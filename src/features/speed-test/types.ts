export type SpeedTestPhase =
    | 'idle'
    | 'ping'
    | 'download'
    | 'upload'
    | 'complete'
    | 'error';

export interface SpeedResult {
    ping: number | null;
    jitter: number | null;
    download: number | null;
    upload: number | null;
}

export interface SpeedTestState {
    phase: SpeedTestPhase;
    result: SpeedResult;
    /** 0–100 progress within the current phase */
    progress: number;
    /** Live reading while a test is running (Mbps for down/up, ms for ping) */
    liveValue: number | null;
    error: string | null;
}
