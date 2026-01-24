import { Database, Image, Type, Code2, Shield, FileText, FileJson, Lock, Wand2 } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: any; 
  toolCount: number;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Extract, transform, and analyze data',
    slug: 'data-processing',
    icon: Database,
    toolCount: 23,
    backgroundColor: '#EFF6FF', 
    gradientFrom: '#EFF6FF',
    gradientTo: '#DBEAFE',
  },
  {
    id: 'media-images',
    name: 'Media & Images',
    description: 'Compress, edit, and enhance images',
    slug: 'media-images',
    icon: Image,
    toolCount: 31,
    backgroundColor: '#FFF7ED', 
    gradientFrom: '#FFF7ED',
    gradientTo: '#FFEDD5',
  },
  {
    id: 'text-utilities',
    name: 'Text Utilities',
    description: 'Convert, format, and analyze text',
    slug: 'text-utilities',
    icon: Type,
    toolCount: 18,
    backgroundColor: '#F5F3FF', 
    gradientFrom: '#F5F3FF',
    gradientTo: '#EDE9FE',
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Code formatters, testers, and utilities',
    slug: 'developer-tools',
    icon: Code2,
    toolCount: 27,
    backgroundColor: '#ECFDF5', 
    gradientFrom: '#ECFDF5',
    gradientTo: '#D1FAE5',
  },
  {
    id: 'security-privacy',
    name: 'Security & Privacy',
    description: 'Encryption, hashing, and password tools',
    slug: 'security-privacy',
    icon: Shield,
    toolCount: 15,
    backgroundColor: '#FEF2F2', 
    gradientFrom: '#FEF2F2',
    gradientTo: '#FEE2E2',
  },
  {
    id: 'documents',
    name: 'Documents',
    description: 'PDF tools, converters, and processors',
    slug: 'documents',
    icon: FileText,
    toolCount: 19,
    backgroundColor: '#FFFBEB', 
    gradientFrom: '#FFFBEB',
    gradientTo: '#FEF3C7',
  },
];

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  categoryId: string;
  featured?: boolean;
  stats?: string; 
  badge?: string;
  href: string;
  usageCount?: string;
}

export const TOOLS: Tool[] = [
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files instantly.',
    icon: FileText,
    categoryId: 'documents',
    featured: true,
    stats: '4.9',
    badge: 'Popular',
    href: '#',
    usageCount: '25k'
  },
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Reduce image size without losing quality. Supports PNG, JPG, WebP.',
    icon: Image,
    categoryId: 'media-images',
    featured: true,
    stats: '4.8',
    href: '#',
    usageCount: '18k'
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Beautify and validate JSON data with error highlighting.',
    icon: FileJson,
    categoryId: 'developer-tools',
    featured: true,
    stats: '4.9',
    badge: 'Dev Choice',
    href: '#',
    usageCount: '10k'
  },
   {
    id: 'sql-generator',
    title: 'SQL Generator',
    description: 'Generate SQL queries from natural language descriptions.',
    icon: Database,
    categoryId: 'data-processing',
    href: '#',
    usageCount: '5k'
  },
  {
    id: 'password-generator',
    title: 'Password Generator',
    description: 'Create strong, secure passwords with custom requirements.',
    icon: Lock,
    categoryId: 'security-privacy',
    href: '#',
    usageCount: '12k'
  },
  {
      id: 'case-converter',
      title: 'Case Converter',
      description: 'Convert text between upper, lower, camel, and snake case.',
      icon: Type,
      categoryId: 'text-utilities',
      href: '#',
      usageCount: '8k'
  },
  {
      id: 'lorem-ipsum',
      title: 'Lorem Ipsum Generator',
      description: 'Generate placeholder text for your designs.',
      icon: Wand2,
      categoryId: 'text-utilities',
      href: '#',
      usageCount: '15k'
  }
];
