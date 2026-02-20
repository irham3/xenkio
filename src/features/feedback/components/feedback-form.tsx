'use client';

import { useActionState, useEffect } from 'react';
import { submitFeedback, FeedbackState } from '../actions/submit-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const initialState: FeedbackState = {
    success: false,
    message: '',
};

interface FeedbackFormProps {
    onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
    const [state, formAction, isPending] = useActionState(submitFeedback, initialState);

    useEffect(() => {
        if (state.success) {
            toast.success(state.message);
            if (onSuccess) {
                onSuccess();
            }
        } else if (state.message) {
            toast.error(state.message);
        }
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                    Email Address <span className="text-muted-foreground/60 text-xs font-normal ml-1">(optional)</span>
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    disabled={isPending}
                    className="bg-muted/50 border-transparent focus-visible:bg-background transition-all duration-200 rounded-md"
                />
                {state.errors?.email && (
                    <p className="text-xs font-medium text-destructive mt-1 animate-in slide-in-from-top-1">{state.errors.email[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="feedback" className="text-sm font-medium text-foreground/80">Your feedback</Label>
                <Textarea
                    id="feedback"
                    name="feedback"
                    placeholder="Tell us what you think..."
                    className="min-h-[120px] bg-muted/50 border-transparent focus-visible:bg-background transition-all duration-200 resize-none rounded-md"
                    required
                    disabled={isPending}
                />
                {state.errors?.feedback && (
                    <p className="text-xs font-medium text-destructive mt-1 animate-in slide-in-from-top-1">{state.errors.feedback[0]}</p>
                )}
            </div>

            <div className="flex justify-end pt-2 w-full">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full shadow-sm transition-all duration-300 rounded-md"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        'Send'
                    )}
                </Button>
            </div>
        </form>
    );
}
