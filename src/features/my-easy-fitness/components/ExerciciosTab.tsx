import { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X, Dumbbell, Info } from 'lucide-react';
import {
  EXERCISE_DATABASE,
  type ExerciseInfo,
} from '../constants/exerciseDatabase';
import { TAB_WATERMARKS } from '../constants';
import { WatermarkIcon } from './shared';

const CATEGORY_LABELS: Record<ExerciseInfo['categoria'], string> = {
  peito: 'Peito',
  costas: 'Costas',
  ombros: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  pernas: 'Pernas',
  core: 'Core',
  cardio: 'Cardio/Funcional',
  calistenia: 'Calistenia',
};

const NIVEL_COLORS: Record<ExerciseInfo['nivel'], string> = {
  iniciante: 'bg-green-500/20 text-green-400',
  intermediario: 'bg-yellow-500/20 text-yellow-400',
  avancado: 'bg-red-500/20 text-red-400',
};

const NIVEL_LABELS: Record<ExerciseInfo['nivel'], string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

// Filter options
const MUSCLE_GROUPS = [
  { id: 'peito', label: 'Peito' },
  { id: 'costas', label: 'Costas' },
  { id: 'ombros', label: 'Ombros' },
  { id: 'biceps', label: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps' },
  { id: 'pernas', label: 'Pernas' },
  { id: 'core', label: 'Abdômen' },
];

const DIFFICULTIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'iniciante', label: 'Iniciante' },
  { id: 'intermediario', label: 'Intermediário' },
  { id: 'avancado', label: 'Avançado' },
];

const MODALITIES = [
  { id: 'musculacao', label: 'Musculação' },
  { id: 'calistenia', label: 'Calistenia' },
  { id: 'funcional', label: 'Funcional' },
  { id: 'crossfit', label: 'CrossFit' },
  { id: 'cardio', label: 'Cardio' },
];

// Filter state type
interface FilterState {
  muscleGroups: string[];
  difficulty: string;
  modalities: string[];
}

