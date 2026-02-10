// =============================================
// ImageConversionService - Image Format Conversions (SRP)
// =============================================
// Converts between image formats using Canvas API.
// =============================================

import type { ImageFormat } from './ImageExportService';

export const ImageConversionService = {
  async convert(blob: Blob, targetFormat: ImageFormat, quality: number = 0.92): Promise<Blob> {
    const img = await this._loadImage(blob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Failed to convert image'));
        },
        `image/${targetFormat}`,
        quality
      );
    });
  },

  async svgToPng(svgBlob: Blob, width?: number, height?: number): Promise<Blob> {
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = width || img.width || 300;
        canvas.height = height || img.height || 300;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert SVG to PNG'));
          },
          'image/png'
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG'));
      };
      img.src = svgUrl;
    });
  },

  async gifFirstFrameToPng(gifBlob: Blob): Promise<Blob> {
    // GIF first frame: just draw the image (browser only renders first frame on canvas)
    return this.convert(gifBlob, 'png');
  },

  async _loadImage(blob: Blob): Promise<HTMLImageElement> {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  },
};
