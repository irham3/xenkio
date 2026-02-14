"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, AlertCircle, FileCode, Lock, Check, FileJson } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import * as jose from 'jose';

const JWT_MODES = [
    { id: 'encode', name: 'Encoder', description: 'Create signed JWT tokens with custom payload', icon: Lock },
    { id: 'decode', name: 'Decoder', description: 'Decode and inspect JWT tokens without verification', icon: FileJson }
] as const;

export function JwtTool() {
    const [mode, setMode] = useState<"decode" | "encode">("encode");
    const [input, setInput] = useState("");
    const [secret, setSecret] = useState("secret");
    const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
    const [output, setOutput] = useState("");
    const [headerOutput, setHeaderOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleDecode = (token: string) => {
        if (!token) {
            setOutput("");
            setHeaderOutput("");
            setError(null);
            return;
        }

        try {
            setError(null);
            const decoded = jose.decodeJwt(token);
            const header = jose.decodeProtectedHeader(token);
            setOutput(JSON.stringify(decoded, null, 2));
            setHeaderOutput(JSON.stringify(header, null, 2));
        } catch {
            setError("Invalid JWT format");
            setOutput("");
            setHeaderOutput("");
        }
    };

    const handleEncode = async () => {
        try {
            setError(null);
            const parsedPayload = JSON.parse(payload);
            const secretKey = new TextEncoder().encode(secret);
            const alg = 'HS256';

            const jwt = await new jose.SignJWT(parsedPayload)
                .setProtectedHeader({ alg })
                .setIssuedAt()
                .sign(secretKey);

            setOutput(jwt);
        } catch (err) {
            setError("Invalid JSON payload or signing error");
            console.error(err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value);
        if (mode === 'decode') {
            handleDecode(value);
        }
    };

    // Trigger encode on payload or secret change
    const triggerEncode = () => {
        if (mode === 'encode') {
            handleEncode();
        }
    };

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copied to clipboard!");
    };

    const handleClear = () => {
        setInput("");
        setPayload('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
        setOutput("");
        setHeaderOutput("");
        setError(null);
    };

    return (
        <div className="w-full">
            {/* Mode Switcher Tabs */}
            <div
                className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl mb-6 w-full border border-gray-200"
                role="tablist"
                aria-label="JWT Tool mode selection"
            >
                {JWT_MODES.map((m) => (
                    <button
                        key={m.id}
                        role="tab"
                        aria-selected={mode === m.id}
                        onClick={() => {
                            setMode(m.id as "decode" | "encode");
                            setError(null);
                            setOutput("");
                            setHeaderOutput("");
                            if (m.id === 'encode') {
                                // Trigger initial encode
                                setTimeout(() => handleEncode(), 100);
                            }
                        }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                            mode === m.id
                                ? "bg-white text-primary-600 shadow-sm border border-gray-100"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                        )}
                    >
                        <m.icon className="w-4 h-4" />
                        {m.name}
                    </button>
                ))}
            </div>

            {/* Main Tool Area */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-soft">
                <div className="grid lg:grid-cols-2 gap-0">

                    {/* LEFT PANEL: Input */}
                    <div className="p-5 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between">
                                <Label className="text-sm font-semibold text-gray-800">
                                    {mode === 'decode' ? 'Encoded Token' : 'Payload (JSON)'}
                                </Label>
                            </div>

                            {mode === 'decode' ? (
                                <textarea
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Paste JWT token here..."
                                    className="w-full min-h-[400px] p-4 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400 font-mono break-all"
                                />
                            ) : (
                                <div className="space-y-4">
                                    <textarea
                                        value={payload}
                                        onChange={(e) => setPayload(e.target.value)}
                                        onBlur={triggerEncode}
                                        placeholder='{"sub": "1234567890", "name": "John Doe", ...}'
                                        className="w-full min-h-[250px] p-4 text-[14px] leading-relaxed bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-400 font-mono"
                                    />

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-800">Secret / Private Key</Label>
                                        <input
                                            type="text"
                                            value={secret}
                                            onChange={(e) => setSecret(e.target.value)}
                                            onBlur={triggerEncode}
                                            className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 font-mono"
                                            placeholder="your-256-bit-secret"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleEncode}
                                        className="w-full"
                                    >
                                        Sign & Encode JWT
                                    </Button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    className="flex-1 gap-2 hover:text-red-600 hover:border-red-300 hover:bg-red-50 cursor-pointer"
                                >
                                    Clear
                                </Button>
                            </div>

                            {/* Mode Description */}
                            <p className="text-xs text-gray-500 leading-relaxed pt-2">
                                {JWT_MODES.find(m => m.id === mode)?.description}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Output */}
                    <div className="p-5 lg:p-6 bg-gray-50/50 flex flex-col h-auto lg:h-[600px] overflow-y-auto">
                        <div className="flex flex-col gap-6">

                            {/* Header Section (Decode Mode Only) */}
                            {mode === 'decode' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-800">Header</h3>
                                    </div>
                                    <div className="relative group">
                                        <textarea
                                            readOnly
                                            value={headerOutput}
                                            placeholder="Header will appear here..."
                                            className="w-full h-[120px] p-4 text-xs font-mono bg-white border border-gray-200 rounded-xl text-red-600 resize-none focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Main Output / Payload Section */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        {mode === 'decode' ? 'Payload (Claims)' : 'Signed Token'}
                                    </h3>
                                    {output && !error && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleCopy(output)}
                                            className="h-6 text-xs gap-1 hover:text-primary-600"
                                        >
                                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            {copied ? 'Copied' : 'Copy'}
                                        </Button>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={error ? 'error' : output ? 'output' : 'empty'}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn(
                                            "w-full p-4 rounded-xl border font-mono text-[13px] leading-relaxed break-all transition-all duration-300 overflow-auto",
                                            error
                                                ? "bg-red-50 border-red-200 text-red-600 h-[200px] flex items-center justify-center"
                                                : output
                                                    ? "bg-white border-gray-200 text-gray-700 shadow-sm"
                                                    : "bg-white/50 border-dashed border-gray-200 text-gray-400 h-[200px] flex items-center justify-center",
                                            mode === 'decode' ? "h-[300px]" : "h-auto min-h-[200px]"
                                        )}
                                    >
                                        {error ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                                <AlertCircle className="w-8 h-8 text-red-400" />
                                                <p className="font-semibold text-sm">Error</p>
                                                <p className="text-xs opacity-80 text-center max-w-[250px]">{error}</p>
                                            </div>
                                        ) : output ? (
                                            <pre className="whitespace-pre-wrap">{output}</pre>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                                                <FileCode className="w-8 h-8 text-gray-300" />
                                                <p className="text-sm">
                                                    {mode === 'decode'
                                                        ? 'Enter token to see claims...'
                                                        : 'Resulting token will appear here...'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
