import type { DnsRecordType, DnsRecord, DnsResponse } from '../types';

export const DNS_RECORD_TYPES: DnsRecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA', 'PTR'];

const TYPE_NUMBER_MAP: Record<DnsRecordType, number> = {
    A: 1,
    NS: 2,
    CNAME: 5,
    SOA: 6,
    PTR: 12,
    MX: 15,
    TXT: 16,
    AAAA: 28,
};

const TYPE_NAME_MAP: Record<number, string> = Object.fromEntries(
    Object.entries(TYPE_NUMBER_MAP).map(([name, num]) => [num, name])
);

export function getTypeName(typeNumber: number): string {
    return TYPE_NAME_MAP[typeNumber] ?? String(typeNumber);
}

export function getTypeNumber(type: DnsRecordType): number {
    return TYPE_NUMBER_MAP[type];
}

export function getDnsStatusMessage(status: number): string {
    const messages: Record<number, string> = {
        0: 'No error',
        1: 'Format error',
        2: 'Server failure',
        3: 'Non-existent domain (NXDOMAIN)',
        4: 'Not implemented',
        5: 'Query refused',
    };
    return messages[status] ?? `Unknown error (${status})`;
}

export function formatTtl(ttl: number): string {
    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m`;
    if (ttl < 86400) return `${Math.floor(ttl / 3600)}h`;
    return `${Math.floor(ttl / 86400)}d`;
}

export function isValidDomain(domain: string): boolean {
    const trimmed = domain.trim();
    if (!trimmed) return false;
    // Allow plain domain names and IP addresses for PTR lookups
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(trimmed);
}

export async function queryDns(domain: string, type: DnsRecordType): Promise<DnsRecord[]> {
    const url = new URL('https://cloudflare-dns.com/dns-query');
    url.searchParams.set('name', domain.trim());
    url.searchParams.set('type', type);

    const response = await fetch(url.toString(), {
        headers: { Accept: 'application/dns-json' },
    });

    if (!response.ok) {
        throw new Error(`DNS query failed with HTTP ${response.status}`);
    }

    const data: DnsResponse = await response.json();

    if (data.Status !== 0) {
        throw new Error(getDnsStatusMessage(data.Status));
    }

    return data.Answer ?? [];
}
