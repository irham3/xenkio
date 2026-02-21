'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Eye, RotateCcw, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ColorBlindnessType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'protanomaly'
  | 'deuteranomaly'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly';

interface SimulationType {
  id: ColorBlindnessType;
  label: string;
  description: string;
  prevalence: string;
  matrix: number[];
}

const SIMULATION_TYPES: SimulationType[] = [
  {
    id: 'protanopia',
    label: 'Protanopia',
    description: 'Complete inability to perceive red light. Red appears dark.',
    prevalence: '~1% of men',
    matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  },
  {
    id: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Complete inability to perceive green light. Green and red appear similar.',
    prevalence: '~1% of men',
    matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  },
  {
    id: 'tritanopia',
    label: 'Tritanopia',
    description: 'Complete inability to perceive blue light. Blue appears green.',
    prevalence: '~0.003%',
    matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  },
  {
    id: 'protanomaly',
    label: 'Protanomaly',
    description: 'Reduced sensitivity to red light. Red appears weaker.',
    prevalence: '~1% of men',
    matrix: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875],
  },
  {
    id: 'deuteranomaly',
    label: 'Deuteranomaly',
    description: 'Reduced sensitivity to green light. The most common type.',
    prevalence: '~5% of men',
    matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
  },
  {
    id: 'tritanomaly',
    label: 'Tritanomaly',
    description: 'Reduced sensitivity to blue light. Blue appears weaker.',
    prevalence: '~0.01%',
    matrix: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817],
  },
  {
    id: 'achromatopsia',
    label: 'Achromatopsia',
    description: 'Total color blindness. Only shades of gray are perceived.',
    prevalence: 'Very rare',
    matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  },
  {
    id: 'achromatomaly',
    label: 'Achromatomaly',
    description: 'Partial color blindness. Colors appear muted and desaturated.',
    prevalence: 'Very rare',
    matrix: [0.618, 0.32, 0.062, 0.163, 0.775, 0.062, 0.163, 0.32, 0.516],
  },
];

const ACCEPTED_FORMATS: Record<string, string[]> = {
  'image/jpeg': [],
  'image/png': [],
  'image/webp': [],
};

function applyColorMatrix(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  matrix: number[]
): void {
  const ctx = sourceCanvas.getContext('2d');
  const targetCtx = targetCanvas.getContext('2d');
  if (!ctx || !targetCtx) return;

  targetCanvas.width = sourceCanvas.width;
  targetCanvas.height = sourceCanvas.height;

  const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const data = imageData.data;
  const output = targetCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
  const out = output.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    out[i] = r * matrix[0] + g * matrix[1] + b * matrix[2];
    out[i + 1] = r * matrix[3] + g * matrix[4] + b * matrix[5];
    out[i + 2] = r * matrix[6] + g * matrix[7] + b * matrix[8];
    out[i + 3] = data[i + 3];
  }

  targetCtx.putImageData(output, 0, 0);
}

export function ColorBlindnessTool() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ColorBlindnessType>('deuteranopia');
  const [fileName, setFileName] = useState<string>('');

  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const simulatedCanvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((file: File): void => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be under 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e): void => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setFileName(file.name);
      toast.success('Image uploaded successfully');
    };
    reader.onerror = (): void => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processImage(acceptedFiles[0]);
      }
    },
    accept: ACCEPTED_FORMATS,
    multiple: false,
    onDropRejected: () => {
      toast.error('Invalid file format. Please upload JPG, PNG, or WebP.');
    },
  });

  useEffect(() => {
    if (!uploadedImage) return;

    const img = new Image();
    img.onload = (): void => {
      const sourceCanvas = sourceCanvasRef.current;
      const simulatedCanvas = simulatedCanvasRef.current;
      if (!sourceCanvas || !simulatedCanvas) return;

      sourceCanvas.width = img.width;
      sourceCanvas.height = img.height;

      const ctx = sourceCanvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const simType = SIMULATION_TYPES.find((t) => t.id === selectedType);
      if (simType) {
        applyColorMatrix(sourceCanvas, simulatedCanvas, simType.matrix);
      }
    };
    img.src = uploadedImage;
  }, [uploadedImage, selectedType]);

  const handleDownload = useCallback((): void => {
    const canvas = simulatedCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to generate image');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = fileName.split('.').pop() || 'png';
      a.href = url;
      a.download = `${fileName.replace(/\.[^.]+$/, '')}-${selectedType}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    }, 'image/png');
  }, [fileName, selectedType]);

  const handleReset = useCallback((): void => {
    setUploadedImage(null);
    setFileName('');
  }, []);

  const currentSimulation = SIMULATION_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Upload Area */}
      {!uploadedImage && (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-12 lg:p-16 transition-all duration-300 cursor-pointer group',
            isDragActive
              ? 'border-primary-500 bg-primary-50/50'
              : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50 bg-white shadow-soft'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center transition-all bg-white shadow-medium',
                isDragActive ? 'scale-110 shadow-primary' : 'group-hover:scale-105'
              )}
            >
              <Upload
                className={cn(
                  'w-10 h-10 transition-colors',
                  isDragActive ? 'text-primary-600' : 'text-primary-500'
                )}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">
                {isDragActive ? 'Drop your image here' : 'Upload an Image'}
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Drag and drop your image here to simulate color blindness
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">
                  JPG
                </span>
                <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">
                  PNG
                </span>
                <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-500 rounded uppercase tracking-wider">
                  WebP
                </span>
              </div>
            </div>
            <Button
              size="lg"
              className="mt-4 rounded-xl px-8 bg-primary-600 hover:bg-primary-700 shadow-primary hover:shadow-primary-lg transition-all cursor-pointer"
              type="button"
            >
              <Eye className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          </div>
        </div>
      )}

      {/* Simulation Controls & Results */}
      {uploadedImage && (
        <>
          {/* Type Selector */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Color Blindness Type</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="rounded-lg text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-lg text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  New Image
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SIMULATION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer',
                    selectedType === type.id
                      ? 'bg-primary-500 text-white shadow-primary'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  )}
                >
                  <span className="block font-bold">{type.label}</span>
                  <span
                    className={cn(
                      'block mt-0.5',
                      selectedType === type.id ? 'text-primary-100' : 'text-gray-400'
                    )}
                  >
                    {type.prevalence}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          {currentSimulation && (
            <div className="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-primary-900">
                  {currentSimulation.label}
                </p>
                <p className="text-xs text-primary-700 mt-0.5">
                  {currentSimulation.description} Prevalence: {currentSimulation.prevalence}.
                </p>
              </div>
            </div>
          )}

          {/* Image Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">Original</h4>
              </div>
              <div className="p-3 flex items-center justify-center bg-gray-50 min-h-[200px]">
                <canvas
                  ref={sourceCanvasRef}
                  className="max-w-full max-h-[500px] rounded-lg object-contain"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">
                  Simulated | {currentSimulation?.label}
                </h4>
              </div>
              <div className="p-3 flex items-center justify-center bg-gray-50 min-h-[200px]">
                <canvas
                  ref={simulatedCanvasRef}
                  className="max-w-full max-h-[500px] rounded-lg object-contain"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
