
import { useState } from 'react';
import { encodeMessage, decodeMessage } from '../lib/steganography-utils';
import { toast } from 'sonner';

export type SteganographyMode = 'encode' | 'decode';

export function useSteganography() {
    const [mode, setMode] = useState<SteganographyMode>('encode');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [outputImageUrl, setOutputImageUrl] = useState<string | null>(null);
    const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Check file size (limit to 5MB for browser performance)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image is too large (max 5MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setSelectedImageUrl(e.target?.result as string);
        reader.readAsDataURL(file);

        setSelectedFile(file);
        setOutputImageUrl(null);
        setDecodedMessage(null);
    };

    const handleProcess = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        let result;

        if (mode === 'encode') {
            if (!message) {
                toast.error('Please enter a message to hide');
                setIsProcessing(false);
                return;
            }
            result = await encodeMessage(selectedFile, message);
            if (result.dataUrl) {
                setOutputImageUrl(result.dataUrl);
                toast.success('Message hidden successfully!');
            }
        } else {
            result = await decodeMessage(selectedFile);
            if (result.message) {
                setDecodedMessage(result.message);
                toast.success('Message revealed successfully!');
            } else if (result.error) {
                toast.error(result.error);
                setDecodedMessage(null);
            }
        }

        if (result.error && mode === 'encode') {
            toast.error(result.error);
        }

        setIsProcessing(false);
    };

    const reset = () => {
        setSelectedFile(null);
        setSelectedImageUrl(null);
        setMessage('');
        setOutputImageUrl(null);
        setDecodedMessage(null);
    };

    return {
        mode,
        setMode,
        selectedFile,
        selectedImageUrl,
        message,
        setMessage,
        outputImageUrl,
        decodedMessage,
        isProcessing,
        handleFileSelect,
        handleProcess,
        reset
    };
}
