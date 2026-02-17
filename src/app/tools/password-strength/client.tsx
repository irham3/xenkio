'use client';

import { usePasswordStrength } from '@/features/password-strength/hooks/use-password-strength';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, RefreshCw, Copy, Check, X } from 'lucide-react';
import { StrengthVisualization } from '@/features/password-strength/components/strength-visualization';
import { AnalysisGrid } from '@/features/password-strength/components/analysis-grid';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PasswordStrengthClient() {
    const {
        password,
        setPassword,
        isVisible,
        toggleVisibility,
        strength,
        generatePassword
    } = usePasswordStrength();

    const handleCopy = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        toast.success('Password copied to clipboard');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            {/* Main Input Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -z-10 opacity-50 transform translate-x-1/2 -translate-y-1/2" />

                <div className="relative group">
                    <Input
                        type={isVisible ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Type a password to check..."
                        className="h-16 text-xl px-6 pr-32 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-primary-500 transition-all bg-gray-50/50 hover:bg-white"
                    />
                    <div className="absolute right-2 top-2 h-12 flex items-center gap-1 bg-white/80 backdrop-blur rounded-lg p-1 border border-gray-100 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleVisibility}
                            className="h-9 w-9 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                            title={isVisible ? "Hide password" : "Show password"}
                        >
                            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generatePassword()}
                            className="h-9 w-9 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                            title="Generate new strong password"
                        >
                            <RefreshCw size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            disabled={!password}
                            className="h-9 w-9 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                            title="Copy to clipboard"
                        >
                            <Copy size={18} />
                        </Button>
                    </div>
                </div>

                {/* Strength Meter */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <StrengthVisualization strength={strength} />
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                    <RequirementItem label="8+ Chars" met={strength.metrics.length >= 8} />
                    <RequirementItem label="Lowercase" met={strength.metrics.hasLower} />
                    <RequirementItem label="Uppercase" met={strength.metrics.hasUpper} />
                    <RequirementItem label="Numbers" met={strength.metrics.hasNumber} />
                    <RequirementItem label="Symbols" met={strength.metrics.hasSymbol} />
                </div>
            </div>

            {/* Analysis Grid */}
            <AnalysisGrid strength={strength} />

            {/* Detailed Feedback & Tips */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Check className="text-green-500" size={20} />
                        What makes a strong password?
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            At least 12-16 characters long.
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            Mix of uppercase, lowercase, numbers, and symbols.
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            Unpredictable and random (high entropy).
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                            Not a common word or phrase.
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <X className="text-red-500" size={20} />
                        What to avoid?
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            Personal info (birthdays, names).
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            Sequential characters (12345, abcde).
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            Common substitutions (@dmin, p@ssword).
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                            Short passwords (&lt; 8 chars).
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function RequirementItem({ label, met }: { label: string; met: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-all duration-300",
            met
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-100"
        )}>
            {met ? <Check size={14} strokeWidth={3} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}
            {label}
        </div>
    );
}
