'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, Download, Trash2, FileJson, FileSpreadsheet, ChevronRight, Wand2, Upload, Table as TableIcon, FileText, AlertCircle } from 'lucide-react';
import { jsonToCsv, generateCsvData, ConvertOptions } from '../lib/converter';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { JsonEditor } from './json-editor';
import { CsvViewer } from './csv-viewer';

const SAMPLE_JSON = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "roles": ["admin", "editor"],
        "details": {
            "age": 30,
            "city": "New York"
        }
    },
    {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "roles": ["user"],
        "details": {
            "age": 25,
            "city": "London"
        }
    }
];

export function JsonToCsvTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [tableData, setTableData] = useState<{ headers: string[], rows: string[][] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<ConvertOptions>({
        delimiter: ',',
        flatten: true
    });
    const [activeTab, setActiveTab] = useState<'csv' | 'table'>('csv');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleConvert = useCallback(() => {
        if (!input.trim()) {
            setOutput('');
            setTableData(null);
            setError(null);
            return;
        }

        try {
            // Generate both CSV string and Table data
            const csvResult = jsonToCsv(input, options);
            const tableResult = generateCsvData(input, options);

            setOutput(csvResult);
            setTableData(tableResult);
            setError(null);
        } catch (err) {
            // Don't clear output while typing unless empty, just show error
            setError((err as Error).message);
        }
    }, [input, options]);

    // Auto-convert on input change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            handleConvert();
        }, 500);
        return () => clearTimeout(timer);
    }, [handleConvert]);

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'converted_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("CSV file downloaded");
    };

    const loadSample = () => {
        const json = JSON.stringify(SAMPLE_JSON, null, 2);
        setInput(json);
    };

    const formatJson = () => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 2));
            setError(null);
            toast.success("JSON formatted");
        } catch (err) {
            toast.error("Invalid JSON content");
            setError((err as Error).message);
        }
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
        setTableData(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // File Upload Handling
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        readFile(file);
    };

    const readFile = (file: File) => {
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            toast.error("Please upload a valid JSON file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setInput(content);
            toast.success("File uploaded successfully");
        };
        reader.readAsText(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px]">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,application/json"
                className="hidden"
            />

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 transition-all hover:shadow-md">
                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-3">
                        <Label htmlFor="delimiter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Delimiter</Label>
                        <Select
                            value={options.delimiter}
                            onValueChange={(val) => setOptions(prev => ({ ...prev, delimiter: val }))}
                        >
                            <SelectTrigger id="delimiter" className="w-[130px] h-9 text-sm bg-white border-gray-200">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=",">Comma (,)</SelectItem>
                                <SelectItem value=";">Semicolon (;)</SelectItem>
                                <SelectItem value="\t">Tab (\t)</SelectItem>
                                <SelectItem value="|">Pipe (|)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                    <div className="flex items-center gap-3">
                        <Label htmlFor="flatten" className="text-sm font-medium text-gray-700 cursor-pointer select-none">Flatten Object</Label>
                        <Switch
                            id="flatten"
                            checked={options.flatten}
                            onCheckedChange={(val) => setOptions(prev => ({ ...prev, flatten: val }))}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
                    <Button variant="ghost" size="sm" onClick={loadSample} className="text-sm h-9 text-primary-600 hover:bg-primary-50 px-3 font-medium">
                        Load Sample
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-sm h-9 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 font-medium">
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Clear All
                    </Button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* JSON Input Panel */}
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-yellow-100 rounded-md">
                                <FileJson className="w-4 h-4 text-yellow-700" />
                            </div>
                            <span className="font-semibold text-gray-700 text-sm">JSON Input</span>
                            {error && (
                                <div className="flex items-center gap-1.5 ml-3 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium animate-pulse">
                                    <AlertCircle className="w-3 h-3" />
                                    Invalid JSON
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm" onClick={() => fileInputRef.current?.click()} title="Upload JSON File">
                                <Upload className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm" onClick={() => handleCopy(input)} title="Copy JSON">
                                <Copy className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm" onClick={formatJson} title="Format JSON">
                                <Wand2 className="w-4 h-4 text-gray-500" />
                            </Button>
                        </div>
                    </div>

                    <div
                        className="flex-1 relative"
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        {isDragging && (
                            <div className="absolute inset-0 z-20 bg-primary-50/90 flex flex-col items-center justify-center border-2 border-dashed border-primary-300 m-2 rounded-lg backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                                <Upload className="w-12 h-12 text-primary-500 mb-2" />
                                <p className="text-lg font-semibold text-primary-700">Drop JSON file here</p>
                            </div>
                        )}
                        <JsonEditor
                            value={input}
                            onChange={setInput}
                            error={error}
                            placeholder="Paste your JSON here or drag & drop a file..."
                            className="w-full h-full border-0"
                        />
                    </div>
                </div>

                {/* Conversion Arrow (Visible on Desktop) */}
                <div className="hidden lg:flex flex-col items-center justify-center text-gray-300 gap-2">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                </div>

                {/* Output Panel (CSV / Table) */}
                <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'csv' | 'table')} className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 rounded-md">
                                        <FileSpreadsheet className="w-4 h-4 text-green-700" />
                                    </div>
                                    <span className="font-semibold text-gray-700 text-sm">Output</span>
                                </div>

                                <TabsList className="h-8 bg-gray-200/50 p-0.5">
                                    <TabsTrigger value="csv" className="h-7 text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                                        CSV Text
                                    </TabsTrigger>
                                    <TabsTrigger value="table" className="h-7 text-xs px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                        <TableIcon className="w-3.5 h-3.5 mr-1.5" />
                                        Table Preview
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-xs border-gray-200 hover:bg-gray-50" onClick={() => handleCopy(output)} disabled={!output} title="Copy CSV">
                                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                                    Copy
                                </Button>
                                <Button variant="default" size="sm" className="h-8 text-xs bg-primary-600 hover:bg-primary-700 text-white shadow-sm" onClick={handleDownload} disabled={!output}>
                                    <Download className="w-3.5 h-3.5 mr-1.5" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-white overflow-hidden">
                            <TabsContent value="csv" className="absolute inset-0 m-0 p-0 h-full w-full data-[state=inactive]:hidden">
                                <CsvViewer
                                    value={output}
                                    delimiter={options.delimiter}
                                    placeholder="CSV output will appear here..."
                                />
                            </TabsContent>

                            <TabsContent value="table" className="absolute inset-0 m-0 p-0 h-full w-full overflow-auto data-[state=inactive]:hidden bg-white">
                                {tableData && tableData.headers.length > 0 ? (
                                    <div className="w-full h-full overflow-auto">
                                        <table className="w-full text-sm text-left border-collapse min-w-max">
                                            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    {tableData.headers.map((header, i) => (
                                                        <th key={i} className="px-4 py-3 font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0 whitespace-nowrap bg-gray-50">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {tableData.rows.map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="px-4 py-2 text-gray-600 border-r border-gray-100 last:border-r-0 whitespace-pre max-w-xs truncate" title={cell}>
                                                                {cell || <span className="text-gray-300 italic">null</span>}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                        <TableIcon className="w-12 h-12 opacity-20" />
                                        <p className="text-sm">Enter valid JSON to see table preview</p>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
