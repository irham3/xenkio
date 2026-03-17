export interface OpenGraphConfig {
    title: string;
    description: string;
    url: string;
    image: string;
    imageAlt: string;
    type: string;
    siteName: string;
    locale: string;
    twitterCard: string;
    twitterSite: string;
    twitterCreator: string;
}

export interface OpenGraphPreset {
    label: string;
    description: string;
    config: Partial<OpenGraphConfig>;
}
