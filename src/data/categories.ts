import {
    FileText,
    FileImage,
    Lock,
    Code2,
    Type,
    Palette,
    Globe,
    Calculator,
    LucideIcon,
} from 'lucide-react';

export interface CategoryData {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    toolCount: number;
}

export const CATEGORIES: CategoryData[] = [
    {
        id: 'documents',
        name: 'PDF & Documents',
        description: 'Merge, split, compress, and convert PDF and document files',
        icon: FileText,
        color: '#FFFFFF',
        toolCount: 7,
    },
    {
        id: 'media-images',
        name: 'Media & Images',
        description: 'Compress, resize, convert images, generate QR codes and barcodes',
        icon: FileImage,
        color: '#FFFFFF',
        toolCount: 11,
    },
    {
        id: 'security-privacy',
        name: 'Security & Privacy',
        description: 'Password generation, hashing, encryption, JWT, and SSL tools',
        icon: Lock,
        color: '#FFFFFF',
        toolCount: 7,
    },
    {
        id: 'developer-tools',
        name: 'Developer Tools',
        description: 'JSON formatter, regex tester, diff checker, minifiers, and code utilities',
        icon: Code2,
        color: '#FFFFFF',
        toolCount: 11,
    },
    {
        id: 'design-tools',
        name: 'Design Tools',
        description: 'Color picker, palette generator, gradients, and contrast checker',
        icon: Palette,
        color: '#FFFFFF',
        toolCount: 4,
    },
    {
        id: 'text-utilities',
        name: 'Text Utilities',
        description: 'Word counter, case converter, slug generator, and text formatting',
        icon: Type,
        color: '#FFFFFF',
        toolCount: 7,
    },
    {
        id: 'web-seo',
        name: 'Web & SEO',
        description: 'Meta tags, sitemap, robots.txt, URL shortener, and screenshots',
        icon: Globe,
        color: '#FFFFFF',
        toolCount: 5,
    },
    {
        id: 'calculators',
        name: 'Calculators',
        description: 'Unit converter, percentage, age, BMI, and loan calculators',
        icon: Calculator,
        color: '#FFFFFF',
        toolCount: 5,
    },
];

export function getCategoryById(id: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryByToolId(toolCategoryId: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === toolCategoryId);
}
