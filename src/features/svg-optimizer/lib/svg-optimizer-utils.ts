import { SvgOptimizerStats } from '../types';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateStats(original: string, result: string): SvgOptimizerStats {
  const originalSize = new Blob([original]).size;
  const resultSize = new Blob([result]).size;
  const compressionRatio =
    originalSize > 0 ? ((originalSize - resultSize) / originalSize) * 100 : 0;

  return {
    originalSize,
    resultSize,
    sizeDiff: resultSize - originalSize,
    compressionRatio,
  };
}
