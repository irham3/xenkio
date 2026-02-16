'use client';

import { useState } from 'react';
import { Lock, Unlock, Zap, Copy, Settings2, Trash2, Key, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    type SymmetricAlgorithm,
    type AsymmetricAlgorithm
} from '../utils/encryption-utils';
import { cn } from '@/lib/utils';

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

const ASYMMETRIC_ALGORITHMS: { value: AsymmetricAlgorithm; label: string; description: string }[] = [
    { value: 'RSA', label: 'RSA', description: 'Standard PKI encryption (2048/4096-bit).' },
    { value: 'ECC', label: 'ECC (Curve25519)', description: 'Efficient, modern elliptic curve cryptography.' },
];

export function TextEncryptor() {
    const [activeTab, setActiveTab] = useState<'symmetric' | 'asymmetric'>('symmetric');

    // Symmetric State
    const [symMode, setSymMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [symAlgorithm, setSymAlgorithm] = useState<SymmetricAlgorithm>('AES');
    const [symInput, setSymInput] = useState('');
    const [symOutput, setSymOutput] = useState('');
    const [symKey, setSymKey] = useState('');
    const [rc4Drop, setRc4Drop] = useState(768);
    const [isSymLoading, setIsSymLoading] = useState(false);
    const [showSymKey, setShowSymKey] = useState(false);

    // Asymmetric State
    const [asymAction, setAsymAction] = useState<'generate' | 'encrypt' | 'decrypt'>('generate');
    const [asymAlgo, setAsymAlgo] = useState<AsymmetricAlgorithm>('RSA');
    const [asymName, setAsymName] = useState('User');
    const [asymEmail, setAsymEmail] = useState('user@example.com');
    const [asymPassphrase, setAsymPassphrase] = useState('');
    const [generatedKeys, setGeneratedKeys] = useState<{ pub: string; priv: string } | null>(null);

    const [asymInputText, setAsymInputText] = useState('');
    const [asymKeyInput, setAsymKeyInput] = useState(''); // Public key for encryption, Private key for decryption
    const [asymOutputText, setAsymOutputText] = useState('');
    const [isAsymLoading, setIsAsymLoading] = useState(false);

    // Symmetric Handlers
    const handleSymmetricProcess = async () => {
        if (!symInput.trim()) return toast.error('Please enter text to process');
        if (!symKey.trim()) return toast.error('Please enter a secret key');

        setIsSymLoading(true);
        // Add small delay to allow UI to update (loading spinner)
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

    // Asymmetric Handlers
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
                // Encrypt message using Public Key
                result = await encryptWithOpenPGP(asymInputText, undefined, asymKeyInput);

            } else {
                // Decrypt message using Private Key + Passphrase
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

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
            {/* Type Selection Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'symmetric' | 'asymmetric')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-gray-100 rounded-2xl mb-8 border border-gray-200">
                    <TabsTrigger
                        value="symmetric"
                        className="h-full rounded-xl text-sm font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
                    >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Symmetric Encryption
                    </TabsTrigger>
                    <TabsTrigger
                        value="asymmetric"
                        className="h-full rounded-xl text-sm font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
                    >
                        <Key className="w-4 h-4 mr-2" />
                        Asymmetric (RSA/PGP)
                    </TabsTrigger>
                </TabsList>

                {/* ================= SYMMETRIC TAB ================= */}
                <TabsContent value="symmetric" className="space-y-6">
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
                                    <Button variant="ghost" size="sm" onClick={() => setSymInput('')} className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-3 h-3 mr-1" /> Clear
                                    </Button>
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
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(symOutput)} disabled={!symOutput}>
                                    <Copy className="w-3 h-3 mr-2" /> Copy Result
                                </Button>
                            </div>
                            <Textarea
                                readOnly
                                value={symOutput}
                                className="min-h-[120px] font-mono text-sm bg-gray-50 border-gray-200 text-gray-600 rounded-xl"
                                placeholder="Result will appear here..."
                            />
                        </div>

                    </Card>
                </TabsContent>


                {/* ================= ASYMMETRIC TAB ================= */}
                <TabsContent value="asymmetric" className="space-y-6">
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
                                                className="w-full h-11 bg-primary-600 hover:bg-primary-700 font-semibold text-white shadow-md mt-4"
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
                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedKeys?.pub || '')} disabled={!generatedKeys}>
                                                <Copy className="w-3 h-3 mr-2" /> Copy
                                            </Button>
                                        </div>
                                        <Textarea readOnly value={generatedKeys?.pub || ''} className="h-[160px] font-mono text-xs bg-gray-50 border-gray-200 text-gray-600 resize-none rounded-xl" placeholder="Generated Public Key will appear here..." />
                                        <p className="text-xs text-gray-500">Share this key with anyone who wants to send you encrypted messages.</p>
                                    </div>

                                    <div className="space-y-4 pt-2 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <Label className="flex items-center gap-2"><Key className="w-3 h-3" /> Private Key</Label>
                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedKeys?.priv || '')} disabled={!generatedKeys}>
                                                <Copy className="w-3 h-3 mr-2" /> Copy
                                            </Button>
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
                                            <Button variant="ghost" size="sm" onClick={() => setAsymInputText('')} className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8">
                                                <Trash2 className="w-3 h-3 mr-1" /> Clear
                                            </Button>
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
                                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(asymOutputText)} disabled={!asymOutputText}>
                                            <Copy className="w-3 h-3 mr-2" /> Copy Result
                                        </Button>
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
