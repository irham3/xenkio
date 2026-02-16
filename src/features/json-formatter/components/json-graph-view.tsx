'use client';

import { useState, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Circle, Box, Layers, Type, Hash, ToggleLeft, Copy, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface JsonGraphViewProps {
    data: unknown;
}

type DataType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

// Context for search filtering and path tracking
// Context for search filtering and path tracking
interface GraphContextType {
    searchTerm: string;
}

const GraphContext = createContext<GraphContextType>({ searchTerm: '' });

const getDataType = (value: unknown): DataType => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
};

const DataTypeIcon = ({ type }: { type: DataType }) => {
    switch (type) {
        case 'object': return <Box className="w-3 h-3 text-purple-500" />;
        case 'array': return <Layers className="w-3 h-3 text-blue-500" />;
        case 'string': return <Type className="w-3 h-3 text-green-500" />;
        case 'number': return <Hash className="w-3 h-3 text-orange-500" />;
        case 'boolean': return <ToggleLeft className="w-3 h-3 text-red-500" />;
        case 'null': return <Circle className="w-3 h-3 text-gray-400" />;
    }
};

const GraphNode = ({
    label,
    value,
    level = 0,
    path = ''
}: {
    label?: string,
    value: unknown,
    level?: number,
    path?: string
}) => {
    const { searchTerm } = useContext(GraphContext);
    const [isExpanded, setIsExpanded] = useState(true);
    const [copied, setCopied] = useState(false);

    const type = getDataType(value);
    const isExpandable = type === 'object' || type === 'array';

    // Check if this node matches search term
    const isMatch = useMemo(() => {
        if (!searchTerm) return false;
        const term = searchTerm.toLowerCase();
        const labelMatch = label?.toLowerCase().includes(term);
        const valueMatch = String(value).toLowerCase().includes(term);
        return labelMatch || (valueMatch && !isExpandable);
    }, [searchTerm, label, value, isExpandable]);


    // Copy Path functionality
    const handleCopyPath = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(path || 'root');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Limits initial expansion for deep formatting performance
    // const defaultExpanded = level < 3; 

    // Formatting for display
    const displayValue = () => {
        if (type === 'object') return `{ ${(value ? Object.keys(value).length : 0)} items }`;
        if (type === 'array') return `[ ${(value as unknown[]).length} items ]`;
        if (type === 'null') return 'null';
        if (type === 'string') return `"${value}"`;
        return String(value);
    };

    return (
        <div className="flex items-start">
            <div className="flex flex-col items-start relative">
                {/* Node Card */}
                <div
                    onClick={() => isExpandable && setIsExpanded(!isExpanded)}
                    className={cn(
                        "relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm transition-all duration-200 select-none group pr-10",
                        isExpandable ? "cursor-pointer hover:shadow-md hover:border-primary-200 bg-white" : "bg-gray-50/50 border-gray-200",
                        type === 'object' && "border-purple-100 bg-purple-50/10",
                        type === 'array' && "border-blue-100 bg-blue-50/10",
                        type === 'string' && "border-green-100 bg-green-50/10",
                        isMatch && "ring-2 ring-yellow-400 bg-yellow-50 border-yellow-200"
                    )}
                >
                    {/* Copy Path Button (Visible on Hover) */}
                    <button
                        onClick={handleCopyPath}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
                        title="Copy JSON Path"
                    >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-500" />}
                    </button>
                    {/* Expand Toggle */}
                    {isExpandable && (
                        <div className="mr-1 text-gray-400 group-hover:text-primary-500 transition-colors">
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </div>
                    )}

                    {/* Type Icon */}
                    <DataTypeIcon type={type} />

                    {/* Key/Label */}
                    {label && (
                        <span className={cn(
                            "font-mono text-xs font-bold text-gray-700",
                            isMatch && label?.toLowerCase().includes(searchTerm.toLowerCase()) && "bg-yellow-200"
                        )}>
                            {label}
                        </span>
                    )}

                    {/* Separator */}
                    {label && <span className="text-gray-300 text-[10px]">:</span>}

                    {/* Value Preview */}
                    <span className={cn(
                        "font-mono text-xs truncate max-w-[200px]",
                        type === 'string' && "text-green-600 font-medium",
                        type === 'number' && "text-orange-600 font-bold",
                        type === 'boolean' && "text-red-600 font-bold",
                        type === 'null' && "text-gray-400 italic",
                        (type === 'object' || type === 'array') && "text-gray-400 italic text-[10px]",
                        isMatch && !isExpandable && String(value).toLowerCase().includes(searchTerm.toLowerCase()) && "bg-yellow-200"
                    )}>
                        {displayValue()}
                    </span>
                </div>

                {/* Children / Recursive Render */}
                <AnimatePresence>
                    {isExpanded && isExpandable && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col items-start pl-8 relative"
                        >
                            {/* Vertical Line Connector */}
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2" />

                            <div className="pt-2 flex flex-col gap-2 w-full">
                                {Object.entries(value as object).map(([key, val]) => (
                                    <div key={key} className="relative">
                                        {/* Horizontal Line Connector */}
                                        <div className="absolute left-[-16px] top-[18px] w-4 h-px bg-gray-200" />

                                        <GraphNode
                                            label={type === 'array' ? String(key) : key}
                                            value={val}
                                            level={level + 1}
                                            path={type === 'array' ? `${path}[${key}]` : (path ? `${path}.${key}` : key)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export function JsonGraphView({ data }: JsonGraphViewProps) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!data) return null;

    return (
        <GraphContext.Provider value={{ searchTerm }}>
            <div className="flex flex-col h-full">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-20 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search keys or values..."
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-gray-50/30">
                    <div className="min-w-max pb-12">
                        <GraphNode
                            key={searchTerm} // Force re-mount on search to auto-expand trees
                            value={data}
                            label="root"
                            path=""
                        />
                    </div>
                </div>
            </div>
        </GraphContext.Provider>
    );
}
