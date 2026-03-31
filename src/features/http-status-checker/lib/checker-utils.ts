import type { StatusCheckResult } from '../types';

const ALLORIGINS_API = 'https://api.allorigins.win/get';

interface AllOriginsResponse {
    status: {
        url: string;
        content_type: string;
        http_code: number;
        response_time: number;
        content_length: number;
        content_hash: string;
    };
    contents: string;
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

function getStatusText(code: number): string {
    return HTTP_STATUS_TEXTS[code] ?? 'Unknown Status';
}

function getStatusClass(code: number): StatusCheckResult['statusClass'] {
    if (code < 200) return '1xx';
    if (code < 300) return '2xx';
    if (code < 400) return '3xx';
    if (code < 500) return '4xx';
    return '5xx';
}

export function isValidUrl(value: string): boolean {
    try {
        const url = new URL(value.startsWith('http') ? value : `https://${value}`);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function normalizeUrl(value: string): string {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return `https://${value}`;
    }
    return value;
}

export async function checkUrlStatus(rawUrl: string): Promise<StatusCheckResult> {
    const targetUrl = normalizeUrl(rawUrl.trim());

    const apiUrl = new URL(ALLORIGINS_API);
    apiUrl.searchParams.set('url', targetUrl);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
        throw new Error(`Failed to reach the checking service. Please try again later.`);
    }

    const data: AllOriginsResponse = await response.json();
    const { status } = data;

    if (!status || !status.http_code) {
        throw new Error('Unable to retrieve status for this URL. The site may be blocking requests.');
    }

    return {
        url: targetUrl,
        finalUrl: status.url || targetUrl,
        statusCode: status.http_code,
        statusText: getStatusText(status.http_code),
        statusClass: getStatusClass(status.http_code),
        contentType: status.content_type || null,
        responseTime: status.response_time,
    };
}
