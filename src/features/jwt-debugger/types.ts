
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

export const createDefaultPayload = (now = Math.floor(Date.now() / 1000)) => {
    return JSON.stringify({
        sub: "1234567890",
        name: "John Doe",
        role: "admin",
        iss: "https://your-domain.com",
        aud: "https://api.your-domain.com",
        iat: now,
        exp: now + 3600
    }, null, 2);
};

export const DEFAULT_PAYLOAD = createDefaultPayload();

export const DEFAULT_HEADER = JSON.stringify({
    alg: "HS256",
    typ: "JWT"
}, null, 2);

export const DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaXNzIjoiaHR0cHM6Ly95b3VyLWRvbWFpbi5jb20iLCJhdWQiOiJodHRwczovL2FwaS55b3VyLWRvbWFpbi5jb20iLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTcwNDA3MDgwMH0.R_Z78gOc3S0n3khnr5R-G6dlKuGPGuUiVgi9Ek8Hc00";
