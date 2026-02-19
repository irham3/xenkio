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
        description: 'Merge, split, compress, and convert PDFs — processed locally, no uploads required',
        icon: FileText,
        color: '#E4E4E7',
        toolCount: 8,
    },
    {
        id: 'media-images',
        name: 'Media & Images',
        description: 'Compress, resize, and convert images in your browser — no file size limits',
        icon: FileImage,
        color: '#E4E4E7',
        toolCount: 11,
    },
    {
        id: 'security-privacy',
        name: 'Security & Privacy',
        description: 'Password generation, hashing, encryption, and JWT tools — everything stays on your device',
        icon: Lock,
        color: '#E4E4E7',
        toolCount: 7,
    },
    {
        id: 'developer-tools',
        name: 'Developer Tools',
        description: 'JSON formatter, regex tester, diff checker, and code utilities — instant, no server needed',
        icon: Code2,
        color: '#E4E4E7',
        toolCount: 11,
    },
    {
        id: 'design-tools',
        name: 'Design Tools',
        description: 'Color picker, palette generator, gradients, and contrast checker — all browser-based',
        icon: Palette,
        color: '#E4E4E7',
        toolCount: 4,
    },
    {
        id: 'text-utilities',
        name: 'Text Utilities',
        description: 'Word counter, case converter, slug generator, and text formatting — fast and private',
        icon: Type,
        color: '#E4E4E7',
        toolCount: 7,
    },
    {
        id: 'web-seo',
        name: 'Web & SEO',
        description: 'Meta tags, sitemap, robots.txt, and URL tools — generate locally, no data sent',
        icon: Globe,
        color: '#E4E4E7',
        toolCount: 5,
    },
    {
        id: 'calculators',
        name: 'Calculators',
        description: 'Unit converter, percentage, age, BMI, and loan calculators — instant results offline',
        icon: Calculator,
        color: '#E4E4E7',
        toolCount: 5,
    },
];

export function getCategoryById(id: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryByToolId(toolCategoryId: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === toolCategoryId);
}
