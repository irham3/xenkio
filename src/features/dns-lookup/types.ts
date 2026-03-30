export type DnsRecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'CNAME' | 'NS' | 'SOA' | 'PTR';

export interface DnsRecord {
    name: string;
    type: number;
    ttl: number;
    data: string;
}

export interface DnsQuestion {
    name: string;
    type: number;
}

export interface DnsResponse {
    Status: number;
    Question: DnsQuestion[];
    Answer?: DnsRecord[];
    Authority?: DnsRecord[];
}

export type DnsStatus = 'idle' | 'loading' | 'success' | 'error';

export interface DnsLookupState {
    records: DnsRecord[];
    status: DnsStatus;
    error: string | null;
    domain: string;
    recordType: DnsRecordType;
}
