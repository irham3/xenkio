'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTreeVisualizer } from '../hooks/use-tree-visualizer';
import { Button } from '@/components/ui/button';
import { 
    Play, Pause, SkipForward, SkipBack, 
    RefreshCw, Download, Copy, Check,
    ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TreeNode } from '../types';

function TreeSVG({ 
    root, 
    width, 
    height, 
    currentStep 
}: { 
    root: TreeNode | null; 
    width: number; 
    height: number;
    currentStep?: { visitedIds: string[], currentId: string | null };
}) {
    const visitedIds = currentStep?.visitedIds || [];
    const currentId = currentStep?.currentId || null;

    if (!root) return null;

    const edges: React.ReactNode[] = [];
    const nodes: React.ReactNode[] = [];

    // Helper to generate SVG elements recursively
    const renderTree = (node: TreeNode, parentX?: number, parentY?: number) => {
        if (parentX !== undefined && parentY !== undefined) {
            edges.push(
                <line 
                    key={`edge-${node.id}`}
                    x1={parentX} 
                    y1={parentY} 
                    x2={node.x} 
                    y2={node.y} 
                    stroke={visitedIds.includes(node.id) ? "#bae6fd" : "#e2e8f0"} // primary-200 or gray-200
                    strokeWidth="3"
                    className="transition-colors duration-300"
                />
            );
        }

        const isCurrent = node.id === currentId;
        const isVisited = visitedIds.includes(node.id);

        let fillColor = "#ffffff";
        let strokeColor = "#94a3b8"; // gray-400
        let textColor = "#334155"; // gray-700
        
        if (isCurrent) {
            fillColor = "#0ea5e9"; // primary-500
            strokeColor = "#0ea5e9";
            textColor = "#ffffff";
        } else if (isVisited) {
            fillColor = "#e0f2fe"; // primary-100
            strokeColor = "#38bdf8"; // primary-400
            textColor = "#0369a1"; // primary-700
        }

        nodes.push(
            <g key={`node-${node.id}`} className="transition-all duration-300" transform={`translate(${node.x}, ${node.y})`}>
                <circle 
                    r="18" 
                    fill={fillColor} 
                    stroke={strokeColor} 
                    strokeWidth={isCurrent ? "3" : "2"}
                    className="transition-all duration-300"
                />
                <text 
                    textAnchor="middle" 
                    dy=".3em" 
                    fill={textColor}
                    className="text-sm font-semibold font-mono pointer-events-none transition-colors duration-300"
                >
                    {node.val}
                </text>
            </g>
        );

        if (node.left) renderTree(node.left, node.x, node.y);
        if (node.right) renderTree(node.right, node.x, node.y);
    };

    renderTree(root);

    return (
        <svg 
            width={width} 
            height={height} 
            className="w-full h-full overflow-visible"
        >
            {edges}
            {nodes}
        </svg>
    );
}

