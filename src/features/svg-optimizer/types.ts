export interface SvgoPlugin {
  name: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface SvgOptimizerOptions {
  svg: string;
  multipass: boolean;
  plugins: SvgoPlugin[];
}

export interface SvgOptimizerResult {
  output: string;
  originalSize: number;
  resultSize: number;
  executionTime: number;
  error?: string;
}

export interface SvgOptimizerStats {
  originalSize: number;
  resultSize: number;
  sizeDiff: number;
  compressionRatio: number;
}
