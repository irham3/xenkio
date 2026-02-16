
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Braces, Box, Type, List, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonGraphViewProps {
    data: unknown;
}

export function JsonGraphView({ data }: JsonGraphViewProps) {
    if (data === null || data === undefined) {
        return <div className="p-4 text-gray-400 italic">No data</div>;
    }

    return (
        <div className="w-full h-full overflow-auto p-4 bg-white font-mono text-sm">
            <JsonNode name="root" value={data} isRoot />
        </div>
    );
}

interface JsonNodeProps {
    name: string;
    value: unknown;
    isRoot?: boolean;
    level?: number;
}

function JsonNode({ name, value, isRoot = false, level = 0 }: JsonNodeProps) {
    const [expanded, setExpanded] = useState(true);
    const isObject = typeof value === 'object' && value !== null;
    const isArray = Array.isArray(value);
    const isEmpty = isObject && Object.keys(value).length === 0;

    const toggle = () => setExpanded(!expanded);

    const getIcon = () => {
        if (isArray) return <List className="w-3 h-3 text-blue-500" />;
        if (isObject) return <Braces className="w-3 h-3 text-purple-500" />;
        if (typeof value === 'string') return <Type className="w-3 h-3 text-green-500" />;
        if (typeof value === 'number') return <Hash className="w-3 h-3 text-orange-500" />;
        return <Box className="w-3 h-3 text-gray-500" />;
    };

    const getTypeLabel = () => {
        if (isArray) return `Array(${value.length})`;
        if (isObject) return 'Object';
        return typeof value;
    };

    return (
        <div className="ml-2 select-none">
            <div
                className={cn(
                    "flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100 cursor-pointer transition-colors group",
                    (isObject && !isEmpty) ? "cursor-pointer" : "cursor-default"
                )}
                onClick={(isObject && !isEmpty) ? toggle : undefined}
            >
                {(isObject && !isEmpty) ? (
                    expanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />
                ) : (
                    <span className="w-3 h-3" />
                )}

                {getIcon()}

                <span className="text-gray-600 font-medium">
                    {name}
                    {!isRoot && <span className="text-gray-400 mx-1">:</span>}
                </span>

                {!isObject && (
                    <span className={cn(
                        "font-medium",
                        typeof value === 'string' ? "text-green-700" :
                            typeof value === 'number' ? "text-orange-700" :
                                typeof value === 'boolean' ? "text-purple-700" : "text-gray-600"
                    )}>
                        {JSON.stringify(value)}
                    </span>
                )}

                {isObject && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 group-hover:bg-white group-hover:border-gray-200 transition-colors">
                        {getTypeLabel()}
                    </span>
                )}
            </div>

            {isObject && expanded && !isEmpty && (
                <div className="border-l border-gray-100 ml-3 pl-1">
                    {Object.entries(value).map(([key, val]) => (
                        <JsonNode key={key} name={key} value={val} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
