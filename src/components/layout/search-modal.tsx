'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { TOOLS } from '@/data/tools';
import { cn } from '@/lib/utils';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const fuse = new Fuse(TOOLS, {
    keys: ['title', 'description', 'category'],
    threshold: 0.4,
    includeScore: true,
});

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    return (
        <AnimatePresence>
            {isOpen && <SearchModalContent onClose={onClose} />}
        </AnimatePresence>
    );
}

function SearchModalContent({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial setup: Focus and Body Scroll Lock
    // Initial setup: Focus and Body Scroll Lock
    useEffect(() => {
        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Store original styles
        const originalStyle = window.getComputedStyle(document.body).overflow;
        const originalPadding = window.getComputedStyle(document.body).paddingRight;

        // Lock body scroll and add padding to prevent layout shift
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${parseInt(originalPadding || '0') + scrollbarWidth}px`;

        // Focus input after animation
        const timer = setTimeout(() => inputRef.current?.focus(), 100);

        return () => {
            document.body.style.overflow = originalStyle;
            document.body.style.paddingRight = originalPadding;
            clearTimeout(timer);
        };
    }, []);

    // Derived results
    const results = useMemo(() => {
        if (!query.trim()) return TOOLS.filter(tool => ['1', '8', '16', '19', '36'].includes(tool.id)) // Default to first few or popular tools
        return fuse.search(query).map(r => r.item).slice(0, 5);
    }, [query]);

    const handleSelect = useCallback((tool: typeof TOOLS[0]) => {
        router.push(tool.href);
        onClose();
    }, [router, onClose]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % Math.min(results.length, 5));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + Math.min(results.length, 5)) % Math.min(results.length, 5));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results.length > 0) {
                    handleSelect(results[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, results, onClose, handleSelect]);

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl px-4 z-50"
            >
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
                    {/* Search Header */}
                    <div className="flex items-center px-4 py-4 border-b border-gray-100">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search tools (e.g., 'PDF', 'Compress', 'Color')..."
                            className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-900"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                        />
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {results.length > 0 ? (
                            <div className="space-y-1">
                                {query.trim() === '' && (
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Popular Tools
                                    </div>
                                )}
                                {results.map((tool, index) => (
                                    <button
                                        key={tool.id}
                                        onClick={() => handleSelect(tool)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-colors",
                                            selectedIndex === index ? "bg-primary-50" : "hover:bg-gray-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                                            selectedIndex === index ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500"
                                        )}>
                                            <tool.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                "font-medium truncate",
                                                selectedIndex === index ? "text-primary-900" : "text-gray-900"
                                            )}>
                                                {tool.title}
                                            </div>
                                            <div className={cn(
                                                "text-sm truncate",
                                                selectedIndex === index ? "text-primary-600/80" : "text-gray-500"
                                            )}>
                                                {tool.description}
                                            </div>
                                        </div>
                                        {selectedIndex === index && (
                                            <ArrowRight className="w-4 h-4 text-primary-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-500">
                                <p className="text-lg font-medium text-gray-900">No results found</p>
                                <p className="mt-1">We couldn&apos;t find any tools matching &quot;{query}&quot;</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-sans">↑↓</kbd>
                                to navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-sans">↵</kbd>
                                to select
                            </span>
                        </div>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-sans">esc</kbd>
                            to close
                        </span>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
