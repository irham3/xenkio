import { useState } from 'react';
import { Person, SplitItem, Currency } from '../types';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Receipt, Users, Check, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemManagerProps {
    people: Person[];
    items: SplitItem[];
    currency: Currency;
    onAddItem: (item: Omit<SplitItem, 'id'>) => void;
    onUpdateItem: (id: string, updates: Partial<SplitItem>) => void;
    onRemoveItem: (id: string) => void;
    onTogglePerson: (itemId: string, personId: string) => void;
    onToggleAllPeople: (itemId: string, selectAll: boolean) => void;
}

export function ItemManager({
    people,
    items,
    currency,
    onAddItem,
    onUpdateItem,
    onRemoveItem,
    onTogglePerson,
    onToggleAllPeople
}: ItemManagerProps) {
    const [newItem, setNewItem] = useState({ name: '', price: '', quantity: 1 });

    const handleAdd = () => {
        if (!newItem.name.trim() || !newItem.price || isNaN(Number(newItem.price))) return;

        onAddItem({
            name: newItem.name.trim(),
            price: Number(newItem.price),
            quantity: newItem.quantity,
            splitAmong: people.map(p => p.id) // Default split among all people currently added
        });

        setNewItem({ name: '', price: '', quantity: 1 });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handlePriceChange = (itemId: string, val: string) => {
        const num = Number(val);
        if (!isNaN(num)) onUpdateItem(itemId, { price: num });
    };

    const handleQuantityChange = (itemId: string, val: string) => {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > 0) onUpdateItem(itemId, { quantity: num });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                <Receipt className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-800">Items (Receipt)</h3>
                <span className="ml-auto text-xs font-bold bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
                    {items.length}
                </span>
            </div>

            {/* Quick Add Form */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Item Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Pizza Margarita"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            onKeyDown={handleKeyDown}
                            className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div className="w-full sm:w-1/3 flex gap-2">
                        <div className="w-16">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Qty</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="1"
                                value={newItem.quantity === 0 ? '' : newItem.quantity}
                                onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                                onKeyDown={handleKeyDown}
                                className="w-full h-10 px-2 text-center text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{currency.symbol}</div>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="0.00"
                                    value={newItem.price || ''}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="w-full h-10 pl-8 pr-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={handleAdd}
                            disabled={!newItem.name.trim() || !newItem.price}
                            className="w-full sm:w-auto h-10 px-5 bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
                        >
                            <Plus className="w-4 h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Add Item</span>
                        </Button>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5" />
                    Price should be the unit price. It will be multiplied by quantity.
                </p>
            </div>

            {/* Item List */}
            {items.length > 0 ? (
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 transition-colors group relative">
                            {/* Item Header (Edit Mode inline essentially) */}
                            <div className="p-3 bg-gray-50 border-b border-gray-100 flex flex-wrap sm:flex-nowrap items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 w-5 text-center">{index + 1}</span>

                                <input
                                    value={item.name}
                                    onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                                    className="flex-1 min-w-[120px] h-8 px-2 text-sm font-semibold bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10 rounded transition-all outline-none"
                                />

                                <div className="flex items-center gap-1.5 ml-auto">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity === 0 ? '' : item.quantity}
                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                        className="w-12 h-8 px-1 text-center text-sm font-medium bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10 rounded transition-all outline-none"
                                    />
                                    <span className="text-gray-400 text-xs font-bold mx-1">×</span>
                                    <div className="relative flex items-center">
                                        <span className="text-xs font-medium text-gray-500 absolute left-2 top-1/2 -translate-y-1/2 z-10">{currency.symbol}</span>
                                        <input
                                            type="number"
                                            value={item.price === 0 ? '' : item.price}
                                            placeholder="0"
                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                            className="w-24 h-8 pl-6 pr-2 text-right text-sm font-bold text-gray-800 bg-transparent border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10 rounded transition-all outline-none"
                                        />
                                    </div>

                                    <div className="w-px h-5 bg-gray-200 mx-1"></div>

                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                        title="Remove Item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Who pays section */}
                            <div className="p-3 sm:px-4">
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        Split Among
                                    </label>

                                    {people.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onToggleAllPeople(item.id, true)}
                                                className="text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2 py-0.5 rounded transition-colors"
                                            >
                                                All
                                            </button>
                                            <button
                                                onClick={() => onToggleAllPeople(item.id, false)}
                                                className="text-[10px] font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded transition-colors"
                                            >
                                                None
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {people.length === 0 ? (
                                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                                        Please add people first to allocate this item.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {people.map(person => {
                                            const isSelected = item.splitAmong.includes(person.id);
                                            return (
                                                <button
                                                    key={person.id}
                                                    onClick={() => onTogglePerson(item.id, person.id)}
                                                    className={cn(
                                                        "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-sm transition-all duration-200",
                                                        isSelected
                                                            ? "bg-primary-50 border-primary-200 shadow-[0_0_0_1px_rgba(var(--primary-500),0.2)]"
                                                            : "bg-white border-gray-200 opacity-60 hover:opacity-100 grayscale hover:grayscale-0"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-colors relative",
                                                        person.avatarColor
                                                    )}>
                                                        {isSelected ? (
                                                            <Check className="w-3.5 h-3.5" />
                                                        ) : (
                                                            person.name.substring(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "font-medium truncate max-w-[80px]",
                                                        isSelected ? "text-primary-900" : "text-gray-500"
                                                    )}>
                                                        {person.name}
                                                    </span>
                                                </button>
                                            );
                                        })}

                                        {item.splitAmong.length > 0 && (
                                            <div className="ml-auto flex items-center text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                                {currency.symbol}{((item.price * item.quantity) / item.splitAmong.length).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / person
                                            </div>
                                        )}
                                        {item.splitAmong.length === 0 && (
                                            <div className="ml-auto flex items-center text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                                                Unassigned!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-600">No items added yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[250px] mx-auto">Add items from your receipt, set their price, and assign who should pay for them.</p>
                </div>
            )}
        </div>
    );
}
