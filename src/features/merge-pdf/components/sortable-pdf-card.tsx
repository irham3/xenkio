"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PdfFile } from "../types"
import { PdfCard } from "./pdf-card"

interface SortablePdfCardProps {
    pdf: PdfFile
    index: number
    onRotate: (id: string) => void
    onRemove: (id: string) => void
    updateThumbnail: (id: string, url: string) => void
}

export function SortablePdfCard({
    pdf,
    index,
    onRotate,
    onRemove,
    updateThumbnail
}: SortablePdfCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: pdf.id })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Invisible placeholder, overlay is visible
        zIndex: isDragging ? 50 : "auto",
    }

    return (
        <PdfCard
            pdf={pdf}
            index={index}
            onRotate={onRotate}
            onRemove={onRemove}
            updateThumbnail={updateThumbnail}
            setNodeRef={setNodeRef}
            style={style}
            attributes={attributes}
            listeners={listeners}
        />
    )
}
