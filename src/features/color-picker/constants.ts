import { ColorValue } from './types';

export const DEFAULT_COLOR: ColorValue = {
  hex: '#0EA5E9',
  rgb: { r: 14, g: 165, b: 233 },
  hsl: { h: 199, s: 89, l: 48 },
};

export const PRESET_COLORS: ColorValue[] = [
  { hex: '#EF4444', rgb: { r: 239, g: 68, b: 68 }, hsl: { h: 0, s: 84, l: 60 } },
  { hex: '#F97316', rgb: { r: 249, g: 115, b: 22 }, hsl: { h: 25, s: 95, l: 53 } },
  { hex: '#EAB308', rgb: { r: 234, g: 179, b: 8 }, hsl: { h: 45, s: 93, l: 47 } },
  { hex: '#22C55E', rgb: { r: 34, g: 197, b: 94 }, hsl: { h: 142, s: 71, l: 45 } },
  { hex: '#0EA5E9', rgb: { r: 14, g: 165, b: 233 }, hsl: { h: 199, s: 89, l: 48 } },
  { hex: '#8B5CF6', rgb: { r: 139, g: 92, b: 246 }, hsl: { h: 258, s: 90, l: 66 } },
  { hex: '#EC4899', rgb: { r: 236, g: 72, b: 153 }, hsl: { h: 330, s: 81, l: 60 } },
  { hex: '#6366F1', rgb: { r: 99, g: 102, b: 241 }, hsl: { h: 239, s: 84, l: 67 } },
  { hex: '#14B8A6', rgb: { r: 20, g: 184, b: 166 }, hsl: { h: 173, s: 80, l: 40 } },
  { hex: '#F43F5E', rgb: { r: 244, g: 63, b: 94 }, hsl: { h: 350, s: 89, l: 60 } },
  { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } },
  { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
];

export const MAX_HISTORY_SIZE = 20;
