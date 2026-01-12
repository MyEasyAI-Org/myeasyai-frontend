import { useState } from 'react';
import {
  Dumbbell,
  PersonStanding,
  Zap,
  Footprints,
  Activity,
  Users,
  Pencil,
  X,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import type { Treino, TrainingModality, UserPersonalInfo, ExerciseAlternative } from '../types';
import { TRAINING_MODALITY_CONFIG } from '../constants';
import { getExerciseAlternatives, modifyWorkout } from '../utils/workoutGenerator';

type ModalidadesTabProps = {
  treinos: Treino[];
  selectedModality: TrainingModality;
  personalInfo: UserPersonalInfo;
  onUpdateTreinos: (treinos: Treino[]) => void;
  onSelectModality: (modality: TrainingModality) => void;
};

// Modality icons mapping
const MODALITY_ICONS: Record<TrainingModality, React.ElementType> = {
  musculacao: Dumbbell,
  corrida: Footprints,
  crossfit: Zap,
  caminhada: PersonStanding,
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
  hasWorkouts,
  workoutCount,
  onClick,
}: {
  modality: TrainingModality;
  isSelected: boolean;
  hasWorkouts: boolean;
  workoutCount: number;
  onClick: () => void;
}) {
  if (modality === '') return null;

  const Icon = MODALITY_ICONS[modality];
  const config = TRAINING_MODALITY_CONFIG[modality];
  const colorGradient = MODALITY_COLORS[modality];

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all text-left ${
        isSelected
          ? 'border-lime-500 bg-lime-500/10'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white">{config.name}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{config.description}</p>
          {hasWorkouts && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs text-lime-400">{workoutCount} treino(s)</span>
            </div>
          )}
        </div>
        <ChevronRight className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-lime-400' : 'text-slate-500'}`} />
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full bg-lime-400" />
        </div>
      )}
    </button>
  );
}

