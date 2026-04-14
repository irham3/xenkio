export interface BrowserInfo {
    name: string;
    version: string;
    majorVersion: string;
}

export interface OsInfo {
    name: string;
    version: string;
}

export interface DeviceInfo {
    type: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown';
    brand: string;
    model: string;
}

export interface EngineInfo {
    name: string;
    version: string;
}

export interface CpuInfo {
    architecture: string;
}

export interface ParsedUserAgent {
    raw: string;
    browser: BrowserInfo;
    os: OsInfo;
    device: DeviceInfo;
    engine: EngineInfo;
    cpu: CpuInfo;
    isBot: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}
