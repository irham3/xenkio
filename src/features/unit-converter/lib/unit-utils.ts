import { Unit, UnitCategory, ConversionResult } from '../types';
import { UNIT_CATEGORIES } from '../constants';

export function getCategoryById(categoryId: UnitCategory) {
    return UNIT_CATEGORIES.find((c) => c.id === categoryId);
}

export function getUnitById(categoryId: UnitCategory, unitId: string): Unit | undefined {
    const category = getCategoryById(categoryId);
    return category?.units.find((u) => u.id === unitId);
}

export function convertValue(
    value: number,
    fromUnit: Unit,
    toUnit: Unit
): number {
    // Handle temperature specially since it has non-linear conversions
    if (fromUnit.toBaseFn && toUnit.fromBase) {
        const baseValue = fromUnit.toBaseFn(value);
        return toUnit.fromBase(baseValue);
    }

    // Standard linear conversion
    const baseValue = value * fromUnit.toBase;
    return baseValue / toUnit.toBase;
}

export function formatResult(value: number): ConversionResult {
    // Handle very small numbers
    if (Math.abs(value) < 0.000001 && value !== 0) {
        return {
            value,
            formatted: value.toExponential(6),
            scientific: value.toExponential(6),
        };
    }

    // Handle very large numbers
    if (Math.abs(value) >= 1e15) {
        return {
            value,
            formatted: value.toExponential(6),
            scientific: value.toExponential(6),
        };
    }

    // Format with appropriate decimal places
    let formatted: string;
    if (Number.isInteger(value)) {
        formatted = value.toString();
    } else {
        // Determine appropriate decimal places based on magnitude
        const absValue = Math.abs(value);
        if (absValue >= 1000) {
            formatted = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
        } else if (absValue >= 1) {
            formatted = value.toLocaleString('en-US', { maximumFractionDigits: 6 });
        } else if (absValue >= 0.001) {
            formatted = value.toLocaleString('en-US', { maximumFractionDigits: 9 });
        } else {
            formatted = value.toExponential(6);
        }
    }

    return {
        value,
        formatted,
    };
}

export function parseInputValue(input: string): number | null {
    if (!input || input.trim() === '') return null;

    // Remove commas and spaces
    const cleanInput = input.replace(/[,\s]/g, '');

    // Check for valid number format
    const num = Number(cleanInput);
    if (Number.isNaN(num)) return null;

    return num;
}

export function generateConversionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getDefaultUnitsForCategory(categoryId: UnitCategory): {
    from: string;
    to: string;
} {
    const category = getCategoryById(categoryId);
    if (!category || category.units.length < 2) {
        return { from: '', to: '' };
    }

    // Common default conversions for each category
    const defaults: Record<UnitCategory, { from: string; to: string }> = {
        length: { from: 'm', to: 'ft' },
        weight: { from: 'kg', to: 'lb' },
        temperature: { from: 'c', to: 'f' },
        volume: { from: 'l', to: 'gal_us' },
        area: { from: 'm2', to: 'ft2' },
        speed: { from: 'kph', to: 'mph' },
        pressure: { from: 'pa', to: 'psi' },
        energy: { from: 'j', to: 'cal' },
        power: { from: 'w', to: 'hp' },
        data: { from: 'mb', to: 'gb' },
        time: { from: 'min', to: 's' },
    };

    const defaultUnits = defaults[categoryId];

    // Verify units exist in category
    const fromExists = category.units.some((u) => u.id === defaultUnits.from);
    const toExists = category.units.some((u) => u.id === defaultUnits.to);

    return {
        from: fromExists ? defaultUnits.from : category.units[0].id,
        to: toExists ? defaultUnits.to : category.units[1]?.id || category.units[0].id,
    };
}
