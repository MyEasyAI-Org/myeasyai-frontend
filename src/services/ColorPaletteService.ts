import type { ColorPalette } from '../constants/colorPalettes';
import { colorPalettes, getCategoryColor, getCategoryIcon } from '../constants/colorPalettes';
import { contentRewritingService } from './ContentRewritingService';

/**
 * Service responsible for managing color palettes
 * Handles palette selection, filtering, and AI-generated custom palettes
 */
export class ColorPaletteService {
  /**
   * Get all available color palettes
   */
  getPalettes(): ColorPalette[] {
    return colorPalettes;
  }

  /**
   * Get palettes filtered by category
   */
  getPalettesByCategory(category: string | null): ColorPalette[] {
    if (!category) {
      return colorPalettes;
    }
    return colorPalettes.filter((palette) => palette.category === category);
  }

  /**
   * Get a specific palette by ID
   */
  getPaletteById(id: string): ColorPalette | undefined {
    return colorPalettes.find((palette) => palette.id === id);
  }

  /**
   * Get first N palettes (for preview)
   */
  getPreviewPalettes(count: number = 12): ColorPalette[] {
    return colorPalettes.slice(0, count);
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    colorPalettes.forEach((palette) => {
      categories.add(palette.category);
    });
    return Array.from(categories);
  }

  /**
   * Get category color (for UI display)
   */
  getCategoryColor(category: string): string {
    return getCategoryColor(category);
  }

  /**
   * Get category icon (for UI display)
   */
  getCategoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  /**
   * Generate custom color palettes using AI
   * Uses ContentRewritingService to generate palettes based on business description
   */
  async generateCustomPalettes(description: string): Promise<ColorPalette[]> {
    console.log('🎨 ColorPaletteService: Generating custom palettes...');

    try {
      const palettes = await contentRewritingService.generateCustomColorPalettes(description);
      console.log('✅ ColorPaletteService: Generated custom palettes:', palettes.length);
      return palettes;
    } catch (error) {
      console.error('❌ ColorPaletteService: Error generating custom palettes:', error);
      // Fallback: return first 3 palettes as suggestion
      return this.getPreviewPalettes(3);
    }
  }

  /**
   * Convert palette to colors object (for site data)
   */
  paletteToColors(palette: ColorPalette): string {
    return JSON.stringify({
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      dark: palette.dark,
      light: palette.light,
    });
  }

  /**
   * Parse colors string to object
   */
  parseColors(colorsString: string): {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
  } {
    try {
      return JSON.parse(colorsString);
    } catch {
      // Fallback to first palette
      const defaultPalette = colorPalettes[0];
      return {
        primary: defaultPalette.primary,
        secondary: defaultPalette.secondary,
        accent: defaultPalette.accent,
        dark: defaultPalette.dark,
        light: defaultPalette.light,
      };
    }
  }

  /**
   * Validate if colors object is valid
   */
  isValidColorPalette(palette: Partial<ColorPalette>): boolean {
    return !!(
      palette.primary &&
      palette.secondary &&
      palette.accent &&
      palette.dark &&
      palette.light
    );
  }
}

// Singleton instance
export const colorPaletteService = new ColorPaletteService();
