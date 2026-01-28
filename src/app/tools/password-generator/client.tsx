'use client';

import { PasswordGenerator } from '@/features/password-generator';

export function PasswordGeneratorClient() {
  return (
    <div className="w-full">
      <PasswordGenerator />
    </div>
  );
}
