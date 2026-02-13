export type ScaleOption = 1 | 2 | 3 | 4;

export interface SvgDimensions {
  width: number;
  height: number;
}

export interface ConversionResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface SvgToPngConfig {
  svgContent: string;
  scale: ScaleOption;
  customWidth: number;
  customHeight: number;
  useCustomSize: boolean;
  aspectRatioLocked: boolean;
  backgroundColor: string;
  transparentBackground: boolean;
}
