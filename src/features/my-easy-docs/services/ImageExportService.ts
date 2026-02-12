// =============================================
// ImageExportService - Image Export (SRP)
// =============================================
// Handles exporting canvas to different image formats.
// =============================================

export type ImageFormat = 'png' | 'jpeg' | 'webp';

export const ImageExportService = {
  async toBlob(
    canvas: HTMLCanvasElement,
    format: ImageFormat = 'png',
    quality: number = 0.92
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export image'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  },

  toDataUrl(
    canvas: HTMLCanvasElement,
    format: ImageFormat = 'png',
    quality: number = 0.92
  ): string {
    return canvas.toDataURL(`image/${format}`, quality);
  },
};
