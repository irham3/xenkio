
import { PasswordStrength } from '../lib/password-utils';
import { Card } from '@/components/ui/card';
import { Shield, Clock, Binary, Gauge } from 'lucide-react';

interface AnalysisGridProps {
    strength: PasswordStrength;
}

export function AnalysisGrid({ strength }: AnalysisGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <Card className="p-4 flex flex-col gap-2 relative overflow-hidden bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <Clock size={14} />
                    <span>Time to crack</span>
                </div>
                <div className="text-xl font-bold text-gray-900 line-clamp-1">
                    {strength.metrics.length > 0 ? strength.crackTime : '-'}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                    <Clock size={80} />
                </div>
            </Card>

            <Card className="p-4 flex flex-col gap-2 relative overflow-hidden bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <Binary size={14} />
                    <span>Entropy</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                    {strength.metrics.length > 0 ? `${strength.entropy} bits` : '-'}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                    <Binary size={80} />
                </div>
            </Card>

            <Card className="p-4 flex flex-col gap-2 relative overflow-hidden bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <Gauge size={14} />
                    <span>Score</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                    {strength.metrics.length > 0 ? `${strength.score}/4` : '-'}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                    <Gauge size={80} />
                </div>
            </Card>

            <Card className="p-4 flex flex-col gap-2 relative overflow-hidden bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <Shield size={14} />
                    <span>Length</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                    {strength.metrics.length} <span className="text-sm font-normal text-gray-400">chars</span>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                    <Shield size={80} />
                </div>
            </Card>
        </div>
    );
}
