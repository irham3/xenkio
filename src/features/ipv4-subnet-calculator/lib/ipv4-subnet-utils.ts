import type { CidrInput, Ipv4SubnetCalculation } from '../types';

export const MAX_IPV4 = 4_294_967_295;
export const IPV4_ADDRESS_COUNT = 4_294_967_296;

export function parseIpv4(address: string): number | null {
    const octets = address.trim().split('.');

    if (octets.length !== 4) {
        return null;
    }

    const parsed = octets.map((octet) => {
        if (!/^\d{1,3}$/.test(octet)) {
            return null;
        }

        const value = Number(octet);
        return value >= 0 && value <= 255 ? value : null;
    });

    if (parsed.some((octet) => octet === null)) {
        return null;
    }

    const [a, b, c, d] = parsed as number[];
    return ((a * 256 + b) * 256 + c) * 256 + d;
}

export function numberToIpv4(value: number): string {
    const normalized = Math.max(0, Math.min(MAX_IPV4, Math.floor(value)));
    const a = Math.floor(normalized / 16_777_216);
    const b = Math.floor((normalized % 16_777_216) / 65_536);
    const c = Math.floor((normalized % 65_536) / 256);
    const d = normalized % 256;

    return `${a}.${b}.${c}.${d}`;
}

export function isValidPrefix(prefix: number): boolean {
    return Number.isInteger(prefix) && prefix >= 0 && prefix <= 32;
}

export function prefixToSubnetMask(prefix: number): string {
    if (!isValidPrefix(prefix)) {
        return '255.255.255.0';
    }

    if (prefix === 0) {
        return '0.0.0.0';
    }

    const hostPart = 2 ** (32 - prefix) - 1;
    return numberToIpv4(MAX_IPV4 - hostPart);
}

export function subnetMaskToPrefix(mask: string): number | null {
    const maskNumber = parseIpv4(mask);

    if (maskNumber === null) {
        return null;
    }

    const binary = maskNumber.toString(2).padStart(32, '0');

    if (!/^1*0*$/.test(binary)) {
        return null;
    }

    const firstZero = binary.indexOf('0');
    return firstZero === -1 ? 32 : firstZero;
}

export function parseCidrInput(value: string): CidrInput | null {
    const trimmed = value.trim();
    const parts = trimmed.split('/');

    if (parts.length !== 2) {
        return null;
    }

    const [address, prefixText] = parts;
    const prefix = Number(prefixText);

    if (parseIpv4(address) === null || !/^\d{1,2}$/.test(prefixText) || !isValidPrefix(prefix)) {
        return null;
    }

    return { address: address.trim(), prefix };
}

export function formatAddressCount(value: number): string {
    return value.toLocaleString('en-US');
}

export function formatIpv4Binary(value: number): string {
    return value
        .toString(2)
        .padStart(32, '0')
        .replace(/(.{8})(?=.)/g, '$1.');
}

function isInCidr(value: number, networkAddress: string, prefix: number): boolean {
    const networkNumber = parseIpv4(networkAddress);

    if (networkNumber === null) {
        return false;
    }

    const blockSize = 2 ** (32 - prefix);
    const networkStart = Math.floor(networkNumber / blockSize) * blockSize;
    const networkEnd = networkStart + blockSize - 1;

    return value >= networkStart && value <= networkEnd;
}

export function getIpClass(value: number): string {
    const firstOctet = Math.floor(value / 16_777_216);

    if (firstOctet <= 127) {
        return 'Class A';
    }

    if (firstOctet <= 191) {
        return 'Class B';
    }

    if (firstOctet <= 223) {
        return 'Class C';
    }

    if (firstOctet <= 239) {
        return 'Class D (multicast)';
    }

    return 'Class E (reserved)';
}

