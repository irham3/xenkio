export type CheckState = 'idle' | 'loading' | 'success' | 'error';

export interface HttpHeader {
    name: string;
    value: string;
}

export interface RedirectHop {
    from: string;
    to: string | null;
    statusCode: number;
    statusText: string;
    type: string;
    duration: number | null;
    headers: HttpHeader[];
}

export interface StatusCheckResult {
    url: string;
    finalUrl: string;
    statusCode: number;
    statusText: string;
    statusClass: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
    contentType: string | null;
    responseTime: number;
    headers: HttpHeader[];
    redirects: RedirectHop[];
    warnings: string[];
    checkedVia: 'browser' | 'external';
    headerSource: 'browser' | 'external' | 'summary';
    headerNote: string | null;
}

export interface HttpStatusCheckerState {
    url: string;
    result: StatusCheckResult | null;
    status: CheckState;
    error: string | null;
}
