'use client';

import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface VerificationBadgeProps {
    isVerified: boolean | null;
    hasToken: boolean;
}

export function VerificationBadge({ isVerified, hasToken }: VerificationBadgeProps) {
    if (!hasToken) return null;

    if (isVerified === null) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                <Shield className="w-3 h-3" />
                Unverified
            </div>
        );
    }

    if (isVerified) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">
                <ShieldCheck className="w-3 h-3" />
                Signature Verified
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider border border-red-200">
            <ShieldAlert className="w-3 h-3" />
            Invalid Signature
        </div>
    );
}
