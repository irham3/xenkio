
'use client';

import React from 'react';
import { useJsonFormatter, Indentation } from '../hooks/use-json-formatter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Trash2, Code2, Download, Braces, FileJson } from 'lucide-react';
import { toast } from 'sonner';

export function JsonFormatterTool() {
    const {
        input,
        setInput,
        output,
        error,
        indentation,
        setIndentation,
        formatJson,
        minifyJson,
        clear,
        loadSample
    } = useJsonFormatter();

    const handleCopy = () => {
        if (!output && !input) return;
        navigator.clipboard.writeText(output || input);
        toast.success('JSON copied to clipboard');
    };

    const handleDownload = () => {
        if (!output && !input) return;
        const blob = new Blob([output || input], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `data-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCreateNew = () => {
        clear();
        toast.info('New Empty JSON created');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-2 z-10 w-full">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCreateNew} className="text-gray-600">
                        <FileJson size={16} className="mr-2 text-primary-500" /> New
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadSample} className="text-gray-600 hidden sm:flex">
                        Load Sample
                    </Button>
                    <span className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-gray-500 hidden sm:block">Indent:</Label>
                        <Select value={String(indentation)} onValueChange={(v) => setIndentation(v === 'tab' ? 'tab' : Number(v) as Indentation)}>
                            <SelectTrigger className="h-8 w-[100px] text-xs">
                                <SelectValue placeholder="2 Spaces" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2 Spaces</SelectItem>
                                <SelectItem value="4">4 Spaces</SelectItem>
                                <SelectItem value="tab">Tab</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={formatJson} className="bg-primary-600 hover:bg-primary-700 text-white shadow-primary">
                        <Braces size={16} className="mr-2" /> Format
                    </Button>
                    <Button size="sm" variant="secondary" onClick={minifyJson} className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                        <Code2 size={16} className="mr-2" /> Minify
                    </Button>
                    <Button size="icon" variant="ghost" onClick={clear} title="Clear All" className="text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
                {/* Input Panel */}
                <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200" />
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Input JSON</span>
                        <div className="flex gap-1">
                            {/* Actions if needed */}
                        </div>
                    </div>
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className="flex-1 w-full h-full resize-none border-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed text-gray-800 bg-transparent"
                        spellCheck={false}
                    />
                    {/* Error Overlay */}
                    {error && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}
                </div>

                {/* Output Panel */}
                <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary-600 to-primary-400" />
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Result</span>
                        <div className="flex gap-1 opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={handleCopy} className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                                <Copy size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleDownload} className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                                <Download size={14} />
                            </Button>
                        </div>
                    </div>
                    <Textarea
                        value={output}
                        readOnly
                        placeholder="Formatted JSON will appear here..."
                        className="flex-1 w-full h-full resize-none border-none focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed text-green-400 bg-transparent placeholder-gray-600 selection:bg-primary-900 selection:text-white"
                        spellCheck={false}
                    />
                </div>
            </div>

        </div>
    );
}
