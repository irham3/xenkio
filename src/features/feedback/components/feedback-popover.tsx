'use client';

import { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { MessageSquarePlus, X } from 'lucide-react';
import { FeedbackForm } from './feedback-form';

export function FeedbackPopover() {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <MessageSquarePlus className="h-[1.2rem] w-[1.2rem]" />
                            <span className="sr-only">Feedback</span>
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                    Feedback
                </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-[360px] p-0 overflow-hidden shadow-xl border-border/50" align="end">
                <div className="relative p-6 bg-card">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-sm"
                        onClick={() => setOpen(false)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>

                    <div className="space-y-1 mb-6">
                        <h4 className="font-semibold text-lg tracking-tight">Send Feedback</h4>
                        <p className="text-sm text-muted-foreground/80 leading-snug">Help us improve our service</p>
                    </div>
                    <FeedbackForm onSuccess={() => setOpen(false)} />
                </div>
            </PopoverContent>
        </Popover>
    );
}
