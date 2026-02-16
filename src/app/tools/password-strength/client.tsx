
'use client';

import { PasswordStrengthChecker } from '@/features/password-strength';

export function PasswordStrengthClient() {
    return (
        <div className="w-full">
            <PasswordStrengthChecker />
        </div>
    );
}
