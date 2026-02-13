export interface WcagResult {
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

export interface ContrastResult {
  ratio: number;
  wcag: WcagResult;
}

export interface ContrastCheckerState {
  foreground: string;
  background: string;
  result: ContrastResult;
}
