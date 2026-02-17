'use client';

import { useState } from 'react';
import { Lock, Unlock, Zap, Settings2, Key, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { type AsymmetricAlgorithm } from '../utils/encryption-utils';
import { cn } from '@/lib/utils';
import { CopyButton, ClearButton } from '@/components/shared';
import { ShieldCheck } from 'lucide-react';

const ASYMMETRIC_ALGORITHMS: { value: AsymmetricAlgorithm; label: string; description: string }[] = [
    { value: 'RSA', label: 'RSA', description: 'Standard PKI encryption (2048/4096-bit).' },
    { value: 'ECC', label: 'ECC (Curve25519)', description: 'Efficient, modern elliptic curve cryptography.' },
];

export function AsymmetricPanel() {
    const [asymAction, setAsymAction] = useState<'generate' | 'encrypt' | 'decrypt'>('generate');
    const [asymAlgo, setAsymAlgo] = useState<AsymmetricAlgorithm>('RSA');
    const [asymName, setAsymName] = useState('User');
    const [asymEmail, setAsymEmail] = useState('user@example.com');
    const [asymPassphrase, setAsymPassphrase] = useState('');
    const [generatedKeys, setGeneratedKeys] = useState<{ pub: string; priv: string } | null>(null);

    const [asymInputText, setAsymInputText] = useState('');
    const [asymKeyInput, setAsymKeyInput] = useState('');
    const [asymOutputText, setAsymOutputText] = useState('');
    const [isAsymLoading, setIsAsymLoading] = useState(false);

    const handleGenerateKeys = async () => {
        if (!asymName.trim() || !asymEmail.trim()) return toast.error('Name and Email are required');
        setIsAsymLoading(true);
        try {
            const { generateKeyPair } = await import('../utils/encryption-utils');
            const keys = await generateKeyPair(asymAlgo as 'RSA' | 'ECC', { name: asymName, email: asymEmail }, asymPassphrase);
            setGeneratedKeys({ pub: keys.publicKey, priv: keys.privateKey });
            toast.success('Key Pair Generated Successfully!');
        } catch (e) {
            toast.error((e as Error).message);
        }
        setIsAsymLoading(false);
    };

    const handleAsymProcess = async () => {
        if (!asymInputText.trim()) return toast.error('Enter text to process');
        if (!asymKeyInput.trim()) return toast.error(asymAction === 'encrypt' ? 'Public Key required' : 'Private Key required');

        setIsAsymLoading(true);
        try {
            const { encryptWithOpenPGP, decryptWithOpenPGP } = await import('../utils/encryption-utils');
            let result;
            if (asymAction === 'encrypt') {
                result = await encryptWithOpenPGP(asymInputText, undefined, asymKeyInput);
            } else {
                result = await decryptWithOpenPGP(asymInputText, asymPassphrase, asymKeyInput);
            }

            if (result.error) throw new Error(result.error);
            setAsymOutputText(result.text);
            toast.success(asymAction === 'encrypt' ? 'Encrypted!' : 'Decrypted!');
        } catch (e) {
            toast.error((e as Error).message);
        }
        setIsAsymLoading(false);
    };

    return (
        <Card className="p-8 border border-gray-200 shadow-sm bg-white rounded-2xl">
            {/* Action Toggle */}
            <div className="flex justify-center mb-10">
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                    {['generate', 'encrypt', 'decrypt'].map((action) => (
                        <button
                            key={action}
                            onClick={() => setAsymAction(action as 'generate' | 'encrypt' | 'decrypt')}
                            className={cn(
                                "px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer",
                                asymAction === action ? "bg-white text-primary-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                            )}
                        >
                            {action === 'generate' ? 'Generate Keys' : action}
                        </button>
                    ))}
                </div>
            </div>

            {/* GENERATE KEYS UI */}
            {asymAction === 'generate' && (
                <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-6">
                        <div className="space-y-6 border border-gray-200 p-6 rounded-2xl bg-gray-50/50">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <Settings2 className="w-5 h-5 text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Identity Details</h3>
                                    <p className="text-xs text-gray-500">Required for PGP key generation</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={asymName} onChange={e => setAsymName(e.target.value)} className="bg-white border-gray-200" placeholder="e.g. Alice Smith" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input value={asymEmail} onChange={e => setAsymEmail(e.target.value)} className="bg-white border-gray-200" placeholder="e.g. alice@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Algorithm</Label>
                                    <Select value={asymAlgo} onValueChange={(v: AsymmetricAlgorithm) => setAsymAlgo(v)}>
                                        <SelectTrigger className="bg-white border-gray-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ASYMMETRIC_ALGORITHMS.map(a => (
                                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Passphrase (Optional)</Label>
                                    <Input type="password" value={asymPassphrase} onChange={e => setAsymPassphrase(e.target.value)} className="bg-white border-gray-200" placeholder="Protect your private key..." />
                                </div>

                                <Button
                                    onClick={handleGenerateKeys}
                                    disabled={isAsymLoading}
                                    className="w-full h-11 bg-primary-600 hover:bg-primary-700 font-semibold text-white shadow-md mt-4 cursor-pointer"
                                >
                                    {isAsymLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                                    Generate Key Pair
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="flex items-center gap-2"><Lock className="w-3 h-3" /> Public Key</Label>
                                <CopyButton value={generatedKeys?.pub || ''} />
                            </div>
                            <Textarea readOnly value={generatedKeys?.pub || ''} className="h-[160px] font-mono text-xs bg-gray-50 border-gray-200 text-gray-600 resize-none rounded-xl" placeholder="Generated Public Key will appear here..." />
                            <p className="text-xs text-gray-500">Share this key with anyone who wants to send you encrypted messages.</p>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <Label className="flex items-center gap-2"><Key className="w-3 h-3" /> Private Key</Label>
                                <CopyButton value={generatedKeys?.priv || ''} />
                            </div>
                            <Textarea readOnly value={generatedKeys?.priv || ''} className="h-[160px] font-mono text-xs bg-gray-50 border-gray-200 text-gray-600 resize-none rounded-xl" placeholder="Generated Private Key will appear here..." />
                            <p className="text-xs text-red-500 font-medium">Warning: Never share your private key with anyone!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ENCRYPT/DECRYPT UI */}
            {asymAction !== 'generate' && (
                <div className="grid lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold">Message Content</Label>
                                <ClearButton onClick={() => setAsymInputText('')} />
                            </div>
                            <Textarea
                                value={asymInputText}
                                onChange={e => setAsymInputText(e.target.value)}
                                className="min-h-[240px] bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl p-4 font-mono text-sm"
                                placeholder={asymAction === 'encrypt' ? "Enter text you want to encrypt..." : "Paste the PGP message block to decrypt..."}
                            />
                        </div>

                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 font-semibold text-gray-900">
                                    {asymAction === 'encrypt' ? <ShieldCheck className="w-4 h-4 text-primary-500" /> : <Key className="w-4 h-4 text-primary-500" />}
                                    {asymAction === 'encrypt' ? "Recipient's Public Key" : "Your Private Key"}
                                </Label>
                                <Textarea
                                    value={asymKeyInput}
                                    onChange={e => setAsymKeyInput(e.target.value)}
                                    className="h-[120px] font-mono text-xs bg-white border-gray-200 resize-none rounded-xl"
                                    placeholder={asymAction === 'encrypt' ? "-----BEGIN PGP PUBLIC KEY BLOCK-----..." : "-----BEGIN PGP PRIVATE KEY BLOCK-----..."}
                                />
                            </div>

                            {asymAction === 'decrypt' && (
                                <div className="space-y-2 pt-2">
                                    <Label>Passphrase</Label>
                                    <Input
                                        type="password"
                                        value={asymPassphrase}
                                        onChange={e => setAsymPassphrase(e.target.value)}
                                        className="bg-white border-gray-200"
                                        placeholder="Enter key passphrase if set..."
                                    />
                                </div>
                            )}

                            <Button
                                onClick={handleAsymProcess}
                                disabled={isAsymLoading}
                                className="w-full h-11 mt-2 font-semibold shadow-md bg-primary-600 hover:bg-primary-700 text-white cursor-pointer"
                            >
                                {isAsymLoading ? (
                                    <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {asymAction === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                        {asymAction === 'encrypt' ? "Encrypt Message" : "Decrypt Message"}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base font-semibold">Processed Output</Label>
                            <CopyButton value={asymOutputText} label="Copy Result" />
                        </div>
                        <Textarea
                            readOnly
                            value={asymOutputText}
                            className="h-full min-h-[400px] font-mono text-sm bg-gray-50 border-gray-200 text-gray-700 rounded-xl"
                            placeholder="The result will be shown here..."
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}
