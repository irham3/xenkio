import { ColorValue } from '@/features/color-picker/types';

export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'monochromatic';

export interface PaletteColor {
  color: ColorValue;
  name: string;
}

export interface ColorPaletteState {
  baseColor: ColorValue;
  harmonyType: HarmonyType;
  palette: PaletteColor[];
}

export type { ColorValue };
