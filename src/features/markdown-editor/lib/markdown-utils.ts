import { marked } from 'marked';

// Configure marked options for safety
marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
});

/**
 * Convert markdown to HTML
 * Note: marked.parse with default options is safe for basic markdown rendering
 */
export function markdownToHtml(markdown: string): string {
    try {
        const rawHtml = marked.parse(markdown) as string;
        return rawHtml;
    } catch (error) {
        console.error('Error converting markdown:', error);
        return `<p>Error rendering markdown</p>`;
    }
}

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}

/**
 * Get word count from markdown
 */
export function getWordCount(markdown: string): number {
    const text = markdown.replace(/[#*`~\[\]()]/g, '').trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
}

/**
 * Get character count from markdown
 */
export function getCharacterCount(markdown: string): number {
    return markdown.length;
}

/**
 * Get line count from markdown
 */
export function getLineCount(markdown: string): number {
    if (!markdown) return 0;
    return markdown.split('\n').length;
}

/**
 * Sample markdown content for demo
 */
export const SAMPLE_MARKDOWN = `# Welcome to Markdown Editor

Edit this markdown in real-time and see the preview on the right!

## Features

- **Live Preview**: See your changes instantly
- **GitHub Flavored Markdown**: Full GFM support
- **Export Options**: Download as Markdown or HTML
- **Clean Interface**: Distraction-free writing

## Formatting Examples

### Text Styling

You can make text **bold**, *italic*, or ~~strikethrough~~.

### Code

Inline code: \`const greeting = "Hello World";\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Links and Images

[Visit Xenkio](https://xenkio.com)

### Lists

1. First item
2. Second item
3. Third item

- Unordered item
- Another item
  - Nested item

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Tables

| Feature | Status |
|---------|--------|
| Preview | ✅ |
| Export  | ✅ |
| Themes  | ✅ |

---

Start writing your markdown here!
`;
