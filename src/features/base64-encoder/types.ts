export type Base64Mode = 'encode' | 'decode';

export interface Base64Options {
  mode: Base64Mode;
  input: string;
  urlSafe: boolean; // Use URL-safe Base64 encoding (RFC 4648)
}

export interface Base64Result {
  output: string;
  mode: Base64Mode;
  inputLength: number;
  outputLength: number;
  executionTime: number; // ms
  error?: string;
}
