import type { SubnetInfo, CidrPreset } from '../types';

export function parseIP(ip: string): { valid: boolean; octets: number[]; value: number } {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return { valid: false, octets: [], value: 0 };

  const octets = parts.map(Number);
  if (octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255))
    return { valid: false, octets: [], value: 0 };

  const value =
    (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
  return { valid: true, octets, value };
}

export function numberToIP(value: number): string {
  const n = value >>> 0;
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join('.');
}

export function cidrToMask(prefix: number): number {
  if (prefix === 0) return 0;
  if (prefix === 32) return 0xffffffff >>> 0;
  return ((0xffffffff << (32 - prefix)) >>> 0);
}

export function maskToCidr(mask: string): number | null {
  const parsed = parseIP(mask);
  if (!parsed.valid) return null;

  const binary = (parsed.value >>> 0).toString(2).padStart(32, '0');
  const firstZero = binary.indexOf('0');

  // Check contiguous — once a 0 appears, no more 1s are allowed
  if (firstZero !== -1 && binary.slice(firstZero).includes('1')) return null;

  return firstZero === -1 ? 32 : firstZero;
}

export function toBinaryString(value: number): string {
  return (value >>> 0).toString(2).padStart(32, '0');
}

export function formatBinaryOctets(binary: string): string {
  return [
    binary.slice(0, 8),
    binary.slice(8, 16),
    binary.slice(16, 24),
    binary.slice(24, 32),
  ].join('.');
}

export function getIPClass(firstOctet: number): string {
  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D (Multicast)';
  return 'E (Reserved)';
}

export function getIPType(ipValue: number, octets: number[]): string {
  const first = octets[0];
  const second = octets[1];

  // Loopback: 127.0.0.0/8
  if (first === 127) return 'Loopback';

  // Link-local: 169.254.0.0/16
  if (first === 169 && second === 254) return 'Link-local';

  // Private: 10.0.0.0/8
  if (first === 10) return 'Private';

  // Private: 172.16.0.0/12
  if (first === 172 && second >= 16 && second <= 31) return 'Private';

  // Private: 192.168.0.0/16
  if (first === 192 && second === 168) return 'Private';

  // Multicast: 224.0.0.0/4
  if (first >= 224 && first <= 239) return 'Multicast';

  // Reserved: 240.0.0.0/4
  if (first >= 240) return 'Reserved';

  // 0.0.0.0
  if (ipValue === 0) return 'Unspecified';

  return 'Public';
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

export function calculateSubnet(ip: string, prefix: number): SubnetInfo | null {
  const parsed = parseIP(ip);
  if (!parsed.valid || prefix < 0 || prefix > 32) return null;

  const maskValue = cidrToMask(prefix);
  const wildcardValue = (~maskValue) >>> 0;
  const networkValue = (parsed.value & maskValue) >>> 0;
  const broadcastValue = (networkValue | wildcardValue) >>> 0;

  const hostBits = 32 - prefix;
  const totalHosts = prefix === 32 ? 1 : Math.pow(2, hostBits);
  const usableHosts =
    prefix === 32 ? 1 : prefix === 31 ? 2 : Math.max(0, totalHosts - 2);

  const firstHostValue = prefix >= 31 ? networkValue : (networkValue + 1) >>> 0;
  const lastHostValue = prefix >= 31 ? broadcastValue : (broadcastValue - 1) >>> 0;

  return {
    ipAddress: ip,
    cidr: prefix,
    subnetMask: numberToIP(maskValue),
    wildcardMask: numberToIP(wildcardValue),
    networkAddress: numberToIP(networkValue),
    broadcastAddress: prefix === 32 ? ip : numberToIP(broadcastValue),
    firstHost: numberToIP(firstHostValue),
    lastHost: numberToIP(lastHostValue),
    totalHosts,
    usableHosts,
    ipClass: getIPClass(parsed.octets[0]),
    ipType: getIPType(parsed.value, parsed.octets),
    binaryIp: formatBinaryOctets(toBinaryString(parsed.value)),
    binarySubnetMask: formatBinaryOctets(toBinaryString(maskValue)),
    binaryNetworkAddress: formatBinaryOctets(toBinaryString(networkValue)),
    binaryBroadcastAddress:
      prefix === 32
        ? formatBinaryOctets(toBinaryString(parsed.value))
        : formatBinaryOctets(toBinaryString(broadcastValue)),
    networkBits: prefix,
    hostBits,
  };
}

export const CIDR_PRESETS: CidrPreset[] = [
  { prefix: 8, label: '/8', hosts: 16_777_214, usage: 'Class A — large networks' },
  { prefix: 16, label: '/16', hosts: 65_534, usage: 'Class B — medium networks' },
  { prefix: 24, label: '/24', hosts: 254, usage: 'Class C — home / small office' },
  { prefix: 25, label: '/25', hosts: 126, usage: 'Half a /24 subnet' },
  { prefix: 26, label: '/26', hosts: 62, usage: 'Quarter /24 subnet' },
  { prefix: 27, label: '/27', hosts: 30, usage: 'Small team VLAN' },
  { prefix: 28, label: '/28', hosts: 14, usage: 'Micro segment (e.g. DMZ)' },
  { prefix: 29, label: '/29', hosts: 6, usage: 'Point-to-multipoint links' },
  { prefix: 30, label: '/30', hosts: 2, usage: 'Point-to-point WAN link' },
  { prefix: 31, label: '/31', hosts: 2, usage: 'P2P (RFC 3021, no broadcast)' },
  { prefix: 32, label: '/32', hosts: 1, usage: 'Single host / loopback route' },
];
