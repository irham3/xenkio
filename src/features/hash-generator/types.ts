export type HashAlgorithm = 
  | 'MD5' 
  | 'SHA1' 
  | 'SHA256' 
  | 'SHA512' 
  | 'RIPEMD160' 
  | 'BCRYPT' 
  | 'ARGON2';

export interface HashOptions {
  algorithm: HashAlgorithm;
  text: string;
  salt?: string; // For adding custom salt to simple hashes (pre-pending) or specific logic
  // Bcrypt specific
  cost?: number; // 4-31
  // Argon2 specific
  memory?: number; // in KB
  iterations?: number;
  parallelism?: number;
  hashLength?: number;
}

export interface HashResult {
  hash: string;
  algorithm: HashAlgorithm;
  executionTime: number; // ms
  error?: string;
}
