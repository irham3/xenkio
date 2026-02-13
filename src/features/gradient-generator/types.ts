export interface ColorStop {
  id: string;
  color: string;
  position: number;
}

export type GradientType = 'linear' | 'radial' | 'conic';

export interface GradientConfig {
  type: GradientType;
  angle: number;
  stops: ColorStop[];
}

export interface GradientPreset {
  name: string;
  config: GradientConfig;
}
