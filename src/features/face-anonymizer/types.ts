export type AnonymizationMode = 'blur' | 'pixelate';
export type ApplyMode = 'all' | 'selected';

export interface DetectedFace {
    id: string;
    topLeft: [number, number];
    bottomRight: [number, number];
    probability: number;
    selected: boolean;
}

export interface FaceAnonymizerStatus {
    isModelLoading: boolean;
    isDetecting: boolean;
    modelReady: boolean;
    error: string | null;
}
