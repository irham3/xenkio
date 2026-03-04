
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getPdfjs } from '@/lib/pdf-worker';
import { PDFStamp, ChecklistItem } from '../types';
import { PDF_PREVIEW_SCALE } from '../constants';

export async function renderPdfPages(file: File): Promise<string[]> {
    const pdfjsLib = await getPdfjs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageImages: string[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: PDF_PREVIEW_SCALE });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: context, viewport } as any).promise;
        pageImages.push(canvas.toDataURL('image/jpeg', 0.8));
    }

    return pageImages;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        }
        : { r: 0, g: 0, b: 0 };
}

function renderStampToCanvas(stamp: PDFStamp, scale: number = 1): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const w = stamp.width * scale;
    const h = stamp.height * scale;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = stamp.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = stamp.borderColor;
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // Inner border accent
    ctx.strokeStyle = stamp.color;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(4 * scale, 4 * scale, w - 8 * scale, h - 8 * scale);

    const fs = stamp.fontSize * scale;
    ctx.fillStyle = stamp.color;
    ctx.textBaseline = 'top';

    switch (stamp.type) {
        case 'approval': {
            // Status label (big)
            ctx.font = `bold ${fs * 1.6}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(stamp.label || stamp.status?.toUpperCase() || 'APPROVED', w / 2, 12 * scale);

            // Signer + date
            ctx.font = `${fs * 0.85}px Inter, sans-serif`;
            ctx.fillStyle = stamp.color + 'cc';
            const signerLine = stamp.signerName || '';
            const dateLine = stamp.date || new Date().toLocaleDateString();
            if (signerLine) {
                ctx.fillText(signerLine, w / 2, 12 * scale + fs * 2);
            }
            ctx.fillText(dateLine, w / 2, 12 * scale + fs * 2 + (signerLine ? fs * 1.2 : 0));
            break;
        }
        case 'date': {
            ctx.font = `bold ${fs}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(stamp.dateLabel || 'Date', w / 2, 12 * scale);

            ctx.font = `${fs * 1.3}px Inter, sans-serif`;
            ctx.fillText(stamp.date || new Date().toLocaleDateString(), w / 2, 12 * scale + fs * 1.5);
            break;
        }
        case 'checklist': {
            ctx.font = `bold ${fs}px Inter, sans-serif`;
            ctx.textAlign = 'left';
            const titleX = 10 * scale;
            ctx.fillText(stamp.checklistTitle || 'Checklist', titleX, 8 * scale);

            const items = stamp.checklist || [];
            items.forEach((item: ChecklistItem, i: number) => {
                const itemY = 8 * scale + fs * 1.5 + i * (fs * 1.4);
                // Checkbox
                const boxSize = fs * 0.85;
                const boxX = titleX;
                const boxY = itemY + 1;
                ctx.strokeStyle = stamp.color;
                ctx.lineWidth = 1.5 * scale;
                ctx.strokeRect(boxX, boxY, boxSize, boxSize);

                if (item.checked) {
                    ctx.fillStyle = stamp.color;
                    ctx.font = `bold ${boxSize}px Inter, sans-serif`;
                    ctx.fillText('✓', boxX + 1, boxY - 1);
                }

                // Text
                ctx.fillStyle = stamp.color;
                ctx.font = `${fs * 0.9}px Inter, sans-serif`;
                ctx.fillText(item.text, boxX + boxSize + 6 * scale, itemY + 1);
            });
            break;
        }
        case 'notes': {
            ctx.font = `bold ${fs}px Inter, sans-serif`;
            ctx.textAlign = 'left';
            const padX = 10 * scale;
            ctx.fillText('Notes', padX, 8 * scale);

            ctx.font = `${fs * 0.9}px Inter, sans-serif`;
            ctx.fillStyle = stamp.color + 'dd';
            const text = stamp.notes || '(empty)';
            const lines = wrapText(ctx, text, w - padX * 2);
            lines.forEach((line, i) => {
                ctx.fillText(line, padX, 8 * scale + fs * 1.5 + i * (fs * 1.2));
            });
            break;
        }
        case 'cost': {
            ctx.font = `bold ${fs}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(stamp.costLabel || 'Total', w / 2, 12 * scale);

            ctx.font = `bold ${fs * 1.4}px Inter, sans-serif`;
            const amount = stamp.costAmount || '0';
            const currency = stamp.costCurrency || 'IDR';
            ctx.fillText(`${currency} ${Number(amount).toLocaleString()}`, w / 2, 12 * scale + fs * 1.6);
            break;
        }
    }

    return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [''];
}

export function renderStampPreview(stamp: PDFStamp): string {
    const canvas = renderStampToCanvas(stamp, 2);
    return canvas.toDataURL('image/png');
}

export async function embedStamps(file: File, stamps: PDFStamp[]): Promise<Uint8Array> {
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();

    // We need Helvetica for fallback
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const scaleFactor = PDF_PREVIEW_SCALE;

    // Group stamps by page
    const stampsByPage: Record<number, PDFStamp[]> = {};
    stamps.forEach(s => {
        if (!stampsByPage[s.pageIndex]) stampsByPage[s.pageIndex] = [];
        stampsByPage[s.pageIndex].push(s);
    });

    for (const pageIndexStr in stampsByPage) {
        const pageIndex = parseInt(pageIndexStr, 10);
        if (pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { height: pageHeight } = page.getSize();
        const pageStamps = stampsByPage[pageIndex];

        for (const stamp of pageStamps) {
            // Scale from preview coords to PDF points
            const x = stamp.x / scaleFactor;
            const y = stamp.y / scaleFactor;
            const w = stamp.width / scaleFactor;
            const h = stamp.height / scaleFactor;

            // PDF Y is bottom-left origin
            const pdfY = pageHeight - y - h;
            const pdfX = x;

            // Draw background
            const bgColor = hexToRgb(stamp.backgroundColor);
            page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: w,
                height: h,
                color: rgb(bgColor.r, bgColor.g, bgColor.b),
                opacity: stamp.opacity,
            });

            // Draw border
            const borderRgb = hexToRgb(stamp.borderColor);
            page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: w,
                height: h,
                borderColor: rgb(borderRgb.r, borderRgb.g, borderRgb.b),
                borderWidth: 1.5,
                opacity: stamp.opacity,
            });

            // Inner border accent
            const accentRgb = hexToRgb(stamp.color);
            page.drawRectangle({
                x: pdfX + 3,
                y: pdfY + 3,
                width: w - 6,
                height: h - 6,
                borderColor: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
                borderWidth: 1,
                opacity: stamp.opacity,
            });

            const textColor = rgb(accentRgb.r, accentRgb.g, accentRgb.b);
            const fs = (stamp.fontSize / scaleFactor);

            switch (stamp.type) {
                case 'approval': {
                    const label = stamp.label || stamp.status?.toUpperCase() || 'APPROVED';
                    const fsLabel = fs * 1.4;
                    const labelWidth = fontBold.widthOfTextAtSize(label, fsLabel);
                    page.drawText(label, {
                        x: pdfX + (w - labelWidth) / 2,
                        y: pdfY + h - (10 / scaleFactor) - fsLabel,
                        size: fsLabel,
                        font: fontBold,
                        color: textColor,
                    });

                    const dateLine = stamp.date || new Date().toLocaleDateString();
                    const fsSub = fs * 0.75;
                    const dateWidth = font.widthOfTextAtSize(dateLine, fsSub);
                    page.drawText(dateLine, {
                        x: pdfX + (w - dateWidth) / 2,
                        y: pdfY + h - (10 / scaleFactor) - fsLabel - (8 / scaleFactor) - fsSub,
                        size: fsSub,
                        font,
                        color: textColor,
                    });

                    if (stamp.signerName) {
                        const signerWidth = font.widthOfTextAtSize(stamp.signerName, fsSub);
                        page.drawText(stamp.signerName, {
                            x: pdfX + (w - signerWidth) / 2,
                            y: pdfY + h - (10 / scaleFactor) - fsLabel - (4 / scaleFactor) - fsSub,
                            size: fsSub,
                            font,
                            color: textColor,
                        });
                        // Shift date down if signer exists
                        page.drawText(dateLine, {
                            x: pdfX + (w - dateWidth) / 2,
                            y: pdfY + h - (10 / scaleFactor) - fsLabel - (4 / scaleFactor) - fsSub - (4 / scaleFactor) - fsSub,
                            size: fsSub,
                            font,
                            color: textColor,
                        });
                    }
                    break;
                }
                case 'date': {
                    const label = stamp.dateLabel || 'Date';
                    const labelWidth = fontBold.widthOfTextAtSize(label, fs);
                    page.drawText(label, {
                        x: pdfX + (w - labelWidth) / 2,
                        y: pdfY + h - (12 / scaleFactor) - fs,
                        size: fs,
                        font: fontBold,
                        color: textColor,
                    });

                    const dateVal = stamp.date || new Date().toLocaleDateString();
                    const fsDate = fs * 1.2;
                    const dateWidth = font.widthOfTextAtSize(dateVal, fsDate);
                    page.drawText(dateVal, {
                        x: pdfX + (w - dateWidth) / 2,
                        y: pdfY + h - (12 / scaleFactor) - fs - (12 / scaleFactor) - fsDate,
                        size: fsDate,
                        font,
                        color: textColor,
                    });
                    break;
                }
                case 'checklist': {
                    const title = stamp.checklistTitle || 'Checklist';
                    page.drawText(title, {
                        x: pdfX + (10 / scaleFactor),
                        y: pdfY + h - (10 / scaleFactor) - fs,
                        size: fs,
                        font: fontBold,
                        color: textColor,
                    });

                    const items = stamp.checklist || [];
                    items.forEach((item: ChecklistItem, i: number) => {
                        const fsItem = fs * 0.85;
                        const iy = pdfY + h - (10 / scaleFactor) - fs - (10 / scaleFactor) - i * (fsItem * 1.4) - fsItem;
                        const checkMark = item.checked ? 'X' : '[ ]';
                        page.drawText(`${checkMark} ${item.text}`, {
                            x: pdfX + (10 / scaleFactor),
                            y: iy,
                            size: fsItem,
                            font,
                            color: textColor,
                        });
                    });
                    break;
                }
                case 'notes': {
                    page.drawText('Notes', {
                        x: pdfX + (10 / scaleFactor),
                        y: pdfY + h - (10 / scaleFactor) - fs,
                        size: fs,
                        font: fontBold,
                        color: textColor,
                    });

                    const text = stamp.notes || '';
                    if (text) {
                        const fsNotes = fs * 0.85;
                        // Simple line wrapping
                        const maxCharsPerLine = Math.floor((w - (20 / scaleFactor)) / (fsNotes * 0.5));
                        const wrapped: string[] = [];
                        for (let i = 0; i < text.length; i += maxCharsPerLine) {
                            wrapped.push(text.slice(i, i + maxCharsPerLine));
                        }
                        wrapped.forEach((line, i) => {
                            page.drawText(line, {
                                x: pdfX + (10 / scaleFactor),
                                y: pdfY + h - (10 / scaleFactor) - fs - (10 / scaleFactor) - i * (fsNotes * 1.2) - fsNotes,
                                size: fsNotes,
                                font,
                                color: textColor,
                            });
                        });
                    }
                    break;
                }
                case 'cost': {
                    const label = stamp.costLabel || 'Total';
                    const labelWidth = fontBold.widthOfTextAtSize(label, fs);
                    page.drawText(label, {
                        x: pdfX + (w - labelWidth) / 2,
                        y: pdfY + h - (12 / scaleFactor) - fs,
                        size: fs,
                        font: fontBold,
                        color: textColor,
                    });

                    const amount = stamp.costAmount || '0';
                    const currency = stamp.costCurrency || 'IDR';
                    const fsCost = fs * 1.3;
                    const costStr = `${currency} ${Number(amount).toLocaleString()}`;
                    const costWidth = fontBold.widthOfTextAtSize(costStr, fsCost);
                    page.drawText(costStr, {
                        x: pdfX + (w - costWidth) / 2,
                        y: pdfY + h - (12 / scaleFactor) - fs - (12 / scaleFactor) - fsCost,
                        size: fsCost,
                        font: fontBold,
                        color: textColor,
                    });
                    break;
                }
            }

        }
    }

    return await pdfDoc.save();
}
