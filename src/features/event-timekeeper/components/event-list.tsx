'use client';

import { cn } from '@/lib/utils';
import { ScheduleEvent, EventItem } from '../types';
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
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Plus, Trash, Minus, CaretRight, Check, Clock, Play } from '@phosphor-icons/react/dist/ssr';
import { useState } from 'react';

interface EventListProps {
    schedule: ScheduleEvent[];
    items: EventItem[];
    activeIndex: number;
    isRunning: boolean;
    onReorder: (items: EventItem[]) => void;
    onAddEvent: (event: EventItem) => void;
    onRemoveEvent: (id: string) => void;
    onUpdateEvent: (id: string, updates: Partial<EventItem>) => void;
    onAdjustDuration: (id: string, delta: number) => void;
    onJumpTo: (index: number) => void;
}

interface SortableRowProps {
    event: ScheduleEvent;
    index: number;
    isRunning: boolean;
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<EventItem>) => void;
    onAdjust: (id: string, delta: number) => void;
    onJumpTo: (index: number) => void;
}

function SortableRow({
    event,
    index,
    isRunning,
    onRemove,
    onUpdate,
    onAdjust,
    onJumpTo,
}: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: event.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(event.title);
    const [editPresenter, setEditPresenter] = useState(event.presenter);

    const handleSave = () => {
        onUpdate(event.id, { title: editTitle, presenter: editPresenter });
        setIsEditing(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-xl border transition-all group",
                isDragging && "opacity-50 z-50",
                event.status === 'ongoing' && "bg-emerald-50 border-emerald-200 shadow-sm",
                event.status === 'completed' && "bg-gray-50 border-gray-100 opacity-60",
                event.status === 'upcoming' && "bg-white border-gray-150 hover:border-gray-200",
                event.status === 'overtime' && "bg-red-50 border-red-200",
            )}
        >
            {/* Drag Handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0"
                tabIndex={-1}
            >
                <DotsSixVertical className="w-4 h-4"  weight="duotone"/>
            </button>

            {/* Status Icon */}
            <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                {event.status === 'completed' && <Check className="w-4 h-4 text-emerald-500"  weight="duotone"/>}
                {event.status === 'ongoing' && <Play className="w-4 h-4 text-emerald-600 fill-emerald-600"  weight="duotone"/>}
                {event.status === 'upcoming' && <Clock className="w-4 h-4 text-gray-300"  weight="duotone"/>}
            </div>

            {/* Time & Delay Badge */}
            <div className="flex flex-col items-center shrink-0 w-16">
                <span className="text-xs font-mono text-gray-400">{event.startTime}</span>
                {isRunning && event.delayMinutes !== 0 && (
                    <span className={cn(
                        "text-[9px] font-bold px-1 rounded-sm uppercase tracking-tighter",
                        event.delayMinutes > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                        {event.delayMinutes > 0 ? `+${event.delayMinutes}m` : `${event.delayMinutes}m`}
                    </span>
                )}
            </div>

            {/* Content */}
            {isEditing ? (
                <div className="flex-1 flex gap-2 min-w-0">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary-500 outline-none min-w-0"
                        placeholder="Session title"
                        autoFocus
                    />
                    <input
                        type="text"
                        value={editPresenter}
                        onChange={e => setEditPresenter(e.target.value)}
                        className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary-500 outline-none"
                        placeholder="Speaker"
                    />
                    <button onClick={handleSave} className="px-2 py-1 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        Save
                    </button>
                </div>
            ) : (
                <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onDoubleClick={() => setIsEditing(true)}
                >
                    <div className="flex items-center gap-2">
                        <p className={cn(
                            "text-sm font-medium truncate",
                            event.status === 'completed' ? "text-gray-400 line-through" : "text-gray-800"
                        )}>
                            {event.title}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {event.presenter && event.presenter !== '-' && (
                            <p className="text-xs text-gray-400 truncate">{event.presenter}</p>
                        )}
                        {isRunning && event.delayMinutes !== 0 && (
                            <span className="text-[10px] text-gray-300 font-mono">
                                ({event.actualStartTime}–{event.actualEndTime})
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Duration Adjust */}
            <div className="flex items-center gap-0.5 shrink-0">
                <button
                    onClick={() => onAdjust(event.id, -1)}
                    className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="−1 minute"
                >
                    <Minus className="w-3 h-3"  weight="duotone"/>
                </button>
                <span className="text-xs font-mono text-gray-500 w-8 text-center">{event.durationMinutes}m</span>
                <button
                    onClick={() => onAdjust(event.id, 1)}
                    className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="+1 minute"
                >
                    <Plus className="w-3 h-3"  weight="duotone"/>
                </button>
            </div>

            {/* Jump / Remove */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {isRunning && event.status === 'upcoming' && (
                    <button
                        onClick={() => onJumpTo(index)}
                        className="p-1 text-gray-300 hover:text-emerald-600 rounded transition-colors"
                        title="Jump to this session"
                    >
                        <CaretRight className="w-4 h-4"  weight="duotone"/>
                    </button>
                )}
                <button
                    onClick={() => onRemove(event.id)}
                    className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                    title="Remove"
                >
                    <Trash className="w-3.5 h-3.5"  weight="duotone"/>
                </button>
            </div>
        </div>
    );
}

export function EventList({
    schedule,
    items,
    activeIndex: _activeIndex,
    isRunning,
    onReorder,
    onAddEvent,
    onRemoveEvent,
    onUpdateEvent,
    onAdjustDuration,
    onJumpTo,
}: EventListProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newPresenter, setNewPresenter] = useState('');
    const [newDuration, setNewDuration] = useState(15);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(e => e.id === active.id);
        const newIndex = items.findIndex(e => e.id === over.id);
        onReorder(arrayMove(items, oldIndex, newIndex));
    };

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        onAddEvent({
            id: crypto.randomUUID(),
            title: newTitle.trim(),
            presenter: newPresenter.trim() || '-',
            durationMinutes: Math.max(1, newDuration),
            notes: '',
        });
        setNewTitle('');
        setNewPresenter('');
        setNewDuration(15);
        setShowAddForm(false);
    };

    return (
        <div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={schedule.map(e => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                        {schedule.map((event, i) => (
                            <SortableRow
                                key={event.id}
                                event={event}
                                index={i}
                                isRunning={isRunning}
                                onRemove={onRemoveEvent}
                                onUpdate={onUpdateEvent}
                                onAdjust={onAdjustDuration}
                                onJumpTo={onJumpTo}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Form */}
            {showAddForm ? (
                <div className="mt-3 p-3 border border-dashed border-gray-200 rounded-xl bg-gray-50 space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="Session title"
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-primary-500 outline-none"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={newPresenter}
                            onChange={e => setNewPresenter(e.target.value)}
                            placeholder="Speaker"
                            className="w-28 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                        <input
                            type="number"
                            value={newDuration}
                            onChange={e => setNewDuration(parseInt(e.target.value) || 1)}
                            min={1}
                            className="w-16 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-center focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            className="px-4 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                        >
                            Add Session
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
                >
                    <Plus className="w-4 h-4"  weight="duotone"/>
                    Add Session
                </button>
            )}
        </div>
    );
}
