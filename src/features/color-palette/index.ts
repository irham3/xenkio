// Color Palette Feature - Public API
export { ColorPaletteGenerator } from './components/color-palette-generator';
export { useColorPalette } from './hooks/use-color-palette';

// Types
export type { HarmonyType, PaletteColor, ColorPaletteState, ColorValue } from './types';

// Constants
export { DEFAULT_BASE_HEX, HARMONY_TYPES, DEFAULT_HARMONY } from './constants';

// Utils
export {
  generatePalette,
  paletteToCssVariables,
  paletteToTailwindColors,
  randomHexColor,
} from './lib/palette-utils';
