'use client';

import { useCallback, useMemo, useState } from 'react';
import { FaqItem, SchemaGeneratorConfig, SchemaType } from '../types';
import { configToJsonLdString, createFaqItem, getDefaultConfig } from '../lib/schema-utils';

const URL_REVOKE_DELAY_MS = 1000;

export function useSchemaGenerator() {
    const [config, setConfig] = useState<SchemaGeneratorConfig>(getDefaultConfig());

    const output = useMemo(() => configToJsonLdString(config), [config]);

    const updateField = useCallback(<FieldKey extends keyof SchemaGeneratorConfig>(
        field: FieldKey,
        value: SchemaGeneratorConfig[FieldKey],
    ) => {
        setConfig((prev) => ({ ...prev, [field]: value }));
    }, []);

    const setSchemaType = useCallback((schemaType: SchemaType) => {
        setConfig((prev) => ({ ...prev, schemaType }));
    }, []);

    const applyPreset = useCallback((schemaType: SchemaType) => {
        setConfig((prev) => ({
            ...getDefaultConfig(),
            schemaType,
            name: prev.name,
            description: prev.description,
            url: prev.url,
            image: prev.image,
        }));
    }, []);

    const addFaq = useCallback(() => {
        setConfig((prev) => ({
            ...prev,
            faqs: [...prev.faqs, createFaqItem()],
        }));
    }, []);

    const removeFaq = useCallback((id: string) => {
        setConfig((prev) => ({
            ...prev,
            faqs: prev.faqs.length === 1
                ? prev.faqs
                : prev.faqs.filter((item) => item.id !== id),
        }));
    }, []);

    const updateFaq = useCallback(<FieldKey extends keyof Omit<FaqItem, 'id'>>(
        id: string,
        field: FieldKey,
        value: FaqItem[FieldKey],
    ) => {
        setConfig((prev) => ({
            ...prev,
            faqs: prev.faqs.map((item) => (
                item.id === id ? { ...item, [field]: value } : item
            )),
        }));
    }, []);

    const resetConfig = useCallback(() => {
        setConfig(getDefaultConfig());
    }, []);

    const downloadFile = useCallback(() => {
        const blob = new Blob([output], { type: 'application/ld+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'schema-markup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), URL_REVOKE_DELAY_MS);
    }, [output]);

    return {
        config,
        output,
        updateField,
        setSchemaType,
        applyPreset,
        addFaq,
        removeFaq,
        updateFaq,
        resetConfig,
        downloadFile,
    };
}
