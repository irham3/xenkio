'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
    value: string;
    label?: string;
    variant?: 'outline' | 'ghost' | 'default' | 'secondary';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    className?: string;
    showText?: boolean;
}

export function CopyButton({
    value,
    label = 'Copy',
    variant = 'outline',
    size = 'sm',
    className,
    showText = true
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <Button
            variant={variant}
            size={size === 'icon' ? 'icon' : 'sm'}
            className={cn("gap-2 cursor-pointer", className)}
            onClick={handleCopy}
            disabled={!value}
        >
            {copied ? (
                <Check className={cn("h-4 w-4", size === 'sm' && "h-3 w-3")} />
            ) : (
                <Copy className={cn("h-4 w-4", size === 'sm' && "h-3 w-3")} />
            )}
            {showText && size !== 'icon' && (copied ? 'Copied!' : label)}
        </Button>
    );
}
