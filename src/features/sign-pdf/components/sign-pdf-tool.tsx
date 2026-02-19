
import React from 'react';
import { useSignPdf } from '../hooks/use-sign-pdf';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignatureCanvas } from './signature-canvas';
import { TextSignature } from './text-signature';
import { UploadSignature } from './upload-signature';
import { PdfViewer } from './pdf-viewer';
import { MobileSignature } from './mobile-signature';
import { Download, Upload, Type, PenTool, Plus, Trash2, Settings, Palette, Smartphone } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { PDFSignature, SignMode } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { COLORS } from '../constants';

export function SignPdfTool() {
    const {
        state,
        handleFileSelect,
        addSignature,
        updateSignature,
        removeSignature,
        selectSignature,
        setEditingSignature,
        generateSignedPdf,
        reset,
    } = useSignPdf();

    const [signatureColor, setSignatureColor] = React.useState(COLORS.black);
    const [activeTab, setActiveTab] = React.useState('draw');

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            handleFileSelect(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    const handleSignatureCreated = (dataUrl: string, type: SignMode = 'draw') => {
        if (!state.file) return;

        if (state.editingSignatureId) {
            updateSignature(state.editingSignatureId, { dataUrl });
            setEditingSignature(null);
            return;
        }

        const newSignature: PDFSignature = {
            id: uuidv4(),
            dataUrl,
            x: 100,
            y: 100,
            width: type === 'draw' || type === 'type' || type === 'mobile' ? 150 : 200,
            height: type === 'draw' || type === 'type' || type === 'mobile' ? 75 : 100,
            pageIndex: state.currentPageIndex,
            type,
        };
        addSignature(newSignature);
    };

    const handleDownload = async () => {
        const pdfBytes = await generateSignedPdf();
        if (pdfBytes) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `signed_${state.file?.name || 'document'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const editingSignature = state.signatures.find(s => s.id === state.editingSignatureId);

    if (!state.file) {
        return (
            <div className="w-full max-w-4xl mx-auto py-12">
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 cursor-pointer bg-white",
                        isDragActive
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-primary-400 hover:bg-gray-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-center space-y-6">
                        <div className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
                            isDragActive ? "bg-primary-100" : "bg-gray-100"
                        )}>
                            <Upload className={cn(
                                "w-10 h-10 transition-colors",
                                isDragActive ? "text-primary-600" : "text-gray-400"
                            )} />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-gray-900">
                                {isDragActive ? "Drop your PDF here" : "Select PDF file"}
                            </p>
                            <p className="text-gray-500">
                                or drag and drop a PDF file here
                            </p>
                        </div>
                        <Button size="lg" className="mt-4" type="button">
                            <Plus className="w-4 h-4 mr-2" />
                            Select PDF file
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-250px)] lg:min-h-[750px] mb-32">
            {/* Left Sidebar - Pdf Viewer */}
            <div className="lg:w-2/3 h-[600px] lg:h-full flex flex-col gap-4">
                <PdfViewer
                    file={state.file}
                    signatures={state.signatures}
                    activeSignature={state.currentSignature}
                    onUpdateSignature={(id, updates) => updateSignature(id, updates)}
                    onRemoveSignature={removeSignature}
                    onSelectSignature={selectSignature}
                />
            </div>

            {/* Right Sidebar - Tools */}
            <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 lg:w-1/3 h-full overflow-y-auto scrollbar-hide shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="text-lg font-bold text-gray-900">
                        {state.editingSignatureId ? 'Edit Signature' : 'Add Signature'}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={reset} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                        Reset
                    </Button>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Palette className="w-4 h-4" />
                            Signature Color
                        </div>
                        <span className="text-xs text-gray-400">For new/edited signs</span>
                    </div>
                    <div className="flex gap-2">
                        {Object.entries(COLORS).map(([name, value]) => (
                            <button
                                key={name}
                                onClick={() => setSignatureColor(value)}
                                className={cn(
                                    "w-7 h-7 rounded-full border-2 transition-all",
                                    signatureColor === value ? "border-primary-500 scale-110" : "border-gray-200 hover:scale-105"
                                )}
                                style={{ backgroundColor: value }}
                                title={name}
                            />
                        ))}
                    </div>
                </div>

                {/* Signature Tabs */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
                    <Tabs value={activeTab} onValueChange={(val) => {
                        setActiveTab(val as SignMode);
                        setEditingSignature(null);
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100/50 p-1 rounded-lg">
                            <TabsTrigger value="draw" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md transition-all text-sm font-medium">
                                <PenTool className="w-4 h-4" />
                                Draw
                            </TabsTrigger>
                            <TabsTrigger value="type" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md transition-all text-sm font-medium">
                                <Type className="w-4 h-4" />
                                Type
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md transition-all text-sm font-medium">
                                <Upload className="w-4 h-4" />
                                Upload
                            </TabsTrigger>
                            <TabsTrigger value="mobile" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm rounded-md transition-all text-sm font-medium">
                                <Smartphone className="w-4 h-4" />
                                Phone
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="draw" className="mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <SignatureCanvas
                                key={state.editingSignatureId || 'new-draw'}
                                onSave={(url) => handleSignatureCreated(url, 'draw')}
                                color={signatureColor}
                                initialImage={editingSignature?.type === 'draw' ? editingSignature.dataUrl : undefined}
                            />
                        </TabsContent>
                        <TabsContent value="type" className="mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TextSignature
                                onSave={(url) => handleSignatureCreated(url, 'type')}
                                color={signatureColor}
                            />
                        </TabsContent>
                        <TabsContent value="upload" className="mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <UploadSignature onSave={(url) => handleSignatureCreated(url, 'upload')} />
                        </TabsContent>
                        <TabsContent value="mobile" className="mt-4 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <MobileSignature onSave={(url) => handleSignatureCreated(url, 'mobile')} />
                        </TabsContent>
                    </Tabs>
                </div>

                {state.signatures.length > 0 && (
                    <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
                            <Settings className="w-4 h-4" />
                            Manage Signatures ({state.signatures.length})
                        </div>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-2 no-scrollbar">
                            {state.signatures.map((sig) => (
                                <div
                                    key={sig.id}
                                    className={cn(
                                        "flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer",
                                        state.currentSignature?.id === sig.id ? "border-primary-500 bg-primary-50 shadow-sm" : "border-gray-100 hover:bg-gray-50"
                                    )}
                                    onClick={() => selectSignature(sig.id)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-12 h-8 bg-white border rounded flex items-center justify-center p-1 shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={sig.dataUrl} alt="sig" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="text-[11px] truncate">
                                            <p className="font-semibold text-gray-900 capitalize">{sig.type}</p>
                                            <p className="text-gray-500">Page {sig.pageIndex + 1}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingSignature(sig.id);
                                                setActiveTab(sig.type);
                                            }}
                                            title="Edit signature"
                                        >
                                            <PenTool className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeSignature(sig.id);
                                            }}
                                            title="Remove"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t space-y-3">
                    <Button
                        className="w-full h-12 text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5"
                        onClick={handleDownload}
                        disabled={state.signatures.length === 0 || state.isProcessing}
                    >
                        {state.isProcessing ? 'Processing...' : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                Sign & Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
