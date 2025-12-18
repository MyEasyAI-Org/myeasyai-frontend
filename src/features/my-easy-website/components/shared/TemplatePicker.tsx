import { Check, ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { TEMPLATE_CONFIGS, type TemplateConfig } from '../../constants/templateConfig';
import { TEMPLATE_STYLES } from '../../constants/templateStyles';
import { TemplateSelectModal } from '../modals/TemplateSelectModal';
import { TemplatePreview } from './TemplatePreview';

type TemplatePickerProps = {
  recommendedTemplateId: number;
  alternativeTemplateIds: number[];
  onSelect: (templateId: number) => void;
  onSkip?: () => void;
};

// Mini preview card para o chat com iframe do template real
function MiniTemplateCard({
  template,
  isRecommended,
  isSelected,
  onClick,
}: {
  template: TemplateConfig;
  isRecommended: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-500/30'
          : 'border-slate-700 hover:border-purple-500/50'
      }`}
      style={{ width: '100%' }}
    >
      {/* Badge */}
      {isRecommended && (
        <div className="absolute top-1 left-1 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[8px] font-bold shadow-lg">
          <Sparkles className="h-2 w-2" />
          Top
        </div>
      )}

      {isSelected && (
        <div className="absolute top-1 right-1 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white shadow-lg">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Preview Real do Template */}
      <div className="h-28 w-full overflow-hidden bg-slate-900">
        <TemplatePreview templateId={template.id} />
      </div>

      {/* Template Name */}
      <div className="px-2 py-1.5 bg-slate-800/90">
        <span className="text-[10px] font-medium text-white block truncate">
          {template.name}
        </span>
      </div>
    </button>
  );
}

export function TemplatePicker({
  recommendedTemplateId,
  alternativeTemplateIds,
  onSelect,
  onSkip,
}: TemplatePickerProps) {
  const [selectedId, setSelectedId] = useState<number>(recommendedTemplateId);
  const [showModal, setShowModal] = useState(false);

  const recommendedTemplate = TEMPLATE_CONFIGS.find(t => t.id === recommendedTemplateId);
  const alternativeTemplates = alternativeTemplateIds
    .map(id => TEMPLATE_CONFIGS.find(t => t.id === id))
    .filter((t): t is TemplateConfig => t !== undefined);

  const displayTemplates = [
    recommendedTemplate,
    ...alternativeTemplates.slice(0, 2),
  ].filter((t): t is TemplateConfig => t !== undefined);

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handleConfirm = () => {
    onSelect(selectedId);
  };

  const handleModalSelect = (id: number) => {
    setSelectedId(id);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Grid de Templates Recomendados */}
      <div>
        <p className="text-xs text-slate-400 mb-3">
          🎨 Escolha o visual do seu site:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {displayTemplates.map((template, idx) => (
            <MiniTemplateCard
              key={template.id}
              template={template}
              isRecommended={idx === 0}
              isSelected={selectedId === template.id}
              onClick={() => handleSelect(template.id)}
            />
          ))}
        </div>
      </div>

      {/* Botão Ver Mais */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-all text-sm"
      >
        Ver todos os 11 templates
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Preview do Template Selecionado */}
      {selectedId && (
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-400 font-semibold">✨ Selecionado:</p>
              <p className="text-sm text-white font-medium">
                {TEMPLATE_CONFIGS.find(t => t.id === selectedId)?.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {TEMPLATE_CONFIGS.find(t => t.id === selectedId)?.description}
              </p>
            </div>
            <div className="flex gap-0.5">
              {(() => {
                const style = TEMPLATE_STYLES.find(s => s.id === selectedId);
                return style ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full border border-slate-600"
                      style={{ backgroundColor: style.colors.primary }}
                      title="Cor primária"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-slate-600"
                      style={{ backgroundColor: style.colors.secondary }}
                      title="Cor secundária"
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-slate-600"
                      style={{ backgroundColor: style.colors.accent }}
                      title="Cor de destaque"
                    />
                  </>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 py-3 text-sm font-semibold text-white hover:from-purple-600 hover:to-blue-700 transition-colors"
        >
          <Check className="h-4 w-4" />
          Usar este template
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-3 rounded-lg border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Pular
          </button>
        )}
      </div>

      {/* Modal de Todos os Templates */}
      <TemplateSelectModal
        isOpen={showModal}
        selectedTemplateId={selectedId}
        recommendedTemplateId={recommendedTemplateId}
        onSelectTemplate={handleModalSelect}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
