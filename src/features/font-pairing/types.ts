export interface FontPair {
    id: string;
    name: string;
    heading: string;
    body: string;
    category: FontPairCategory;
    description: string;
}

export type FontPairCategory = 'serif-sans' | 'sans-sans' | 'serif-serif' | 'display-sans' | 'mono-sans';

export interface FontPairCategoryInfo {
    id: FontPairCategory;
    label: string;
}

export type PreviewLayout = 'card' | 'article' | 'hero';
