export type Unit = 'px' | 'cm' | 'mm' | 'in';

export interface Guide {
    id: string;
    axis: 'horizontal' | 'vertical';
    position: number; // px from top (horizontal) or left (vertical)
}

export interface Measurement {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface ScreenRulerState {
    unit: Unit;
    dpi: number;
    guides: Guide[];
    measurement: Measurement | null;
    mouseX: number;
    mouseY: number;
    showCrosshair: boolean;
    measureMode: boolean;
}
