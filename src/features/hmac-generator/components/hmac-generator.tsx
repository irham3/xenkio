
'use client';


import { useHmacGenerator } from '../hooks/use-hmac-generator';
import { HmacAlgorithm } from '../lib/hmac-utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, RotateCcw, Copy, FileCode, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function HmacGenerator() {
    const {
        message,
        setMessage,
        secret,
        setSecret,
        algorithm,
        setAlgorithm,
        format,
        setFormat,
        isSecretVisible,
        toggleSecretVisibility,
        result,
        reset
    } = useHmacGenerator();

    const handleCopy = () => {
        if (!result.signature) return;
        navigator.clipboard.writeText(result.signature);
        toast.success('Signature copied to clipboard');
    };

    const ALGORITHMS: { value: HmacAlgorithm; label: string }[] = [
        { value: 'MD5', label: 'MD5 (128-bit)' },
        { value: 'SHA1', label: 'SHA-1 (160-bit)' },
        { value: 'SHA224', label: 'SHA-224' },
        { value: 'SHA256', label: 'SHA-256 (Standard)' },
        { value: 'SHA384', label: 'SHA-384' },
        { value: 'SHA512', label: 'SHA-512 (Secure)' },
        { value: 'RIPEMD160', label: 'RIPEMD-160' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">

            {/* Main Container */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50/50 rounded-full blur-3xl -z-10 opacity-60 transform translate-x-1/2 -translate-y-1/2" />

                <div className="p-8 space-y-8">
                    {/* Top Controls: Algorithm & Key */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-primary-500" /> Algorithm
                            </Label>
                            <Select value={algorithm} onValueChange={(val) => setAlgorithm(val as HmacAlgorithm)}>
                                <SelectTrigger className="h-12 border-gray-200 bg-gray-50/50 focus:ring-primary-500 text-base">
                                    <SelectValue placeholder="Select Algorithm" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALGORITHMS.map((algo) => (
                                        <SelectItem key={algo.value} value={algo.value} className="cursor-pointer">
                                            {algo.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <KeyRound size={16} className="text-primary-500" /> Secret Key
                            </Label>
                            <div className="relative group">
                                <Input
                                    type={isSecretVisible ? 'text' : 'password'}
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    placeholder="Enter your secret key..."
                                    className="h-12 border-gray-200 bg-gray-50/50 focus:ring-primary-500 pr-10 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={toggleSecretVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                                >
                                    {isSecretVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileCode size={16} className="text-primary-500" /> Message Payload
                        </Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter the message data here to sign..."
                            className="min-h-[150px] border-gray-200 bg-gray-50/50 focus:ring-primary-500 font-mono text-sm resize-y"
                        />
                    </div>


                    {/* Output Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <Label className="text-sm font-semibold text-gray-700">Calculated Signature (HMAC)</Label>
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                                <button
                                    onClick={() => setFormat('Hex')}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        format === 'Hex' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Hex
                                </button>
                                <button
                                    onClick={() => setFormat('Base64')}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        format === 'Base64' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Base64
                                </button>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className={cn(
                                "w-full min-h-[60px] p-4 rounded-xl border border-gray-200 bg-gray-50 font-mono text-sm break-all flex items-center transition-all duration-300",
                                result.signature ? "text-gray-800 bg-green-50/30 border-green-100" : "text-gray-400 italic"
                            )}>
                                {result.signature || "Enter message and key to verify signature..."}
                            </div>

                            {result.signature && (
                                <div className="absolute right-2 top-2 flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 bg-white shadow-xs hover:bg-gray-50 text-gray-500"
                                        onClick={handleCopy}
                                        title="Copy Result"
                                    >
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-2">
                        <Button
                            variant="ghost"
                            onClick={reset}
                            className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                        >
                            <RotateCcw size={16} className="mr-2" /> Reset All
                        </Button>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <ShieldCheck className="text-green-500" size={18} />
                        Secure Hashing
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Uses standard algorithms (SHA-256, SHA-512) to verify data integrity and authenticity without exposing the key.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <KeyRound className="text-blue-500" size={18} />
                        Key Protection
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Your secret key is processed entirely in your browser. It is never sent to any server.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileCode className="text-purple-500" size={18} />
                        API Compatible
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Perfect for debugging API webhooks, payment gateway signatures (Stripe, PayPal), and JWTs.
                    </p>
                </div>
            </div>
        </div>
    );
}
