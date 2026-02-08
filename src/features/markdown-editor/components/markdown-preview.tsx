import { FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
    html: string;
    isEmpty: boolean;
    className?: string; // For container styling
}

export const MarkdownPreview = ({ html, isEmpty, className }: MarkdownPreviewProps) => {
    return (
        <>
            <div className={cn(
                "rounded-xl border overflow-y-auto min-h-0",
                !isEmpty ? "bg-white border-gray-200 shadow-sm" : "bg-white/50 border-dashed border-gray-200",
                className
            )}>
                {!isEmpty ? (
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50 p-8">
                        <FileCode className="w-8 h-8 text-gray-300" />
                        <p className="text-sm text-gray-400">Start typing to see preview...</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
          .markdown-body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            word-wrap: break-word;
            padding: 24px 32px;
            color: #1f2328;
          }
          .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            color: #1f2328;
          }
          .markdown-body h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; margin-top: 0; }
          .markdown-body h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
          .markdown-body h3 { font-size: 1.25em; }
          .markdown-body h4 { font-size: 1em; }
          .markdown-body h5 { font-size: 0.875em; color: #656d76; }
          .markdown-body h6 { font-size: 0.85em; color: #656d76; }
          .markdown-body p { margin-top: 0; margin-bottom: 16px; }
          .markdown-body a { color: #0969da; text-decoration: none; }
          .markdown-body a:hover { text-decoration: underline; }
          .markdown-body strong { font-weight: 600; }
          .markdown-body code {
            padding: 0.2em 0.4em;
            font-size: 85%;
            background-color: rgba(175, 184, 193, 0.2);
            border-radius: 6px;
            font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
          }
          .markdown-body pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .markdown-body pre code { background: transparent; padding: 0; font-size: 100%; }
          .markdown-body ul, .markdown-body ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
          .markdown-body ul { list-style-type: disc; }
          .markdown-body ol { list-style-type: decimal; }
          .markdown-body ul ul { list-style-type: circle; }
          .markdown-body ul ul ul { list-style-type: square; }
          .markdown-body li { margin-top: 0.25em; }
          .markdown-body li > ul, .markdown-body li > ol { margin-top: 0.25em; margin-bottom: 0; }
          .markdown-body blockquote {
            margin: 0 0 16px 0;
            padding: 0 1em;
            color: #656d76;
            border-left: 0.25em solid #d0d7de;
          }
          .markdown-body ul { padding-left: 2em; }
          .markdown-body ul.contains-task-list { padding-left: 0; list-style-type: none; }
          
          /* Modern Layout for Task Lists */
          .markdown-body li:has(input[type="checkbox"]) {
            list-style: none;
            display: flex;
            align-items: flex-start;
            gap: 0.5em;
            margin-bottom: 4px;
          }

          /* Checkbox Core Styling */
          .markdown-body input[type="checkbox"] {
            -webkit-appearance: none;
            appearance: none;
            display: inline-grid; /* Prevents line break */
            place-content: center;
            width: 1.15em;
            height: 1.15em;
            margin-top: 0.2em; /* Optical alignment */
            border: 1px solid #d0d7de;
            border-radius: 3px;
            background-color: #f6f8fa;
            cursor: default;
            opacity: 1 !important;
            flex-shrink: 0;
            position: relative;
          }

          /* Checked State (GitHub Blue) */
          .markdown-body input[type="checkbox"]:checked {
            background-color: #0969da;
            border-color: #0969da;
          }

          /* Checkmark Icon */
          .markdown-body input[type="checkbox"]:checked::after {
            content: '';
            width: 0.35em;
            height: 0.6em;
            border: solid white;
            border-width: 0 2.5px 2.5px 0; /* Slightly thicker for visibility */
            transform: rotate(45deg);
            margin-bottom: 2px;
          }

          .markdown-body table { border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; overflow: auto; display: block; width: 100%; }
          .markdown-body table th, .markdown-body table td { padding: 10px 14px; border: 1px solid #d0d7de; }
          .markdown-body table th { font-weight: 600; background-color: #f8fafc; color: #475569; }
          .markdown-body table tr:nth-child(2n) { background-color: #fbfcfd; }
          .markdown-body hr { height: 1px; padding: 0; margin: 32px 0; background-color: #e2e8f0; border: 0; }
          .markdown-body img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
          .markdown-body > *:first-child { margin-top: 0 !important; }
          .markdown-body > *:last-child { margin-bottom: 0 !important; }
            `}</style>
        </>
    );
};
