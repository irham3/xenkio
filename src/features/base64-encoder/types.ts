export type Base64Mode = 'encode' | 'decode';

export interface Base64Options {
  mode: Base64Mode;
  input: string;
}

export interface Base64Result {
  output: string;
  mode: Base64Mode;
  inputLength: number;
  outputLength: number;
  executionTime: number;
  error?: string;
}
