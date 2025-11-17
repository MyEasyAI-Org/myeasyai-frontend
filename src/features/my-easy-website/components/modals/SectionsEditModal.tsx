import { Check } from 'lucide-react';
import { Modal } from '../../../../components/Modal';
import type { SectionKey } from '../../hooks/useSiteData';

type SectionsEditModalProps = {
  isOpen: boolean;
  sections: SectionKey[];
  onToggleSection: (section: string) => void;
  onClose: () => void;
};

const AVAILABLE_SECTIONS = [
  { label: 'Hero (Início)', value: 'hero' },
  { label: 'Sobre Nós', value: 'about' },
  { label: 'Serviços', value: 'services' },
  { label: 'Galeria', value: 'gallery' },
  { label: 'Preços', value: 'pricing' },
  { label: 'Equipe', value: 'team' },
  { label: 'FAQ', value: 'faq' },
  { label: 'App Download', value: 'app' },
  { label: 'Depoimentos', value: 'testimonials' },
  { label: 'Contato', value: 'contact' },
];

export function SectionsEditModal({
  isOpen,
  sections,
  onToggleSection,
  onClose,
}: SectionsEditModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📋 Selecione as Seções do Site">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Clique nas seções que você deseja incluir no seu site:
        </p>

        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_SECTIONS.map((section) => {
            const isSelected = sections.includes(section.value as SectionKey);
            return (
              <button
                key={section.value}
                onClick={() => onToggleSection(section.value)}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-slate-600 bg-slate-700 hover:border-purple-500 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <span className="text-sm font-medium">{section.label}</span>
                {isSelected && <Check className="h-5 w-5 text-purple-400" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            disabled={sections.length === 0}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar ({sections.length} seções)
          </button>
        </div>
      </div>
    </Modal>
  );
}
