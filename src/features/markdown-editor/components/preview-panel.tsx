'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MarkdownPreview } from './markdown-preview';
import { CopyButton } from '@/components/shared';

interface PreviewPanelProps {
    html: string;
    markdown: string;
    onDownload: () => void;
    heightClass: string;
}

export function PreviewPanel({
    html,
    markdown,
    onDownload,
    heightClass
}: PreviewPanelProps) {
    return (
        <div className="bg-gray-50/50 flex flex-col h-full overflow-hidden">
            <div className="p-5 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-baseline justify-between mb-3 shrink-0">
                    <h3 className="text-sm font-semibold text-gray-800">Preview</h3>
                </div>
                <MarkdownPreview
                    html={html}
                    isEmpty={!markdown.trim()}
                    className={cn("flex-1", heightClass)}
                />
                <div className="flex gap-2 mt-3 shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onDownload}
                        disabled={!markdown.trim()}
                        className="h-8 gap-1.5 text-xs font-medium border-gray-200 hover:bg-gray-100 cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Download HTML
                    </Button>
                    <CopyButton
                        value={html}
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs font-medium border-gray-200"
                    />
                </div>
            </div>
        </div>
    );
}
