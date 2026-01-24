import { LucideIcon } from 'lucide-react';

export type ToolCategory =
  | 'data-processing'
  | 'media-images'
  | 'text-utilities'
  | 'developer-tools'
  | 'security-privacy'
  | 'documents';

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: ToolCategory;
  icon: string;
  usageCount: string;
  isFeatured: boolean;
  isNew: boolean;
  isPremium: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

export interface Category {
  id: ToolCategory;
  name: string;
  description: string;
  slug: string;
  icon: string;
  toolCount: number;
  backgroundColor?: string;
}

export interface ToolCardProps {
  id?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  usageCount?: string;
  stats?: string;
  featured?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
  categoryId?: string;
  gradientFrom?: string;
  gradientTo?: string;
}
