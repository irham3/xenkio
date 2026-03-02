'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    // DialogDescription,
    DialogHeader,
    // DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackForm } from './feedback-form';

export function FeedbackDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                    <MessageSquarePlus className="h-4 w-4" />
                    Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    {/* <DialogTitle>Send Feedback</DialogTitle> */}
                    {/* <DialogDescription>
                        Help us improve our service
                    </DialogDescription> */}
                </DialogHeader>
                <FeedbackForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
