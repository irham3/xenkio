import { Base64Options, Base64Result } from '../types';

/**
 * Encode a string to Base64
 */
function encodeToBase64(text: string, urlSafe: boolean): string {
  // Use TextEncoder for proper UTF-8 handling
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  
  // Convert bytes to base64
  let base64 = btoa(String.fromCharCode(...bytes));
  
  if (urlSafe) {
    // Convert to URL-safe Base64 (RFC 4648)
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  
  return base64;
}

/**
 * Decode a Base64 string back to text
 */
function decodeFromBase64(base64: string, urlSafe: boolean): string {
  let normalizedBase64 = base64;
  
  if (urlSafe) {
    // Convert from URL-safe Base64 back to standard
    normalizedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary
    const padding = normalizedBase64.length % 4;
    if (padding > 0) {
      normalizedBase64 += '='.repeat(4 - padding);
    }
  }
  
  // Decode base64 to bytes
  const binaryString = atob(normalizedBase64);
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
  
  // Use TextDecoder for proper UTF-8 handling
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

/**
 * Process Base64 encoding or decoding based on options
 */
export function processBase64(options: Base64Options): Base64Result {
  const startTime = performance.now();
  
  try {
    const { mode, input, urlSafe } = options;
    
    if (!input.trim()) {
      return {
        output: '',
        mode,
        inputLength: 0,
        outputLength: 0,
        executionTime: performance.now() - startTime,
      };
    }
    
    let output: string;
    
    if (mode === 'encode') {
      output = encodeToBase64(input, urlSafe);
    } else {
      output = decodeFromBase64(input, urlSafe);
    }
    
    return {
      output,
      mode,
      inputLength: input.length,
      outputLength: output.length,
      executionTime: performance.now() - startTime,
    };
  } catch (err: unknown) {
    return {
      output: '',
      mode: options.mode,
      inputLength: options.input.length,
      outputLength: 0,
      executionTime: performance.now() - startTime,
      error: err instanceof Error ? err.message : 'Invalid input for decoding',
    };
  }
}
