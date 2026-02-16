
import { PasswordStrength } from '../lib/password-utils';
import { cn } from '@/lib/utils';

interface StrengthVisualizationProps {
    strength: PasswordStrength;
}

export function StrengthVisualization({ strength }: StrengthVisualizationProps) {
    const getLabel = (score: number) => {
        switch (score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Strong';
            case 4: return 'Very Strong';
            default: return 'Enter Password';
        }
    };

    const getColor = (score: number) => {
        switch (score) {
            case 0: return 'bg-gray-200';
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-500">Strength</span>
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                    strength.score === 0 ? "text-gray-500 bg-gray-100" :
                        strength.score === 1 ? "text-red-700 bg-red-100" :
                            strength.score === 2 ? "text-orange-700 bg-orange-100" :
                                strength.score === 3 ? "text-yellow-700 bg-yellow-100" :
                                    "text-green-700 bg-green-100"
                )}>
                    {getLabel(strength.score)}
                </span>
            </div>

            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                {[0, 1, 2, 3].map((step) => (
                    <div
                        key={step}
                        className={cn(
                            "h-full flex-1 transition-all duration-500 ease-out rounded-full",
                            step < strength.score ? getColor(strength.score) : "bg-gray-200 opacity-50"
                        )}
                    />
                ))}
            </div>

            <div className="text-xs text-gray-400 mt-2">
                {strength.feedback.warning && <span className="text-red-500 font-medium block mb-1">{strength.feedback.warning}</span>}
                {strength.feedback.suggestions.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                        {strength.feedback.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
