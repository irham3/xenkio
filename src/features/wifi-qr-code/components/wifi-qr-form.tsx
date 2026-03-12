'use client';

import { WifiQrConfig } from '../types';
import { ENCRYPTION_OPTIONS } from '../constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Eye, EyeOff, Wifi, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WifiQrFormProps {
    config: WifiQrConfig;
    onChange: (updates: Partial<WifiQrConfig>) => void;
}

export function WifiQrForm({ config, onChange }: WifiQrFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            {/* Network Name (SSID) */}
            <div className="space-y-2">
                <Label htmlFor="wifi-ssid" className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-gray-500" />
                    Network Name (SSID)
                </Label>
                <Input
                    id="wifi-ssid"
                    value={config.ssid}
                    onChange={(e) => onChange({ ssid: e.target.value })}
                    placeholder="Enter your WiFi network name"
                    className="w-full"
                />
            </div>

            {/* Encryption Type */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Security Type
                </Label>
                <div className="grid grid-cols-3 gap-2">
                    {ENCRYPTION_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange({
                                    encryption: option.value,
                                    ...(option.value === 'nopass' ? { password: '' } : {}),
                                });
                            }}
                            className={cn(
                                'px-3 py-2 text-sm rounded-lg border transition-all text-center',
                                config.encryption === option.value
                                    ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Password */}
            {config.encryption !== 'nopass' && (
                <div className="space-y-2">
                    <Label htmlFor="wifi-password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="wifi-password"
                            type={showPassword ? 'text' : 'password'}
                            value={config.password}
                            onChange={(e) => onChange({ password: e.target.value })}
                            placeholder="Enter WiFi password"
                            className="w-full pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden Network */}
            <div className="flex items-center gap-3 py-2">
                <input
                    id="wifi-hidden"
                    type="checkbox"
                    checked={config.hidden}
                    onChange={(e) => onChange({ hidden: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Label htmlFor="wifi-hidden" className="flex items-center gap-2 cursor-pointer">
                    <Globe className="w-4 h-4 text-gray-500" />
                    Hidden Network
                </Label>
            </div>
        </div>
    );
}
