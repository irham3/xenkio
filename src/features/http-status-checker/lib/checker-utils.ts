import type { HttpHeader, RedirectHop, StatusCheckResult } from '../types';

const REDIRECT_CHECK_API = 'https://www.redirectcheck.org/api/check';
const HEADER_CHECK_API = 'https://api.hackertarget.com/httpheaders/';
const REQUEST_TIMEOUT_MS = 20_000;

interface RedirectCheckHop {
    from?: string;
    to?: string | null;
    status_code?: number;
    type?: string;
    duration?: number;
    headers?: Record<string, string>;
}

interface RedirectCheckResponse {
    url?: string;
    redirects?: RedirectCheckHop[];
    final_result?: {
        final_url?: string;
        status_code?: number;
        canonical?: string | null;
        x_robots_tag?: string | null;
        server?: string | null;
        content_type?: string | null;
    };
    warnings?: string[];
    total_duration?: number;
    error?: boolean;
    error_type?: string;
    message?: string;
}

interface HeaderBlock {
    statusCode: number;
    statusText: string;
    headers: HttpHeader[];
}

const HTTP_STATUS_TEXTS: Record<number, string> = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Content Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a Teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Content',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
};

function getStatusText(code: number, fallback?: string): string {
    return fallback?.trim() || HTTP_STATUS_TEXTS[code] || 'Unknown Status';
}

function getStatusClass(code: number): StatusCheckResult['statusClass'] {
    if (code < 200) return '1xx';
    if (code < 300) return '2xx';
    if (code < 400) return '3xx';
    if (code < 500) return '4xx';
    return '5xx';
}

function getHeader(headers: HttpHeader[], name: string): string | null {
    const found = headers.find((header) => header.name.toLowerCase() === name.toLowerCase());
    return found?.value || null;
}

function appendHeader(headers: HttpHeader[], name: string, value?: string | null) {
    const trimmed = value?.trim();
    if (!trimmed) return;
    if (headers.some((header) => header.name.toLowerCase() === name.toLowerCase())) return;
    headers.push({ name, value: trimmed });
}

function headersFromRecord(headers?: Record<string, string>): HttpHeader[] {
    if (!headers) return [];
    return Object.entries(headers)
        .filter(([, value]) => Boolean(value))
        .map(([name, value]) => ({ name, value }));
}

function headersFromFetch(response: Response): HttpHeader[] {
    return Array.from(response.headers.entries()).map(([name, value]) => ({ name, value }));
}

function canUseHeaderApi(url: string): boolean {
    const parsed = new URL(url);
    return !parsed.search && !parsed.hash;
}

function createTimeoutController() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return { controller, timeoutId };
}

function abortErrorMessage() {
    return 'The request timed out. Please try again or check a faster endpoint.';
}

export function isValidUrl(value: string): boolean {
    try {
        const url = new URL(normalizeUrl(value));
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function normalizeUrl(value: string): string {
    const trimmed = value.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }
    return trimmed;
}

function parseHeaderBlocks(raw: string): HeaderBlock[] {
    const cleaned = raw.replace(/\r\n/g, '\n').trim();

    if (!cleaned || /^error\b/i.test(cleaned)) {
        return [];
    }

    return cleaned
        .split(/\n\s*\n(?=HTTP\/\d(?:\.\d)?\s+\d{3})/i)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            const [statusLine, ...headerLines] = block.split('\n');
            const match = statusLine.match(/^HTTP\/\d(?:\.\d)?\s+(\d{3})\s*(.*)$/i);

            if (!match) return null;

            const headers: HttpHeader[] = [];

            for (const line of headerLines) {
                const separatorIndex = line.indexOf(':');
                if (separatorIndex <= 0) continue;

                const name = line.slice(0, separatorIndex).trim();
                const value = line.slice(separatorIndex + 1).trim();
                if (name && value) {
                    headers.push({ name, value });
                }
            }

            const statusCode = Number(match[1]);
            return {
                statusCode,
                statusText: getStatusText(statusCode, match[2]),
                headers,
            };
        })
        .filter((block): block is HeaderBlock => Boolean(block));
}

