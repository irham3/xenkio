export type TotpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

export interface TotpAccount {
    id: string;
    name: string;
    issuer: string;
    secret: string;
    algorithm: TotpAlgorithm;
    digits: 6 | 8;
    period: number;
}

export interface TotpCode {
    code: string;
    remainingSeconds: number;
    progress: number; // 0-1, percentage of time elapsed
}
