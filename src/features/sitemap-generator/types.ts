export type SitemapChangeFrequency =
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';

export interface SitemapUrlEntry {
    id: string;
    path: string;
    lastmod: string;
    changefreq: SitemapChangeFrequency;
    priority: number;
}

export interface SitemapGeneratorConfig {
    baseUrl: string;
    urls: SitemapUrlEntry[];
}

export interface SitemapPreset {
    label: string;
    description: string;
    paths: string[];
}
