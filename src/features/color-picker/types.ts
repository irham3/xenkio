export interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export interface ColorPickerState {
  color: ColorValue;
  recentColors: string[];
}
