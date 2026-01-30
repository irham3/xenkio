import { HashAlgorithm } from './types';

export const HASH_ALGORITHMS: { id: HashAlgorithm; name: string; description: string; isAsync: boolean; category: string }[] = [
  { id: 'MD5', name: 'MD5', description: 'Widely used 128-bit hash. Fast but vulnerable to collisions.', isAsync: false, category: 'General Purpose' },
  { id: 'SHA1', name: 'SHA-1', description: '160-bit hash function. Deprecated for security uses.', isAsync: false, category: 'General Purpose' },
  { id: 'SHA256', name: 'SHA-256', description: 'Standard 256-bit secure hash. Used in Bitcoin and TLS.', isAsync: false, category: 'General Purpose' },
  { id: 'SHA512', name: 'SHA-512', description: '512-bit hash. Higher security margin than SHA-256.', isAsync: false, category: 'General Purpose' },
  { id: 'RIPEMD160', name: 'RIPEMD-160', description: '160-bit cryptographic hash function. Used in Bitcoin.', isAsync: false, category: 'General Purpose' },
  { id: 'BCRYPT', name: 'Bcrypt', description: 'Adaptive password hashing function based on Blowfish. Slow by design.', isAsync: true, category: 'Password Hashing' },
  { id: 'ARGON2', name: 'Argon2id', description: 'Winner of PHC. Memory-hard. Best for password storage.', isAsync: true, category: 'Password Hashing' },
];

export const DEFAULT_OPTIONS = {
  bcryptCost: 10,
  argonMemory: 65536, // 64MB - Safe default for browser
  argonIterations: 3,
  argonParallelism: 1,
  argonHashLength: 32,
};
