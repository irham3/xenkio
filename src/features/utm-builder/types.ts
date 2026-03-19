export interface UTMParams {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
}

export interface UTMState {
    baseUrl: string;
    params: UTMParams;
}

export interface UTMPreset {
    label: string;
    description: string;
    params: Partial<UTMParams>;
}
