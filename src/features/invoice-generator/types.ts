export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface CompanyInfo {
    name: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
    logo?: string; // Base64 encoded logo
}

export interface ClientInfo {
    name: string;
    address: string;
    email: string;
    phone?: string;
}

// 8 Professional Invoice Templates
export type InvoiceTemplate =
    | 'modern-blue'
    | 'executive-dark'
    | 'minimal-clean'
    | 'corporate-green'
    | 'creative-purple'
    | 'elegant-gold'
    | 'tech-gradient'
    | 'classic-formal';

export interface InvoiceColors {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
}

export interface InvoiceSettings {
    currency: string;
    currencySymbol: string;
    taxRate: number;
    taxEnabled: boolean;
    discountRate: number;
    discountEnabled: boolean;
    dateFormat: string;
    template: InvoiceTemplate;
    customColors: InvoiceColors;
    useCustomColors: boolean;
    showPaymentTerms: boolean;
    paymentTerms: string;
    showBankDetails: boolean;
    bankDetails: string;
}

export interface InvoiceData {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    company: CompanyInfo;
    client: ClientInfo;
    items: InvoiceItem[];
    notes: string;
    settings: InvoiceSettings;
}

export interface InvoiceTotals {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
}

export const DEFAULT_COLORS: InvoiceColors = {
    primary: '#0284C7',
    secondary: '#0EA5E9',
    accent: '#38BDF8',
    text: '#1E293B',
    background: '#F8FAFC',
};

export const DEFAULT_SETTINGS: InvoiceSettings = {
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 10,
    taxEnabled: true,
    discountRate: 0,
    discountEnabled: false,
    dateFormat: 'MM/DD/YYYY',
    template: 'modern-blue',
    customColors: DEFAULT_COLORS,
    useCustomColors: false,
    showPaymentTerms: false,
    paymentTerms: 'Payment due within 30 days',
    showBankDetails: false,
    bankDetails: '',
};

export const CURRENCY_OPTIONS = [
    { value: 'USD', symbol: '$', label: 'USD ($)' },
    { value: 'EUR', symbol: '€', label: 'EUR (€)' },
    { value: 'GBP', symbol: '£', label: 'GBP (£)' },
    { value: 'JPY', symbol: '¥', label: 'JPY (¥)' },
    { value: 'IDR', symbol: 'Rp', label: 'IDR (Rp)' },
    { value: 'INR', symbol: '₹', label: 'INR (₹)' },
    { value: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    { value: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
    { value: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
    { value: 'MYR', symbol: 'RM', label: 'MYR (RM)' },
    { value: 'CNY', symbol: '¥', label: 'CNY (¥)' },
    { value: 'KRW', symbol: '₩', label: 'KRW (₩)' },
];

export interface TemplateOption {
    value: InvoiceTemplate;
    label: string;
    description: string;
    colors: InvoiceColors;
    preview: {
        headerStyle: 'full' | 'accent' | 'minimal' | 'gradient' | 'sidebar';
        accentPosition: 'top' | 'left' | 'corner' | 'none';
    };
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
    {
        value: 'modern-blue',
        label: 'Modern Blue',
        description: 'Clean professional look with sky blue accents',
        colors: {
            primary: '#0284C7',
            secondary: '#0EA5E9',
            accent: '#38BDF8',
            text: '#1E293B',
            background: '#F8FAFC',
        },
        preview: { headerStyle: 'accent', accentPosition: 'top' },
    },
    {
        value: 'executive-dark',
        label: 'Executive Dark',
        description: 'Premium dark theme for high-end clients',
        colors: {
            primary: '#18181B',
            secondary: '#27272A',
            accent: '#A1A1AA',
            text: '#FAFAFA',
            background: '#09090B',
        },
        preview: { headerStyle: 'full', accentPosition: 'top' },
    },
    {
        value: 'minimal-clean',
        label: 'Minimal Clean',
        description: 'Ultra-minimal design with subtle accents',
        colors: {
            primary: '#404040',
            secondary: '#525252',
            accent: '#A3A3A3',
            text: '#171717',
            background: '#FAFAFA',
        },
        preview: { headerStyle: 'minimal', accentPosition: 'none' },
    },
    {
        value: 'corporate-green',
        label: 'Corporate Green',
        description: 'Professional emerald green for business',
        colors: {
            primary: '#059669',
            secondary: '#10B981',
            accent: '#34D399',
            text: '#1E293B',
            background: '#F0FDF4',
        },
        preview: { headerStyle: 'accent', accentPosition: 'left' },
    },
    {
        value: 'creative-purple',
        label: 'Creative Purple',
        description: 'Bold violet for creative agencies',
        colors: {
            primary: '#7C3AED',
            secondary: '#8B5CF6',
            accent: '#A78BFA',
            text: '#1E1B4B',
            background: '#FAF5FF',
        },
        preview: { headerStyle: 'full', accentPosition: 'corner' },
    },
    {
        value: 'elegant-gold',
        label: 'Elegant Gold',
        description: 'Luxurious gold accents for premium feel',
        colors: {
            primary: '#B45309',
            secondary: '#D97706',
            accent: '#FBBF24',
            text: '#292524',
            background: '#FFFBEB',
        },
        preview: { headerStyle: 'accent', accentPosition: 'top' },
    },
    {
        value: 'tech-gradient',
        label: 'Tech Gradient',
        description: 'Modern gradient style for tech companies',
        colors: {
            primary: '#6366F1',
            secondary: '#8B5CF6',
            accent: '#EC4899',
            text: '#1E293B',
            background: '#F8FAFC',
        },
        preview: { headerStyle: 'gradient', accentPosition: 'top' },
    },
    {
        value: 'classic-formal',
        label: 'Classic Formal',
        description: 'Traditional layout for formal invoices',
        colors: {
            primary: '#1F2937',
            secondary: '#374151',
            accent: '#6B7280',
            text: '#111827',
            background: '#F9FAFB',
        },
        preview: { headerStyle: 'minimal', accentPosition: 'top' },
    },
];

// Color presets for quick selection
export const COLOR_PRESETS = [
    { name: 'Ocean Blue', primary: '#0284C7', secondary: '#0EA5E9' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10B981' },
    { name: 'Royal Purple', primary: '#7C3AED', secondary: '#8B5CF6' },
    { name: 'Sunset Orange', primary: '#EA580C', secondary: '#F97316' },
    { name: 'Rose Pink', primary: '#DB2777', secondary: '#EC4899' },
    { name: 'Slate Gray', primary: '#475569', secondary: '#64748B' },
    { name: 'Teal', primary: '#0D9488', secondary: '#14B8A6' },
    { name: 'Indigo', primary: '#4F46E5', secondary: '#6366F1' },
    { name: 'Amber Gold', primary: '#B45309', secondary: '#D97706' },
    { name: 'Crimson Red', primary: '#DC2626', secondary: '#EF4444' },
];
