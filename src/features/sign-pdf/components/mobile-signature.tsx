import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Smartphone, RefreshCw, Check } from 'lucide-react';

interface MobileSignatureProps {
    onSave: (dataUrl: string) => void;
}

export function MobileSignature({ onSave }: MobileSignatureProps) {
    const [status, setStatus] = React.useState<'generating' | 'waiting' | 'scanned'>('waiting');

    // In a real app, this would be a unique session ID
    // and we would poll a backend for the signature.
    // For this client-side demo, we just show the UI.
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://xenkio.com/tools/sign-pdf';

    // Use QR Server API for generating the QR code
    // We append a query param to simulate a unique session
    const [sessionId] = React.useState(() => Math.random().toString(36).substring(7));
    const mobileSignUrl = `${currentUrl}/mobile/${sessionId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mobileSignUrl)}`;

    const handleSimulateMobileSign = () => {
        setStatus('generating');
        setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = '24px "Caveat", cursive';
                ctx.fillStyle = 'black';
                ctx.fillText('Mobile Signed', 50, 80);
                onSave(canvas.toDataURL());
            }

            setStatus('scanned');
            alert("Signature received from mobile! (Simulation)");
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={qrCodeUrl}
                    alt="Scan to sign"
                    className={cn(
                        "w-48 h-48 object-contain transition-opacity duration-500",
                        status === 'generating' ? "opacity-50" : "opacity-100"
                    )}
                />
                {status === 'generating' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
                    </div>
                )}
                {status === 'scanned' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>
                )}
            </div>

            <div className="space-y-2 max-w-sm">
                <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary-600" />
                    Sign from your mobile device
                </h3>
                <p className="text-sm text-gray-500">
                    Scan the QR code with your phone&apos;s camera. Draw your signature on the screen, and it will appear here instantly.
                </p>
            </div>

            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg max-w-xs">
                Note: This feature requires the application to be accessible from your mobile device (on the same network or deployed).
            </div>

            {/* Demo Control */}
            <Button variant="outline" size="sm" onClick={handleSimulateMobileSign} className="text-xs text-gray-400">
                <RefreshCw className="w-3 h-3 mr-2" />
                Simulate (Demo)
            </Button>
        </div>
    );
}
