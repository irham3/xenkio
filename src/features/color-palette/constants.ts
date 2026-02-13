import { HarmonyType } from './types';

export const DEFAULT_BASE_HEX = '#0EA5E9';

export const HARMONY_TYPES: { value: HarmonyType; label: string }[] = [
  { value: 'complementary', label: 'Complementary' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'triadic', label: 'Triadic' },
  { value: 'split-complementary', label: 'Split-Complementary' },
  { value: 'tetradic', label: 'Tetradic (Square)' },
  { value: 'monochromatic', label: 'Monochromatic' },
];

export const DEFAULT_HARMONY: HarmonyType = 'complementary';
