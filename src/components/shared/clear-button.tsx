'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClearButtonProps {
    onClick: () => void;
    label?: string;
    variant?: 'outline' | 'ghost' | 'destructive' | 'secondary';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    className?: string;
    disabled?: boolean;
}

export function ClearButton({
    onClick,
    label = 'Clear',
    variant = 'ghost',
    size = 'sm',
    className,
    disabled = false
}: ClearButtonProps) {
    return (
        <Button
            variant={variant}
            size={size === 'icon' ? 'icon' : 'sm'}
            className={cn(
                "gap-2 cursor-pointer",
                variant === 'ghost' && "text-red-500 hover:text-red-600 hover:bg-red-50",
                className
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <Trash2 className={cn("h-4 w-4", size === 'sm' && "h-3 w-3")} />
            {size !== 'icon' && label}
        </Button>
    );
}
