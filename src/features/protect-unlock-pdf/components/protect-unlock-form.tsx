'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Upload, File as FileIcon, X, Eye, EyeOff, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { processPdfSecurity } from '../lib/pdf-security';
import { SecurityAction } from '../types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ProtectUnlockForm() {
    const [file, setFile] = useState<File | null>(null);
    const [action, setAction] = useState<SecurityAction>('protect');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [advancedOptions, setAdvancedOptions] = useState(false);

    // Protect Options
    const [ownerPassword, setOwnerPassword] = useState('');
    const [permissions, setPermissions] = useState({
        printing: true,
        modifying: false,
        copying: false,
        annotating: false,
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setProcessedUrl(null);
            setPassword('');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

    const handleRemoveFile = () => {
        setFile(null);
        setProcessedUrl(null);
        setPassword('');
    };

    const handleSubmit = async () => {
        if (!file) return;
        if (!password && action === 'protect') {
            toast.error('Please enter a password');
            return;
        }

        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Minimal delay for UX
            const blob = await processPdfSecurity(file, {
                action,
                password,
                ownerPassword: ownerPassword || undefined,
                permissions: action === 'protect' ? permissions : undefined,
            });
            const url = URL.createObjectURL(blob);
            setProcessedUrl(url);
            toast.success(`PDF ${action === 'protect' ? 'Protected' : 'Unlocked'} successfully!`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-12">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className={cn(
                    "p-4 rounded-2xl transition-colors duration-500",
                    action === 'protect' ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                )}>
                    {action === 'protect' ? <Lock className="w-10 h-10" /> : <Unlock className="w-10 h-10" />}
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-foreground">
                        {action === 'protect' ? 'Protect PDF File' : 'Unlock PDF File'}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        {action === 'protect'
                            ? 'Secure your documents with strong encryption and detailed permissions.'
                            : 'Remove password protection and restrictions from your PDF files.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                <Card className="p-8 border-none shadow-2xl bg-white backdrop-blur-xl rounded-3xl overflow-hidden relative ring-1 ring-slate-100">

                    {/* Tabs for Action Selection */}
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-center z-10">
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
                            <button
                                onClick={() => setAction('protect')}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                                    action === 'protect'
                                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Protect
                            </button>
                            <button
                                onClick={() => setAction('unlock')}
                                className={cn(
                                    "px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                                    action === 'unlock'
                                        ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Unlock
                            </button>
                        </div>
                    </div>

                    <div className="mt-16">
                        <AnimatePresence mode="wait">
                            {!file ? (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <div
                                        {...getRootProps()}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-16 text-center cursor-pointer transition-all duration-300 rounded-4xl border-2 border-dashed",
                                            "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-blue-400/50",
                                            isDragActive && "border-blue-500 bg-blue-50/50 scale-[0.99]"
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        <div className={cn(
                                            "w-24 h-24 mb-6 rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300",
                                            action === 'protect' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                        )}>
                                            {action === 'protect' ? <ShieldCheck className="w-12 h-12" /> : <FileText className="w-12 h-12" />}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3 text-slate-900">Drop your PDF here</h3>
                                        <p className="text-slate-500 mb-8 max-w-xs mx-auto text-base font-medium">
                                            Drag and drop your PDF file here, or click to browse from your computer
                                        </p>
                                        <Button
                                            size="lg"
                                            className={cn(
                                                "rounded-full px-8 h-12 text-base shadow-lg hover:shadow-xl transition-all font-semibold",
                                                action === 'protect' ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"
                                            )}
                                        >
                                            <Upload className="w-5 h-5 mr-2" />
                                            Select PDF File
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="file-ready"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    {/* File Preview Card */}
                                    {/* File Preview Card */}
                                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-300 transition-all duration-300">
                                        <div className="flex items-center space-x-5">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <FileIcon className="w-6 h-6" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-slate-900 truncate max-w-[200px] md:max-w-[300px]">{file.name}</p>
                                                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                                                    <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium uppercase tracking-wider">PDF</span>
                                                    <span>•</span>
                                                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleRemoveFile}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    {/* Configuration Area */}
                                    <div className="space-y-6 max-w-md mx-auto">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                {action === 'protect' ? 'Set Password' : 'Enter PDF Password'}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder={action === 'protect' ? "Enter a strong password" : "Password to open file"}
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {action === 'protect' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="ownerPassword" className="text-xs text-muted-foreground">Owner Password (Optional)</Label>
                                                <Input
                                                    id="ownerPassword"
                                                    type="password"
                                                    value={ownerPassword}
                                                    onChange={(e) => setOwnerPassword(e.target.value)}
                                                    placeholder="Same as user password if empty"
                                                    className="text-sm"
                                                />
                                            </div>
                                        )}

                                        {action === 'protect' && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <ShieldCheck className={cn("w-5 h-5", action === 'protect' ? "text-blue-600" : "text-orange-600")} />
                                                        <Label className="text-base font-semibold text-slate-900">Advanced Options</Label>
                                                    </div>
                                                    <Switch
                                                        checked={advancedOptions}
                                                        onCheckedChange={setAdvancedOptions}
                                                    />
                                                </div>

                                                <AnimatePresence>
                                                    {advancedOptions && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="space-y-4 overflow-hidden pt-2"
                                                        >
                                                            <div className="space-y-2">
                                                                <Label>Permissions</Label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="perm-print"
                                                                            checked={permissions.printing}
                                                                            onCheckedChange={(c: boolean | 'indeterminate') => setPermissions(p => ({ ...p, printing: c === true }))}
                                                                        />
                                                                        <Label htmlFor="perm-print" className="font-normal cursor-pointer">Allow Printing</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="perm-copy"
                                                                            checked={permissions.copying}
                                                                            onCheckedChange={(c: boolean | 'indeterminate') => setPermissions(p => ({ ...p, copying: c === true }))}
                                                                        />
                                                                        <Label htmlFor="perm-copy" className="font-normal cursor-pointer">Allow Copying</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="perm-mod"
                                                                            checked={permissions.modifying}
                                                                            onCheckedChange={(c: boolean | 'indeterminate') => setPermissions(p => ({ ...p, modifying: c === true }))}
                                                                        />
                                                                        <Label htmlFor="perm-mod" className="font-normal cursor-pointer">Allow Modifying</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="perm-ann"
                                                                            checked={permissions.annotating}
                                                                            onCheckedChange={(c: boolean | 'indeterminate') => setPermissions(p => ({ ...p, annotating: c === true }))}
                                                                        />
                                                                        <Label htmlFor="perm-ann" className="font-normal cursor-pointer">Allow Annotating</Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleSubmit}
                                            className="w-full text-lg h-12 rounded-xl"
                                            disabled={isProcessing || (!password && action === 'protect')}
                                        >
                                            {isProcessing ? 'Processing...' : (action === 'protect' ? 'Protect PDF' : 'Unlock PDF')}
                                        </Button>

                                        {processedUrl && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="pt-4"
                                            >
                                                <Button asChild className="w-full h-14 text-lg rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all duration-300">
                                                    <a href={processedUrl} download={`${action === 'protect' ? 'protected' : 'unlocked'}-${file.name}`}>
                                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                                        Download {action === 'protect' ? 'Protected' : 'Unlocked'} PDF
                                                    </a>
                                                </Button>
                                                <p className="text-center text-xs text-muted-foreground mt-3">
                                                    Your file is ready! Download it now.
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>
        </div>
    );
}