async function fetchHeaderBlocks(targetUrl: string): Promise<HeaderBlock[]> {
    if (!canUseHeaderApi(targetUrl)) {
        return [];
    }

    const apiUrl = new URL(HEADER_CHECK_API);
    apiUrl.searchParams.set('q', targetUrl);

    const { controller, timeoutId } = createTimeoutController();

    try {
        const response = await fetch(apiUrl.toString(), {
            cache: 'no-store',
            signal: controller.signal,
        });

        if (!response.ok) return [];

        const text = await response.text();
        return parseHeaderBlocks(text);
    } catch {
        return [];
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function checkWithBrowser(targetUrl: string): Promise<StatusCheckResult> {
    const startedAt = performance.now();
    const { controller, timeoutId } = createTimeoutController();

    try {
        const response = await fetch(targetUrl, {
            cache: 'no-store',
            redirect: 'follow',
            signal: controller.signal,
        });

        await response.body?.cancel();

        const responseTime = Math.max(0, Math.round(performance.now() - startedAt));
        const headers = headersFromFetch(response);
        const contentType = getHeader(headers, 'content-type');

        return {
            url: targetUrl,
            finalUrl: response.url || targetUrl,
            statusCode: response.status,
            statusText: getStatusText(response.status, response.statusText),
            statusClass: getStatusClass(response.status),
            contentType,
            responseTime,
            headers,
            redirects: [],
            warnings: response.redirected
                ? ['The browser followed a redirect, but direct fetch does not expose intermediate redirect hops.']
                : [],
            checkedVia: 'browser',
            headerSource: 'browser',
            headerNote:
                headers.length === 0
                    ? 'The server responded, but the browser did not expose any response headers.'
                    : null,
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(abortErrorMessage());
        }
        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function checkWithRedirectApi(targetUrl: string): Promise<StatusCheckResult> {
    const { controller, timeoutId } = createTimeoutController();

    try {
        const response = await fetch(REDIRECT_CHECK_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: targetUrl,
                method: 'GET',
                followMetaRefresh: true,
            }),
            cache: 'no-store',
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`The external checker returned HTTP ${response.status}.`);
        }

        const data = (await response.json()) as RedirectCheckResponse;

        if (data.error) {
            const detail = data.message || data.error_type || 'The URL could not be checked.';
            throw new Error(detail);
        }

        const final = data.final_result;
        const statusCode = final?.status_code;

        if (!final || typeof statusCode !== 'number') {
            throw new Error('The external checker did not return a valid status code.');
        }

        const headerBlocks = await fetchHeaderBlocks(targetUrl);
        const finalHeaderBlock = headerBlocks.at(-1);
        const summaryHeaders: HttpHeader[] = [];
        appendHeader(summaryHeaders, 'Content-Type', final.content_type);
        appendHeader(summaryHeaders, 'Server', final.server);
        appendHeader(summaryHeaders, 'X-Robots-Tag', final.x_robots_tag);

        const headers = finalHeaderBlock?.headers.length
            ? finalHeaderBlock.headers
            : summaryHeaders;
        const redirects: RedirectHop[] = (data.redirects ?? []).map((hop) => ({
            from: hop.from || targetUrl,
            to: hop.to || null,
            statusCode: hop.status_code || 0,
            statusText: hop.status_code ? getStatusText(hop.status_code) : 'Unknown Status',
            type: hop.type || 'http',
            duration: typeof hop.duration === 'number' ? hop.duration : null,
            headers: headersFromRecord(hop.headers),
        }));

        return {
            url: targetUrl,
            finalUrl: final.final_url || targetUrl,
            statusCode,
            statusText: getStatusText(statusCode, finalHeaderBlock?.statusText),
            statusClass: getStatusClass(statusCode),
            contentType: final.content_type || getHeader(headers, 'content-type'),
            responseTime: Math.max(0, Math.round(data.total_duration ?? 0)),
            headers,
            redirects,
            warnings: data.warnings ?? [],
            checkedVia: 'external',
            headerSource: finalHeaderBlock?.headers.length ? 'external' : 'summary',
            headerNote: finalHeaderBlock?.headers.length
                ? null
                : 'Full response headers were not available, so the checker is showing the headers returned in the status summary.',
        };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(abortErrorMessage());
        }
        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export async function checkUrlStatus(rawUrl: string): Promise<StatusCheckResult> {
    const targetUrl = normalizeUrl(rawUrl);

    try {
        return await checkWithBrowser(targetUrl);
    } catch {
        return checkWithRedirectApi(targetUrl);
    }
}
