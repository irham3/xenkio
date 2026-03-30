export type SchemaType = 'organization' | 'website' | 'article' | 'faq';

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface SchemaGeneratorConfig {
    schemaType: SchemaType;
    name: string;
    description: string;
    url: string;
    image: string;
    headline: string;
    authorName: string;
    publisherName: string;
    datePublished: string;
    dateModified: string;
    faqs: FaqItem[];
}

export interface SchemaPreset {
    label: string;
    description: string;
    schemaType: SchemaType;
}
