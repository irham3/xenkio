import { ColorValue } from './types';

export const DEFAULT_COLOR: ColorValue = {
  hex: '#0EA5E9',
  rgb: { r: 14, g: 165, b: 233 },
  hsl: { h: 199, s: 89, l: 48 },
};

export const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#000000', // Black
  '#FFFFFF', // White
];

export const MAX_RECENT_COLORS = 12;
