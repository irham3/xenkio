'use client';

import { WifiConfig, WifiEncryption } from '../types';
import { ENCRYPTION_OPTIONS } from '../constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wifi, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface WifiFormProps {
    wifi: WifiConfig;
    onChange: (updates: Partial<WifiConfig>) => void;
}

export function WifiForm({ wifi, onChange }: WifiFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            {/* SSID */}
            <div className="space-y-2">
                <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                <div className="relative">
                    <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="wifi-ssid"
                        value={wifi.ssid}
                        onChange={(e) => onChange({ ssid: e.target.value })}
                        placeholder="Enter WiFi network name"
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Encryption Type */}
            <div className="space-y-2">
                <Label>Security Type</Label>
                <div className="grid grid-cols-3 gap-2">
                    {ENCRYPTION_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange({ encryption: option.value as WifiEncryption });
                                if (option.value === 'nopass') {
                                    onChange({ encryption: option.value, password: '' });
                                }
                            }}
                            className={cn(
                                "px-3 py-2 text-sm rounded-md border transition-all",
                                wifi.encryption === option.value
                                    ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Password */}
            {wifi.encryption !== 'nopass' && (
                <div className="space-y-2">
                    <Label htmlFor="wifi-password">Password</Label>
                    <div className="relative">
                        <Input
                            id="wifi-password"
                            type={showPassword ? 'text' : 'password'}
                            value={wifi.password}
                            onChange={(e) => onChange({ password: e.target.value })}
                            placeholder="Enter WiFi password"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden Network */}
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                <input
                    type="checkbox"
                    id="wifi-hidden"
                    checked={wifi.hidden}
                    onChange={(e) => onChange({ hidden: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                    <Label htmlFor="wifi-hidden" className="cursor-pointer">Hidden Network</Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Enable if the network doesn&apos;t broadcast its SSID.
                    </p>
                </div>
            </div>
        </div>
    );
}
