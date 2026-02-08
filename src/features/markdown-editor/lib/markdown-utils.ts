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
export const SAMPLE_MARKDOWN = `# Xenkio Technical Documentation

This document serves as a comprehensive reference for the Xenkio productivity suite. It outlines the architectural specifications, module capabilities, and usage patterns for the platform's client-side tools.

## 1. Platform Architecture

Xenkio operates on a serverless infrastructure, prioritizing privacy and performance. All sensitive data processing—including PDF manipulation and image conversion—is executed locally within the user's browser or on transient edge workers.

### Key Performance Indicators
The following table summarizes the performance benchmarks for core modules at reasonable load.

| Module Name | Processing Strategy | Average Latency | Reliability |
| :--- | :---: | ---: | :---: |
| QR Generator | Client-Side Canvas | 12ms | 99.99% |
| PDF Engine | WebAssembly | 48ms | 99.95% |
| Image Ops | Browser Native API | 24ms | 100.00% |

---

## 2. Usage Guidelines

To ensure optimal results when integrating with the Xenkio ecosystem, adhere to the following standards.

> "Efficiency is not just about speed, but about the precision of execution. Our tools are designed to respect the user's workflow without introducing unnecessary friction."
> — *Xenkio Engineering Standard*

### Text Formatting
Standard markdown formatting is fully supported:
*   **Strong Emphasis**: Use bold for critical alerts.
*   *Emphasis*: Use italics for terminology or definitions.
*   ~~Deprecated~~: Use strikethrough for outdated specs.
*   <u>Underline</u>: Use selectively for visual highlights.

### List Structures
Complex data can be organized using nested lists:

1.  **Preparation Phase**
    *   Verify file integrity
    *   Check format compatibility (PDF, JPG, PNG)
2.  **Execution Phase**
    *   Select appropriate tool
    *   Configure output parameters
3.  **Finalization**
    *   Download artifacts
    *   Clear session cache

### Task Management
Current development status for the Q3 release cycle:

- [x] Optimize WASM binary size
- [x] Implement strict type safety across all modules
- [ ] Finalize multi-region edge deployment
- [ ] Complete WCAG 2.1 accessibility audit

---

## 3. Developer Reference

For developers integrating Xenkio utilities, we provide a strongly typed API.

\`\`\`typescript
/**
 * Initialize the core processing engine.
 * @param config {Object} System configuration options
 */
export async function initializeEngine(config: EngineConfig): Promise<void> {
  if (!config.apiKey) {
    throw new Error("Authentication failed: Missing API Key");
  }
  
  await loadWasmModule();
  console.log("System Ready");
}
\`\`\`

You can also reference \`config.maxRetries\` in your local environment settings.

---

## 4. Visual Implementation

The interface is designed with a focus on minimalism and data density.

![System Workspace](https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=1200&h=600)

---

#### Appendix A: Error Codes
##### System Errors
###### Critical Failures
For detailed error logs, refer to the internal telemetry dashboard.

*Documentation Revision 4.2.0 — Generated by Xenkio Markdown Editor*
`;
