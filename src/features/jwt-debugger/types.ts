
export type JwtMode = 'encode' | 'decode';

export interface JwtOptions {
    mode: JwtMode;
    token: string;
    secret: string;
    payload: string;
    header: string;
    algorithm: string;
}

export interface JwtResult {
    decodedHeader: Record<string, unknown> | null;
    decodedPayload: Record<string, unknown> | null;
    encodedToken: string;
    isValid: boolean;
    isVerified: boolean | null;
    error: string | null;
}

export const JWT_ALGORITHMS = [
    { id: 'HS256', label: 'HS256 (HMAC with SHA-256)' },
    { id: 'HS384', label: 'HS384 (HMAC with SHA-384)' },
    { id: 'HS512', label: 'HS512 (HMAC with SHA-512)' },
] as const;

export const DEFAULT_PAYLOAD = JSON.stringify({
    sub: "1234567890",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000)
}, null, 2);

export const DEFAULT_HEADER = JSON.stringify({
    alg: "HS256",
    typ: "JWT"
}, null, 2);
