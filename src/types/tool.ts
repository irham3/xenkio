import { LucideIcon } from 'lucide-react';

/**
 * Tool data interface for all tools in the application
 */
export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  usageCount: string;
  stats?: string;
  featured?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
  categoryId: string;
  slug?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

/**
 * Tool category interface
 */
export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  toolCount: number;
}

/**
 * Search suggestion interface
 */
export interface SearchSuggestion {
  type: 'tool' | 'category';
  name: string;
  category?: string;
  count?: number;
}
