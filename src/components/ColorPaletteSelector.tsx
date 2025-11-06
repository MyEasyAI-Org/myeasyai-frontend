import { Check, Loader2, Palette, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';
import {
  type ColorPalette,
  colorPalettes,
  getCategoryIcon,
} from '../constants/colorPalettes';
import { generateCustomColorPalettes } from '../lib/gemini';

interface ColorPaletteSelectorProps {
  onSelectPalette: (palette: ColorPalette) => void;
  onCustomColors: (description: string) => void;
  selectedPaletteId?: string;
}

export function ColorPaletteSelector({
  onSelectPalette,
  onCustomColors,
  selectedPaletteId,
}: ColorPaletteSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [isGeneratingPalettes, setIsGeneratingPalettes] = useState(false);
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([]);

  const categories = Array.from(new Set(colorPalettes.map((p) => p.category)));

  // Combinar paletas predefinidas com paletas customizadas
  const allPalettes = [...colorPalettes, ...customPalettes];

  const filteredPalettes = selectedCategory
    ? allPalettes.filter((p) => p.category === selectedCategory)
    : allPalettes;

  const handleCustomSubmit = async () => {
    if (!customDescription.trim()) return;

    setIsGeneratingPalettes(true);
    setShowCustom(false);

    try {
      console.log('🎨 Gerando paletas customizadas para:', customDescription);

      // Chamar a IA do Gemini para gerar paletas
      const aiPalettes = await generateCustomColorPalettes(customDescription);

      console.log('✅ Paletas geradas pela IA:', aiPalettes.length);

      // Atualizar estado com as novas paletas
      setCustomPalettes(aiPalettes);
      setSelectedCategory('custom'); // Mostrar categoria custom automaticamente

      // Ainda chamar o callback original para compatibilidade
      onCustomColors(customDescription);
    } catch (error) {
      console.error('❌ Erro ao gerar paletas customizadas:', error);
      // Em caso de erro, usar o método antigo
      onCustomColors(customDescription);
    } finally {
      setIsGeneratingPalettes(false);
      setCustomDescription('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Palette className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">
            Escolha as Cores do Seu Site
          </h3>
        </div>
        <span className="text-sm text-slate-400">
          {filteredPalettes.length} paletas disponíveis
        </span>
      </div>

      {/* Custom Colors Button */}
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="w-full flex items-center justify-center space-x-2 rounded-lg border-2 border-dashed border-purple-500 bg-purple-500/10 p-4 hover:bg-purple-500/20 transition-colors"
      >
        <Wand2 className="h-5 w-5 text-purple-400" />
        <span className="text-purple-300 font-semibold">
          ✨ Descrever Minhas Cores (IA Personalizada)
        </span>
      </button>

      {/* Custom Colors Input */}
      {showCustom && (
        <div className="rounded-lg border border-purple-500 bg-slate-800 p-4 space-y-3 animate-in slide-in-from-top">
          <p className="text-sm text-slate-300">
            Descreva as cores que você imagina para seu site. A IA vai criar uma
            paleta perfeita!
          </p>
          <div className="space-y-2">
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' &&
                !isGeneratingPalettes &&
                handleCustomSubmit()
              }
              placeholder='Ex: "azul e laranja vibrante" ou "verde escuro com dourado"'
              disabled={isGeneratingPalettes}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCustomSubmit}
                disabled={!customDescription.trim() || isGeneratingPalettes}
                className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 px-4 py-2 text-white font-semibold hover:from-purple-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPalettes ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Criando com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Gerar Paleta com IA</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCustom(false);
                  setCustomDescription('');
                }}
                disabled={isGeneratingPalettes}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isGeneratingPalettes && (
        <div className="rounded-lg border border-purple-500 bg-purple-500/10 p-6 text-center animate-in slide-in-from-top">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
            <h4 className="text-lg font-semibold text-purple-300">
              IA Criando suas Paletas...
            </h4>
          </div>
          <p className="text-sm text-purple-200 mb-2">
            🤖 Analisando suas preferências de cores
          </p>
          <p className="text-xs text-purple-300">
            Isso pode levar alguns segundos...
          </p>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-purple-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>🎨 Todas ({allPalettes.length})</span>
        </button>

        {/* Categoria Personalizadas (apenas se tiver paletas customizadas) */}
        {customPalettes.length > 0 && (
          <button
            onClick={() => setSelectedCategory('custom')}
            className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === 'custom'
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>✨</span>
            <span>Personalizadas ({customPalettes.length})</span>
          </button>
        )}

        {categories.map((category) => {
          const count = colorPalettes.filter(
            (p) => p.category === category,
          ).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{getCategoryIcon(category)}</span>
              <span className="capitalize">
                {category === 'neutral' ? 'Neutro' : category} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Palettes Grid */}
      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {filteredPalettes.map((palette) => {
          const isSelected = selectedPaletteId === palette.id;
          return (
            <button
              key={palette.id}
              onClick={() => onSelectPalette(palette)}
              className={`relative rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex items-center justify-center h-6 w-6 rounded-full bg-purple-500">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Palette Name */}
              <div className="mb-3">
                <h4 className="text-sm font-bold text-white text-left">
                  {palette.name}
                </h4>
                <span className="text-xs text-slate-400 capitalize">
                  {palette.category}
                </span>
              </div>

              {/* Color Swatches */}
              <div className="grid grid-cols-5 gap-1 mb-3">
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: palette.primary }}
                  title="Primary"
                />
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: palette.secondary }}
                  title="Secondary"
                />
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: palette.accent }}
                  title="Accent"
                />
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: palette.dark }}
                  title="Dark"
                />
                <div
                  className="h-8 rounded border border-slate-600"
                  style={{ backgroundColor: palette.light }}
                  title="Light"
                />
              </div>

              {/* Preview Text */}
              <div className="text-xs text-left space-y-1">
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <span className="text-slate-400">Primária</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <span className="text-slate-400">Secundária</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="rounded-lg bg-blue-900/30 border border-blue-700 p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Dica:</strong> Escolha cores que representem a identidade
          da sua marca. Use a opção de IA para criar paletas totalmente
          personalizadas!
        </p>
      </div>
    </div>
  );
}
