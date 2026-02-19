"use client"

import { RotateCw, X, Loader2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { PdfFile } from "../types"
import { PdfThumbnail } from "./pdf-thumbnail"
import { useSortable } from "@dnd-kit/sortable"

// Define types for dnd-kit attributes/listeners safely
type SortableAttributes = ReturnType<typeof useSortable>["attributes"]
type SortableListeners = ReturnType<typeof useSortable>["listeners"]

interface PdfCardProps {
    pdf: PdfFile
    index: number
    onRotate?: (id: string) => void
    onRemove?: (id: string) => void
    updateThumbnail: (id: string, url: string) => void
    setNodeRef?: (node: HTMLElement | null) => void
    style?: React.CSSProperties
    attributes?: SortableAttributes
    listeners?: SortableListeners
    isOverlay?: boolean
    dragWidth?: number
}

export function PdfCard({
    pdf,
    index,
    onRotate,
    onRemove,
    updateThumbnail,
    setNodeRef,
    style,
    attributes,
    listeners,
    isOverlay = false,
    dragWidth
}: PdfCardProps) {
    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
    }

    return (
        <div
            ref={setNodeRef}
            id={pdf.id}
            style={{
                ...style,
                width: isOverlay && dragWidth ? dragWidth : style?.width
            }}
            {...attributes}
            {...listeners}
            className={cn(
                isOverlay ? "relative group w-60" : "relative group w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)]",
                "bg-white rounded-xl border border-gray-200 p-3",
                "transition-[box-shadow,background-color,border-color] duration-200",
                "flex flex-col items-center text-center ",
                isOverlay ? "cursor-grabbing shadow-2xl z-50" : "hover:shadow-lg hover:border-primary-200 cursor-move"
            )}
        >
            {/* Drag Handle Indicator */}
            <div className={cn(
                "absolute top-2 left-1/2 -translate-x-1/2 transition-opacity",
                isOverlay ? "hidden" : "opacity-0 group-hover:opacity-100"
            )}>
                <GripVertical className="w-4 h-4 text-gray-400" />
            </div>

            {/* Order Badge */}
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shadow-sm z-10">
                {index + 1}
            </div>

            {/* Action Buttons */}
            <div className={cn(
                "absolute -top-2 -right-2 flex items-center gap-1 transition-all z-10 opacity-0 group-hover:opacity-100",
                // isOverlay ? "hidden" : "opacity-0 group-hover:opacity-100"
            )}>
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        onRotate?.(pdf.id)
                    }}
                    className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-primary-500 hover:border-primary-200 flex items-center justify-center shadow-sm cursor-pointer"
                    aria-label={`Rotate ${pdf.name}`}
                    title="Rotate 90°"
                >
                    <RotateCw className="w-3 h-3" />
                </button>
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove?.(pdf.id)
                    }}
                    className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center shadow-sm cursor-pointer"
                    aria-label={`Remove ${pdf.name}`}
                    title="Remove"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* PDF Preview */}
            <div className="w-full aspect-3/4 rounded-lg bg-gray-100 flex items-center justify-center mb-3 mt-2 relative overflow-hidden">
                {pdf.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={pdf.thumbnailUrl}
                        alt={`Preview of ${pdf.name}`}
                        className="w-full h-full object-cover rounded-lg pointer-events-none"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                            <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                        </div>
                        <PdfThumbnail
                            arrayBuffer={pdf.arrayBuffer}
                            onLoad={(url) => updateThumbnail(pdf.id, url)}
                            rotation={pdf.rotation}
                        />
                    </>
                )}
                {/* Page count overlay */}
                <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/60 text-xs font-medium text-white pointer-events-none">
                    {pdf.pageCount} {pdf.pageCount === 1 ? "page" : "pages"}
                </div>
                {/* Rotation indicator */}
                {pdf.rotation !== 0 && (
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-primary-500/80 text-xs font-medium text-white pointer-events-none">
                        {pdf.rotation}°
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="w-full space-y-0.5 pointer-events-none">
                <p className="text-sm font-medium text-gray-900 truncate" title={pdf.name}>
                    {pdf.name.length > 18 ? pdf.name.substring(0, 15) + "..." : pdf.name}
                </p>
                <p className="text-xs text-gray-400">
                    {formatSize(pdf.size)}
                </p>
            </div>
        </div>
    )
}
