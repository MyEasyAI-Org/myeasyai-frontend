import { useState } from 'react';
import type { ColorPalette } from '../../../constants/colorPalettes';
import { colorPaletteService } from '../../../services/ColorPaletteService';

/**
 * Hook for managing color palettes in MyEasyWebsite
 * Handles palette selection, filtering, and AI-generated custom palettes
 */
export function useColorPalettes() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatedPalettes, setGeneratedPalettes] = useState<ColorPalette[]>([]);
  const [isGeneratingPalettes, setIsGeneratingPalettes] = useState(false);

  /**
   * Get all available palettes
   */
  const getAllPalettes = () => {
    return colorPaletteService.getPalettes();
  };

  /**
   * Get palettes filtered by current category
   */
  const getFilteredPalettes = () => {
    return colorPaletteService.getPalettesByCategory(selectedCategory);
  };

  /**
   * Get preview palettes (first 12)
   */
  const getPreviewPalettes = () => {
    return colorPaletteService.getPreviewPalettes(12);
  };

  /**
   * Get all available categories
   */
  const getCategories = () => {
    return colorPaletteService.getCategories();
  };

  /**
   * Select a category to filter palettes
   */
  const selectCategory = (category: string | null) => {
    setSelectedCategory(category);
  };

  /**
   * Generate custom palettes using AI
   */
  const generateCustomPalettes = async (description: string) => {
    setIsGeneratingPalettes(true);

    try {
      const palettes = await colorPaletteService.generateCustomPalettes(description);
      setGeneratedPalettes(palettes);
      return palettes;
    } catch (error) {
      console.error('Error generating custom palettes:', error);
      return [];
    } finally {
      setIsGeneratingPalettes(false);
    }
  };

  /**
   * Clear generated palettes
   */
  const clearGeneratedPalettes = () => {
    setGeneratedPalettes([]);
  };

  /**
   * Get palette by ID
   */
  const getPaletteById = (id: string) => {
    return colorPaletteService.getPaletteById(id);
  };

  /**
   * Convert palette to colors string
   */
  const paletteToColors = (palette: ColorPalette) => {
    return colorPaletteService.paletteToColors(palette);
  };

  return {
    // State
    selectedCategory,
    generatedPalettes,
    isGeneratingPalettes,

    // Actions
    selectCategory,
    generateCustomPalettes,
    clearGeneratedPalettes,

    // Getters
    getAllPalettes,
    getFilteredPalettes,
    getPreviewPalettes,
    getCategories,
    getPaletteById,
    paletteToColors,
  };
}
