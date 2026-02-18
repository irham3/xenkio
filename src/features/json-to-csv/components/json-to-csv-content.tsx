
import React from 'react';
import {
    CheckCircle2,
    FileJson,
    FileSpreadsheet,
    Zap,
    ShieldCheck,
    Settings2
} from 'lucide-react';

export function JsonToCsvContent() {
    return (
        <div className="mt-16 space-y-16">
            {/* Quick Guide Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary-500" />
                    How to Convert JSON to CSV in seconds
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">1</div>
                        <h3 className="font-semibold text-gray-900">Paste JSON Data</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Copy your JSON data and paste it into the left input panel. You can also drag and drop a .json file directly.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">2</div>
                        <h3 className="font-semibold text-gray-900">Customize Output</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Select your preferred delimiter (comma, tab, etc.) and enable object flattening for nested data structures.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg border border-primary-100">3</div>
                        <h3 className="font-semibold text-gray-900">Download CSV</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Click &quot;Download&quot; to save your file or copy the CSV data directly to your clipboard for immediate use.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why use our JSON to CSV Converter?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Powerful features designed for developers and data analysts who need quick, reliable data conversion.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                            <Settings2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Flattening</h3>
                        <p className="text-gray-600 text-sm">
                            Automatically converts complex nested JSON objects into flat CSV rows using dot notation headers.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">100% Client-Side Secure</h3>
                        <p className="text-gray-600 text-sm">
                            Your data never leaves your browser. Conversion happens locally, ensuring maximum privacy for sensitive data.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Table Preview</h3>
                        <p className="text-gray-600 text-sm">
                            Instantly preview your data in a structured table format before downloading to verify column alignment.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Conversion</h3>
                        <p className="text-gray-600 text-sm">
                            Enjoy real-time preview as you type or paste. No waiting for server uploads or processing queues.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-4">
                            <FileJson className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Error Validation</h3>
                        <p className="text-gray-600 text-sm">
                            Built-in JSON validator highlights syntax errors instantly so you can fix your data before conversion.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Flexible Delimiters</h3>
                        <p className="text-gray-600 text-sm">
                            Choose between standard comma (,), semicolon (;), tab (\t), or pipe (|) delimiters for compatibility.
                        </p>
                    </div>
                </div>
            </section>

            {/* SEO Content / FAQ */}
            <section className="prose prose-gray max-w-none">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 not-prose">Frequently Asked Questions</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my JSON data safe?</h3>
                            <p className="text-gray-600 text-sm">
                                Yes, absolutely. This tool runs entirely in your web browser using JavaScript. No data is sent to our servers, making it safe for confidential or sensitive information.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I handle nested JSON objects?</h3>
                            <p className="text-gray-600 text-sm">
                                By default, our tool enables &quot;Flatten Object&quot; mode. This converts nested structures (like <code>{`{"user": {"name": "John"}}`}</code>) into dot-notation columns (e.g., <code>user.name</code>). You can convert complex API responses directly into flat spreadsheets.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I convert large JSON files?</h3>
                            <p className="text-gray-600 text-sm">
                                Yes. Since the processing is done locally on your device, the limit depends primarily on your computer&apos;s memory (RAM). Most modern browsers can easily handle files up to 100MB+ instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
