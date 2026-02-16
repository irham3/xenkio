export interface MarkdownEditorState {
    markdown: string;
    html: string;
}

export interface MarkdownRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
}

export const DEFAULT_MARKDOWN_RULES: MarkdownRule[] = [
    {
        id: 'headings',
        name: 'Headings',
        description: 'Support for # headings (H1-H6)',
        enabled: true,
    },
    {
        id: 'bold',
        name: 'Bold',
        description: 'Support for **bold** text',
        enabled: true,
    },
    {
        id: 'italic',
        name: 'Italic',
        description: 'Support for *italic* text',
        enabled: true,
    },
    {
        id: 'strikethrough',
        name: 'Strikethrough',
        description: 'Support for ~~strikethrough~~ text',
        enabled: true,
    },
    {
        id: 'links',
        name: 'Links',
        description: 'Support for [text](url) links',
        enabled: true,
    },
    {
        id: 'images',
        name: 'Images',
        description: 'Support for ![alt](url) images',
        enabled: true,
    },
    {
        id: 'code',
        name: 'Code',
        description: 'Support for `inline code` and ```code blocks```',
        enabled: true,
    },
    {
        id: 'lists',
        name: 'Lists',
        description: 'Support for ordered and unordered lists',
        enabled: true,
    },
    {
        id: 'blockquotes',
        name: 'Blockquotes',
        description: 'Support for > blockquotes',
        enabled: true,
    },
    {
        id: 'tables',
        name: 'Tables',
        description: 'Support for markdown tables',
        enabled: true,
    },
    {
        id: 'hr',
        name: 'Horizontal Rules',
        description: 'Support for --- horizontal rules',
        enabled: true,
    },
];

export type ViewMode = 'split' | 'editor' | 'preview';
