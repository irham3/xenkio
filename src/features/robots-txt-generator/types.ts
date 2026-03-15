export interface RobotRule {
    id: string;
    userAgent: string;
    allow: string[];
    disallow: string[];
    crawlDelay?: number;
}

export interface RobotsTxtConfig {
    rules: RobotRule[];
    sitemaps: string[];
    host?: string;
}

export interface RobotPreset {
    label: string;
    description: string;
    config: RobotsTxtConfig;
}