export function getAddressType(value: number): string {
    if (value === 0) {
        return 'Unspecified / default route';
    }

    if (value === MAX_IPV4) {
        return 'Limited broadcast';
    }

    if (isInCidr(value, '10.0.0.0', 8)) {
        return 'Private network';
    }

    if (isInCidr(value, '172.16.0.0', 12)) {
        return 'Private network';
    }

    if (isInCidr(value, '192.168.0.0', 16)) {
        return 'Private network';
    }

    if (isInCidr(value, '127.0.0.0', 8)) {
        return 'Loopback';
    }

    if (isInCidr(value, '169.254.0.0', 16)) {
        return 'Link-local';
    }

    if (isInCidr(value, '100.64.0.0', 10)) {
        return 'Carrier-grade NAT';
    }

    if (
        isInCidr(value, '192.0.2.0', 24) ||
        isInCidr(value, '198.51.100.0', 24) ||
        isInCidr(value, '203.0.113.0', 24)
    ) {
        return 'Documentation range';
    }

    if (isInCidr(value, '198.18.0.0', 15)) {
        return 'Benchmark testing range';
    }

    if (isInCidr(value, '224.0.0.0', 4)) {
        return 'Multicast';
    }

    if (isInCidr(value, '240.0.0.0', 4)) {
        return 'Reserved';
    }

    return 'Public unicast';
}

export function calculateIpv4Subnet(address: string, prefix: number): Ipv4SubnetCalculation | null {
    const addressNumber = parseIpv4(address);

    if (addressNumber === null || !isValidPrefix(prefix)) {
        return null;
    }

    const blockSize = 2 ** (32 - prefix);
    const networkNumber = Math.floor(addressNumber / blockSize) * blockSize;
    const broadcastNumber = networkNumber + blockSize - 1;
    const totalAddresses = prefix === 0 ? IPV4_ADDRESS_COUNT : blockSize;
    const subnetMaskNumber = prefix === 0 ? 0 : MAX_IPV4 - (2 ** (32 - prefix) - 1);
    const wildcardNumber = MAX_IPV4 - subnetMaskNumber;

    const usableHosts =
        prefix === 32
            ? 1
            : prefix === 31
              ? 2
              : Math.max(0, totalAddresses - 2);

    const firstHostNumber =
        prefix >= 31
            ? networkNumber
            : networkNumber + 1;
    const lastHostNumber =
        prefix >= 31
            ? broadcastNumber
            : broadcastNumber - 1;

    const usableNote =
        prefix === 32
            ? 'Single-host route'
            : prefix === 31
              ? 'Point-to-point subnet'
              : 'Network and broadcast excluded';

    return {
        inputAddress: numberToIpv4(addressNumber),
        inputAddressNumber: addressNumber,
        prefix,
        cidr: `${numberToIpv4(networkNumber)}/${prefix}`,
        subnetMask: numberToIpv4(subnetMaskNumber),
        wildcardMask: numberToIpv4(wildcardNumber),
        networkAddress: numberToIpv4(networkNumber),
        broadcastAddress: numberToIpv4(broadcastNumber),
        firstHost: numberToIpv4(firstHostNumber),
        lastHost: numberToIpv4(lastHostNumber),
        totalAddresses,
        usableHosts,
        networkBits: prefix,
        hostBits: 32 - prefix,
        blockSize,
        ipClass: getIpClass(addressNumber),
        addressType: getAddressType(addressNumber),
        usableNote,
        binary: {
            inputAddress: formatIpv4Binary(addressNumber),
            subnetMask: formatIpv4Binary(subnetMaskNumber),
            wildcardMask: formatIpv4Binary(wildcardNumber),
            networkAddress: formatIpv4Binary(networkNumber),
            broadcastAddress: formatIpv4Binary(broadcastNumber),
        },
    };
}

export const SUBNET_PRESETS = [
    {
        label: '/24',
        cidr: '192.168.1.10/24',
        description: 'Common LAN with 254 usable hosts',
    },
    {
        label: '/30',
        cidr: '192.168.1.1/30',
        description: 'Small link with 2 usable hosts',
    },
    {
        label: '/31',
        cidr: '10.10.10.0/31',
        description: 'Point-to-point subnet',
    },
    {
        label: '/20',
        cidr: '172.16.5.20/20',
        description: 'VPC or office segment',
    },
    {
        label: '/16',
        cidr: '10.42.15.8/16',
        description: 'Large private network',
    },
    {
        label: '/32',
        cidr: '203.0.113.42/32',
        description: 'Single host route',
    },
];
