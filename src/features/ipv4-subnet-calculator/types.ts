export interface Ipv4SubnetCalculation {
    inputAddress: string;
    inputAddressNumber: number;
    prefix: number;
    cidr: string;
    subnetMask: string;
    wildcardMask: string;
    networkAddress: string;
    broadcastAddress: string;
    firstHost: string;
    lastHost: string;
    totalAddresses: number;
    usableHosts: number;
    networkBits: number;
    hostBits: number;
    blockSize: number;
    ipClass: string;
    addressType: string;
    usableNote: string;
    binary: {
        inputAddress: string;
        subnetMask: string;
        wildcardMask: string;
        networkAddress: string;
        broadcastAddress: string;
    };
}

export interface CidrInput {
    address: string;
    prefix: number;
}
