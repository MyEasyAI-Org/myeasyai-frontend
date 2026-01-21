import {
  Dumbbell,
  Zap,
  Footprints,
  Activity,
  Users,
  Sparkles,
  PersonStanding,
} from 'lucide-react';
import { IconRun } from '@tabler/icons-react';
import type { TrainingModality } from '../types';
import { TRAINING_MODALITY_CONFIG, MODALITY_WATERMARKS } from '../constants';
import { WatermarkIcon } from './shared';

type ModalidadeTabProps = {
  selectedModality: TrainingModality;
  onSelectModality: (modality: TrainingModality) => void;
};

// Modality icons mapping
const MODALITY_ICONS: Record<TrainingModality, React.ElementType> = {
  musculacao: Dumbbell,
  corrida: IconRun,
  crossfit: Zap,
  caminhada: Footprints,
  funcional: Activity,
  calistenia: Users,
  '': Dumbbell,
};

const MODALITY_COLORS: Record<TrainingModality, string> = {
  musculacao: 'from-blue-500 to-blue-600',
  corrida: 'from-green-500 to-green-600',
  crossfit: 'from-orange-500 to-orange-600',
  caminhada: 'from-teal-500 to-teal-600',
  funcional: 'from-purple-500 to-purple-600',
  calistenia: 'from-pink-500 to-pink-600',
  '': 'from-slate-500 to-slate-600',
};

// Modality Card Component
function ModalityCard({
  modality,
  isSelected,
  onClick,
}: {
  modality: TrainingModality;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (modality === '') return null;

  const Icon = MODALITY_ICONS[modality];
  const config = TRAINING_MODALITY_CONFIG[modality];
  const colorGradient = MODALITY_COLORS[modality];

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all text-left overflow-hidden ${
        isSelected
          ? 'border-lime-500 bg-lime-500/10 ring-2 ring-lime-500/30'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
      }`}
    >
      {/* Watermark */}
      {MODALITY_WATERMARKS[modality] && (
        <WatermarkIcon src={MODALITY_WATERMARKS[modality]} size="sm" />
      )}

      <div className="flex items-start gap-3 relative z-10">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white">{config.name}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{config.description}</p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
        </div>
      )}
    </button>
  );
}

// Benefits Card Component
function BenefitsCard({ modality }: { modality: TrainingModality }) {
  if (modality === '') return null;

  const config = TRAINING_MODALITY_CONFIG[modality];
  const Icon = MODALITY_ICONS[modality];
  const colorGradient = MODALITY_COLORS[modality];

  return (
    <div className="relative bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Watermark */}
      {MODALITY_WATERMARKS[modality] && (
        <WatermarkIcon src={MODALITY_WATERMARKS[modality]} size="lg" />
      )}

      {/* Header */}
      <div className="relative z-10 p-5 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-800/50">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorGradient}`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{config.name}</h3>
            <p className="text-sm text-slate-400">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Benefits Content */}
      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-lime-400" />
          <h4 className="text-lg font-semibold text-lime-400">Benefícios</h4>
        </div>
        <p className="text-slate-300 leading-relaxed text-[15px]">
          {config.beneficios}
        </p>
      </div>
    </div>
  );
}

// Main Component
export function ModalidadeTab({
  selectedModality,
  onSelectModality,
}: ModalidadeTabProps) {
  // Get available modalities
  const modalities: TrainingModality[] = ['musculacao', 'corrida', 'crossfit', 'caminhada', 'funcional', 'calistenia'];

  return (
    <div className="p-6 space-y-6">
      {/* Modality Selection */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Selecione sua Modalidade</h2>
        <p className="text-sm text-slate-400 mb-4">
          Escolha a modalidade de treino que mais combina com seus objetivos
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modalities.map((modality) => (
            <ModalityCard
              key={modality}
              modality={modality}
              isSelected={selectedModality === modality}
              onClick={() => onSelectModality(modality)}
            />
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      {selectedModality && (
        <BenefitsCard modality={selectedModality} />
      )}

      {/* Empty state when no modality selected */}
      {!selectedModality && (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/30 rounded-xl border border-slate-700">
          <div className="p-4 rounded-full bg-lime-500/20 mb-4">
            <PersonStanding className="h-10 w-10 text-lime-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Escolha uma modalidade</h3>
          <p className="text-slate-400 max-w-md">
            Selecione uma modalidade acima para conhecer mais sobre seus benefícios e pedir ao assistente para criar um treino personalizado.
          </p>
        </div>
      )}
    </div>
  );
}
