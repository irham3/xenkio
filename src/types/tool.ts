export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  featured?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
  categoryId: string;
  slug?: string;
}

/**
 * Tool category interface
 */
export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
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
