export interface FaviconSize {
  width: number;
  height: number;
  label: string;
  isAppleTouch?: boolean;
}

export interface GeneratedFavicon {
  size: FaviconSize;
  dataUrl: string;
  blob: Blob;
}

export interface FaviconGeneratorState {
  sourceImage: string | null;
  sourceFileName: string | null;
  selectedSizes: number[];
  generatedFavicons: GeneratedFavicon[];
  isGenerating: boolean;
}