// FilterChip Component
function FilterChip({ label, selected, onClick, multiSelect }: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multiSelect?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        selected
          ? 'bg-lime-500 text-black'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {multiSelect && selected && '✓ '}{label}
    </button>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise, isExpanded, onToggle }: {
  exercise: ExerciseInfo;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [movementImageError, setMovementImageError] = useState(false);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header - sempre visível */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/70 transition-colors text-left"
      >
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
          {!movementImageError ? (
            <img
              src={exercise.imagemMovimento}
              alt={exercise.nome}
              className="w-full h-full object-cover"
              onError={() => setMovementImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-slate-500" />
            </div>
          )}
        </div>

        {/* Info básica */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{exercise.nome}</h3>
          <p className="text-sm text-slate-400 truncate">{exercise.nomeIngles}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs ${NIVEL_COLORS[exercise.nivel]}`}>
              {NIVEL_LABELS[exercise.nivel]}
            </span>
            <span className="text-xs text-slate-500">{CATEGORY_LABELS[exercise.categoria]}</span>
          </div>
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0 text-slate-400">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="border-t border-slate-700">
          {/* GIF do exercício */}
          <div className="p-3 bg-slate-900/50">
            <div className="h-64 bg-slate-700/50 rounded-lg overflow-hidden">
              {!movementImageError ? (
                <img
                  src={exercise.imagemMovimento}
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
                    {exercise.gruposMusculares.principal.map((musculo, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-lime-500/20 text-lime-400 rounded text-xs"
                      >
                        {musculo}
                      </span>
                    ))}
                  </div>
                </div>
                {exercise.gruposMusculares.secundario.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Secundário:</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.gruposMusculares.secundario.map((musculo, idx) => (
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
                {exercise.descricaoMovimento.map((passo, idx) => (
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
                {exercise.dicas.map((dica, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-400">
                    <span className="text-yellow-400">•</span>
                    <span>{dica}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipamento e Modalidades */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-500 mb-1">Equipamento:</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.equipamento.map((eq, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Modalidades:</p>
                <div className="flex flex-wrap gap-1">
                  {exercise.modalidade.map((mod, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs capitalize"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Component
export function ExerciciosTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    muscleGroups: [],
    difficulty: 'todos',
    modalities: [],
  });
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Check if any filter is active
  const hasActiveFilters = filters.muscleGroups.length > 0 ||
    filters.difficulty !== 'todos' ||
    filters.modalities.length > 0;

  // Toggle muscle group selection
  const toggleMuscleGroup = (id: string) => {
    setFilters(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(id)
        ? prev.muscleGroups.filter(g => g !== id)
        : [...prev.muscleGroups, id],
    }));
  };

  // Toggle modality selection
  const toggleModality = (id: string) => {
    setFilters(prev => ({
      ...prev,
      modalities: prev.modalities.includes(id)
        ? prev.modalities.filter(m => m !== id)
        : [...prev.modalities, id],
    }));
  };

  // Set difficulty
  const setDifficulty = (id: string) => {
    setFilters(prev => ({ ...prev, difficulty: id }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      muscleGroups: [],
      difficulty: 'todos',
      modalities: [],
    });
    setSearchQuery('');
  };

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(ex => {
      // Text search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          ex.nome.toLowerCase().includes(query) ||
          ex.nomeIngles.toLowerCase().includes(query) ||
          ex.gruposMusculares.principal.some(m => m.toLowerCase().includes(query)) ||
          ex.gruposMusculares.secundario.some(m => m.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Muscle group filter (OR logic)
      if (filters.muscleGroups.length > 0) {
        if (!filters.muscleGroups.includes(ex.categoria)) return false;
      }

      // Difficulty filter
      if (filters.difficulty !== 'todos') {
        if (ex.nivel !== filters.difficulty) return false;
      }

      // Modality filter (OR logic)
      if (filters.modalities.length > 0) {
        const hasMatchingModality = ex.modalidade.some(m =>
          filters.modalities.includes(m)
        );
        if (!hasMatchingModality) return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Group by category for display
  const groupedExercises = useMemo(() => {
    const groups: Record<string, ExerciseInfo[]> = {};
    filteredExercises.forEach(ex => {
      if (!groups[ex.categoria]) {
        groups[ex.categoria] = [];
      }
      groups[ex.categoria].push(ex);
    });
    return groups;
  }, [filteredExercises]);

  return (
    <div className="relative p-6 space-y-6 overflow-hidden">
      {/* Tab Watermark */}
      <WatermarkIcon src={TAB_WATERMARKS.exercicios} size="lg" />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Biblioteca de Exercícios</h2>
            <p className="text-sm text-slate-400">
              {filteredExercises.length} exercícios disponíveis
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar exercício, músculo ou modalidade..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-lime-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters Toggle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="px-1.5 py-0.5 bg-lime-500 text-black text-xs rounded-full font-medium">
                  {filters.muscleGroups.length + (filters.difficulty !== 'todos' ? 1 : 0) + filters.modalities.length}
                </span>
              )}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-400 hover:text-lime-400 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {showFilters && (
            <div className="space-y-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
              {/* Muscle Groups - Multi-select */}
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium">Grupo Muscular</p>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map((group) => (
                    <FilterChip
                      key={group.id}
                      label={group.label}
                      selected={filters.muscleGroups.includes(group.id)}
                      onClick={() => toggleMuscleGroup(group.id)}
                      multiSelect
                    />
                  ))}
                </div>
              </div>

              {/* Difficulty - Single-select */}
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium">Dificuldade</p>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((diff) => (
                    <FilterChip
                      key={diff.id}
                      label={diff.label}
                      selected={filters.difficulty === diff.id}
                      onClick={() => setDifficulty(diff.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Modalities - Multi-select */}
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium">Modalidade</p>
                <div className="flex flex-wrap gap-2">
                  {MODALITIES.map((mod) => (
                    <FilterChip
                      key={mod.id}
                      label={mod.label}
                      selected={filters.modalities.includes(mod.id)}
                      onClick={() => toggleModality(mod.id)}
                      multiSelect
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exercise List */}
      {filteredExercises.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedExercises).map(([categoria, exercises]) => (
            <div key={categoria}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-lime-400">{CATEGORY_LABELS[categoria as ExerciseInfo['categoria']]}</span>
                <span className="text-sm text-slate-500">({exercises.length})</span>
              </h3>
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isExpanded={expandedExercise === exercise.id}
                    onToggle={() =>
                      setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-slate-800/50 mb-4">
            <Search className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum exercício encontrado</h3>
          <p className="text-slate-400 max-w-md">
            Tente buscar por outro termo ou remova os filtros aplicados.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-lime-500/20 text-lime-400 rounded-lg hover:bg-lime-500/30 transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
