import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Person, Currency } from '../types';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface PaymentQrProps {
    isOpen: boolean;
    onClose: () => void;
    person: Person | null;
    amount: number;
    currency: Currency;
}

export function PaymentQr({ isOpen, onClose, person, amount, currency }: PaymentQrProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    if (!person) return null;

    // Generic EPC-like payment string or generic string
    // In a real app, you might ask for the host's bank details to build the string
    const paymentString = `PAYMENT:${amount}:${currency.code}:${person.name.toUpperCase()}`;

    const handleDownload = () => {
        if (!svgRef.current) return;

        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            // Add padding and white background
            canvas.width = img.width + 40;
            canvas.height = img.height + 80;

            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw text
                ctx.fillStyle = "#111827"; // gray-900
                ctx.font = "bold 20px Inter, system-ui, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`Pay to ${person.name}`, canvas.width / 2, 35);

                // Draw QR
                ctx.drawImage(img, 20, 50);

                const a = document.createElement("a");
                a.download = `payment-qr-${person.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                a.href = canvas.toDataURL("image/png");
                a.click();
            }
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    const formattedAmount = `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">Payment QR Code</DialogTitle>
                    <DialogDescription className="text-center">
                        Scan to pay the exact shared amount.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl my-4 border border-gray-100">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <QRCodeSVG
                            value={paymentString}
                            size={200}
                            level="H"
                            includeMargin={false}
                            ref={svgRef}
                            className="rounded-lg"
                        />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{formattedAmount}</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">Please pay to <span className="text-gray-900">{person.name}</span></p>
                </div>

                <div className="flex justify-center">
                    <Button onClick={handleDownload} className="w-full sm:w-auto px-8 bg-primary-600 hover:bg-primary-700">
                        <Download className="w-4 h-4 mr-2" />
                        Save QR Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
