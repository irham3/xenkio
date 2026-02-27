import { Viewport, Metadata } from 'next';
import { PomodoroClient } from './client';

export const metadata: Metadata = {
    title: 'Pomodoro Timer | Xenkio Tools',
    description: 'Boost productivity with our advanced Pomodoro Timer. Customizable intervals, focus mode, and sound notifications.',
    keywords: ['pomodoro timer', 'productivity timer', 'focus timer', 'tomato timer'],
    openGraph: {
        title: 'Pomodoro Timer - Boost Productivity',
        description: 'Focus better with our customizable Pomodoro Timer.',
        type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Xenkio | Free Browser-Based Tools',
          type: 'image/jpeg',
        },
      ],

    },
};

export const viewport: Viewport = {
    themeColor: '#ef4444',
};

export default function PomodoroPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <PomodoroClient />
        </main>
    );
}
