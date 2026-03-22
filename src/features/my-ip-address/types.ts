export interface IpInfo {
    ip: string;
    hostname?: string;
    city?: string;
    region?: string;
    country?: string;
    loc?: string;
    org?: string;
    postal?: string;
    timezone?: string;
}

export type IpStatus = 'idle' | 'loading' | 'success' | 'error';

export interface IpState {
    info: IpInfo | null;
    status: IpStatus;
    error: string | null;
}
