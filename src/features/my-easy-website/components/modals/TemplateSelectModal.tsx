import { Check, Sparkles } from 'lucide-react';
import { Modal } from '../../../../components/Modal';
import { TEMPLATE_CONFIGS, type TemplateConfig } from '../../constants/templateConfig';
import { TEMPLATE_STYLES } from '../../constants/templateStyles';
import { TemplatePreview } from '../shared/TemplatePreview';

type TemplateSelectModalProps = {
  isOpen: boolean;
  selectedTemplateId?: number;
  recommendedTemplateId?: number;
  onSelectTemplate: (templateId: number) => void;
  onClose: () => void;
};

// Componente de preview visual do template com iframe real
function TemplatePreviewCard({
  template,
  isSelected,
  isRecommended,
  onClick,
}: {
  template: TemplateConfig;
  isSelected: boolean;
  isRecommended: boolean;
  onClick: () => void;
}) {
  const style = TEMPLATE_STYLES.find(s => s.id === template.id);
  const colors = style?.colors || {
    primary: '#6366f1',
    secondary: '#1a1a1a',
    accent: '#ec4899',
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-500/30'
          : 'border-slate-700 hover:border-purple-500/50'
      }`}
    >
      {/* Badge de Recomendado */}
      {isRecommended && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-bold shadow-lg">
          <Sparkles className="h-3 w-3" />
          Recomendado
        </div>
      )}

      {/* Badge de Selecionado */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white shadow-lg">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Preview Real do Template com iframe */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <TemplatePreview templateId={template.id} />

        {/* Overlay sutil no hover */}
        <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
      </div>

      {/* Info do Template */}
      <div className="p-3 bg-slate-800/80">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-white">{template.name}</span>
          <div className="flex gap-0.5">
            <div
              className="w-3 h-3 rounded-full border border-slate-600"
              style={{ backgroundColor: colors.primary }}
              title="Cor primária"
            />
            <div
              className="w-3 h-3 rounded-full border border-slate-600"
              style={{ backgroundColor: colors.secondary }}
              title="Cor secundária"
            />
            <div
              className="w-3 h-3 rounded-full border border-slate-600"
              style={{ backgroundColor: colors.accent }}
              title="Cor de destaque"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 line-clamp-2">
          {template.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {template.bestFor.slice(0, 2).map((item, i) => (
            <span
              key={i}
              className="text-[8px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

export function TemplateSelectModal({
  isOpen,
  selectedTemplateId,
  recommendedTemplateId,
  onSelectTemplate,
  onClose,
}: TemplateSelectModalProps) {
  // Ordenar templates: recomendado primeiro, depois o resto
  const sortedTemplates = [...TEMPLATE_CONFIGS].sort((a, b) => {
    if (a.id === recommendedTemplateId) return -1;
    if (b.id === recommendedTemplateId) return 1;
    return a.id - b.id;
  });

  const handleConfirm = () => {
    if (selectedTemplateId) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🎨 Escolha o Template do Seu Site"
      dialogClassName="max-w-6xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Selecione o visual que melhor representa seu negócio. Cada template tem fontes e estilo únicos.
        </p>

        {/* Grid de Templates - 3 por linha */}
        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 py-2">
          {sortedTemplates.map((template) => (
            <TemplatePreviewCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              isRecommended={recommendedTemplateId === template.id}
              onClick={() => onSelectTemplate(template.id)}
            />
          ))}
        </div>

        {/* Template Selecionado */}
        {selectedTemplateId && (
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
              <div>
                <p className="text-xs text-purple-400 font-semibold">✨ Template selecionado:</p>
                <p className="text-white font-medium">
                  {TEMPLATE_CONFIGS.find(t => t.id === selectedTemplateId)?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {TEMPLATE_CONFIGS.find(t => t.id === selectedTemplateId)?.theme}
                </span>
                {(() => {
                  const style = TEMPLATE_STYLES.find(s => s.id === selectedTemplateId);
                  return style ? (
                    <div className="flex gap-0.5">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-600"
                        style={{ backgroundColor: style.colors.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-slate-600"
                        style={{ backgroundColor: style.colors.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-slate-600"
                        style={{ backgroundColor: style.colors.accent }}
                      />
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTemplateId}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Confirmar Template
          </button>
        </div>
      </div>
    </Modal>
  );
}
