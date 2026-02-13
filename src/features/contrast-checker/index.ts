// Contrast Checker Feature - Public API
export { ContrastChecker } from './components/contrast-checker';
export { useContrastChecker } from './hooks/use-contrast-checker';

// Types
export type { WcagResult, ContrastResult, ContrastCheckerState } from './types';

// Constants
export {
  DEFAULT_FOREGROUND,
  DEFAULT_BACKGROUND,
  WCAG_THRESHOLDS,
  WCAG_LABELS,
} from './constants';

// Utils
export {
  getRelativeLuminance,
  getContrastRatio,
  checkWcagCompliance,
  calculateContrast,
  suggestAccessibleColor,
} from './lib/contrast-utils';
