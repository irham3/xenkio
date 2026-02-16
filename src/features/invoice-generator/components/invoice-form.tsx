'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import {
    InvoiceData,
    InvoiceItem,
    CompanyInfo,
    ClientInfo,
    InvoiceSettings,
    InvoiceColors,
    CURRENCY_OPTIONS,
    TEMPLATE_OPTIONS,
    COLOR_PRESETS,
} from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
    Plus,
    Trash2,
    Building2,
    User,
    Package,
    Settings,
    StickyNote,
    Palette,
    Upload,
    X,
    FileText,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceFormProps {
    invoiceData: InvoiceData;
    setInvoiceNumber: (value: string) => void;
    setIssueDate: (value: string) => void;
    setDueDate: (value: string) => void;
    updateCompany: (updates: Partial<CompanyInfo>) => void;
    updateClient: (updates: Partial<ClientInfo>) => void;
    setLogo: (logo: string | undefined) => void;
    addItem: () => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, updates: Partial<InvoiceItem>) => void;
    setNotes: (value: string) => void;
    updateSettings: (updates: Partial<InvoiceSettings>) => void;
    updateCustomColors: (updates: Partial<InvoiceColors>) => void;
}

function SectionCard({
    title,
    icon: Icon,
    children,
    className,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden", className)}>
            <div className="flex items-center gap-2.5 p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100">
                    <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
}

function ColorPicker({
    value,
    onChange,
    label,
}: {
    value: string;
    onChange: (color: string) => void;
    label: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer appearance-none bg-transparent"
                    style={{ backgroundColor: value }}
                />
                <div
                    className="absolute inset-0 rounded-lg pointer-events-none border-2 border-transparent"
                    style={{ backgroundColor: value }}
                />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 uppercase">{value}</p>
            </div>
        </div>
    );
}

export function InvoiceForm({
    invoiceData,
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
}: InvoiceFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Logo must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setLogo(base64);
        };
        reader.readAsDataURL(file);
    }, [setLogo]);

    const removeLogo = useCallback(() => {
        setLogo(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [setLogo]);

    return (
        <div className="space-y-5">
            {/* Template Selection */}
            <SectionCard title="Choose Template" icon={Palette}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {TEMPLATE_OPTIONS.map((template) => (
                        <button
                            key={template.value}
                            onClick={() => updateSettings({ template: template.value, useCustomColors: false })}
                            className={cn(
                                "relative p-3 rounded-xl border-2 transition-all text-left group cursor-pointer",
                                invoiceData.settings.template === template.value && !invoiceData.settings.useCustomColors
                                    ? "border-primary-500 bg-primary-50 shadow-md"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            )}
                        >
                            {/* Mini Preview */}
                            <div
                                className="w-full h-14 rounded-lg mb-2 overflow-hidden flex"
                                style={{
                                    background: template.preview.headerStyle === 'gradient'
                                        ? `linear-gradient(135deg, ${template.colors.primary}, ${template.colors.accent})`
                                        : template.colors.background,
                                }}
                            >
                                {template.preview.accentPosition === 'left' && (
                                    <div className="w-1.5 h-full" style={{ backgroundColor: template.colors.primary }} />
                                )}
                                <div className="flex-1 p-2">
                                    {template.preview.accentPosition === 'top' && template.preview.headerStyle !== 'gradient' && (
                                        <div className="h-1 w-full rounded mb-1" style={{ backgroundColor: template.colors.primary }} />
                                    )}
                                    {template.preview.headerStyle === 'full' && (
                                        <div className="h-4 w-full rounded-sm mb-1" style={{ backgroundColor: template.colors.primary }} />
                                    )}
                                    <div className="space-y-0.5">
                                        <div className="h-0.5 w-8 rounded" style={{ backgroundColor: template.colors.primary, opacity: 0.6 }} />
                                        <div className="h-0.5 w-6 rounded bg-gray-300" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 truncate">{template.label}</p>
                            {invoiceData.settings.template === template.value && !invoiceData.settings.useCustomColors && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Custom Colors Section */}
                <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-medium text-gray-900">Custom Colors</p>
                            <p className="text-xs text-gray-500">Override template colors</p>
                        </div>
                        <Switch
                            checked={invoiceData.settings.useCustomColors}
                            onCheckedChange={(checked) => updateSettings({ useCustomColors: checked })}
                        />
                    </div>

                    {invoiceData.settings.useCustomColors && (
                        <>
                            {/* Color Presets */}
                            <div className="mb-4">
                                <p className="text-xs font-medium text-gray-500 mb-2">Quick Presets</p>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_PRESETS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            onClick={() => updateCustomColors({ primary: preset.primary, secondary: preset.secondary })}
                                            className="group relative cursor-pointer"
                                            title={preset.name}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110"
                                                style={{
                                                    background: `linear-gradient(135deg, ${preset.primary} 50%, ${preset.secondary} 50%)`,
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Manual Color Pickers */}
                            <div className="grid grid-cols-2 gap-4">
                                <ColorPicker
                                    value={invoiceData.settings.customColors.primary}
                                    onChange={(color) => updateCustomColors({ primary: color })}
                                    label="Primary"
                                />
                                <ColorPicker
                                    value={invoiceData.settings.customColors.secondary}
                                    onChange={(color) => updateCustomColors({ secondary: color })}
                                    label="Secondary"
                                />
                                <ColorPicker
                                    value={invoiceData.settings.customColors.accent}
                                    onChange={(color) => updateCustomColors({ accent: color })}
                                    label="Accent"
                                />
                                <ColorPicker
                                    value={invoiceData.settings.customColors.text}
                                    onChange={(color) => updateCustomColors({ text: color })}
                                    label="Text"
                                />
                            </div>
                        </>
                    )}
                </div>
            </SectionCard>

            {/* Logo Upload */}
            <SectionCard title="Company Logo" icon={Upload}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                />
                {invoiceData.company.logo ? (
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Image
                                src={invoiceData.company.logo}
                                alt="Company Logo"
                                width={80}
                                height={80}
                                className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white"
                                unoptimized
                            />
                            <button
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer"
                            >
                                Change logo
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50/50 transition-colors group cursor-pointer"
                    >
                        <Upload className="w-8 h-8 mx-auto text-gray-400 group-hover:text-primary-500 mb-2" />
                        <p className="text-sm font-medium text-gray-600 group-hover:text-primary-600">
                            Click to upload logo
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                    </button>
                )}
            </SectionCard>

            {/* Invoice Info */}
            <SectionCard title="Invoice Information" icon={FileText}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700">
                            Invoice Number
                        </Label>
                        <Input
                            id="invoiceNumber"
                            value={invoiceData.invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            placeholder="INV-00001"
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="issueDate" className="text-sm font-medium text-gray-700">
                            Issue Date
                        </Label>
                        <Input
                            id="issueDate"
                            type="date"
                            value={invoiceData.issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                            Due Date
                        </Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={invoiceData.dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="h-10"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Company Info */}
            <SectionCard title="Your Company" icon={Building2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                        <Input
                            value={invoiceData.company.name}
                            onChange={(e) => updateCompany({ name: e.target.value })}
                            placeholder="Your Company LLC"
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            type="email"
                            value={invoiceData.company.email}
                            onChange={(e) => updateCompany({ email: e.target.value })}
                            placeholder="contact@company.com"
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <Input
                            value={invoiceData.company.phone}
                            onChange={(e) => updateCompany({ phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Website</Label>
                        <Input
                            value={invoiceData.company.website || ''}
                            onChange={(e) => updateCompany({ website: e.target.value })}
                            placeholder="www.company.com"
                            className="h-10"
                        />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Address</Label>
                        <Input
                            value={invoiceData.company.address}
                            onChange={(e) => updateCompany({ address: e.target.value })}
                            placeholder="123 Business St, City, State, ZIP"
                            className="h-10"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Client Info */}
            <SectionCard title="Bill To (Client)" icon={User}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Client Name</Label>
                        <Input
                            value={invoiceData.client.name}
                            onChange={(e) => updateClient({ name: e.target.value })}
                            placeholder="Client Company Inc"
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            type="email"
                            value={invoiceData.client.email}
                            onChange={(e) => updateClient({ email: e.target.value })}
                            placeholder="client@example.com"
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <Input
                            value={invoiceData.client.phone || ''}
                            onChange={(e) => updateClient({ phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className="h-10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Address</Label>
                        <Input
                            value={invoiceData.client.address}
                            onChange={(e) => updateClient({ address: e.target.value })}
                            placeholder="456 Client Ave, City, Country"
                            className="h-10"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Line Items */}
            <SectionCard title="Items / Services" icon={Package}>
                <div className="space-y-3">
                    {/* Table Header */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-3">Unit Price</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    {invoiceData.items.map((item, index) => (
                        <div
                            key={item.id}
                            className={cn(
                                "grid grid-cols-12 gap-2 items-end p-3 rounded-lg border border-gray-100",
                                index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                            )}
                        >
                            <div className="col-span-12 sm:col-span-5 space-y-1">
                                <Label className="sm:hidden text-xs text-gray-500">Description</Label>
                                <Input
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                    placeholder="Service or product name"
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="col-span-4 sm:col-span-2 space-y-1">
                                <Label className="sm:hidden text-xs text-gray-500">Qty</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) || 1 })}
                                    className="h-9 text-sm text-center"
                                />
                            </div>
                            <div className="col-span-5 sm:col-span-3 space-y-1">
                                <Label className="sm:hidden text-xs text-gray-500">Unit Price</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                        {invoiceData.settings.currencySymbol}
                                    </span>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                                        className="h-9 text-sm pl-8"
                                    />
                                </div>
                            </div>
                            <div className="col-span-3 sm:col-span-2 flex items-end justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    disabled={invoiceData.items.length <= 1}
                                    className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addItem}
                        className="w-full mt-2 border-dashed border-gray-300 text-gray-600 hover:text-primary-600 hover:border-primary-300"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </SectionCard>

            {/* Settings */}
            <SectionCard title="Invoice Settings" icon={Settings}>
                <div className="space-y-6">
                    {/* Currency & Tax & Discount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium text-gray-700">Currency</Label>
                            <select
                                value={invoiceData.settings.currency}
                                onChange={(e) => updateSettings({ currency: e.target.value })}
                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {CURRENCY_OPTIONS.map((currency) => (
                                    <option key={currency.value} value={currency.value}>
                                        {currency.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">Tax Rate</Label>
                                <Switch
                                    checked={invoiceData.settings.taxEnabled}
                                    onCheckedChange={(checked) => updateSettings({ taxEnabled: checked })}
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={invoiceData.settings.taxRate}
                                    onChange={(e) => updateSettings({ taxRate: Number(e.target.value) || 0 })}
                                    disabled={!invoiceData.settings.taxEnabled}
                                    className="h-10 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">Discount</Label>
                                <Switch
                                    checked={invoiceData.settings.discountEnabled}
                                    onCheckedChange={(checked) => updateSettings({ discountEnabled: checked })}
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={invoiceData.settings.discountRate}
                                    onChange={(e) => updateSettings({ discountRate: Number(e.target.value) || 0 })}
                                    disabled={!invoiceData.settings.discountEnabled}
                                    className="h-10 pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Payment Terms</Label>
                                <p className="text-xs text-gray-500">Add payment terms to invoice</p>
                            </div>
                            <Switch
                                checked={invoiceData.settings.showPaymentTerms}
                                onCheckedChange={(checked) => updateSettings({ showPaymentTerms: checked })}
                            />
                        </div>
                        {invoiceData.settings.showPaymentTerms && (
                            <Input
                                value={invoiceData.settings.paymentTerms}
                                onChange={(e) => updateSettings({ paymentTerms: e.target.value })}
                                placeholder="Payment due within 30 days"
                                className="h-10"
                            />
                        )}
                    </div>

                    {/* Bank Details */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Bank Details</Label>
                                <p className="text-xs text-gray-500">Add bank account for payment</p>
                            </div>
                            <Switch
                                checked={invoiceData.settings.showBankDetails}
                                onCheckedChange={(checked) => updateSettings({ showBankDetails: checked })}
                            />
                        </div>
                        {invoiceData.settings.showBankDetails && (
                            <textarea
                                value={invoiceData.settings.bankDetails}
                                onChange={(e) => updateSettings({ bankDetails: e.target.value })}
                                placeholder="Bank: Example Bank&#10;Account: 1234567890&#10;Routing: 000000000"
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* Notes */}
            <SectionCard title="Notes & Terms" icon={StickyNote}>
                <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes, payment instructions, or terms and conditions..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </SectionCard>
        </div>
    );
}
