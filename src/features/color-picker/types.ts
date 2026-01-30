export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface ColorValue {
  hex: string;
  rgb: RGBColor;
  hsl: HSLColor;
}

export interface ColorHistoryItem {
  id: string;
  color: ColorValue;
  addedAt: number;
}

export interface ColorPickerState {
  currentColor: ColorValue;
  history: ColorHistoryItem[];
  activeFormat: ColorFormat;
}
