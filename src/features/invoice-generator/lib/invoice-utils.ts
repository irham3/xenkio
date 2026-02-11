import { InvoiceData, InvoiceTotals, InvoiceItem } from '../types';

export function generateInvoiceNumber(): string {
    const randomNum = Math.floor(Math.random() * 100000);
    return `INV-${randomNum.toString().padStart(5, '0')}`;
}

export function formatDate(date: Date, format: string = 'MM/DD/YYYY'): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        default:
            return `${month}/${day}/${year}`;
    }
}

export function calculateItemTotal(item: InvoiceItem): number {
    return item.quantity * item.unitPrice;
}

export function calculateTotals(
    items: InvoiceItem[],
    settings: InvoiceData['settings']
): InvoiceTotals {
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

    const discount = settings.discountEnabled
        ? (subtotal * settings.discountRate) / 100
        : 0;

    const taxableAmount = subtotal - discount;
    const tax = settings.taxEnabled
        ? (taxableAmount * settings.taxRate) / 100
        : 0;

    const total = taxableAmount + tax;

    return {
        subtotal,
        discount,
        tax,
        total,
    };
}

export function formatCurrency(amount: number, symbol: string): string {
    return `${symbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
}

export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

export function createEmptyItem(): InvoiceItem {
    return {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
    };
}
