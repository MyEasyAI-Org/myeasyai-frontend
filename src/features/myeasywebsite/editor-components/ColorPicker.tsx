import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  type ColorPalette,
  colorPalettes,
} from '../../../constants/colorPalettes';
import { useEditing } from './EditingContext';

export function ColorPicker() {
  const { selectedElement, updateElement } = useEditing();
  const [color, setColor] = useState(
    selectedElement?.currentValue || '#ea580c',
  );
  const [showAIInput, setShowAIInput] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [recentColors, setRecentColors] = useState<string[]>([
    '#ea580c',
    '#1a1a1a',
    '#fb923c',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
  ]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedElement) {
      updateElement(selectedElement.id, { color: newColor });
    }
  };

  const handleAddToRecent = () => {
    if (!recentColors.includes(color)) {
      setRecentColors((prev) => [color, ...prev].slice(0, 12));
    }
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setColor(value);
      if (value.length === 7) {
        handleColorChange(value);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Color Picker */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Escolher Cor
        </label>
        <div className="rounded-lg overflow-hidden border-2 border-slate-700">
          <HexColorPicker
            color={color}
            onChange={handleColorChange}
            style={{ width: '100%', height: '200px' }}
          />
        </div>
      </div>

      {/* Hex Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Código HEX
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={color}
            onChange={handleHexInput}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="#000000"
            maxLength={7}
          />
          <div
            className="w-12 h-10 rounded-lg border-2 border-slate-700 shadow-inner"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Recent Colors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-300">
            Cores Recentes
          </label>
          <button
            onClick={handleAddToRecent}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            + Adicionar atual
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {recentColors.map((recentColor, idx) => (
            <button
              key={idx}
              onClick={() => handleColorChange(recentColor)}
              className="w-full aspect-square rounded-lg border-2 hover:scale-110 transition-transform"
              style={{
                backgroundColor: recentColor,
                borderColor: color === recentColor ? '#a855f7' : '#475569',
              }}
              title={recentColor}
            />
          ))}
        </div>
      </div>

      {/* Paletas Profissionais Sugeridas */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          🎨 Paletas Profissionais Sugeridas
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
          {colorPalettes.slice(0, 12).map((palette: ColorPalette) => (
            <button
              key={palette.id}
              onClick={() => handleColorChange(palette.primary)}
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-purple-500 transition-all hover:scale-105"
            >
              <div className="flex gap-1">
                <div
                  className="w-4 h-8 rounded"
                  style={{ backgroundColor: palette.primary }}
                ></div>
                <div
                  className="w-4 h-8 rounded"
                  style={{ backgroundColor: palette.secondary }}
                ></div>
                <div
                  className="w-4 h-8 rounded"
                  style={{ backgroundColor: palette.accent }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-200 truncate flex-1 text-left">
                {palette.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Opção de Descrever Cores com IA */}
      <div className="border-t border-slate-700 pt-4">
        <button
          onClick={() => setShowAIInput(!showAIInput)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-colors group"
        >
          <Sparkles className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-semibold text-purple-300">
            💡 Ou digite as cores do jeito que você imagina
          </span>
        </button>

        {showAIInput && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              placeholder="Ex: azul e amarelo, roxo com rosa, verde marinho..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => {
                // Aqui você pode chamar a IA para gerar paletas
                console.log('Gerar paletas para:', aiDescription);
                setShowAIInput(false);
                setAiDescription('');
              }}
              disabled={!aiDescription.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gerar Paletas com IA
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-400">
          💡 <strong className="text-slate-300">Dica:</strong> Esta cor será
          aplicada ao elemento selecionado quando você clicar em "Aplicar
          Mudanças"
        </p>
      </div>
    </div>
  );
}
