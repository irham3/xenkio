'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ShieldCheck, Infinity, WifiOff, ArrowRight, Upload, Server, Download, MonitorSmartphone } from 'lucide-react';

// Hook: observe elements and add 'is-visible' class on scroll
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);

    const setupObserver = useCallback(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
        );

        const elements = ref.current.querySelectorAll('.reveal');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        return setupObserver();
    }, [setupObserver]);

    return ref;
}

export function HowItWorksClient() {
    const containerRef = useScrollReveal();

    return (
        <div ref={containerRef}>
            <style jsx>{`
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        .flow-line {
          background: repeating-linear-gradient(
            to right,
            currentColor 0,
            currentColor 6px,
            transparent 6px,
            transparent 12px
          );
          height: 2px;
        }
      `}</style>

            {/* ─── Section 1: Opening Statement ─── */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="reveal text-sm font-medium text-primary-600 tracking-wide uppercase mb-6">
                        How it works
                    </p>
                    <h1 className="reveal reveal-delay-1 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-8">
                        Most online tools upload your{' '}
                        <br className="hidden sm:block" />
                        files to their servers.
                        <br />
                        <span className="text-primary-500">We don&apos;t.</span>
                    </h1>
                    <p className="reveal reveal-delay-2 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Every tool on Xenkio runs entirely inside your browser.
                        Your files are processed on your own device and never touch our servers.
                    </p>
                </div>
            </section>

            {/* ─── Section 2: Comparison Flow ─── */}
            <section className="py-20 lg:py-28 bg-gray-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="reveal text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            The difference
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Other Tools */}
                        <div className="reveal reveal-delay-1 rounded-2xl border border-gray-200 bg-white p-8 lg:p-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Other tools</p>
                            </div>
                            <div className="space-y-6">
                                <FlowStep icon={Upload} label="Upload your file" sublabel="Wait for upload..." tone="red" />
                                <FlowArrow />
                                <FlowStep icon={Server} label="Server processes it" sublabel="File is on their server" tone="red" />
                                <FlowArrow />
                                <FlowStep icon={Download} label="Download result" sublabel="Wait again..." tone="red" />
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    <Pill text="File size limits" variant="red" />
                                    <Pill text="Privacy risk" variant="red" />
                                    <Pill text="Slow on large files" variant="red" />
                                    <Pill text="Daily quotas" variant="red" />
                                </div>
                            </div>
                        </div>

                        {/* Xenkio */}
                        <div className="reveal reveal-delay-2 rounded-2xl border-2 border-primary-200 bg-primary-50/30 p-8 lg:p-10 relative">
                            <div className="absolute -top-3 right-6">
                                <span className="px-3 py-1 text-xs font-bold text-primary-700 bg-primary-100 border border-primary-200 rounded-full">
                                    Xenkio
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">How we do it</p>
                            </div>
                            <div className="space-y-6">
                                <FlowStep icon={MonitorSmartphone} label="Open in browser" sublabel="No upload needed" tone="green" />
                                <FlowArrow color="emerald" />
                                <FlowStep icon={MonitorSmartphone} label="Browser processes it" sublabel="Stays on your device" tone="green" />
                                <FlowArrow color="emerald" />
                                <FlowStep icon={Download} label="Done" sublabel="Instant, save directly" tone="green" />
                            </div>
                            <div className="mt-8 pt-6 border-t border-primary-100">
                                <div className="flex flex-wrap gap-2">
                                    <Pill text="No file limits" variant="green" />
                                    <Pill text="100% private" variant="green" />
                                    <Pill text="Instant" variant="green" />
                                    <Pill text="Free forever" variant="green" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Section 3: Three Pillars ─── */}
            <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="reveal text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            What this means for you
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <PillarCard
                            icon={ShieldCheck}
                            title="Private by design"
                            description="Your files never leave your browser. No tracking, no server logs, no third-party access. Handle confidential documents without worry."
                            delay={1}
                        />
                        <PillarCard
                            icon={Infinity}
                            title="No limits, ever"
                            description="Other tools cap you at 100MB or 3 files per day. Since we don&apos;t pay for server processing, there are no limits and no paywalls."
                            delay={2}
                        />
                        <PillarCard
                            icon={WifiOff}
                            title="Works offline"
                            description="Load Xenkio once and use it anywhere — on a plane, in a cafe with bad wifi, or on a restricted network. No connection required."
                            delay={3}
                        />
                    </div>
                </div>
            </section>

            {/* ─── Section 4: CTA ─── */}
            <section className="py-20 lg:py-28 bg-gray-50 px-4 sm:px-6 lg:px-8">
                <div className="reveal max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6">
                        Ready to try it?
                    </h2>
                    <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                        No account needed, no software to install.
                        Just open a tool and go.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
                    >
                        Explore tools
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

/* ─── Sub-components ─── */

function FlowStep({ icon: Icon, label, sublabel, tone }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    sublabel: string;
    tone: 'red' | 'green';
}) {
    const bg = tone === 'red' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500';
    return (
        <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${bg}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{sublabel}</p>
            </div>
        </div>
    );
}

function FlowArrow({ color = 'gray' }: { color?: 'gray' | 'emerald' }) {
    return (
        <div className="flex items-center pl-5">
            <div className="w-0.5 h-5 rounded-full opacity-40" style={{ backgroundColor: color === 'emerald' ? '#6ee7b7' : '#e5e7eb' }} />
        </div>
    );
}

function Pill({ text, variant }: { text: string; variant: 'red' | 'green' }) {
    const cls = variant === 'red'
        ? 'bg-red-50 text-red-500 border-red-100'
        : 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${cls}`}>
            {text}
        </span>
    );
}

function PillarCard({ icon: Icon, title, description, delay }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    delay: number;
}) {
    return (
        <div className={`reveal reveal-delay-${delay} group bg-white border border-gray-100 rounded-2xl p-8 hover:border-gray-200 hover:shadow-sm transition-all duration-200`}>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 text-gray-500 mb-6 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
    );
}
