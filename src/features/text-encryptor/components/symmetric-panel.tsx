'use client';

import { useState } from 'react';
import { Lock, Unlock, Key, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { type SymmetricAlgorithm } from '../utils/encryption-utils';
import { cn } from '@/lib/utils';
import { CopyButton, ClearButton } from '@/components/shared';

const SYMMETRIC_ALGORITHMS: { value: SymmetricAlgorithm; label: string; description: string }[] = [
    { value: 'AES', label: 'AES (Recommended)', description: 'Standard secure encryption (256-bit).' },
    { value: 'ChaCha20', label: 'ChaCha20 (Fast)', description: 'Modern, high-performance stream cipher.' },
    { value: 'Twofish', label: 'Twofish', description: 'Secure, unpatented 128-bit block cipher.' },
    { value: 'Camellia', label: 'Camellia', description: 'Internationally approved secure block cipher.' },
    { value: 'Blowfish', label: 'Blowfish', description: 'Legacy but fast. Good for small data.' },
    { value: 'Cast5', label: 'CAST5', description: 'Standard PGP algorithm (64-bit block).' },
    { value: 'TripleDES', label: '3DES', description: 'Legacy standard. Slower but widely supported.' },
    { value: 'Rabbit', label: 'Rabbit', description: 'High-speed stream cipher.' },
    { value: 'RC4', label: 'RC4', description: 'Legacy stream cipher. Use with caution.' },
    { value: 'RC4Drop', label: 'RC4Drop', description: 'RC4 variant with keystream drop.' },
];

export function SymmetricPanel() {
    const [symMode, setSymMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [symAlgorithm, setSymAlgorithm] = useState<SymmetricAlgorithm>('AES');
    const [symInput, setSymInput] = useState('');
    const [symOutput, setSymOutput] = useState('');
    const [symKey, setSymKey] = useState('');
    const [rc4Drop, setRc4Drop] = useState(768);
    const [isSymLoading, setIsSymLoading] = useState(false);
    const [showSymKey, setShowSymKey] = useState(false);

    const handleSymmetricProcess = async () => {
        if (!symInput.trim()) return toast.error('Please enter text to process');
        if (!symKey.trim()) return toast.error('Please enter a secret key');

        setIsSymLoading(true);
        setTimeout(async () => {
            const { encryptText, decryptText } = await import('../utils/encryption-utils');
            const result = symMode === 'encrypt'
                ? await encryptText(symInput, symAlgorithm, symKey, { drop: rc4Drop })
                : await decryptText(symInput, symAlgorithm, symKey, { drop: rc4Drop });

            if (result.error) {
                toast.error(result.error);
                setSymOutput('');
            } else {
                setSymOutput(result.text);
                toast.success(symMode === 'encrypt' ? 'Encrypted successfully!' : 'Decrypted successfully!');
            }
            setIsSymLoading(false);
        }, 100);
    };

    return (
        <Card className="p-8 border border-gray-200 shadow-sm bg-white rounded-2xl space-y-8">
            {/* Top Controls: Mode & Algo */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">Operation Mode</Label>
                    <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                        <button
                            onClick={() => { setSymMode('encrypt'); setSymOutput(''); }}
                            className={cn(
                                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer",
                                symMode === 'encrypt' ? "bg-white text-primary-600 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                            )}
                        >
                            <Lock className="w-4 h-4" /> Encrypt
                        </button>
                        <button
                            onClick={() => { setSymMode('decrypt'); setSymOutput(''); }}
                            className={cn(
                                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer",
                                symMode === 'decrypt' ? "bg-white text-primary-600 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                            )}
                        >
                            <Unlock className="w-4 h-4" /> Decrypt
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">Algorithm</Label>
                    <Select value={symAlgorithm} onValueChange={(v: SymmetricAlgorithm) => setSymAlgorithm(v)}>
                        <SelectTrigger className="h-[52px] bg-white border-gray-200 focus:ring-primary-500 rounded-xl px-4">
                            <SelectValue placeholder="Select Algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Modern Standards</SelectLabel>
                                {SYMMETRIC_ALGORITHMS.filter(a => ['AES', 'ChaCha20', 'Twofish', 'Camellia'].includes(a.value)).map(algo => (
                                    <SelectItem key={algo.value} value={algo.value}>{algo.label}</SelectItem>
                                ))}
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Legacy / Specialized</SelectLabel>
                                {SYMMETRIC_ALGORITHMS.filter(a => !['AES', 'ChaCha20', 'Twofish', 'Camellia'].includes(a.value)).map(algo => (
                                    <SelectItem key={algo.value} value={algo.value}>{algo.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Input & Key */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-gray-700">Message Input</Label>
                        <ClearButton onClick={() => setSymInput('')} />
                    </div>
                    <Textarea
                        value={symInput}
                        onChange={(e) => setSymInput(e.target.value)}
                        placeholder={symMode === 'encrypt' ? "Type your plain text message here..." : "Paste the encrypted text here..."}
                        className="min-h-[200px] font-mono text-sm bg-gray-50/50 border-gray-200 focus:ring-primary-500 focus:bg-white transition-all rounded-xl resize-none p-4"
                    />
                </div>

                <div className="space-y-6">
                    <div className="space-y-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Key className="w-4 h-4 text-primary-500" /> Secret Passphrase
                        </Label>
                        <div className="relative">
                            <Input
                                type={showSymKey ? "text" : "password"}
                                value={symKey}
                                onChange={(e) => setSymKey(e.target.value)}
                                className="pr-10 bg-white border-gray-200 h-11 rounded-lg"
                                placeholder="Enter strong password..."
                            />
                            <button
                                onClick={() => setShowSymKey(!showSymKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                {showSymKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            All encryption happens locally in your browser. Your key never leaves this device.
                        </p>
                        {symAlgorithm === 'RC4Drop' && (
                            <div className="pt-2">
                                <Label className="text-xs">Drop Count</Label>
                                <Input type="number" value={rc4Drop} onChange={(e) => setRc4Drop(Number(e.target.value))} className="bg-white mt-1" />
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSymmetricProcess}
                        disabled={isSymLoading}
                        className={cn(
                            "w-full h-12 text-base font-semibold shadow-lg transition-all cursor-pointer",
                            "bg-primary-600 hover:bg-primary-700 text-white"
                        )}
                    >
                        {isSymLoading ? (
                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            symMode === 'encrypt' ? <Lock className="w-5 h-5 mr-2" /> : <Unlock className="w-5 h-5 mr-2" />
                        )}
                        {symMode === 'encrypt' ? 'Encrypt Message' : 'Decrypt Message'}
                    </Button>
                </div>
            </div>

            {/* Output */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-gray-900">Result Output</Label>
                    <CopyButton value={symOutput} label="Copy Result" />
                </div>
                <Textarea
                    readOnly
                    value={symOutput}
                    className="min-h-[120px] font-mono text-sm bg-gray-50 border-gray-200 text-gray-600 rounded-xl"
                    placeholder="Result will appear here..."
                />
            </div>
        </Card>
    );
}
