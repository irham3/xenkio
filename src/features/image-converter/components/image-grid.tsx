"use client"

import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { ImageFile } from "../types"
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
import { Button } from "@/components/ui/button";

interface ImageGridProps {
    images: ImageFile[];
    onReorder: (newImages: ImageFile[]) => void;
    onRemove: (id: string) => void;
}

interface SortableImageItemProps {
    image: ImageFile;
    index: number;
    onRemove: (id: string) => void;
}

function SortableImageItem({ image, index, onRemove }: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: image.id });

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
            className={cn(
                "relative aspect-3/4 rounded-xl border-2 bg-white cursor-move transition-all group touch-none overflow-hidden hover:shadow-md",
                isDragging
                    ? "border-primary-500 ring-2 ring-primary-200 shadow-xl scale-105"
                    : "border-gray-200 hover:border-primary-300"
            )}
        >
            {/* Page Number Badge */}
            <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white text-xs font-medium flex items-center justify-center backdrop-blur-sm shadow-sm">
                {index + 1}
            </div>

            {/* Remove Button */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 rounded-full shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onRemove(image.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                >
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>

            {/* Image Preview */}
            <div className="w-full h-full p-3 flex items-center justify-center bg-gray-50/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-contain shadow-sm rounded-sm"
                />
            </div>

            {/* Image Info Overlay on Hover */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] truncate px-1 text-center font-medium">
                    {image.name}
                </p>
            </div>
        </div>
    );
}

export function ImageGrid({ images, onReorder, onRemove }: ImageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex(img => img.id === active.id);
            const newIndex = images.findIndex(img => img.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                onReorder(arrayMove(images, oldIndex, newIndex));
            }
        }
    }

    // Pass image IDs to SortableContext
    const itemIds = images.map(img => img.id);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 max-h-[70vh] overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 min-h-[300px]">
                <SortableContext
                    items={itemIds}
                    strategy={rectSortingStrategy}
                >
                    {images.map((image, index) => (
                        <SortableImageItem
                            key={image.id}
                            image={image}
                            index={index}
                            onRemove={onRemove}
                        />
                    ))}
                </SortableContext>

                {images.length === 0 && (
                    <div className="col-span-full h-full flex items-center justify-center text-gray-400 font-medium">
                        No images selected
                    </div>
                )}
            </div>
        </DndContext>
    );
}
