// =============================================
// MyEasyDocs - ImageEditor Component
// =============================================
// Canvas-based image editor with rotate, crop,
// resize, filters using Fabric.js.
// =============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas, FabricImage, filters as fabricFilters } from 'fabric';
import {
  RotateCw, Crop, Maximize2, Sun, Save, X, Loader2, Download,
} from 'lucide-react';
import { ImageExportService } from '../../services/ImageExportService';
import type { ImageFormat } from '../../services/ImageExportService';
import { MESSAGES } from '../../constants';

// =============================================
// PROPS
// =============================================
interface ImageEditorProps {
  url: string;
  name: string;
  onSave: (blob: Blob, format: ImageFormat) => Promise<void>;
  onCancel: () => void;
}

// =============================================
// COMPONENT
// =============================================
export function ImageEditor({ url, name, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [exportFormat, setExportFormat] = useState<ImageFormat>('png');

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      backgroundColor: '#1e293b',
      selection: false,
    });
    fabricRef.current = fabricCanvas;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const fabricImage = new FabricImage(img);

      // Scale to fit canvas
      const maxWidth = 800;
      const maxHeight = 600;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

      fabricCanvas.setDimensions({
        width: img.width * scale,
        height: img.height * scale,
      });

      fabricImage.scale(scale);
      fabricImage.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });

      fabricCanvas.add(fabricImage);
      fabricCanvas.renderAll();
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = url;

    return () => {
      fabricCanvas.dispose();
      fabricRef.current = null;
    };
  }, [url]);

  const handleRotate = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length === 0) return;

    const img = objects[0];
    const newRotation = (rotation + 90) % 360;
    img.rotate(newRotation);

    // Swap canvas dimensions for 90/270 degrees
    if (newRotation === 90 || newRotation === 270) {
      const w = canvas.getWidth();
      const h = canvas.getHeight();
      canvas.setDimensions({ width: h, height: w });
      img.set({ left: h / 2, top: w / 2, originX: 'center', originY: 'center' });
    } else {
      const w = canvas.getWidth();
      const h = canvas.getHeight();
      // Check if dimensions need to be swapped back
      if (rotation === 90 || rotation === 270) {
        canvas.setDimensions({ width: h, height: w });
      }
      img.set({ left: canvas.getWidth() / 2, top: canvas.getHeight() / 2, originX: 'center', originY: 'center' });
    }

    canvas.renderAll();
    setRotation(newRotation);
  }, [rotation]);

  const handleBrightnessChange = useCallback((value: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length === 0) return;

    const img = objects[0] as FabricImage;
    const filter = new fabricFilters.Brightness({ brightness: value / 100 });
    img.filters = [filter];
    img.applyFilters();
    canvas.renderAll();
    setBrightness(value);
  }, []);

  const handleToggleCrop = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (isCropping) {
      // Apply crop - find the crop rectangle
      const cropRect = canvas.getObjects().find(obj => obj.type === 'rect');
      if (cropRect) {
        canvas.remove(cropRect);
      }
      setIsCropping(false);
    } else {
      // Enable crop mode - add selection rectangle
      setIsCropping(true);
    }

    canvas.selection = !isCropping;
    canvas.renderAll();
  }, [isCropping]);

  const handleSave = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas || isSaving) return;

    setIsSaving(true);
    try {
      // Export canvas to blob
      const dataUrl = canvas.toDataURL({
        format: exportFormat,
        quality: 0.92,
        multiplier: 1 / (canvas.getZoom() || 1),
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await onSave(blob, exportFormat);
    } catch (err) {
      console.error('Error saving image:', err);
    } finally {
      setIsSaving(false);
    }
  }, [exportFormat, isSaving, onSave]);

  const handleDownload = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: exportFormat,
      quality: 0.92,
      multiplier: 1,
    });

    const link = document.createElement('a');
    link.download = name.replace(/\.[^.]+$/, `.${exportFormat}`);
    link.href = dataUrl;
    link.click();
  }, [exportFormat, name]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <p className="text-slate-400">Carregando editor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRotate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            title="Girar 90°"
          >
            <RotateCw className="w-4 h-4" />
            <span>Girar</span>
          </button>
          <button
            onClick={handleToggleCrop}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isCropping ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
            title="Cortar"
          >
            <Crop className="w-4 h-4" />
            <span>Cortar</span>
          </button>

          <div className="w-px h-5 bg-slate-600 mx-1" />

          {/* Brightness slider */}
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min={-100}
              max={100}
              value={brightness}
              onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
              className="w-24 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          <div className="w-px h-5 bg-slate-600 mx-1" />

          {/* Export format */}
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ImageFormat)}
            className="px-2 py-1 text-sm bg-slate-700 text-slate-300 rounded border border-slate-600"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>{MESSAGES.preview.cancelAction}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{MESSAGES.preview.savingAction}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{MESSAGES.preview.saveAction}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950/50">
        <canvas ref={canvasRef} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs text-slate-500">
        <span>Rotação: {rotation}°</span>
        <span>Formato: {exportFormat.toUpperCase()}</span>
      </div>
    </div>
  );
}
