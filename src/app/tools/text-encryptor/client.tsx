'use client';

import { useState } from 'react';
import { Key, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SymmetricPanel } from '@/features/text-encryptor/components/symmetric-panel';
import { AsymmetricPanel } from '@/features/text-encryptor/components/asymmetric-panel';

export default function TextEncryptorClient() {
    const [activeTab, setActiveTab] = useState<'symmetric' | 'asymmetric'>('symmetric');

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-20">
            {/* Type Selection Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'symmetric' | 'asymmetric')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 p-1 bg-gray-100 rounded-2xl mb-8 border border-gray-200">
                    <TabsTrigger
                        value="symmetric"
                        className="h-full rounded-xl text-sm font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer"
                    >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Symmetric Encryption
                    </TabsTrigger>
                    <TabsTrigger
                        value="asymmetric"
                        className="h-full rounded-xl text-sm font-semibold text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all cursor-pointer"
                    >
                        <Key className="w-4 h-4 mr-2" />
                        Asymmetric (RSA/PGP)
                    </TabsTrigger>
                </TabsList>

                {/* ================= SYMMETRIC TAB ================= */}
                <TabsContent value="symmetric" className="space-y-6">
                    <SymmetricPanel />
                </TabsContent>

                {/* ================= ASYMMETRIC TAB ================= */}
                <TabsContent value="asymmetric" className="space-y-6">
                    <AsymmetricPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
}
