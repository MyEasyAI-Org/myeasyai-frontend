import {
  Activity,
  Apple,
  Dumbbell,
  Flame,
  Heart,
  LayoutDashboard,
  Salad,
  Target,
  User,
  Scale,
  Ruler,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Pencil,
  X,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { UserAnamnese, Treino, Dieta } from '../types';

type TabId = 'visao-geral' | 'anamnese' | 'treinos' | 'dieta';

type FitnessVisualizationPanelProps = {
  anamnese: UserAnamnese;
  treinos: Treino[];
  dieta: Dieta | null;
  onUpdateAnamnese: (anamnese: UserAnamnese) => void;
  onUpdateTreinos: (treinos: Treino[]) => void;
  onUpdateDieta: (dieta: Dieta | null) => void;
};

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
        active
          ? 'text-lime-400 border-lime-400 bg-lime-400/10'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

// Editable Field Component
function EditableField({
  label,
  value,
  onSave,
  type = 'text',
  suffix = '',
  options,
}: {
  label: string;
  value: string | number;
  onSave: (value: string) => void;
  type?: 'text' | 'number' | 'select';
  suffix?: string;
  options?: { value: string; label: string }[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const displayValue = value ? `${value}${suffix}` : '--';

  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
      <span className="text-slate-400">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-2">
          {type === 'select' && options ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
            >
              <option value="">Selecione...</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm w-24"
              autoFocus
            />
          )}
          <button onClick={handleSave} className="p-1 text-green-400 hover:bg-green-400/20 rounded">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={handleCancel} className="p-1 text-red-400 hover:bg-red-400/20 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{displayValue}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-500 hover:text-lime-400 hover:bg-lime-400/10 rounded transition-colors"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// Visão Geral Tab
function VisaoGeralTab({
  anamnese,
  treinos,
  dieta,
}: {
  anamnese: UserAnamnese;
  treinos: Treino[];
  dieta: Dieta | null;
}) {
  const imc =
    anamnese.peso && anamnese.altura
      ? (anamnese.peso / Math.pow(anamnese.altura / 100, 2)).toFixed(1)
      : null;

  const getImcStatus = (imc: number) => {
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-yellow-400' };
    if (imc < 25) return { label: 'Peso normal', color: 'text-green-400' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-orange-400' };
    return { label: 'Obesidade', color: 'text-red-400' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Scale className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">Peso</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {anamnese.peso ? `${anamnese.peso} kg` : '--'}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Ruler className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">Altura</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {anamnese.altura ? `${anamnese.altura} cm` : '--'}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Activity className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">IMC</span>
          </div>
          <p className="text-2xl font-bold text-white">{imc || '--'}</p>
          {imc && (
            <p className={`text-xs ${getImcStatus(parseFloat(imc)).color}`}>
              {getImcStatus(parseFloat(imc)).label}
            </p>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-sm text-slate-400">Meta Calorica</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {dieta?.calorias ? `${dieta.calorias}` : '--'}
          </p>
          <p className="text-xs text-slate-500">kcal/dia</p>
        </div>
      </div>

      {/* Objetivo */}
      {anamnese.objetivo && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Seu Objetivo</span>
          </div>
          <p className="text-slate-300">{anamnese.objetivo}</p>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Treinos</span>
          </div>
          {treinos.length > 0 ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">{treinos.length} treino(s) configurado(s)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Nenhum treino configurado</span>
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Salad className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Dieta</span>
          </div>
          {dieta ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Dieta configurada</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Nenhuma dieta configurada</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!anamnese.nome && treinos.length === 0 && !dieta && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-lime-500/20 mb-4">
            <LayoutDashboard className="h-10 w-10 text-lime-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Bem-vindo ao MyEasyFitness!</h3>
          <p className="text-slate-400 max-w-md">
            Converse com o assistente para configurar seu perfil, treinos e dieta personalizados.
          </p>
        </div>
      )}
    </div>
  );
}

// Anamnese Tab
function AnamneseTab({
  anamnese,
  onUpdate,
}: {
  anamnese: UserAnamnese;
  onUpdate: (anamnese: UserAnamnese) => void;
}) {
  const [newRestricao, setNewRestricao] = useState('');
  const [newLesao, setNewLesao] = useState('');

  const updateField = (field: keyof UserAnamnese, value: string) => {
    if (field === 'idade' || field === 'peso' || field === 'altura') {
      onUpdate({ ...anamnese, [field]: parseFloat(value) || 0 });
    } else {
      onUpdate({ ...anamnese, [field]: value });
    }
  };

  const addRestricao = () => {
    if (newRestricao.trim()) {
      onUpdate({
        ...anamnese,
        restricoesMedicas: [...anamnese.restricoesMedicas, newRestricao.trim()],
      });
      setNewRestricao('');
    }
  };

  const removeRestricao = (index: number) => {
    onUpdate({
      ...anamnese,
      restricoesMedicas: anamnese.restricoesMedicas.filter((_, i) => i !== index),
    });
  };

  const addLesao = () => {
    if (newLesao.trim()) {
      onUpdate({
        ...anamnese,
        lesoes: [...anamnese.lesoes, newLesao.trim()],
      });
      setNewLesao('');
    }
  };

  const removeLesao = (index: number) => {
    onUpdate({
      ...anamnese,
      lesoes: anamnese.lesoes.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Dados Pessoais */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-lime-400" />
          Dados Pessoais
        </h3>
        <div className="space-y-1">
          <EditableField
            label="Nome"
            value={anamnese.nome}
            onSave={(v) => updateField('nome', v)}
          />
          <EditableField
            label="Idade"
            value={anamnese.idade || ''}
            onSave={(v) => updateField('idade', v)}
            type="number"
            suffix=" anos"
          />
          <EditableField
            label="Sexo"
            value={anamnese.sexo}
            onSave={(v) => updateField('sexo', v)}
            type="select"
            options={[
              { value: 'masculino', label: 'Masculino' },
              { value: 'feminino', label: 'Feminino' },
            ]}
          />
          <EditableField
            label="Peso"
            value={anamnese.peso || ''}
            onSave={(v) => updateField('peso', v)}
            type="number"
            suffix=" kg"
          />
          <EditableField
            label="Altura"
            value={anamnese.altura || ''}
            onSave={(v) => updateField('altura', v)}
            type="number"
            suffix=" cm"
          />
        </div>
      </div>

      {/* Objetivo e Nivel */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-lime-400" />
          Objetivo e Atividade
        </h3>
        <div className="space-y-1">
          <EditableField
            label="Objetivo"
            value={anamnese.objetivo}
            onSave={(v) => updateField('objetivo', v)}
          />
          <EditableField
            label="Nivel de Atividade"
            value={anamnese.nivelAtividade}
            onSave={(v) => updateField('nivelAtividade', v)}
            type="select"
            options={[
              { value: 'sedentario', label: 'Sedentario' },
              { value: 'leve', label: 'Levemente ativo' },
              { value: 'moderado', label: 'Moderadamente ativo' },
              { value: 'intenso', label: 'Muito ativo' },
            ]}
          />
        </div>
      </div>

      {/* Restricoes */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-lime-400" />
          Saude
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm mb-2">Restricoes Medicas</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {anamnese.restricoesMedicas.map((restricao, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1"
                >
                  {restricao}
                  <button onClick={() => removeRestricao(idx)} className="hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRestricao}
                onChange={(e) => setNewRestricao(e.target.value)}
                placeholder="Adicionar restricao..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addRestricao()}
              />
              <button
                onClick={addRestricao}
                className="p-1 bg-lime-500/20 text-lime-400 rounded hover:bg-lime-500/30"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Lesoes</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {anamnese.lesoes.map((lesao, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm flex items-center gap-1"
                >
                  {lesao}
                  <button onClick={() => removeLesao(idx)} className="hover:text-orange-300">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLesao}
                onChange={(e) => setNewLesao(e.target.value)}
                placeholder="Adicionar lesao..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addLesao()}
              />
              <button
                onClick={addLesao}
                className="p-1 bg-lime-500/20 text-lime-400 rounded hover:bg-lime-500/30"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Treinos Tab
function TreinosTab({
  treinos,
  onUpdate,
}: {
  treinos: Treino[];
  onUpdate: (treinos: Treino[]) => void;
}) {
  const [treinoSelecionado, setTreinoSelecionado] = useState<string | null>(
    treinos.length > 0 ? treinos[0].id : null
  );
  const [editingTreino, setEditingTreino] = useState<string | null>(null);

  const treino = treinos.find((t) => t.id === treinoSelecionado);

  const updateTreinoNome = (id: string, nome: string) => {
    onUpdate(treinos.map((t) => (t.id === id ? { ...t, nome } : t)));
    setEditingTreino(null);
  };

  const updateTreinoDia = (id: string, diaSemana: string) => {
    onUpdate(treinos.map((t) => (t.id === id ? { ...t, diaSemana } : t)));
  };

  const removeTreino = (id: string) => {
    const newTreinos = treinos.filter((t) => t.id !== id);
    onUpdate(newTreinos);
    if (treinoSelecionado === id) {
      setTreinoSelecionado(newTreinos.length > 0 ? newTreinos[0].id : null);
    }
  };

  const updateExercicio = (
    treinoId: string,
    exercicioIndex: number,
    field: string,
    value: string | number
  ) => {
    onUpdate(
      treinos.map((t) => {
        if (t.id !== treinoId) return t;
        const newExercicios = [...t.exercicios];
        newExercicios[exercicioIndex] = { ...newExercicios[exercicioIndex], [field]: value };
        return { ...t, exercicios: newExercicios };
      })
    );
  };

  const removeExercicio = (treinoId: string, exercicioIndex: number) => {
    onUpdate(
      treinos.map((t) => {
        if (t.id !== treinoId) return t;
        return { ...t, exercicios: t.exercicios.filter((_, i) => i !== exercicioIndex) };
      })
    );
  };

  const addExercicio = (treinoId: string) => {
    onUpdate(
      treinos.map((t) => {
        if (t.id !== treinoId) return t;
        return {
          ...t,
          exercicios: [
            ...t.exercicios,
            { nome: 'Novo exercicio', series: 3, repeticoes: '10-12', descanso: '60s' },
          ],
        };
      })
    );
  };

  return (
    <div className="p-6 space-y-6">
      {treinos.length > 0 ? (
        <>
          {/* Seletor de Treino */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {treinos.map((t) => (
              <div key={t.id} className="flex items-center gap-1">
                {editingTreino === t.id ? (
                  <input
                    type="text"
                    defaultValue={t.nome}
                    onBlur={(e) => updateTreinoNome(t.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateTreinoNome(t.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-700 text-white border border-lime-500"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setTreinoSelecionado(t.id)}
                    onDoubleClick={() => setEditingTreino(t.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      treinoSelecionado === t.id
                        ? 'bg-lime-500 text-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t.nome}
                  </button>
                )}
                <button
                  onClick={() => removeTreino(t.id)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Detalhes do Treino */}
          {treino && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{treino.nome}</h3>
                  <input
                    type="text"
                    value={treino.diaSemana}
                    onChange={(e) => updateTreinoDia(treino.id, e.target.value)}
                    className="px-3 py-1 bg-lime-500/20 text-lime-400 rounded-full text-sm border border-lime-500/30 focus:border-lime-500"
                  />
                </div>
              </div>
              <div className="divide-y divide-slate-700/50">
                {treino.exercicios.map((exercicio, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={exercicio.nome}
                        onChange={(e) => updateExercicio(treino.id, idx, 'nome', e.target.value)}
                        className="font-medium text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-lime-500 outline-none"
                      />
                      <button
                        onClick={() => removeExercicio(treino.id, idx)}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Series:</span>
                        <input
                          type="number"
                          value={exercicio.series}
                          onChange={(e) =>
                            updateExercicio(treino.id, idx, 'series', parseInt(e.target.value) || 0)
                          }
                          className="w-12 bg-slate-700 rounded px-2 py-1 text-lime-400"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Reps:</span>
                        <input
                          type="text"
                          value={exercicio.repeticoes}
                          onChange={(e) => updateExercicio(treino.id, idx, 'repeticoes', e.target.value)}
                          className="w-16 bg-slate-700 rounded px-2 py-1 text-lime-400"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Descanso:</span>
                        <input
                          type="text"
                          value={exercicio.descanso}
                          onChange={(e) => updateExercicio(treino.id, idx, 'descanso', e.target.value)}
                          className="w-16 bg-slate-700 rounded px-2 py-1 text-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addExercicio(treino.id)}
                  className="w-full p-3 text-lime-400 hover:bg-lime-400/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar exercicio
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-lime-500/20 mb-4">
            <Dumbbell className="h-10 w-10 text-lime-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum treino configurado</h3>
          <p className="text-slate-400 max-w-md">
            Peca ao assistente para criar uma planilha de treino personalizada para voce.
          </p>
        </div>
      )}
    </div>
  );
}

// Dieta Tab
function DietaTab({ dieta, onUpdate }: { dieta: Dieta | null; onUpdate: (dieta: Dieta | null) => void }) {
  const updateMacro = (field: keyof Dieta, value: number) => {
    if (!dieta) return;
    onUpdate({ ...dieta, [field]: value });
  };

  const updateRefeicao = (index: number, field: string, value: string) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    newRefeicoes[index] = { ...newRefeicoes[index], [field]: value };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  };

  const updateAlimento = (refeicaoIndex: number, alimentoIndex: number, value: string) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    const newAlimentos = [...newRefeicoes[refeicaoIndex].alimentos];
    newAlimentos[alimentoIndex] = value;
    newRefeicoes[refeicaoIndex] = { ...newRefeicoes[refeicaoIndex], alimentos: newAlimentos };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  };

  const removeAlimento = (refeicaoIndex: number, alimentoIndex: number) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    newRefeicoes[refeicaoIndex] = {
      ...newRefeicoes[refeicaoIndex],
      alimentos: newRefeicoes[refeicaoIndex].alimentos.filter((_, i) => i !== alimentoIndex),
    };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  };

  const addAlimento = (refeicaoIndex: number) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    newRefeicoes[refeicaoIndex] = {
      ...newRefeicoes[refeicaoIndex],
      alimentos: [...newRefeicoes[refeicaoIndex].alimentos, 'Novo alimento'],
    };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  };

  const removeRefeicao = (index: number) => {
    if (!dieta) return;
    onUpdate({ ...dieta, refeicoes: dieta.refeicoes.filter((_, i) => i !== index) });
  };

  const addRefeicao = () => {
    if (!dieta) return;
    onUpdate({
      ...dieta,
      refeicoes: [...dieta.refeicoes, { nome: 'Nova refeicao', horario: '12:00', alimentos: [] }],
    });
  };

  return (
    <div className="p-6 space-y-6">
      {dieta ? (
        <>
          {/* Macros */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <input
                type="number"
                value={dieta.calorias}
                onChange={(e) => updateMacro('calorias', parseInt(e.target.value) || 0)}
                className="text-2xl font-bold text-white bg-transparent text-center w-full"
              />
              <p className="text-xs text-slate-400">kcal/dia</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <div className="h-6 w-6 rounded-full bg-red-500 mx-auto mb-2 flex items-center justify-center text-xs font-bold">
                P
              </div>
              <input
                type="number"
                value={dieta.proteinas}
                onChange={(e) => updateMacro('proteinas', parseInt(e.target.value) || 0)}
                className="text-2xl font-bold text-white bg-transparent text-center w-full"
              />
              <p className="text-xs text-slate-400">g Proteinas</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <div className="h-6 w-6 rounded-full bg-yellow-500 mx-auto mb-2 flex items-center justify-center text-xs font-bold">
                C
              </div>
              <input
                type="number"
                value={dieta.carboidratos}
                onChange={(e) => updateMacro('carboidratos', parseInt(e.target.value) || 0)}
                className="text-2xl font-bold text-white bg-transparent text-center w-full"
              />
              <p className="text-xs text-slate-400">g Carboidratos</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <div className="h-6 w-6 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center text-xs font-bold">
                G
              </div>
              <input
                type="number"
                value={dieta.gorduras}
                onChange={(e) => updateMacro('gorduras', parseInt(e.target.value) || 0)}
                className="text-2xl font-bold text-white bg-transparent text-center w-full"
              />
              <p className="text-xs text-slate-400">g Gorduras</p>
            </div>
          </div>

          {/* Refeicoes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lime-400" />
              Plano Alimentar
            </h3>
            {dieta.refeicoes.map((refeicao, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={refeicao.nome}
                    onChange={(e) => updateRefeicao(idx, 'nome', e.target.value)}
                    className="font-medium text-white bg-transparent border-b border-transparent hover:border-slate-600 focus:border-lime-500 outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={refeicao.horario}
                      onChange={(e) => updateRefeicao(idx, 'horario', e.target.value)}
                      className="text-sm text-lime-400 bg-slate-700 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => removeRefeicao(idx)}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {refeicao.alimentos.map((alimento, aIdx) => (
                    <div
                      key={aIdx}
                      className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm flex items-center gap-1"
                    >
                      <input
                        type="text"
                        value={alimento}
                        onChange={(e) => updateAlimento(idx, aIdx, e.target.value)}
                        className="bg-transparent outline-none w-auto"
                        style={{ width: `${alimento.length + 1}ch` }}
                      />
                      <button
                        onClick={() => removeAlimento(idx, aIdx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addAlimento(idx)}
                    className="px-3 py-1 bg-lime-500/20 text-lime-400 rounded-full text-sm hover:bg-lime-500/30"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addRefeicao}
              className="w-full p-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-lime-400 hover:border-lime-500/50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar refeicao
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-lime-500/20 mb-4">
            <Apple className="h-10 w-10 text-lime-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhuma dieta configurada</h3>
          <p className="text-slate-400 max-w-md">
            Peca ao assistente para criar um plano alimentar personalizado para voce.
          </p>
        </div>
      )}
    </div>
  );
}

// Main Component
export function FitnessVisualizationPanel({
  anamnese,
  treinos,
  dieta,
  onUpdateAnamnese,
  onUpdateTreinos,
  onUpdateDieta,
}: FitnessVisualizationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('visao-geral');

  const tabs = [
    { id: 'visao-geral' as TabId, label: 'Visao Geral', icon: LayoutDashboard },
    { id: 'anamnese' as TabId, label: 'Anamnese', icon: User },
    { id: 'treinos' as TabId, label: 'Treinos', icon: Dumbbell },
    { id: 'dieta' as TabId, label: 'Dieta', icon: Salad },
  ];

  return (
    <div className="flex-1 min-h-0 bg-slate-900/30 flex flex-col">
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50">
        <div className="flex">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'visao-geral' && (
          <VisaoGeralTab anamnese={anamnese} treinos={treinos} dieta={dieta} />
        )}
        {activeTab === 'anamnese' && <AnamneseTab anamnese={anamnese} onUpdate={onUpdateAnamnese} />}
        {activeTab === 'treinos' && <TreinosTab treinos={treinos} onUpdate={onUpdateTreinos} />}
        {activeTab === 'dieta' && <DietaTab dieta={dieta} onUpdate={onUpdateDieta} />}
      </div>
    </div>
  );
}