// Exercise Swap Modal Component
function ExerciseSwapModal({
  isOpen,
  exerciseName,
  alternatives,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  exerciseName: string;
  alternatives: ExerciseAlternative[];
  onSelect: (alternative: ExerciseAlternative) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Trocar Exercicio</h3>
            <p className="text-sm text-slate-400">Substituir: {exerciseName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {alternatives.length > 0 ? (
            <div className="space-y-2">
              {alternatives.map((alt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(alt)}
                  className="w-full p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white group-hover:text-lime-400">{alt.nome}</p>
                      <p className="text-sm text-slate-400">{alt.motivo}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-lime-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">Nenhuma alternativa disponivel para este exercicio.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Workout Editor Component
function WorkoutEditor({
  treino,
  personalInfo,
  onUpdate,
  onDelete,
}: {
  treino: Treino;
  personalInfo: UserPersonalInfo;
  onUpdate: (treino: Treino) => void;
  onDelete: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(treino.nome);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapExerciseIndex, setSwapExerciseIndex] = useState<number | null>(null);
  const [swapAlternatives, setSwapAlternatives] = useState<ExerciseAlternative[]>([]);

  const updateExercicio = (index: number, field: string, value: string | number) => {
    const newExercicios = [...treino.exercicios];
    newExercicios[index] = { ...newExercicios[index], [field]: value };
    onUpdate({ ...treino, exercicios: newExercicios });
  };

  const removeExercicio = (index: number) => {
    onUpdate({
      ...treino,
      exercicios: treino.exercicios.filter((_, i) => i !== index),
    });
  };

  const addExercicio = () => {
    onUpdate({
      ...treino,
      exercicios: [
        ...treino.exercicios,
        { nome: 'Novo exercício', series: 3, repeticoes: '10-12', descanso: '60s' },
      ],
    });
  };

  const saveName = () => {
    onUpdate({ ...treino, nome: tempName });
    setEditingName(false);
  };

  const openSwapModal = (index: number) => {
    const exerciseName = treino.exercicios[index].nome;
    const alternatives = getExerciseAlternatives(exerciseName, personalInfo.lesoes);
    setSwapExerciseIndex(index);
    setSwapAlternatives(alternatives);
    setSwapModalOpen(true);
  };

  const handleSwapExercise = (alternative: ExerciseAlternative) => {
    if (swapExerciseIndex === null) return;

    const updatedTreino = modifyWorkout(treino, {
      type: 'substituir',
      exercicioIndex: swapExerciseIndex,
      exercicioNovo: alternative.nome,
      motivo: alternative.motivo,
    });

    onUpdate(updatedTreino);
    setSwapModalOpen(false);
    setSwapExerciseIndex(null);
  };

  return (
    <>
      <ExerciseSwapModal
        isOpen={swapModalOpen}
        exerciseName={swapExerciseIndex !== null ? treino.exercicios[swapExerciseIndex]?.nome || '' : ''}
        alternatives={swapAlternatives}
        onSelect={handleSwapExercise}
        onClose={() => {
          setSwapModalOpen(false);
          setSwapExerciseIndex(null);
        }}
      />
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="px-3 py-1 bg-slate-700 text-white rounded border border-lime-500 focus:outline-none"
                autoFocus
              />
              <button onClick={saveName} className="p-1 text-green-400 hover:bg-green-400/20 rounded">
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setTempName(treino.nome);
                  setEditingName(false);
                }}
                className="p-1 text-red-400 hover:bg-red-400/20 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{treino.nome}</h3>
              <button
                onClick={() => setEditingName(true)}
                className="p-1 text-slate-500 hover:text-lime-400 hover:bg-lime-400/10 rounded"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={treino.diaSemana}
              onChange={(e) => onUpdate({ ...treino, diaSemana: e.target.value })}
              className="px-3 py-1 bg-lime-500/20 text-lime-400 rounded-full text-sm border border-lime-500/30 focus:border-lime-500 focus:outline-none"
            />
            <button onClick={onDelete} className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-700/50">
        {treino.exercicios.map((exercicio, idx) => (
          <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={exercicio.nome}
                onChange={(e) => updateExercicio(idx, 'nome', e.target.value)}
                className="font-medium text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-lime-500 outline-none flex-1"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openSwapModal(idx)}
                  className="p-1 text-slate-500 hover:text-lime-400 hover:bg-lime-400/10 rounded"
                  title="Trocar exercicio"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button onClick={() => removeExercicio(idx)} className="p-1 text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Séries:</span>
                <input
                  type="number"
                  value={exercicio.series}
                  onChange={(e) => updateExercicio(idx, 'series', parseInt(e.target.value) || 0)}
                  className="w-12 bg-slate-700 rounded px-2 py-1 text-lime-400"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Reps:</span>
                <input
                  type="text"
                  value={exercicio.repeticoes}
                  onChange={(e) => updateExercicio(idx, 'repeticoes', e.target.value)}
                  className="w-16 bg-slate-700 rounded px-2 py-1 text-lime-400"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Descanso:</span>
                <input
                  type="text"
                  value={exercicio.descanso}
                  onChange={(e) => updateExercicio(idx, 'descanso', e.target.value)}
                  className="w-16 bg-slate-700 rounded px-2 py-1 text-slate-300"
                />
              </div>
            </div>
            {exercicio.observacao && (
              <p className="text-xs text-slate-500 mt-2 italic">{exercicio.observacao}</p>
            )}
          </div>
        ))}
        <button
          onClick={addExercicio}
          className="w-full p-3 text-lime-400 hover:bg-lime-400/10 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar exercício
        </button>
      </div>
    </div>
    </>
  );
}

// Main Component
export function ModalidadesTab({
  treinos,
  selectedModality,
  personalInfo,
  onUpdateTreinos,
  onSelectModality,
}: ModalidadesTabProps) {
  const [treinoSelecionado, setTreinoSelecionado] = useState<string | null>(
    treinos.length > 0 ? treinos[0].id : null
  );

  // Get available modalities
  const modalities: TrainingModality[] = ['musculacao', 'corrida', 'crossfit', 'caminhada', 'funcional', 'calistenia'];

  // Count workouts per modality (simple heuristic based on workout names)
  const getModalityWorkouts = (modality: TrainingModality) => {
    // For now, all workouts belong to the selected modality
    // In a more complex implementation, workouts would have a modality field
    if (selectedModality === modality) {
      return treinos;
    }
    return [];
  };

  const updateTreino = (treinoId: string, updates: Partial<Treino>) => {
    onUpdateTreinos(
      treinos.map((t) => (t.id === treinoId ? { ...t, ...updates } : t))
    );
  };

  const deleteTreino = (treinoId: string) => {
    const newTreinos = treinos.filter((t) => t.id !== treinoId);
    onUpdateTreinos(newTreinos);
    if (treinoSelecionado === treinoId) {
      setTreinoSelecionado(newTreinos.length > 0 ? newTreinos[0].id : null);
    }
  };

  const modalityWorkouts = selectedModality ? getModalityWorkouts(selectedModality) : [];
  const selectedTreino = treinos.find((t) => t.id === treinoSelecionado);

  return (
    <div className="p-6 space-y-6">
      {/* Modality Selection */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Selecione sua Modalidade</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modalities.map((modality) => (
            <ModalityCard
              key={modality}
              modality={modality}
              isSelected={selectedModality === modality}
              hasWorkouts={getModalityWorkouts(modality).length > 0}
              workoutCount={getModalityWorkouts(modality).length}
              onClick={() => onSelectModality(modality)}
            />
          ))}
        </div>
      </div>

      {/* Workouts Section */}
      {selectedModality && (
        <div className="pt-4 border-t border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-lime-400" />
            Seus Treinos de {TRAINING_MODALITY_CONFIG[selectedModality].name}
          </h2>

          {treinos.length > 0 ? (
            <div className="space-y-4">
              {/* Workout Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {treinos.map((treino) => (
                  <button
                    key={treino.id}
                    onClick={() => setTreinoSelecionado(treino.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      treinoSelecionado === treino.id
                        ? 'bg-lime-500 text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {treino.nome}
                  </button>
                ))}
              </div>

              {/* Selected Workout Editor */}
              {selectedTreino && (
                <WorkoutEditor
                  treino={selectedTreino}
                  personalInfo={personalInfo}
                  onUpdate={(updated) => updateTreino(selectedTreino.id, updated)}
                  onDelete={() => deleteTreino(selectedTreino.id)}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/30 rounded-xl border border-slate-700">
              <div className="p-4 rounded-full bg-lime-500/20 mb-4">
                <Dumbbell className="h-10 w-10 text-lime-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Nenhum treino configurado</h3>
              <p className="text-slate-400 max-w-md">
                Peça ao assistente para criar um treino de {TRAINING_MODALITY_CONFIG[selectedModality].name.toLowerCase()} personalizado para você.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no modality selected */}
      {!selectedModality && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-lime-500/20 mb-4">
            <Activity className="h-10 w-10 text-lime-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Escolha uma modalidade</h3>
          <p className="text-slate-400 max-w-md">
            Selecione uma modalidade de treino acima para ver seus treinos ou pedir ao assistente para criar um novo.
          </p>
        </div>
      )}
    </div>
  );
}
