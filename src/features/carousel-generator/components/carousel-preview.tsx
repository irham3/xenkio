'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CarouselConfig, CarouselImage, INSTAGRAM_SIZES } from '../types';
import { cn } from '@/lib/utils';
import { Minus, Plus, Trash2, RotateCw } from 'lucide-react';

interface CarouselPreviewProps {
  config: CarouselConfig;
  onChange: (updates: Partial<CarouselConfig>) => void;
  selectedImageId: string | null;
  onSelectImage: (id: string | null) => void;
}

type InteractionMode = 'none' | 'move' | 'resize' | 'rotate';

export function CarouselPreview({ config, onChange, selectedImageId, onSelectImage }: CarouselPreviewProps) {
  const { width, height } = INSTAGRAM_SIZES[config.size];
  const [zoom, setZoom] = useState(0.25);
  const containerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  // Auto-fit zoom
  useEffect(() => {
    if (areaRef.current) {
      const areaWidth = areaRef.current.clientWidth - 100;
      const areaHeight = areaRef.current.clientHeight - 100;
      const totalWidth = width * config.slideCount;
      const zoomX = areaWidth / totalWidth;
      const zoomY = areaHeight / height;
      const newZoom = Math.min(zoomX, zoomY, 0.8);
      setZoom(Math.max(0.1, Math.floor(newZoom * 100) / 100));
    }
  }, [config.slideCount, config.size, width, height]);

  // Interaction State
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
  const dragStart = useRef({ x: 0, y: 0 });
  const initialImgState = useRef({ x: 0, y: 0, scale: 1, rotation: 0 });

  const handleStart = (
    e: React.MouseEvent | React.TouchEvent,
    id: string,
    mode: InteractionMode
  ) => {
    e.preventDefault();
    e.stopPropagation();

    onSelectImage(id);
    setInteractionMode(mode);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStart.current = { x: clientX, y: clientY };

    const img = config.images.find(i => i.id === id);
    if (img) {
      initialImgState.current = {
        x: img.x,
        y: img.y,
        scale: img.scale,
        rotation: img.rotation
      };
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (interactionMode === 'none' || !selectedImageId) return;

    const img = config.images.find(i => i.id === selectedImageId);
    if (!img) return;

    // Deltas
    const dx = (clientX - dragStart.current.x) / zoom;
    const dy = (clientY - dragStart.current.y) / zoom;
    const rawDx = clientX - dragStart.current.x;

    let updates: Partial<CarouselImage> = {};

    if (interactionMode === 'move') {
      updates = {
        x: initialImgState.current.x + dx,
        y: initialImgState.current.y + dy
      };
    }
    else if (interactionMode === 'resize') {
      const sensitivity = 0.002;
      const delta = (dx + dy);
      const newScale = Math.max(0.1, initialImgState.current.scale * (1 + delta * sensitivity));
      updates = { scale: newScale };
    }
    else if (interactionMode === 'rotate') {
      const sensitivity = 0.5;
      updates = { rotation: (initialImgState.current.rotation + rawDx * sensitivity) % 360 };
    }

    const newImages = config.images.map(i =>
      i.id === selectedImageId ? { ...i, ...updates } : i
    );
    onChange({ images: newImages });
  };

  const handleEnd = () => {
    setInteractionMode('none');
  };

  const totalWidth = width * config.slideCount;
  const sortedImages = [...config.images].sort((a, b) => a.order - b.order);

  const handleDelete = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onChange({ images: config.images.filter(img => img.id !== id) });
    if (selectedImageId === id) onSelectImage(null);
  };

  return (
    <div
      className="flex flex-col h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800"
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={(e) => {
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }}
      onTouchEnd={handleEnd}
    >
      {/* Toolbar */}
      <div className="h-12 bg-gray-950 border-b border-gray-800 flex items-center px-4 justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-400 font-mono tracking-tight">
            {totalWidth} x {height}px
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-800/50 rounded-lg border border-gray-700/50 p-0.5">
            <button
              className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white rounded-md transition-colors"
              onClick={() => setZoom(z => Math.max(0.05, z - 0.05))}
            >
              <Minus size={14} />
            </button>
            <span className="text-[10px] font-mono w-10 text-center text-gray-300 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white rounded-md transition-colors"
              onClick={() => setZoom(z => Math.min(1.5, z + 0.05))}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={areaRef}
        className="flex-1 overflow-hidden relative touch-none bg-gray-950/50 cursor-move"
        onMouseDown={() => onSelectImage(null)}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div
          ref={containerRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out origin-center bg-white"
          style={{
            width: totalWidth * zoom,
            height: height * zoom,
            backgroundColor: config.backgroundColor,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Slides Divider Lines */}
          {Array.from({ length: config.slideCount - 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-r border-dashed border-gray-400/30 z-0 pointer-events-none"
              style={{ left: (i + 1) * width * zoom }}
            />
          ))}

          {/* Render Images */}
          {sortedImages.map((img) => {
            const isSelected = selectedImageId === img.id;
            const finalWidth = (img.width || 0) * (img.baseScale || 1) * img.scale * zoom;
            const finalHeight = (img.height || 0) * (img.baseScale || 1) * img.scale * zoom;

            return (
              <div
                key={img.id}
                className={cn(
                  "absolute select-none group touch-none",
                  isSelected ? "z-50" : "z-10"
                )}
                style={{
                  transform: `translate(${img.x * zoom}px, ${img.y * zoom}px) rotate(${img.rotation}deg)`,
                  transformOrigin: '0 0',
                  width: finalWidth,
                  height: finalHeight,
                  //   transition: interactionMode !== 'none' ? 'none' : 'transform 0.1s ease-out'
                }}
                onMouseDown={(e) => handleStart(e, img.id, 'move')}
                onTouchStart={(e) => handleStart(e, img.id, 'move')}
              >
                <div className={cn(
                  "relative w-full h-full transition-shadow duration-200",
                  isSelected && "ring-2 ring-primary-500 shadow-xl"
                )}>
                  <Image
                    src={img.url}
                    alt=""
                    className="pointer-events-none w-full h-full object-cover select-none shadow-sm"
                    width={img.width || 800}
                    height={img.height || 800}
                    unoptimized
                    draggable={false}
                  />

                  {/* Selection Overlay & Handles */}
                  {isSelected && (
                    <>
                      {/* Corners for Resize */}
                      {['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((pos, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "absolute w-3.5 h-3.5 bg-white border-2 border-primary-500 rounded-full shadow-sm z-50 cursor-nwse-resize hover:scale-110 hover:bg-primary-50 transition-all",
                            pos
                          )}
                          onMouseDown={(e) => handleStart(e, img.id, 'resize')}
                          onTouchStart={(e) => handleStart(e, img.id, 'resize')}
                        />
                      ))}

                      {/* Rotate Handle */}
                      <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-lg z-50 flex items-center justify-center cursor-ew-resize hover:scale-105 hover:border-primary-500 hover:text-primary-600 transition-all text-gray-500"
                        onMouseDown={(e) => handleStart(e, img.id, 'rotate')}
                      >
                        <RotateCw size={14} />
                      </div>

                      {/* Connecting line to rotate handle */}
                      <div className="absolute -top-6 left-1/2 w-px h-6 bg-primary-500 -translate-x-1/2 pointer-events-none" />

                      {/* Delete Button */}
                      <button
                        className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all z-50"
                        onClick={(e) => handleDelete(img.id, e)}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
