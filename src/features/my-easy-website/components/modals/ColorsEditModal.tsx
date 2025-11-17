import { Check } from 'lucide-react';
import { Modal } from '../../../../components/Modal';
import type { ColorPalette } from '../../../../constants/colorPalettes';

type ColorsEditModalProps = {
  isOpen: boolean;
  selectedPaletteId?: string;
  palettes: ColorPalette[];
  onSelectPalette: (palette: ColorPalette) => void;
  onCustomColors?: (description: string) => Promise<void>;
  onClose: () => void;
};

export function ColorsEditModal({
  isOpen,
  selectedPaletteId,
  palettes,
  onSelectPalette,
  onCustomColors,
  onClose,
}: ColorsEditModalProps) {
  const handleCustomColorKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() && onCustomColors) {
      const description = e.currentTarget.value.trim();
      onClose();
      await onCustomColors(description);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎨 Escolha as Cores do Seu Site">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Selecione uma paleta de cores ou descreva suas cores customizadas:
        </p>

        {/* Paletas Sugeridas */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Paletas Sugeridas:</h4>
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {palettes.slice(0, 12).map((palette) => {
              const isSelected = selectedPaletteId === palette.id;
              return (
                <button
                  key={palette.id}
                  onClick={() => onSelectPalette(palette)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-slate-600 bg-slate-700 hover:border-purple-500'
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-12 rounded"
                      style={{ backgroundColor: palette.primary }}
                    ></div>
                    <div
                      className="w-6 h-12 rounded"
                      style={{ backgroundColor: palette.secondary }}
                    ></div>
                    <div
                      className="w-6 h-12 rounded"
                      style={{ backgroundColor: palette.accent }}
                    ></div>
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-xs font-medium text-slate-200 block">
                      {palette.name}
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-purple-400 mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ou Descrever Cores Customizadas */}
        {onCustomColors && (
          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm font-semibold text-white mb-3">
              Ou digite as cores do jeito que você imagina:
            </p>
            <input
              type="text"
              placeholder="Ex: azul e amarelo, roxo com rosa, verde marinho..."
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={handleCustomColorKeyPress}
            />
            <p className="text-xs text-slate-500 mt-2">
              💡 Pressione Enter para gerar paletas com IA baseadas na sua descrição
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
