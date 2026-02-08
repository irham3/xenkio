"use client"

import { useState } from "react";
import { useMarkdownEditor } from "@/features/markdown-editor/hooks/use-markdown-editor";
import { downloadFile, copyToClipboard, getWordCount, getCharacterCount, getLineCount } from "@/features/markdown-editor/lib/markdown-utils";
import { ViewMode } from "@/features/markdown-editor/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Copy,
    Check,
    Download,
    FileText,
    Code,
    Eye,
    Columns2,
    RotateCcw,
    Sparkles,
    Zap,
    FileCode,
} from "lucide-react";

export function MarkdownEditorClient() {
    const {
        markdown,
        html,
        viewMode,
        setViewMode,
        updateMarkdown,
        resetToSample,
    } = useMarkdownEditor();

    const [copiedMd, setCopiedMd] = useState(false);
    const [copiedHtml, setCopiedHtml] = useState(false);

    const handleCopyMarkdown = async () => {
        const success = await copyToClipboard(markdown);
        if (success) {
            setCopiedMd(true);
            setTimeout(() => setCopiedMd(false), 2000);
        }
    };

    const handleCopyHtml = async () => {
        const success = await copyToClipboard(html);
        if (success) {
            setCopiedHtml(true);
            setTimeout(() => setCopiedHtml(false), 2000);
        }
    };

    const handleDownloadMarkdown = () => {
        downloadFile(markdown, 'document.md', 'text/markdown');
    };

    const handleDownloadHtml = () => {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1f2328; }
    h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    code { background: rgba(175, 184, 193, 0.2); padding: 0.2em 0.4em; border-radius: 6px; font-family: ui-monospace, monospace; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 0.25em solid #d0d7de; padding-left: 1em; color: #656d76; margin: 0; }
    table { border-collapse: collapse; } th, td { border: 1px solid #d0d7de; padding: 6px 13px; }
    th { background: #f6f8fa; } a { color: #0969da; text-decoration: none; }
  </style>
</head>
<body>${html}</body>
</html>`;
        downloadFile(fullHtml, 'document.html', 'text/html');
    };

    const words = getWordCount(markdown);
    const chars = getCharacterCount(markdown);
    const lines = getLineCount(markdown);

    const VIEW_MODES: { id: ViewMode; name: string; icon: typeof Code }[] = [
        { id: 'editor', name: 'Editor', icon: Code },
        { id: 'split', name: 'Split', icon: Columns2 },
        { id: 'preview', name: 'Preview', icon: Eye },
    ];

    return (
        <div className="w-full">
            {/* Main Tool Area */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-gray-200">
                            {VIEW_MODES.map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        viewMode === mode.id
                                            ? "bg-primary-100 text-primary-700"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    )}
                                >
                                    <mode.icon className="w-3.5 h-3.5" />
                                    {mode.name}
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-3 px-3 text-xs text-gray-500 font-medium tabular-nums">
                            <span>{words} words</span>
                            <span className="text-gray-300">•</span>
                            <span>{chars} chars</span>
                            <span className="text-gray-300">•</span>
                            <span>{lines} lines</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={resetToSample}
                            className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 rounded-lg hover:bg-primary-50 transition-all flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" />
                            Load Sample
                        </button>
                        <button
                            onClick={resetToSample}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
                            title="Reset"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Editor Area with fixed height */}
                <div className={cn(
                    "grid gap-0",
                    viewMode === 'split' ? "lg:grid-cols-2" : "grid-cols-1"
                )}>
                    {/* Editor Panel */}
                    {(viewMode === 'editor' || viewMode === 'split') && (
                        <div className={cn(
                            "p-5 border-b lg:border-b-0",
                            viewMode === 'split' && "lg:border-r border-gray-100"
                        )}>
                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between">
                                    <label htmlFor="markdown-input" className="text-sm font-semibold text-gray-800">
                                        Markdown
                                    </label>
                                    <span className="text-xs text-gray-400 font-medium tabular-nums">
                                        {chars.toLocaleString()} chars
                                    </span>
                                </div>
                                {/* Viewport-fit scrollable textarea container */}
                                <div className="h-[calc(100vh-480px)] min-h-[250px]">
                                    <textarea
                                        id="markdown-input"
                                        value={markdown}
                                        onChange={(e) => updateMarkdown(e.target.value)}
                                        placeholder="Start writing your markdown here..."
                                        spellCheck={false}
                                        className="w-full h-full p-4 text-[14px] font-mono leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDownloadMarkdown}
                                        disabled={!markdown.trim()}
                                        className="h-8 gap-1.5 text-xs font-medium border-gray-200 hover:bg-gray-100"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download .md
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleCopyMarkdown}
                                        disabled={!markdown.trim()}
                                        className={cn(
                                            "h-8 gap-1.5 text-xs font-medium border-gray-200 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all",
                                            copiedMd && "text-success-600 border-success-500 bg-success-50"
                                        )}
                                    >
                                        {copiedMd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copiedMd ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Panel */}
                    {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className="p-5 bg-gray-50/50">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        Preview
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                            <Zap className="w-3 h-3" />
                                            Live
                                        </span>
                                        {markdown.trim() && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleDownloadHtml}
                                                    className="h-7 gap-1 text-xs font-medium border-gray-200 bg-white hover:bg-gray-50"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    HTML
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleCopyHtml}
                                                    className={cn(
                                                        "h-7 gap-1 text-xs font-medium border-gray-200 bg-white hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700",
                                                        copiedHtml && "text-success-600 border-success-500 bg-success-50"
                                                    )}
                                                >
                                                    {copiedHtml ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                    {copiedHtml ? 'Copied' : 'Copy'}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Viewport-fit scrollable preview container */}
                                <div className={cn(
                                    "h-[calc(100vh-480px)] min-h-[250px] rounded-xl border overflow-y-auto",
                                    markdown.trim()
                                        ? "bg-white border-gray-200 shadow-sm"
                                        : "bg-white/50 border-dashed border-gray-200"
                                )}>
                                    {markdown.trim() ? (
                                        <div
                                            className="markdown-body"
                                            dangerouslySetInnerHTML={{ __html: html }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50">
                                            <FileCode className="w-8 h-8 text-gray-300" />
                                            <p className="text-sm text-gray-400">Start typing to see preview...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State (when editor open but empty) */}
                {!markdown.trim() && viewMode === 'editor' && (
                    <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">Ready to Write</h3>
                            <p className="text-xs text-gray-500 max-w-[250px]">
                                Start typing markdown or click &quot;Load Sample&quot; to see an example.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* GitHub Markdown Styles */}
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
        .markdown-body li { margin-top: 0.25em; }
        .markdown-body blockquote {
          margin: 0 0 16px 0;
          padding: 0 1em;
          color: #656d76;
          border-left: 0.25em solid #d0d7de;
        }
        .markdown-body table { border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; }
        .markdown-body table th, .markdown-body table td { padding: 6px 13px; border: 1px solid #d0d7de; }
        .markdown-body table th { font-weight: 600; background-color: #f6f8fa; }
        .markdown-body table tr:nth-child(2n) { background-color: #f6f8fa; }
        .markdown-body hr { height: 0.25em; padding: 0; margin: 24px 0; background-color: #d0d7de; border: 0; }
        .markdown-body img { max-width: 100%; height: auto; }
        .markdown-body > *:first-child { margin-top: 0 !important; }
        .markdown-body > *:last-child { margin-bottom: 0 !important; }
      `}</style>
        </div>
    );
}
