'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    ShieldCheck, Infinity, WifiOff, ArrowRight, Upload, Server, Download,
    MonitorSmartphone, Cpu, Lock, Globe, Zap, UserX, Scale, Briefcase,
    FileText, Code, Search
} from 'lucide-react';

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
                                    <Pill text="Account required" variant="red" />
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
                                <FlowStep icon={Cpu} label="Browser processes it" sublabel="Stays on your device" tone="green" />
                                <FlowArrow color="emerald" />
                                <FlowStep icon={Download} label="Done" sublabel="Instant, save directly" tone="green" />
                            </div>
                            <div className="mt-8 pt-6 border-t border-primary-100">
                                <div className="flex flex-wrap gap-2">
                                    <Pill text="No file limits" variant="green" />
                                    <Pill text="100% private" variant="green" />
                                    <Pill text="Instant" variant="green" />
                                    <Pill text="Free forever" variant="green" />
                                    <Pill text="No account needed" variant="green" />
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
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
                            Three pillars that make Xenkio fundamentally different from every other online tool.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <PillarCard
                            icon={ShieldCheck}
                            title="Private by design"
                            description="Your files never leave your browser. No tracking, no server logs, no third-party access. Handle confidential documents without worry. Inherently GDPR, HIPAA, and SOC 2 compliant."
                            delay={1}
                        />
                        <PillarCard
                            icon={Zap}
                            title="Instant, no waiting"
                            description="No upload queue, no server processing time. Files are processed at the speed of your device. On slow WiFi? Doesn't matter — everything happens locally."
                            delay={2}
                        />
                        <PillarCard
                            icon={UserX}
                            title="No account, no friction"
                            description="No sign-up, no email capture, no paywall after 3 uses. Just open a tool and get results. We don't need your data because we never see your files."
                            delay={3}
                        />
                    </div>

                    {/* Offline capability sub-card */}
                    <div className="reveal reveal-delay-4 mt-8 rounded-2xl border border-gray-100 bg-white p-8 lg:p-10 flex flex-col md:flex-row items-start gap-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 shrink-0">
                            <WifiOff className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Works offline — that&apos;s the proof</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Load Xenkio once and use it anywhere — on a plane, in a café with bad WiFi, or on a restricted corporate network.
                                If the tools work with no internet connection, that&apos;s the strongest possible proof that nothing is being sent to any server.
                                Try it: turn off your WiFi and keep using any tool.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Section 4: Technical Explanation ─── */}
            <section className="py-20 lg:py-28 bg-gray-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="reveal text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Under the hood
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
                            A technical but accessible look at how local processing actually works.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        <TechCard
                            icon={Cpu}
                            title="JavaScript & WebAssembly"
                            description="Your browser is more powerful than you think. Modern JavaScript and WebAssembly (WASM) can handle PDF parsing, image manipulation, video compression, and encryption — all without a server."
                            delay={1}
                        />
                        <TechCard
                            icon={Lock}
                            title="File API, not uploads"
                            description="When you 'select a file,' Xenkio reads it through the browser's File API. The file stays in your device memory and is never transmitted anywhere. After processing, the result is saved directly to your downloads."
                            delay={2}
                        />
                        <TechCard
                            icon={Globe}
                            title="Progressive Web App"
                            description="Xenkio is a PWA — it installs on your device and works offline. The service worker caches all the tool code so processing happens entirely on your machine, even without internet."
                            delay={3}
                        />
                        <TechCard
                            icon={Infinity}
                            title="No server costs = no limits"
                            description="Since we don't run processing servers, we don't pay per file. That means no file size limits, no daily quotas, no premium tiers. Your device's RAM is the only limit."
                            delay={4}
                        />
                    </div>

                    {/* Network monitor explanation */}
                    <div className="reveal reveal-delay-4 mt-10 rounded-2xl border border-gray-200 bg-white p-8">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Don&apos;t take our word for it — verify it yourself
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    Open your browser&apos;s Developer Tools (F12 → Network tab) while using any Xenkio tool.
                                    You&apos;ll see zero outgoing requests containing your file data. What you will see is only the initial page load and optional analytics.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                        Chrome: F12 → Network
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                        Firefox: F12 → Network
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                        Safari: Develop → Network
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Section 5: GDPR & Compliance ─── */}
            <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="reveal text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Inherently compliant
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
                            Because your files never leave your browser, Xenkio is compliant by architecture, not by policy.
                        </p>
                    </div>

                    <div className="reveal rounded-2xl border border-gray-200 bg-white overflow-hidden">
                        <div className="p-8 lg:p-10 bg-linear-to-br from-primary-50/60 to-white border-b border-gray-100">
                            <div className="flex items-start gap-5">
                                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 shrink-0">
                                    <Scale className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        GDPR, HIPAA, SOC 2 — by design
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                                        Traditional tools must build complex data handling pipelines, write privacy policies, and undergo security audits to prove compliance.
                                        Xenkio sidesteps all of that: <strong className="text-gray-800">we never receive, process, or store your data</strong>, so there&apos;s nothing to protect on our end.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                            <ComplianceItem
                                title="GDPR Compliant"
                                description="No personal data is collected, transmitted, or processed by Xenkio servers. Article 25 'Data Protection by Design' satisfied by architecture."
                            />
                            <ComplianceItem
                                title="No Data Retention"
                                description="Files exist only in your browser's memory during processing. When you close the tab, everything is gone. Nothing persists."
                            />
                            <ComplianceItem
                                title="Enterprise Ready"
                                description="Safe for use on corporate networks with strict DLP policies. IT departments can verify by auditing network traffic — zero file data leaves the browser."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Section 6: Who It's For ─── */}
            <section className="py-20 lg:py-28 bg-gray-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="reveal text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            Built for people who care about their files
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">
                            If your work involves sensitive documents, Xenkio is the only tool you can trust completely.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                        <SegmentCard
                            icon={Scale}
                            title="Lawyers & Notaries"
                            description="Client contracts, NDAs, legal briefs — documents that must never be uploaded to a third-party server. Attorney-client privilege is maintained because files never leave your device."
                            delay={1}
                        />
                        <SegmentCard
                            icon={Briefcase}
                            title="Finance & Accounting"
                            description="Tax returns, financial statements, audit reports — handle the most sensitive financial documents without violating internal data policies or compliance requirements."
                            delay={2}
                        />
                        <SegmentCard
                            icon={Code}
                            title="Developers & IT Teams"
                            description="You understand the risks of uploading files to unknown servers. Verify our claims yourself — check the network tab, read the source, or use the tools fully offline."
                            delay={3}
                        />
                        <SegmentCard
                            icon={FileText}
                            title="Journalists & Researchers"
                            description="Source documents, whistleblower files, research data — protect your sources by ensuring their documents never touch anyone else's infrastructure."
                            delay={4}
                        />
                    </div>
                </div>
            </section>

            {/* ─── Section 7: CTA ─── */}
            <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
                <div className="reveal max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-6">
                        Ready to try?
                    </h2>
                    <p className="text-lg text-gray-500 mb-4 leading-relaxed">
                        No account needed, no software to install.
                        Just open a tool and go.
                    </p>
                    <p className="text-sm text-gray-400 mb-10">
                        Tip: Open DevTools (F12) while using any tool to confirm zero file uploads.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300"
                        >
                            Explore tools
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <Search className="w-4 h-4" />
                            Browse all tools
                        </Link>
                    </div>
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

function TechCard({ icon: Icon, title, description, delay }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    delay: number;
}) {
    return (
        <div className={`reveal reveal-delay-${delay} group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-600 mb-5 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
    );
}

function ComplianceItem({ title, description }: { title: string; description: string }) {
    return (
        <div className="p-6 lg:p-8">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
    );
}

function SegmentCard({ icon: Icon, title, description, delay }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    delay: number;
}) {
    return (
        <div className={`reveal reveal-delay-${delay} flex items-start gap-5 bg-white border border-gray-100 rounded-2xl p-8 hover:border-gray-200 hover:shadow-sm transition-all duration-200`}>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 text-gray-500 shrink-0">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
