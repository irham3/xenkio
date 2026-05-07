'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    ArrowCounterClockwise,
    Calculator,
    Check,
    Copy,
    Globe,
    GridFour,
    HardDrives,
    Shield,
    Warning,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    calculateIpv4Subnet,
    formatAddressCount,
    parseCidrInput,
    parseIpv4,
    prefixToSubnetMask,
    SUBNET_PRESETS,
    subnetMaskToPrefix,
} from '../lib/ipv4-subnet-utils';
import type { Ipv4SubnetCalculation } from '../types';

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }).catch(() => {
            setCopied(false);
        });
    }, [value]);

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all',
                copied
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            )}
        >
            {copied ? (
                <Check className="h-3.5 w-3.5" weight="duotone" />
            ) : (
                <Copy className="h-3.5 w-3.5" weight="duotone" />
            )}
            {copied ? 'Copied' : label}
        </button>
    );
}

function ResultTile({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail?: string;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {label}
                    </p>
                    <p className="mt-1 break-all font-mono text-lg font-bold text-gray-900">
                        {value}
                    </p>
                    {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
                </div>
                <CopyButton value={value} />
            </div>
        </div>
    );
}

function StatTile({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    {icon}
                </div>
            </div>
            <div className="mt-3">
                <CopyButton value={value} />
            </div>
        </div>
    );
}

function BinaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-2 border-b border-gray-100 py-3 last:border-0 sm:grid-cols-[150px_1fr_auto] sm:items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {label}
            </span>
            <code className="overflow-x-auto whitespace-nowrap rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">
                {value}
            </code>
            <CopyButton value={value} label="Copy bits" />
        </div>
    );
}

function EmptyState({ addressError }: { addressError: boolean }) {
    return (
        <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
                <Warning className="h-7 w-7" weight="duotone" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">
                {addressError ? 'Invalid IPv4 address' : 'Enter a subnet'}
            </h3>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-gray-500">
                Use four decimal octets from 0 to 255, then choose a CIDR prefix from /0 to /32.
            </p>
        </div>
    );
}

function SubnetResults({ result }: { result: Ipv4SubnetCalculation }) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-gray-900 p-5 text-white shadow-soft">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Network CIDR
                        </p>
                        <p className="mt-1 break-all font-mono text-3xl font-bold tracking-tight">
                            {result.cidr}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                                {result.addressType}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                                {result.ipClass}
                            </span>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                                {result.usableNote}
                            </span>
                        </div>
                    </div>
                    <CopyButton value={result.cidr} label="Copy CIDR" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="text-xs font-medium text-gray-400">Usable hosts</p>
                        <p className="mt-1 text-2xl font-bold">{formatAddressCount(result.usableHosts)}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="text-xs font-medium text-gray-400">Total addresses</p>
                        <p className="mt-1 text-2xl font-bold">{formatAddressCount(result.totalAddresses)}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-4">
                        <p className="text-xs font-medium text-gray-400">Host bits</p>
                        <p className="mt-1 text-2xl font-bold">{result.hostBits}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <ResultTile
                    label="Network address"
                    value={result.networkAddress}
                    detail="First address in the subnet"
                />
                <ResultTile
                    label="Broadcast address"
                    value={result.broadcastAddress}
                    detail="Last address in the subnet"
                />
                <ResultTile
                    label="First usable host"
                    value={result.firstHost}
                    detail={result.prefix >= 31 ? result.usableNote : 'After the network address'}
                />
                <ResultTile
                    label="Last usable host"
                    value={result.lastHost}
                    detail={result.prefix >= 31 ? result.usableNote : 'Before the broadcast address'}
                />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <StatTile
                    label="Subnet mask"
                    value={result.subnetMask}
                    icon={<HardDrives className="h-5 w-5" weight="duotone" />}
                />
                <StatTile
                    label="Wildcard mask"
                    value={result.wildcardMask}
                    icon={<GridFour className="h-5 w-5" weight="duotone" />}
                />
                <StatTile
                    label="Network bits"
                    value={`/${result.networkBits}`}
                    icon={<Shield className="h-5 w-5" weight="duotone" />}
                />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Binary Breakdown</h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Octets are grouped for easier inspection.
                        </p>
                    </div>
                </div>
                <BinaryRow label="Input IP" value={result.binary.inputAddress} />
                <BinaryRow label="Network" value={result.binary.networkAddress} />
                <BinaryRow label="Subnet mask" value={result.binary.subnetMask} />
                <BinaryRow label="Wildcard" value={result.binary.wildcardMask} />
                <BinaryRow label="Broadcast" value={result.binary.broadcastAddress} />
            </div>
        </div>
    );
}

