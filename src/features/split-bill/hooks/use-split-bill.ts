import { useState, useMemo, useCallback } from 'react';
import { Person, SplitItem, SplitBillState, BillSummary, PersonSummary } from '../types';
import { DEFAULT_CURRENCY, AVATAR_COLORS } from '../constants';

const generateId = () => Math.random().toString(36).substring(2, 9);

export function useSplitBill() {
    const [state, setState] = useState<SplitBillState>({
        people: [],
        items: [],
        currency: DEFAULT_CURRENCY,
        taxPercentage: 0,
        serviceChargePercentage: 0,
        discountAmount: 0,
        paymentMethod: '',
        paymentAccountName: '',
        paymentAccountNumber: '',
    });

    const addPerson = useCallback((name: string) => {
        if (!name.trim()) return;
        const newPerson: Person = {
            id: generateId(),
            name: name.trim(),
            avatarColor: AVATAR_COLORS[state.people.length % AVATAR_COLORS.length]
        };
        setState(prev => ({ ...prev, people: [...prev.people, newPerson] }));
    }, [state.people.length]);

    const removePerson = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            people: prev.people.filter(p => p.id !== id),
            // Un-assign from all items when completely removed
            items: prev.items.map(item => ({
                ...item,
                splitAmong: item.splitAmong.filter(personId => personId !== id)
            }))
        }));
    }, []);

    const addItem = useCallback((item: Omit<SplitItem, 'id'>) => {
        setState(prev => ({
            ...prev,
            items: [...prev.items, { ...item, id: generateId() }]
        }));
    }, []);

    const updateItem = useCallback((id: string, updates: Partial<SplitItem>) => {
        setState(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
        }));
    }, []);

    const removeItem = useCallback((id: string) => {
        setState(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    }, []);

    const toggleItemPerson = useCallback((itemId: string, personId: string) => {
        setState(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === itemId) {
                    const isSelected = item.splitAmong.includes(personId);
                    return {
                        ...item,
                        splitAmong: isSelected
                            ? item.splitAmong.filter(id => id !== personId)
                            : [...item.splitAmong, personId]
                    };
                }
                return item;
            })
        }));
    }, []);

    const toggleAllPeopleForItem = useCallback((itemId: string, selectAll: boolean) => {
        setState(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        splitAmong: selectAll ? prev.people.map(p => p.id) : []
                    };
                }
                return item;
            })
        }));
    }, []);

    const updateGlobalSettings = useCallback((updates: Partial<Omit<SplitBillState, 'people' | 'items'>>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Core Calculation Logic
    const summary = useMemo<BillSummary>(() => {
        const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let subtotalAfterDiscount = subtotal;
        let discountMultiplier = 1;

        if (state.discountAmount > 0 && subtotal > 0) {
            subtotalAfterDiscount = Math.max(0, subtotal - state.discountAmount);
            discountMultiplier = subtotalAfterDiscount / subtotal;
        }

        const serviceChargeTotal = subtotalAfterDiscount * (state.serviceChargePercentage / 100);
        // Tax usually calculated after discount but before service charge, or on (subtotalAfterDiscount + serviceCharge), it varies by region.
        // Assuming Standard Indonesian calculation (PB1: 10% from Subtotal + Service Charge)
        const taxableAmount = subtotalAfterDiscount + serviceChargeTotal;
        const taxTotal = taxableAmount * (state.taxPercentage / 100);

        const grandTotal = subtotalAfterDiscount + serviceChargeTotal + taxTotal;

        const peopleSummaries = state.people.map(person => {
            const personItems: { item: SplitItem; shareAmount: number }[] = [];
            let personSubtotal = 0;

            state.items.forEach(item => {
                if (item.splitAmong.includes(person.id)) {
                    const shareAmount = (item.price * item.quantity) / item.splitAmong.length;
                    personItems.push({ item, shareAmount });
                    personSubtotal += shareAmount;
                }
            });

            // Calculate person's proportion of the total bill
            const personProportion = subtotal > 0 ? personSubtotal / subtotal : 0;

            // Distribute global charges proportionally
            const personDiscount = state.discountAmount * personProportion;
            const personSubAfterDiscount = Math.max(0, personSubtotal - personDiscount);
            const personServiceCharge = personSubAfterDiscount * (state.serviceChargePercentage / 100);
            const personTax = (personSubAfterDiscount + personServiceCharge) * (state.taxPercentage / 100);

            const personTotal = personSubAfterDiscount + personServiceCharge + personTax;

            return {
                person,
                items: personItems,
                subtotal: personSubtotal,
                discountShare: personDiscount,
                serviceChargeShare: personServiceCharge,
                taxShare: personTax,
                total: personTotal
            };
        });

        return {
            subtotal,
            taxTotal,
            serviceChargeTotal,
            discountTotal: state.discountAmount,
            grandTotal,
            peopleSummaries
        };
    }, [state]);

    return {
        state,
        summary,
        addPerson,
        removePerson,
        addItem,
        updateItem,
        removeItem,
        toggleItemPerson,
        toggleAllPeopleForItem,
        updateGlobalSettings
    };
}
