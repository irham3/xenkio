import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'error' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                {
                    'bg-primary-100 text-primary-700': variant === 'default',
                    'bg-gray-100 text-gray-700': variant === 'secondary',
                    'border border-gray-200 text-gray-700 bg-white': variant === 'outline',
                    'bg-success-100 text-success-700': variant === 'success',
                    'bg-red-100 text-red-700': variant === 'error',
                    'bg-amber-100 text-amber-700': variant === 'warning',
                },
                className
            )}
            {...props}
        />
    );
}
