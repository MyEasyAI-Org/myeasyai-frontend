import { useState, memo, useMemo, useCallback } from 'react';
import {
  Dumbbell,
  Pencil,
  X,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import type { Treino, UserPersonalInfo, ExerciseAlternative } from '../types';
import { getExerciseAlternatives, modifyWorkout } from '../utils/workoutGenerator';
import { EXERCISE_DATABASE, type ExerciseInfo } from '../constants/exerciseDatabase';

type TreinosTabProps = {
  treinos: Treino[];
  personalInfo: UserPersonalInfo;
  onUpdateTreinos: (treinos: Treino[]) => void;
};

// Normalize string for comparison (remove accents, lowercase)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}

// Find exercise info from database by name
function findExerciseInfo(exerciseName: string): ExerciseInfo | null {
  const normalizedName = normalizeString(exerciseName);

  // Try exact match first (normalized)
  const exactMatch = EXERCISE_DATABASE.find(
    ex => normalizeString(ex.nome) === normalizedName ||
          normalizeString(ex.nomeIngles) === normalizedName
  );
  if (exactMatch) return exactMatch;

  // Try partial match (normalized)
  const partialMatch = EXERCISE_DATABASE.find(
    ex => normalizeString(ex.nome).includes(normalizedName) ||
          normalizedName.includes(normalizeString(ex.nome)) ||
          normalizeString(ex.nomeIngles).includes(normalizedName)
  );
  return partialMatch || null;
}

// Exercise Swap Modal Component
const ExerciseSwapModal = memo(function ExerciseSwapModal({
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
            <h3 className="text-lg font-semibold text-white">Trocar Exercício</h3>
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
              {alternatives.map((alt) => (
                <button
                  key={alt.nome}
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
              <p className="text-slate-400">Nenhuma alternativa disponível para este exercício.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Expandable Exercise Card Component
const ExpandableExerciseCard = memo(function ExpandableExerciseCard({
  exercise,
  exerciseIndex,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onSwap,
}: {
  exercise: { nome: string; series: number; repeticoes: string; descanso: string; observacao?: string };
  exerciseIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (field: string, value: string | number) => void;
  onDelete: () => void;
  onSwap: () => void;
}) {
  const [movementImageError, setMovementImageError] = useState(false);
  const exerciseInfo = useMemo(() => findExerciseInfo(exercise.nome), [exercise.nome]);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header - sempre visível */}
      <div className="p-4 flex items-center gap-4">
        {/* Thumbnail */}
        <button
          onClick={onToggle}
          className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 hover:ring-2 hover:ring-lime-500/50 transition-all"
        >
          {exerciseInfo && !movementImageError ? (
            <img
              src={exerciseInfo.imagemMovimento}
              alt={exercise.nome}
              className="w-full h-full object-cover"
              onError={() => setMovementImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-slate-500" />
            </div>
          )}
        </button>

        {/* Info e controles */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={exercise.nome}
            onChange={(e) => onUpdate('nome', e.target.value)}
            className="font-semibold text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-lime-500 outline-none w-full truncate"
          />
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Séries:</span>
              <input
                type="number"
                value={exercise.series}
                onChange={(e) => onUpdate('series', parseInt(e.target.value) || 0)}
                className="w-10 bg-slate-700 rounded px-1 py-0.5 text-lime-400 text-center"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Reps:</span>
              <input
                type="text"
                value={exercise.repeticoes}
                onChange={(e) => onUpdate('repeticoes', e.target.value)}
                className="w-14 bg-slate-700 rounded px-1 py-0.5 text-lime-400"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Descanso:</span>
              <input
                type="text"
                value={exercise.descanso}
                onChange={(e) => onUpdate('descanso', e.target.value)}
                className="w-12 bg-slate-700 rounded px-1 py-0.5 text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onSwap}
            className="p-2 text-slate-500 hover:text-lime-400 hover:bg-lime-400/10 rounded-lg transition-colors"
            title="Trocar exercício"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Remover exercício"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && exerciseInfo && (
        <div className="border-t border-slate-700">
          {/* GIF do exercício */}
          <div className="p-3 bg-slate-900/50">
            <div className="h-64 bg-slate-700/50 rounded-lg overflow-hidden">
              {!movementImageError ? (
                <img
                  src={exerciseInfo.imagemMovimento}
                  alt={`${exercise.nome} - movimento`}
                  className="w-full h-full object-contain"
                  onError={() => setMovementImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Dumbbell className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Imagem indisponível</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Grupos Musculares */}
            <div>
              <h4 className="text-sm font-medium text-lime-400 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Músculos Trabalhados
              </h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Principal:</p>
                  <div className="flex flex-wrap gap-1">
                    {exerciseInfo.gruposMusculares.principal.map((musculo, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-lime-500/20 text-lime-400 rounded text-xs"
                      >
                        {musculo}
                      </span>
                    ))}
                  </div>
                </div>
                {exerciseInfo.gruposMusculares.secundario.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Secundário:</p>
                    <div className="flex flex-wrap gap-1">
                      {exerciseInfo.gruposMusculares.secundario.map((musculo, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                        >
                          {musculo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Execução */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Como Executar</h4>
              <ol className="space-y-2">
                {exerciseInfo.descricaoMovimento.map((passo, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{passo}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Dicas */}
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-2">Dicas</h4>
              <ul className="space-y-1">
                {exerciseInfo.dicas.map((dica, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-400">
                    <span className="text-yellow-400">•</span>
                    <span>{dica}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Observação do exercício */}
      {exercise.observacao && (
        <div className="px-4 pb-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 italic pt-2">{exercise.observacao}</p>
        </div>
      )}
    </div>
  );
});

// Workout Card Component
const WorkoutCard = memo(function WorkoutCard({
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
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
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
    if (expandedExercise === index) {
      setExpandedExercise(null);
    }
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

      <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden">
        {/* Workout Header */}
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
                <Dumbbell className="h-5 w-5 text-lime-400" />
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
              <button
                onClick={onDelete}
                className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-4 space-y-3">
          {treino.exercicios.map((exercicio, idx) => (
            <ExpandableExerciseCard
              key={idx}
              exercise={exercicio}
              exerciseIndex={idx}
              isExpanded={expandedExercise === idx}
              onToggle={() => setExpandedExercise(expandedExercise === idx ? null : idx)}
              onUpdate={(field, value) => updateExercicio(idx, field, value)}
              onDelete={() => removeExercicio(idx)}
              onSwap={() => openSwapModal(idx)}
            />
          ))}

          <button
            onClick={addExercicio}
            className="w-full p-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar exercício
          </button>
        </div>
      </div>
    </>
  );
});

// Main Component
export const TreinosTab = memo(function TreinosTab({
  treinos,
  personalInfo,
  onUpdateTreinos,
}: TreinosTabProps) {
  const updateTreino = useCallback((treinoId: string, updates: Partial<Treino>) => {
    onUpdateTreinos(
      treinos.map((t) => (t.id === treinoId ? { ...t, ...updates } : t))
    );
  }, [treinos, onUpdateTreinos]);

  const deleteTreino = useCallback((treinoId: string) => {
    onUpdateTreinos(treinos.filter((t) => t.id !== treinoId));
  }, [treinos, onUpdateTreinos]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-lime-400" />
            Seus Treinos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {treinos.length} treino(s) configurado(s)
          </p>
        </div>
      </div>

      {treinos.length > 0 ? (
        <div className="space-y-6">
          {treinos.map((treino) => (
            <WorkoutCard
              key={treino.id}
              treino={treino}
              personalInfo={personalInfo}
              onUpdate={(updated) => updateTreino(treino.id, updated)}
              onDelete={() => deleteTreino(treino.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-800/30 rounded-xl border border-slate-700">
          <div className="p-4 rounded-full bg-lime-500/20 mb-4">
            <Dumbbell className="h-10 w-10 text-lime-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum treino configurado</h3>
          <p className="text-slate-400 max-w-md">
            Peça ao assistente para criar um treino personalizado para você. Basta dizer qual modalidade prefere e seus objetivos.
          </p>
        </div>
      )}
    </div>
  );
});
