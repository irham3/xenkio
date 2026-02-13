import { ScaleOption, SvgToPngConfig } from './types';

export const SCALE_OPTIONS: ScaleOption[] = [1, 2, 3, 4];

export const DEFAULT_CONFIG: SvgToPngConfig = {
  svgContent: '',
  scale: 1,
  customWidth: 800,
  customHeight: 600,
  useCustomSize: false,
  aspectRatioLocked: true,
  backgroundColor: '#ffffff',
  transparentBackground: true,
};

export const MAX_CANVAS_SIZE = 8192;
