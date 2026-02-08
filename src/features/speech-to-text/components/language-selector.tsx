"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "../constants";

interface LanguageSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function LanguageSelector({
    value,
    onChange,
    disabled,
}: LanguageSelectorProps) {
    return (
        <div className="w-full max-w-xs">
            <label className="text-sm font-medium mb-1.5 block">
                Spoken Language
            </label>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-950 border shadow-xl z-[100] min-w-[200px]">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
