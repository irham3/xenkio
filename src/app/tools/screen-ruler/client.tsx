'use client';

import dynamic from 'next/dynamic';

const ScreenRuler = dynamic(
    () => import('@/features/screen-ruler/components/screen-ruler').then((mod) => mod.ScreenRuler),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center min-h-[420px] gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary-600" />
                <p className="text-gray-500 animate-pulse">Loading screen ruler...</p>
            </div>
        ),
    },
);

export function ScreenRulerClient() {
    return <ScreenRuler />;
}
