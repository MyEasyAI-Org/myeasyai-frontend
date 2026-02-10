// =============================================
// ImageTransformService - Image Transformations (SRP)
// =============================================
// Handles rotate, crop, and resize operations on canvas.
// =============================================

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ImageTransformService = {
  rotate(image: HTMLImageElement, degrees: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const radians = (degrees * Math.PI) / 180;

    if (degrees === 90 || degrees === 270) {
      canvas.width = image.height;
      canvas.height = image.width;
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    return canvas;
  },

  crop(image: HTMLImageElement, rect: CropRect): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

    return canvas;
  },

  resize(image: HTMLImageElement, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    return canvas;
  },
};
