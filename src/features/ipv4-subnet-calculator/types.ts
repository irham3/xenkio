export interface SubnetInfo {
  ipAddress: string;
  cidr: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  ipType: string;
  binaryIp: string;
  binarySubnetMask: string;
  binaryNetworkAddress: string;
  binaryBroadcastAddress: string;
  networkBits: number;
  hostBits: number;
}

export interface CidrPreset {
  prefix: number;
  label: string;
  hosts: number;
  usage: string;
}
