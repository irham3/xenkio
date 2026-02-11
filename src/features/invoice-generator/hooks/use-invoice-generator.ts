import { useState, useCallback, useMemo } from 'react';
import {
    InvoiceData,
    InvoiceItem,
    CompanyInfo,
    ClientInfo,
    InvoiceSettings,
    InvoiceColors,
    DEFAULT_SETTINGS,
    DEFAULT_COLORS,
    CURRENCY_OPTIONS,
    TEMPLATE_OPTIONS,
} from '../types';
import {
    generateInvoiceNumber,
    getTodayDate,
    getDefaultDueDate,
    calculateTotals,
    createEmptyItem,
} from '../lib/invoice-utils';

const DEFAULT_COMPANY: CompanyInfo = {
    name: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    logo: undefined,
};

const DEFAULT_CLIENT: ClientInfo = {
    name: '',
    address: '',
    email: '',
    phone: '',
};

export function useInvoiceGenerator() {
    const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);
    const [issueDate, setIssueDate] = useState(getTodayDate);
    const [dueDate, setDueDate] = useState(getDefaultDueDate);
    const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
    const [client, setClient] = useState<ClientInfo>(DEFAULT_CLIENT);
    const [items, setItems] = useState<InvoiceItem[]>(() => [createEmptyItem()]);
    const [notes, setNotes] = useState('');
    const [settings, setSettings] = useState<InvoiceSettings>(DEFAULT_SETTINGS);

    const totals = useMemo(() => calculateTotals(items, settings), [items, settings]);

    const activeColors = useMemo((): InvoiceColors => {
        if (settings.useCustomColors) {
            return settings.customColors;
        }
        const template = TEMPLATE_OPTIONS.find(t => t.value === settings.template);
        return template?.colors || DEFAULT_COLORS;
    }, [settings.useCustomColors, settings.customColors, settings.template]);

    const updateCompany = useCallback((updates: Partial<CompanyInfo>) => {
        setCompany(prev => ({ ...prev, ...updates }));
    }, []);

    const updateClient = useCallback((updates: Partial<ClientInfo>) => {
        setClient(prev => ({ ...prev, ...updates }));
    }, []);

    const setLogo = useCallback((logoBase64: string | undefined) => {
        setCompany(prev => ({ ...prev, logo: logoBase64 }));
    }, []);

    const addItem = useCallback(() => {
        setItems(prev => [...prev, createEmptyItem()]);
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => {
            if (prev.length <= 1) return prev;
            return prev.filter(item => item.id !== id);
        });
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<InvoiceItem>) => {
        setItems(prev =>
            prev.map(item => (item.id === id ? { ...item, ...updates } : item))
        );
    }, []);

    const updateSettings = useCallback((updates: Partial<InvoiceSettings>) => {
        setSettings(prev => {
            const newSettings = { ...prev, ...updates };

            if (updates.currency) {
                const currency = CURRENCY_OPTIONS.find(c => c.value === updates.currency);
                if (currency) {
                    newSettings.currencySymbol = currency.symbol;
                }
            }

            if (updates.template && !newSettings.useCustomColors) {
                const template = TEMPLATE_OPTIONS.find(t => t.value === updates.template);
                if (template) {
                    newSettings.customColors = template.colors;
                }
            }

            return newSettings;
        });
    }, []);

    const updateCustomColors = useCallback((updates: Partial<InvoiceColors>) => {
        setSettings(prev => ({
            ...prev,
            customColors: { ...prev.customColors, ...updates },
            useCustomColors: true,
        }));
    }, []);

    const resetInvoice = useCallback(() => {
        setInvoiceNumber(generateInvoiceNumber());
        setIssueDate(getTodayDate());
        setDueDate(getDefaultDueDate());
        setCompany(DEFAULT_COMPANY);
        setClient(DEFAULT_CLIENT);
        setItems([createEmptyItem()]);
        setNotes('');
        setSettings(DEFAULT_SETTINGS);
    }, []);

    const invoiceData: InvoiceData = {
        invoiceNumber,
        issueDate,
        dueDate,
        company,
        client,
        items,
        notes,
        settings,
    };

    return {
        invoiceData,
        totals,
        activeColors,
        setInvoiceNumber,
        setIssueDate,
        setDueDate,
        updateCompany,
        updateClient,
        setLogo,
        addItem,
        removeItem,
        updateItem,
        setNotes,
        updateSettings,
        updateCustomColors,
        resetInvoice,
    };
}
