export type BinaryMode = 'encode' | 'decode';

export type BinarySeparator = 'space' | 'none' | 'dash';

export interface BinaryOptions {
  mode: BinaryMode;
  input: string;
  separator: BinarySeparator;
}

export interface BinaryResult {
  output: string;
  mode: BinaryMode;
  inputLength: number;
  outputLength: number;
  charCount: number;
  executionTime: number;
  error?: string;
}
