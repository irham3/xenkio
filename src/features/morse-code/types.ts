export type MorseMode = 'encode' | 'decode';

export interface MorseOptions {
  mode: MorseMode;
  input: string;
}

export interface MorseResult {
  output: string;
  mode: MorseMode;
  inputLength: number;
  outputLength: number;
  executionTime: number;
  error?: string;
}
