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
        color: '#8B5CF6',
        toolCount: 7,
    },
    {
        id: 'media-images',
        name: 'Media & Images',
        description: 'Edit, convert, and optimize images and media files',
        icon: FileImage,
        color: '#10B981',
        toolCount: 12,
    },
    {
        id: 'developer-tools',
        name: 'Developer Tools',
        description: 'Code formatting, debugging, and development utilities',
        icon: Code2,
        color: '#3B82F6',
        toolCount: 10,
    },
    {
        id: 'documents',
        name: 'Documents',
        description: 'Convert, merge, split, and edit PDF and document files',
        icon: FileText,
        color: '#F97316',
        toolCount: 8,
    },
    {
        id: 'security-privacy',
        name: 'Security & Privacy',
        description: 'Password generation, encryption, and security tools',
        icon: Lock,
        color: '#EF4444',
        toolCount: 6,
    },
    {
        id: 'text-utilities',
        name: 'Text Utilities',
        description: 'Text manipulation, conversion, and formatting tools',
        icon: Type,
        color: '#EC4899',
        toolCount: 6,
    },
];

export function getCategoryById(id: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryByToolId(toolCategoryId: string): CategoryData | undefined {
    return CATEGORIES.find((cat) => cat.id === toolCategoryId);
}
