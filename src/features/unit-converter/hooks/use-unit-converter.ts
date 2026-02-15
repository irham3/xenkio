'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    UnitCategory,
    ConversionHistoryItem,
    ConversionResult,
} from '../types';
import {
    getCategoryById,
    getUnitById,
    convertValue,
    formatResult,
    parseInputValue,
    generateConversionId,
    getDefaultUnitsForCategory,
} from '../lib/unit-utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

const MAX_HISTORY_ITEMS = 10;

export function useUnitConverter() {
    // Initialize with length category and default units
    const [category, setCategory] = useState<UnitCategory>('length');
    const [fromUnit, setFromUnit] = useState<string>('m');
    const [toUnit, setToUnit] = useState<string>('ft');
    const [inputValue, setInputValue] = useState<string>('1');
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Use the existing localStorage hook for history
    const [history, setHistory] = useLocalStorage<ConversionHistoryItem[]>(
        'unit-converter-history',
        []
    );

    // Calculate result using useMemo instead of useEffect
    const result = useMemo<ConversionResult | null>(() => {
        const numValue = parseInputValue(inputValue);
        if (numValue === null) {
            return null;
        }

        const from = getUnitById(category, fromUnit);
        const to = getUnitById(category, toUnit);

        if (!from || !to) {
            return null;
        }

        const converted = convertValue(numValue, from, to);
        return formatResult(converted);
    }, [category, fromUnit, toUnit, inputValue]);

    const currentCategory = useMemo(
        () => getCategoryById(category),
        [category]
    );

    const availableUnits = useMemo(
        () => currentCategory?.units || [],
        [currentCategory]
    );

    const handleCategoryChange = useCallback(
        (newCategory: UnitCategory) => {
            setCategory(newCategory);
            const defaults = getDefaultUnitsForCategory(newCategory);
            setFromUnit(defaults.from);
            setToUnit(defaults.to);
            // Keep the input value, or reset to 1 if empty
            if (!inputValue || inputValue.trim() === '') {
                setInputValue('1');
            }
        },
        [inputValue]
    );

    const handleSwapUnits = useCallback(() => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    }, [fromUnit, toUnit]);

    const handleAddToHistory = useCallback(() => {
        if (!result) return;

        const numValue = parseInputValue(inputValue);
        if (numValue === null) return;

        const newItem: ConversionHistoryItem = {
            id: generateConversionId(),
            fromValue: numValue,
            fromUnit,
            toValue: result.value,
            toUnit,
            category,
            timestamp: Date.now(),
        };

        setHistory((prev) => {
            const filtered = prev.filter(
                (item) =>
                    !(
                        item.fromValue === newItem.fromValue &&
                        item.fromUnit === newItem.fromUnit &&
                        item.toUnit === newItem.toUnit &&
                        item.category === newItem.category
                    )
            );
            return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        });
    }, [result, inputValue, fromUnit, toUnit, category, setHistory]);

    const handleClearHistory = useCallback(() => {
        setHistory([]);
    }, [setHistory]);

    const handleHistoryItemClick = useCallback(
        (item: ConversionHistoryItem) => {
            setCategory(item.category);
            setFromUnit(item.fromUnit);
            setToUnit(item.toUnit);
            setInputValue(item.fromValue.toString());
        },
        []
    );

    const handleCopy = useCallback(
        async (text: string, field: string) => {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        },
        []
    );

    const getUnitSymbol = useCallback(
        (unitId: string) => {
            const unit = getUnitById(category, unitId);
            return unit?.symbol || unitId;
        },
        [category]
    );

    return {
        category,
        fromUnit,
        toUnit,
        inputValue,
        result,
        history,
        copiedField,
        currentCategory,
        availableUnits,
        setCategory: handleCategoryChange,
        setFromUnit,
        setToUnit,
        setInputValue,
        swapUnits: handleSwapUnits,
        addToHistory: handleAddToHistory,
        clearHistory: handleClearHistory,
        onHistoryItemClick: handleHistoryItemClick,
        onCopy: handleCopy,
        getUnitSymbol,
    };
}
