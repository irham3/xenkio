export type CheckState = 'idle' | 'loading' | 'success' | 'error';

export interface StatusCheckResult {
    url: string;
    finalUrl: string;
    statusCode: number;
    statusText: string;
    statusClass: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
    contentType: string | null;
    responseTime: number;
}

export interface HttpStatusCheckerState {
    url: string;
    result: StatusCheckResult | null;
    status: CheckState;
    error: string | null;
}
