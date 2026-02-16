import jsPDF from 'jspdf';
import { InvoiceData, InvoiceTotals, InvoiceColors, TEMPLATE_OPTIONS } from '../types';
import { formatCurrency, calculateItemTotal } from './invoice-utils';

function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
        : [0, 0, 0];
}

function formatDisplayDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export async function generateInvoicePDF(
    invoiceData: InvoiceData,
    totals: InvoiceTotals,
    activeColors: InvoiceColors
): Promise<void> {
    const { company, client, items, settings, invoiceNumber, issueDate, dueDate, notes } = invoiceData;
    const { currencySymbol, template } = settings;
    const colors = activeColors;

    const templateConfig = TEMPLATE_OPTIONS.find(t => t.value === template);
    const headerStyle = templateConfig?.preview.headerStyle || 'accent';
    const isDarkTheme = template === 'executive-dark';

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Helper functions
    const setTextColor = (color: string) => {
        const rgb = hexToRgb(color);
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    };

    const setDrawColor = (color: string) => {
        const rgb = hexToRgb(color);
        doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
    };

    const setFillColor = (color: string) => {
        const rgb = hexToRgb(color);
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    };

    // Background for dark theme
    if (isDarkTheme) {
        setFillColor(colors.background);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    // Add logo if exists
    const addLogo = async (x: number, y: number, maxWidth: number, maxHeight: number): Promise<void> => {
        if (!company.logo) return;

        try {
            const img = new Image();
            img.src = company.logo;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const width = img.width * ratio;
            const height = img.height * ratio;

            doc.addImage(company.logo, 'PNG', x, y, width, height);
        } catch (error) {
            console.error('Failed to add logo:', error);
        }
    };

    // Header based on template style
    if (headerStyle === 'gradient' || headerStyle === 'full') {
        // Full color header
        setFillColor(colors.primary);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Logo
        if (company.logo) {
            await addLogo(margin, 8, 25, 15);
        }

        // Invoice title
        setTextColor('#FFFFFF');
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', company.logo ? margin + 30 : margin, 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(invoiceNumber || 'INV-00000', company.logo ? margin + 30 : margin, 25);

        // Company info - right side
        const companyX = pageWidth - margin;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(company.name || 'Your Company', companyX, 14, { align: 'right' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        let compY = 19;
        if (company.address) {
            doc.text(company.address, companyX, compY, { align: 'right' });
            compY += 4;
        }
        if (company.email) {
            doc.text(company.email, companyX, compY, { align: 'right' });
            compY += 4;
        }
        if (company.phone) {
            doc.text(company.phone, companyX, compY, { align: 'right' });
        }

        yPos = 50;
    } else if (headerStyle === 'accent') {
        // Accent bar at top
        setFillColor(colors.primary);
        doc.rect(0, 0, pageWidth, 6, 'F');
        yPos = 15;

        // Logo
        if (company.logo) {
            await addLogo(margin, yPos, 20, 14);
        }

        // Invoice title
        setTextColor(colors.primary);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', company.logo ? margin + 25 : margin, yPos + 6);

        setTextColor(colors.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(invoiceNumber || 'INV-00000', company.logo ? margin + 25 : margin, yPos + 12);

        // Company info - right side
        const companyX = pageWidth - margin;
        setTextColor(colors.text);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(company.name || 'Your Company', companyX, yPos + 4, { align: 'right' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        let compY = yPos + 9;
        if (company.address) {
            doc.text(company.address, companyX, compY, { align: 'right' });
            compY += 3.5;
        }
        if (company.email) {
            doc.text(company.email, companyX, compY, { align: 'right' });
            compY += 3.5;
        }
        if (company.phone) {
            doc.text(company.phone, companyX, compY, { align: 'right' });
        }

        yPos += 25;
    } else {
        // Minimal style
        setDrawColor(colors.primary);
        doc.setLineWidth(0.5);
        yPos = 15;

        // Logo
        if (company.logo) {
            await addLogo(margin, yPos, 18, 12);
        }

        // Invoice title
        setTextColor(colors.primary);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', company.logo ? margin + 22 : margin, yPos + 5);

        setTextColor(colors.text);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(invoiceNumber || 'INV-00000', company.logo ? margin + 22 : margin, yPos + 10);

        // Company info - right side
        const companyX = pageWidth - margin;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(company.name || 'Your Company', companyX, yPos + 4, { align: 'right' });

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        let compY = yPos + 8;
        if (company.address) {
            doc.text(company.address, companyX, compY, { align: 'right' });
            compY += 3;
        }
        if (company.email) {
            doc.text(company.email, companyX, compY, { align: 'right' });
        }

        // Divider line
        doc.line(margin, yPos + 18, pageWidth - margin, yPos + 18);
        yPos += 25;
    }

    // Bill To & Dates Section
    const sectionStartY = yPos;

    // Bill To
    setTextColor(isDarkTheme ? '#888888' : '#888888');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', margin, yPos);

    yPos += 5;
    setTextColor(colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(client.name || 'Client Name', margin, yPos);

    yPos += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    if (client.address) {
        doc.text(client.address, margin, yPos);
        yPos += 3.5;
    }
    if (client.email) {
        doc.text(client.email, margin, yPos);
        yPos += 3.5;
    }
    if (client.phone) {
        doc.text(client.phone, margin, yPos);
    }

    // Dates - Right side
    const datesX = pageWidth - margin - 50;
    let datesY = sectionStartY;

    setTextColor(isDarkTheme ? '#888888' : '#888888');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('ISSUE DATE', datesX, datesY);
    datesY += 4;
    setTextColor(colors.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDisplayDate(issueDate), datesX, datesY);

    datesY += 7;
    setTextColor(isDarkTheme ? '#888888' : '#888888');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('DUE DATE', datesX, datesY);
    datesY += 4;
    setTextColor(colors.text);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDisplayDate(dueDate), datesX, datesY);

    yPos = Math.max(yPos, datesY) + 12;

    // Items Table
    const colWidths = {
        description: contentWidth * 0.45,
        qty: contentWidth * 0.12,
        price: contentWidth * 0.2,
        amount: contentWidth * 0.23,
    };

    // Table Header
    setFillColor(colors.primary);
    doc.rect(margin, yPos - 2, contentWidth, 8, 'F');

    setTextColor('#FFFFFF');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', margin + 3, yPos + 3);
    doc.text('QTY', margin + colWidths.description + 3, yPos + 3);
    doc.text('PRICE', margin + colWidths.description + colWidths.qty + 3, yPos + 3);
    doc.text('AMOUNT', margin + colWidths.description + colWidths.qty + colWidths.price + 3, yPos + 3);

    yPos += 10;

    // Table Rows
    items.forEach((item, index) => {
        const rowHeight = 7;
        const itemTotal = calculateItemTotal(item);

        // Alternating row background
        if (index % 2 === 1) {
            setFillColor(isDarkTheme ? colors.secondary : '#F9FAFB');
            doc.rect(margin, yPos - 2, contentWidth, rowHeight, 'F');
        }

        setTextColor(colors.text);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        // Truncate description if too long
        const maxDescWidth = colWidths.description - 6;
        let description = item.description || 'Item description';
        const descWidth = doc.getTextWidth(description);
        if (descWidth > maxDescWidth) {
            while (doc.getTextWidth(description + '...') > maxDescWidth && description.length > 0) {
                description = description.slice(0, -1);
            }
            description += '...';
        }

        doc.text(description, margin + 3, yPos + 2);
        doc.text(String(item.quantity), margin + colWidths.description + 3, yPos + 2);
        doc.text(formatCurrency(item.unitPrice, currencySymbol), margin + colWidths.description + colWidths.qty + 3, yPos + 2);

        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(itemTotal, currencySymbol), margin + colWidths.description + colWidths.qty + colWidths.price + 3, yPos + 2);

        yPos += rowHeight;
    });

    // Table border
    setDrawColor(isDarkTheme ? colors.secondary : '#E5E7EB');
    doc.setLineWidth(0.2);
    doc.rect(margin, yPos - (items.length * 7) - 10, contentWidth, (items.length * 7) + 10);

    yPos += 10;

    // Totals Section
    const totalsX = pageWidth - margin - 60;
    const totalsValueX = pageWidth - margin;

    setTextColor(isDarkTheme ? '#888888' : '#666666');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal', totalsX, yPos);
    setTextColor(colors.text);
    doc.text(formatCurrency(totals.subtotal, currencySymbol), totalsValueX, yPos, { align: 'right' });

    yPos += 5;

    if (settings.discountEnabled && totals.discount > 0) {
        doc.setTextColor(34, 197, 94);
        doc.text(`Discount (${settings.discountRate}%)`, totalsX, yPos);
        doc.text(`-${formatCurrency(totals.discount, currencySymbol)}`, totalsValueX, yPos, { align: 'right' });
        yPos += 5;
    }

    if (settings.taxEnabled && totals.tax > 0) {
        setTextColor(isDarkTheme ? '#888888' : '#666666');
        doc.text(`Tax (${settings.taxRate}%)`, totalsX, yPos);
        setTextColor(colors.text);
        doc.text(formatCurrency(totals.tax, currencySymbol), totalsValueX, yPos, { align: 'right' });
        yPos += 5;
    }

    // Total line
    yPos += 2;
    setDrawColor(colors.primary);
    doc.setLineWidth(0.6);
    doc.line(totalsX - 5, yPos, pageWidth - margin, yPos);
    yPos += 5;

    setTextColor(colors.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', totalsX, yPos);
    doc.text(formatCurrency(totals.total, currencySymbol), totalsValueX, yPos, { align: 'right' });

    yPos += 15;

    // Payment Terms
    if (settings.showPaymentTerms && settings.paymentTerms) {
        setFillColor(isDarkTheme ? colors.secondary : '#F3F4F6');
        doc.rect(margin, yPos - 2, contentWidth, 12, 'F');

        setTextColor(isDarkTheme ? '#888888' : '#666666');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT TERMS', margin + 3, yPos + 2);

        setTextColor(colors.text);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(settings.paymentTerms, margin + 3, yPos + 7);

        yPos += 15;
    }

    // Bank Details
    if (settings.showBankDetails && settings.bankDetails) {
        setFillColor(isDarkTheme ? colors.secondary : '#F3F4F6');
        const bankLines = settings.bankDetails.split('\n');
        const bankHeight = 8 + bankLines.length * 4;
        doc.rect(margin, yPos - 2, contentWidth, bankHeight, 'F');

        setTextColor(isDarkTheme ? '#888888' : '#666666');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('BANK DETAILS', margin + 3, yPos + 2);

        setTextColor(colors.text);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        let bankY = yPos + 7;
        bankLines.forEach(line => {
            doc.text(line, margin + 3, bankY);
            bankY += 4;
        });

        yPos += bankHeight + 5;
    }

    // Notes
    if (notes) {
        setTextColor(isDarkTheme ? '#888888' : '#666666');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES', margin, yPos);

        yPos += 4;
        setTextColor(colors.text);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        const splitNotes = doc.splitTextToSize(notes, contentWidth);
        doc.text(splitNotes, margin, yPos);

        yPos += splitNotes.length * 4 + 10;
    }

    // Footer
    const footerY = pageHeight - 15;

    setDrawColor(isDarkTheme ? colors.secondary : '#E5E7EB');
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    setTextColor(isDarkTheme ? '#666666' : '#999999');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

    if (company.website) {
        doc.text(company.website, pageWidth / 2, footerY + 4, { align: 'center' });
    }

    // Save PDF
    doc.save(`${invoiceNumber || 'invoice'}.pdf`);
}
