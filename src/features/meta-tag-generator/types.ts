export interface MetaTagConfig {
    title: string;
    description: string;
    keywords: string;
    author: string;
    robots: string;
    canonical: string;
    charset: string;
    viewport: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    ogSiteName: string;
    twitterCard: string;
    twitterSite: string;
    twitterCreator: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    themeColor: string;
    language: string;
}

export interface MetaTagPreset {
    label: string;
    description: string;
    config: Partial<MetaTagConfig>;
}
