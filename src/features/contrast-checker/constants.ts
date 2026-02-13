export const DEFAULT_FOREGROUND = '#1E293B';
export const DEFAULT_BACKGROUND = '#FFFFFF';

export const WCAG_THRESHOLDS = {
  aaNormal: 4.5,
  aaLarge: 3,
  aaaNormal: 7,
  aaaLarge: 4.5,
} as const;

export const WCAG_LABELS: Record<keyof typeof WCAG_THRESHOLDS, string> = {
  aaNormal: 'AA Normal Text',
  aaLarge: 'AA Large Text',
  aaaNormal: 'AAA Normal Text',
  aaaLarge: 'AAA Large Text',
};
