export interface TwitterCardConfig {
    cardType: string;
    title: string;
    description: string;
    siteUsername: string;
    creatorUsername: string;
    image: string;
    imageAlt: string;
    // Player card fields
    playerUrl: string;
    playerWidth: string;
    playerHeight: string;
    // App card fields
    appNameIphone: string;
    appIdIphone: string;
    appNameIpad: string;
    appIdIpad: string;
    appNameGooglePlay: string;
    appIdGooglePlay: string;
}

export interface TwitterCardPreset {
    label: string;
    description: string;
    config: Partial<TwitterCardConfig>;
}
