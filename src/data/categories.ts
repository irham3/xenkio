import {
    Database,
    FileImage,
    Code2,
    FileText,
    Lock,
    Type,
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
        id: 'data-processing',
        name: 'Data Processing',
        description: 'Transform, convert, and analyze data in various formats',
        icon: Database,
        color: '#FFFFFF',
        toolCount: 7,
    },
    {
        id: 'media-images',
        name: 'Media & Images',
        description: 'Edit, convert, and optimize images and media files',
        icon: FileImage,
        color: '#FFFFFF',
        toolCount: 12,
    },
    {
        id: 'developer-tools',
        name: 'Developer Tools',
        description: 'Code formatting, debugging, and development utilities',
        icon: Code2,
        color: '#FFFFFF',
        toolCount: 10,
    },
    {
        id: 'documents',
        name: 'Documents',
        description: 'Convert, merge, split, and edit PDF and document files',
        icon: FileText,
        color: '#FFFFFF',
        toolCount: 8,
    },
    {
        id: 'security-privacy',
        name: 'Security & Privacy',
        description: 'Password generation, encryption, and security tools',
        icon: Lock,
        color: '#FFFFFF',
        toolCount: 6,
    },
    {
        id: 'text-utilities',
        name: 'Text Utilities',
        description: 'Text manipulation, conversion, and formatting tools',
        icon: Type,
        color: '#FFFFFF',
        toolCount: 6,
    },
];

export function getCategoryById(id: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryByToolId(toolCategoryId: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === toolCategoryId);
}