export function TreeVisualizer() {
    const {
        state,
        handleArrayInput,
        generateRandom,
        playTraversal,
        togglePlay,
        setSpeed,
        stepForward,
        stepBackward,
        updateDimensions
    } = useTreeVisualizer();

    const containerRef = useRef<HTMLDivElement>(null);
    const svgWrapperRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    // Zoom and Pan State
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const handleResetView = () => setTransform({ x: 0, y: 0, scale: 1 });
    const handleZoomIn = () => setTransform(p => ({ ...p, scale: Math.min(3, p.scale + 0.2) }));
    const handleZoomOut = () => setTransform(p => ({ ...p, scale: Math.max(0.2, p.scale - 0.2) }));

    useEffect(() => {
        const el = svgWrapperRef.current;
        if (!el) return;
        const handleNativeWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.0015;
            setTransform(prev => ({ ...prev, scale: Math.min(Math.max(0.2, prev.scale + delta), 3) }));
        };
        el.addEventListener('wheel', handleNativeWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleNativeWheel);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setTransform(prev => ({
            ...prev,
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        }));
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);

    // Initial resize observer for SVG canvas
    useEffect(() => {
        if (!svgWrapperRef.current) return;
        const resizeObserver = new window.ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                // Leave some padding
                updateDimensions(width, Math.max(400, height));
            }
        });
        resizeObserver.observe(svgWrapperRef.current);
        return () => resizeObserver.disconnect();
    }, [updateDimensions]);

    // Download SVG
    const handleDownload = () => {
        if (!svgWrapperRef.current) return;
        const svgElement = svgWrapperRef.current.querySelector('svg');
        if (!svgElement) return;

        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgElement);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tree-${Math.random().toString(36).substring(2,7)}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currentStep = state.traversalSteps[state.currentStepIndex];

    const copyOutput = () => {
        if (!currentStep) return;
        const outputStr = `[${currentStep.outputVals.join(', ')}]`;
        navigator.clipboard.writeText(outputStr).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto" ref={containerRef}>
            
            {/* Input Controls */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2 w-full">
                        <label className="text-sm font-semibold text-gray-700">
                            Tree Array Representation (Level-order)
                        </label>
                        <input
                            type="text"
                            value={state.arrayInput}
                            onChange={(e) => handleArrayInput(e.target.value)}
                            placeholder="e.g. [1, 2, 3, null, 5]"
                            className={cn(
                                "w-full border rounded-lg px-4 py-2 font-mono text-sm",
                                "focus:outline-none focus:ring-2 focus:ring-indigo-300",
                                state.error ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-indigo-400"
                            )}
                        />
                        {state.error && <p className="text-xs text-red-500 mt-1">{state.error}</p>}
                        <p className="text-xs text-gray-500">
                            Format: comma-separated values, LeetCode style.
                        </p>
                    </div>
                    
                    <Button onClick={generateRandom} variant="outline" className="shrink-0 gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Random Tree
                    </Button>
                </div>
            </div>

            {/* Tree Canvas */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Visualization</h3>
                    <Button onClick={handleDownload} variant="ghost" size="sm" className="h-8 gap-1.5 text-gray-500">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export SVG</span>
                    </Button>
                </div>
                
                <div 
                    ref={svgWrapperRef} 
                    className={cn(
                        "w-full min-h-[400px] h-[500px] bg-slate-50 relative overflow-hidden flex items-center justify-center p-4",
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="absolute right-4 top-4 z-10 flex gap-2 bg-white/80 backdrop-blur border shadow-sm rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleZoomIn} title="Zoom In">
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleResetView} title="Reset View">
                            <Maximize className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={handleZoomOut} title="Zoom Out">
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                    </div>

                    <div 
                        style={{ 
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, 
                            transformOrigin: 'center',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }} 
                        className="w-full h-full flex items-center justify-center pointer-events-none"
                    >
                        {state.root ? (
                            <TreeSVG 
                                root={state.root} 
                                width={1200}
                                height={600}
                                currentStep={currentStep}
                            />
                        ) : (
                            <div className="text-gray-400 font-medium">Empty Tree</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Traversal Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Actions */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-1">
                    <h3 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">Algorithms</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Button 
                            variant={state.traversalType === 'preorder' ? 'default' : 'outline'}
                            onClick={() => playTraversal('preorder')}
                            className="w-full text-xs"
                        >Pre-order</Button>
                        <Button 
                            variant={state.traversalType === 'inorder' ? 'default' : 'outline'}
                            onClick={() => playTraversal('inorder')}
                            className="w-full text-xs"
                        >In-order</Button>
                        <Button 
                            variant={state.traversalType === 'postorder' ? 'default' : 'outline'}
                            onClick={() => playTraversal('postorder')}
                            className="w-full text-xs"
                        >Post-order</Button>
                        <Button 
                            variant={state.traversalType === 'level-order' ? 'default' : 'outline'}
                            onClick={() => playTraversal('level-order')}
                            className="w-full text-xs"
                        >Level-order</Button>
                    </div>

                    {state.traversalSteps.length > 0 && (
                        <div className="pt-4 border-t border-gray-100 space-y-4 mt-2">
                            <div className="flex items-center justify-center gap-2">
                                <Button onClick={stepBackward} variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={state.currentStepIndex === 0}>
                                    <SkipBack className="w-4 h-4" />
                                </Button>
                                <Button onClick={togglePlay} className="h-10 w-10 rounded-full" size="icon">
                                    {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                </Button>
                                <Button onClick={stepForward} variant="outline" size="icon" className="h-8 w-8 rounded-full" disabled={state.currentStepIndex >= state.traversalSteps.length - 1}>
                                    <SkipForward className="w-4 h-4" />
                                </Button>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Fast</span>
                                    <span>Slow</span>
                                </div>
                                <input
                                    type="range"
                                    min="200"
                                    max="2000"
                                    step="100"
                                    value={state.speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    className="w-full accent-indigo-600"
                                    style={{ direction: 'rtl' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Traversal Output display */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 tracking-wide">
                            {state.traversalSteps.length > 0 ? (
                                <span className="capitalize">{state.traversalType} Traversal</span>
                            ) : (
                                "Traversal Output"
                            )}
                        </h3>
                        {currentStep && currentStep.outputVals.length > 0 && (
                            <button onClick={copyOutput} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied!' : 'Copy Array'}
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 font-mono text-lg flex flex-wrap gap-2 items-start content-start overflow-y-auto">
                        {!currentStep || currentStep.outputVals.length === 0 ? (
                            <span className="text-gray-400 text-sm">Select an algorithm to start visualization</span>
                        ) : (
                            currentStep.outputVals.map((val, idx) => (
                                <span 
                                    key={`${idx}-${val}`}
                                    className={cn(
                                        "px-2 py-1 rounded-md border min-w-[2rem] text-center shadow-sm transition-all duration-300",
                                        idx === currentStep.outputVals.length - 1 && currentStep.currentId // if it's the very last appended and currently being processed
                                            ? "bg-indigo-500 text-white border-indigo-600 scale-110" 
                                            : "bg-white text-gray-700 border-gray-200"
                                    )}
                                >
                                    {val}
                                </span>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