export function Ipv4SubnetCalculator() {
    const [addressInput, setAddressInput] = useState('192.168.1.10');
    const [prefix, setPrefix] = useState(24);
    const [maskInput, setMaskInput] = useState(prefixToSubnetMask(24));
    const [cidrInput, setCidrInput] = useState('192.168.1.10/24');
    const [cidrError, setCidrError] = useState(false);

    const result = useMemo(
        () => calculateIpv4Subnet(addressInput, prefix),
        [addressInput, prefix]
    );

    const addressError = addressInput.trim().length > 0 && parseIpv4(addressInput) === null;
    const maskError = maskInput.trim().length > 0 && subnetMaskToPrefix(maskInput) === null;

    const setPrefixAndMask = useCallback((nextPrefix: number, address = addressInput) => {
        const normalized = Math.max(0, Math.min(32, Math.round(nextPrefix)));
        setPrefix(normalized);
        setMaskInput(prefixToSubnetMask(normalized));
        setCidrInput(`${address}/${normalized}`);
    }, [addressInput]);

    const handleAddressChange = useCallback((value: string) => {
        setAddressInput(value);
        setCidrInput(`${value}/${prefix}`);
    }, [prefix]);

    const handleMaskChange = useCallback((value: string) => {
        setMaskInput(value);
        const nextPrefix = subnetMaskToPrefix(value);

        if (nextPrefix !== null) {
            setPrefix(nextPrefix);
            setCidrInput(`${addressInput}/${nextPrefix}`);
        }
    }, [addressInput]);

    const applyCidr = useCallback((value = cidrInput) => {
        const parsed = parseCidrInput(value);

        if (!parsed) {
            setCidrError(true);
            return;
        }

        setAddressInput(parsed.address);
        setPrefix(parsed.prefix);
        setMaskInput(prefixToSubnetMask(parsed.prefix));
        setCidrInput(`${parsed.address}/${parsed.prefix}`);
        setCidrError(false);
    }, [cidrInput]);

    const applyPreset = useCallback((cidr: string) => {
        setCidrInput(cidr);
        applyCidr(cidr);
    }, [applyCidr]);

    const handleReset = useCallback(() => {
        setAddressInput('192.168.1.10');
        setPrefix(24);
        setMaskInput(prefixToSubnetMask(24));
        setCidrInput('192.168.1.10/24');
        setCidrError(false);
    }, []);

    return (
        <div className="w-full space-y-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft">
                <div className="grid gap-0 lg:grid-cols-5">
                    <div className="border-b border-gray-100 p-5 lg:col-span-2 lg:border-b-0 lg:border-r lg:p-6">
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Subnet Input</h2>
                                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                    Enter a host address, CIDR prefix, or subnet mask. Results update locally in your browser.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ipv4-address" className="text-sm font-semibold text-gray-800">
                                    IPv4 address
                                </Label>
                                <div className="relative">
                                    <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" weight="duotone" />
                                    <Input
                                        id="ipv4-address"
                                        type="text"
                                        inputMode="decimal"
                                        value={addressInput}
                                        onChange={(event) => handleAddressChange(event.target.value)}
                                        placeholder="192.168.1.10"
                                        className={cn(
                                            'h-12 rounded-xl border-gray-200 bg-gray-50 pl-10 font-mono text-sm focus:bg-white',
                                            addressError && 'border-error-300 focus-visible:ring-error-200'
                                        )}
                                    />
                                </div>
                                {addressError && (
                                    <p className="text-xs font-medium text-error-600">
                                        Enter a valid IPv4 address from 0.0.0.0 to 255.255.255.255.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="cidr-prefix" className="text-sm font-semibold text-gray-800">
                                        CIDR prefix
                                    </Label>
                                    <Input
                                        id="cidr-prefix"
                                        type="number"
                                        min={0}
                                        max={32}
                                        value={prefix}
                                        onChange={(event) => setPrefixAndMask(Number(event.target.value))}
                                        className="h-9 w-20 rounded-lg border-gray-200 text-center font-mono text-sm"
                                    />
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={32}
                                    value={prefix}
                                    onChange={(event) => setPrefixAndMask(Number(event.target.value))}
                                    className="h-2 w-full cursor-pointer accent-primary-600"
                                    aria-label="CIDR prefix"
                                />
                                <div className="flex justify-between text-[11px] font-medium text-gray-400">
                                    <span>/0</span>
                                    <span>/16</span>
                                    <span>/24</span>
                                    <span>/32</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subnet-mask" className="text-sm font-semibold text-gray-800">
                                    Subnet mask
                                </Label>
                                <div className="relative">
                                    <HardDrives className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" weight="duotone" />
                                    <Input
                                        id="subnet-mask"
                                        type="text"
                                        inputMode="decimal"
                                        value={maskInput}
                                        onChange={(event) => handleMaskChange(event.target.value)}
                                        placeholder="255.255.255.0"
                                        className={cn(
                                            'h-12 rounded-xl border-gray-200 bg-gray-50 pl-10 font-mono text-sm focus:bg-white',
                                            maskError && 'border-error-300 focus-visible:ring-error-200'
                                        )}
                                    />
                                </div>
                                {maskError && (
                                    <p className="text-xs font-medium text-error-600">
                                        Use a contiguous subnet mask such as 255.255.255.0.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-5">
                                <Label htmlFor="cidr-shortcut" className="text-sm font-semibold text-gray-800">
                                    CIDR shortcut
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="cidr-shortcut"
                                        type="text"
                                        value={cidrInput}
                                        onChange={(event) => {
                                            setCidrInput(event.target.value);
                                            setCidrError(false);
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                applyCidr();
                                            }
                                        }}
                                        placeholder="192.168.1.10/24"
                                        className={cn(
                                            'h-11 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm focus:bg-white',
                                            cidrError && 'border-error-300 focus-visible:ring-error-200'
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        onClick={() => applyCidr()}
                                        className="h-11 shrink-0 gap-2 bg-primary-600 text-white hover:bg-primary-700"
                                    >
                                        <Calculator className="h-4 w-4" weight="duotone" />
                                        Apply
                                    </Button>
                                </div>
                                {cidrError && (
                                    <p className="text-xs font-medium text-error-600">
                                        Use CIDR format like 192.168.1.10/24.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    className="gap-2 border-gray-200"
                                >
                                    <ArrowCounterClockwise className="h-4 w-4" weight="duotone" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50/50 p-5 lg:col-span-3 lg:p-6">
                        {result && !addressError ? (
                            <SubnetResults result={result} />
                        ) : (
                            <EmptyState addressError={addressError} />
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Common Subnets</h2>
                        <p className="mt-1 text-xs text-gray-500">
                            Start from a familiar CIDR block and adjust from there.
                        </p>
                    </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {SUBNET_PRESETS.map((preset) => (
                        <button
                            key={preset.cidr}
                            type="button"
                            onClick={() => applyPreset(preset.cidr)}
                            className={cn(
                                'rounded-xl border p-4 text-left transition-all',
                                result?.prefix === Number(preset.label.slice(1)) && cidrInput === preset.cidr
                                    ? 'border-primary-200 bg-primary-50 text-primary-800'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50/50'
                            )}
                        >
                            <span className="block font-mono text-sm font-bold">{preset.cidr}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                                {preset.description}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
