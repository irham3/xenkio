import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import { argon2id } from 'hash-wasm';
import { HashOptions, HashResult } from '../types';

export async function generateHash(options: HashOptions): Promise<HashResult> {
  const startTime = performance.now();
  let hash = '';
  
  try {
    const { algorithm, text, salt = '' } = options;
    
    // For general purpose hashes, we just prepend the salt if it exists (simple concatenation)
    // This is a common "layman" understanding of salting for MD5/SHA
    const textToHash = (['MD5', 'SHA1', 'SHA256', 'SHA512', 'RIPEMD160'].includes(algorithm) && salt) 
      ? `${salt}${text}` 
      : text;

    switch (algorithm) {
      case 'MD5':
        hash = CryptoJS.MD5(textToHash).toString();
        break;
      case 'SHA1':
        hash = CryptoJS.SHA1(textToHash).toString();
        break;
      case 'SHA256':
        hash = CryptoJS.SHA256(textToHash).toString();
        break;
      case 'SHA512':
        hash = CryptoJS.SHA512(textToHash).toString();
        break;
      case 'RIPEMD160':
        hash = CryptoJS.RIPEMD160(textToHash).toString();
        break;
      case 'BCRYPT':
        // Bcrypt handles salt internaly. We use the cost factor.
        // We do typically not allow "manual" string salt in bcrypt as it requires specific format.
        const cost = options.cost || 10;
        hash = await bcrypt.hash(text, cost); 
        break;
      case 'ARGON2':
        // Argon2 requires a salt. If user provided one, we use it (hashed/converted), else random.
        let saltArray: Uint8Array;
        if (salt) {
           // Basic string to bytes
           const encoder = new TextEncoder();
           saltArray = encoder.encode(salt);
           // Argon2 expects at least 8 bytes salt usually, but hash-wasm handles it.
        } else {
           saltArray = crypto.getRandomValues(new Uint8Array(16));
        }

         hash = await argon2id({
          password: text,
          salt: saltArray,
          parallelism: options.parallelism || 1,
          iterations: options.iterations || 3,
          memorySize: options.memory || 65536, // in KB
          hashLength: options.hashLength || 32,
          outputType: 'encoded', // Return the full encoded string ($argon2id$...)
        });
        break;
      default:
        throw new Error(`Algorithm ${algorithm} not supported`);
    }
  } catch (err: any) {
    return {
      hash: '',
      algorithm: options.algorithm,
      executionTime: performance.now() - startTime,
      error: err.message || 'Unknown error',
    };
  }

  return {
    hash,
    algorithm: options.algorithm,
    executionTime: performance.now() - startTime,
  };
}
