
import {
    Database,
    Image,
    Type,
    Code2,
    Shield,
    FileText,
    LucideIcon,
} from 'lucide-react';

export interface CategoryData {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    toolCount: number;
    backgroundColor: string;
}

export const CATEGORIES: CategoryData[] = [
    {
        id: 'data-processing',
        name: 'Data Processing',
        description: 'Extract, transform, and analyze structured data',
        icon: Database,
        toolCount: 23,
        backgroundColor: '#EFF6FF',
    },
    {
        id: 'media-images',
        name: 'Media & Images',
        description: 'Compress, convert, and enhance visual assets',
        icon: Image,
        toolCount: 31,
        backgroundColor: '#FEF3C7',
    },
    {
        id: 'text-utilities',
        name: 'Text Utilities',
        description: 'Transform, format, and analyze text content',
        icon: Type,
        toolCount: 18,
        backgroundColor: '#F3E8FF',
    },
    {
        id: 'developer-tools',
        name: 'Developer Tools',
        description: 'Essential utilities for software development',
        icon: Code2,
        toolCount: 27,
        backgroundColor: '#ECFDF5',
    },
    {
        id: 'security-privacy',
        name: 'Security & Privacy',
        description: 'Encryption, hashing, and security utilities',
        icon: Shield,
        toolCount: 15,
        backgroundColor: '#FEE2E2',
    },
    {
        id: 'documents',
        name: 'Documents',
        description: 'PDF tools, converters, and document processing',
        icon: FileText,
        toolCount: 19,
        backgroundColor: '#FEF9C3',
    },
];
