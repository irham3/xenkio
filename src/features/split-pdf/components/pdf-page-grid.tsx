"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { PdfPageThumbnail } from "./pdf-page-thumbnail"
import { PdfFile } from "../types"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PdfPageGridProps {
    pdf: PdfFile;
    selectedPages: number[];
    pageOrder: number[]; // 1-based page numbers
    onTogglePage: (pageNumber: number) => void;
    onReorder: (newOrder: number[]) => void;
}

interface SortablePageItemProps {
    pageNum: number;
    isSelected: boolean;
    onToggle: (pageNum: number) => void;
    pdf: PdfFile;
}

function SortablePageItem({ pageNum, isSelected, onToggle, pdf }: SortablePageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: pageNum });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => {
                onToggle(pageNum);
            }}
            className={cn(
                "relative aspect-3/4 rounded-lg border-2 cursor-pointer transition-all group touch-none",
                isSelected
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-transparent hover:border-primary-300"
            )}
        >
            {/* Page Number Badge */}
            <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-medium flex items-center justify-center backdrop-blur-xs">
                {pageNum}
            </div>

            {/* Selection Checkbox */}
            <div className={cn(
                "absolute top-2 right-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "bg-white/80 border-gray-300 text-transparent group-hover:border-primary-400"
            )}>
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </div>

            <PdfPageThumbnail
                pdfDocument={pdf.pdfDocument}
                arrayBuffer={pdf.arrayBuffer}
                pageNumber={pageNum}
                scale={0.5}
            />

            {isSelected && (
                <div className="absolute inset-0 bg-primary-500/10 rounded-lg pointer-events-none" />
            )}
        </div>
    );
}

export function PdfPageGrid({ pdf, selectedPages, pageOrder, onTogglePage, onReorder }: PdfPageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement required to start dragging, allows clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = pageOrder.indexOf(active.id as number);
            const newIndex = pageOrder.indexOf(over.id as number);
            onReorder(arrayMove(pageOrder, oldIndex, newIndex));
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 max-h-[60vh] overflow-y-auto bg-gray-50 rounded-xl border border-gray-200">
                <SortableContext
                    items={pageOrder}
                    strategy={rectSortingStrategy}
                >
                    {pageOrder.map((pageNum) => (
                        <SortablePageItem
                            key={pageNum}
                            pageNum={pageNum}
                            isSelected={selectedPages.includes(pageNum)}
                            onToggle={onTogglePage}
                            pdf={pdf}
                        />
                    ))}
                </SortableContext>
            </div>
        </DndContext>
    );
}
