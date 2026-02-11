
export type UUIDVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7';

export interface UUIDConfig {
    version: UUIDVersion;
    count: number;
    uppercase: boolean;
    hyphens: boolean;
    namespace?: string; // For v5
    name?: string;      // For v5
}

export interface UUIDItem {
    id: string;
    value: string;
    version: UUIDVersion;
    timestamp: number;
}
