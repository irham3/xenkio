export interface Color {
    id: string;
    hex: string;
    locked: boolean;
}

export type Palette = Color[];

export type ColorFormat = 'hex' | 'rgb' | 'hsl';
