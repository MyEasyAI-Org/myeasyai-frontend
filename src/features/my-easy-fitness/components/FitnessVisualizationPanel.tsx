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
  BookOpen,
} from 'lucide-react';
import {
  IconRun,
  IconYoga,
  IconStretching,
  IconBarbell,
  IconBike,
  IconSwimming,
} from '@tabler/icons-react';
import { useState } from 'react';
import type { UserPersonalInfo, Treino, Dieta, Alimento, TrainingModality } from '../types';
import { ModalidadesTab } from './ModalidadesTab';
import { ExerciciosTab } from './ExerciciosTab';

type TabId = 'visao-geral' | 'personal-info' | 'treinos' | 'exercicios' | 'dieta';

type FitnessVisualizationPanelProps = {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
  selectedModality: TrainingModality;
  onUpdatePersonalInfo: (personalInfo: UserPersonalInfo) => void;
  onUpdateTreinos: (treinos: Treino[]) => void;
  onUpdateDieta: (dieta: Dieta | null) => void;
  onSelectModality: (modality: TrainingModality) => void;
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
  personalInfo,
  treinos,
  dieta,
}: {
  personalInfo: UserPersonalInfo;
  treinos: Treino[];
  dieta: Dieta | null;
}) {
  const imc =
    personalInfo.peso && personalInfo.altura
      ? (personalInfo.peso / Math.pow(personalInfo.altura / 100, 2)).toFixed(1)
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
            {personalInfo.peso ? `${personalInfo.peso} kg` : '--'}
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
            {personalInfo.altura ? `${personalInfo.altura} cm` : '--'}
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
      {personalInfo.objetivo && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-lime-400" />
            <span className="font-medium text-white">Seu Objetivo</span>
          </div>
          <p className="text-slate-300">{personalInfo.objetivo}</p>
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
      {!personalInfo.nome && treinos.length === 0 && !dieta && (
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

// Personal Info Tab
function PersonalInfoTab({
  personalInfo,
  onUpdate,
}: {
  personalInfo: UserPersonalInfo;
  onUpdate: (personalInfo: UserPersonalInfo) => void;
}) {
  const [newRestricao, setNewRestricao] = useState('');
  const [newLesao, setNewLesao] = useState('');
  const [newRestricaoAlimentar, setNewRestricaoAlimentar] = useState('');
  const [newComidaFavorita, setNewComidaFavorita] = useState('');
  const [newComidaEvitar, setNewComidaEvitar] = useState('');

  const updateField = (field: keyof UserPersonalInfo, value: string) => {
    if (field === 'idade' || field === 'peso' || field === 'altura' || field === 'diasTreinoSemana' || field === 'tempoTreinoMinutos' || field === 'numeroRefeicoes') {
      onUpdate({ ...personalInfo, [field]: parseFloat(value) || 0 });
    } else {
      onUpdate({ ...personalInfo, [field]: value });
    }
  };

  const addRestricao = () => {
    if (newRestricao.trim()) {
      onUpdate({
        ...personalInfo,
        restricoesMedicas: [...personalInfo.restricoesMedicas, newRestricao.trim()],
      });
      setNewRestricao('');
    }
  };

  const removeRestricao = (index: number) => {
    onUpdate({
      ...personalInfo,
      restricoesMedicas: personalInfo.restricoesMedicas.filter((_, i) => i !== index),
    });
  };

  const addLesao = () => {
    if (newLesao.trim()) {
      onUpdate({
        ...personalInfo,
        lesoes: [...personalInfo.lesoes, newLesao.trim()],
      });
      setNewLesao('');
    }
  };

  const removeLesao = (index: number) => {
    onUpdate({
      ...personalInfo,
      lesoes: personalInfo.lesoes.filter((_, i) => i !== index),
    });
  };

  const addRestricaoAlimentar = () => {
    if (newRestricaoAlimentar.trim()) {
      onUpdate({
        ...personalInfo,
        restricoesAlimentares: [...personalInfo.restricoesAlimentares, newRestricaoAlimentar.trim()],
      });
      setNewRestricaoAlimentar('');
    }
  };

  const removeRestricaoAlimentar = (index: number) => {
    onUpdate({
      ...personalInfo,
      restricoesAlimentares: personalInfo.restricoesAlimentares.filter((_, i) => i !== index),
    });
  };

  const addComidaFavorita = () => {
    if (newComidaFavorita.trim()) {
      onUpdate({
        ...personalInfo,
        comidasFavoritas: [...personalInfo.comidasFavoritas, newComidaFavorita.trim()],
      });
      setNewComidaFavorita('');
    }
  };

  const removeComidaFavorita = (index: number) => {
    onUpdate({
      ...personalInfo,
      comidasFavoritas: personalInfo.comidasFavoritas.filter((_, i) => i !== index),
    });
  };

  const addComidaEvitar = () => {
    if (newComidaEvitar.trim()) {
      onUpdate({
        ...personalInfo,
        comidasEvitar: [...personalInfo.comidasEvitar, newComidaEvitar.trim()],
      });
      setNewComidaEvitar('');
    }
  };

  const removeComidaEvitar = (index: number) => {
    onUpdate({
      ...personalInfo,
      comidasEvitar: personalInfo.comidasEvitar.filter((_, i) => i !== index),
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
            value={personalInfo.nome}
            onSave={(v) => updateField('nome', v)}
          />
          <EditableField
            label="Idade"
            value={personalInfo.idade || ''}
            onSave={(v) => updateField('idade', v)}
            type="number"
            suffix=" anos"
          />
          <EditableField
            label="Sexo Atribuido no Nascimento"
            value={personalInfo.sexo}
            onSave={(v) => updateField('sexo', v)}
            type="select"
            options={[
              { value: 'masculino', label: 'Masculino' },
              { value: 'feminino', label: 'Feminino' },
              { value: 'prefiro-nao-declarar', label: 'Prefiro nao declarar' },
            ]}
          />
          <EditableField
            label="Genero"
            value={personalInfo.genero}
            onSave={(v) => updateField('genero', v)}
            type="select"
            options={[
              { value: 'mulher-cis', label: 'Mulher cis' },
              { value: 'mulher-trans', label: 'Mulher trans' },
              { value: 'homem-cis', label: 'Homem cis' },
              { value: 'homem-trans', label: 'Homem trans' },
              { value: 'outro', label: 'Outro' },
              { value: 'prefiro-nao-declarar', label: 'Prefiro nao declarar' },
            ]}
          />
          {personalInfo.genero === 'outro' && (
            <EditableField
              label="Especificar genero"
              value={personalInfo.generoOutro}
              onSave={(v) => updateField('generoOutro', v)}
            />
          )}
          <EditableField
            label="Peso"
            value={personalInfo.peso || ''}
            onSave={(v) => updateField('peso', v)}
            type="number"
            suffix=" kg"
          />
          <EditableField
            label="Altura"
            value={personalInfo.altura || ''}
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
            value={personalInfo.objetivo}
            onSave={(v) => updateField('objetivo', v)}
          />
          <EditableField
            label="Nivel de Atividade"
            value={personalInfo.nivelAtividade}
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
              {personalInfo.restricoesMedicas.map((restricao, idx) => (
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
              {personalInfo.lesoes.map((lesao, idx) => (
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

      {/* Preferencias de Treino */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-lime-400" />
          Preferencias de Treino
        </h3>
        <div className="space-y-1">
          <EditableField
            label="Modalidade"
            value={personalInfo.preferenciaTreino}
            onSave={(v) => updateField('preferenciaTreino', v)}
            type="select"
            options={[
              { value: 'musculacao', label: 'Musculacao' },
              { value: 'corrida', label: 'Corrida' },
              { value: 'crossfit', label: 'CrossFit' },
              { value: 'caminhada', label: 'Caminhada' },
              { value: 'funcional', label: 'Funcional' },
              { value: 'calistenia', label: 'Calistenia' },
            ]}
          />
          <EditableField
            label="Dias por Semana"
            value={personalInfo.diasTreinoSemana || ''}
            onSave={(v) => updateField('diasTreinoSemana', v)}
            type="number"
            suffix=" dias"
          />
          <EditableField
            label="Tempo por Sessao"
            value={personalInfo.tempoTreinoMinutos || ''}
            onSave={(v) => updateField('tempoTreinoMinutos', v)}
            type="number"
            suffix=" min"
          />
          <EditableField
            label="Experiencia"
            value={personalInfo.experienciaTreino}
            onSave={(v) => updateField('experienciaTreino', v)}
            type="select"
            options={[
              { value: 'iniciante', label: 'Iniciante' },
              { value: 'intermediario', label: 'Intermediario' },
              { value: 'avancado', label: 'Avancado' },
            ]}
          />
        </div>
      </div>

      {/* Preferencias de Dieta */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Apple className="h-5 w-5 text-lime-400" />
          Preferencias de Dieta
        </h3>
        <div className="space-y-4">
          <EditableField
            label="Numero de Refeicoes"
            value={personalInfo.numeroRefeicoes || ''}
            onSave={(v) => updateField('numeroRefeicoes', v)}
            type="number"
            suffix=" refeicoes/dia"
          />
          <EditableField
            label="Horario de Treino"
            value={personalInfo.horarioTreino}
            onSave={(v) => updateField('horarioTreino', v)}
            type="select"
            options={[
              { value: 'manha', label: 'Manha' },
              { value: 'tarde', label: 'Tarde' },
              { value: 'noite', label: 'Noite' },
            ]}
          />
          <div>
            <p className="text-slate-400 text-sm mb-2">Restricoes Alimentares</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {personalInfo.restricoesAlimentares.map((restricao, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center gap-1"
                >
                  {restricao}
                  <button onClick={() => removeRestricaoAlimentar(idx)} className="hover:text-yellow-300">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRestricaoAlimentar}
                onChange={(e) => setNewRestricaoAlimentar(e.target.value)}
                placeholder="Ex: lactose, gluten, vegetariano..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addRestricaoAlimentar()}
              />
              <button
                onClick={addRestricaoAlimentar}
                className="p-1 bg-lime-500/20 text-lime-400 rounded hover:bg-lime-500/30"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Comidas Favoritas</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {personalInfo.comidasFavoritas.map((comida, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1"
                >
                  {comida}
                  <button onClick={() => removeComidaFavorita(idx)} className="hover:text-green-300">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComidaFavorita}
                onChange={(e) => setNewComidaFavorita(e.target.value)}
                placeholder="Adicionar comida favorita..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addComidaFavorita()}
              />
              <button
                onClick={addComidaFavorita}
                className="p-1 bg-lime-500/20 text-lime-400 rounded hover:bg-lime-500/30"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Comidas a Evitar</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {personalInfo.comidasEvitar.map((comida, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1"
                >
                  {comida}
                  <button onClick={() => removeComidaEvitar(idx)} className="hover:text-red-300">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComidaEvitar}
                onChange={(e) => setNewComidaEvitar(e.target.value)}
                placeholder="Adicionar comida a evitar..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addComidaEvitar()}
              />
              <button
                onClick={addComidaEvitar}
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

// TreinosTab removed - replaced by ModalidadesTab

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

  const updateAlimento = (refeicaoIndex: number, alimentoIndex: number, updates: Partial<Alimento>) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    const newAlimentos = [...newRefeicoes[refeicaoIndex].alimentos];
    newAlimentos[alimentoIndex] = { ...newAlimentos[alimentoIndex], ...updates };
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
      alimentos: [...newRefeicoes[refeicaoIndex].alimentos, { nome: 'Novo alimento', gramas: 100 }],
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
                        value={alimento.nome}
                        onChange={(e) => updateAlimento(idx, aIdx, { nome: e.target.value })}
                        className="bg-transparent outline-none w-auto"
                        style={{ width: `${alimento.nome.length + 1}ch` }}
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        value={alimento.gramas}
                        onChange={(e) => updateAlimento(idx, aIdx, { gramas: parseInt(e.target.value) || 0 })}
                        className="bg-transparent outline-none w-12 text-lime-400"
                      />
                      <span className="text-slate-500">g</span>
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
  personalInfo,
  treinos,
  dieta,
  selectedModality,
  onUpdatePersonalInfo,
  onUpdateTreinos,
  onUpdateDieta,
  onSelectModality,
}: FitnessVisualizationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('visao-geral');

  const tabs = [
    { id: 'visao-geral' as TabId, label: 'Visao Geral', icon: LayoutDashboard },
    { id: 'personal-info' as TabId, label: 'Informacoes Pessoais', icon: User },
    { id: 'treinos' as TabId, label: 'Treinos', icon: Dumbbell },
    { id: 'exercicios' as TabId, label: 'Exercicios', icon: BookOpen },
    { id: 'dieta' as TabId, label: 'Dieta', icon: Salad },
  ];

  return (
    <div className="flex-1 min-h-0 bg-slate-900/30 flex flex-col relative overflow-hidden">
      {/* Decorative watermark background icons */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top row */}
        <IconYoga className="absolute top-8 left-[10%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconBarbell className="absolute top-12 left-[40%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconRun className="absolute top-6 right-[15%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        {/* Middle row */}
        <IconBike className="absolute top-[35%] left-[5%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconSwimming className="absolute top-[40%] left-[30%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconStretching className="absolute top-[38%] right-[25%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconYoga className="absolute top-[32%] right-[5%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        {/* Bottom row */}
        <IconBarbell className="absolute bottom-[30%] left-[15%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconRun className="absolute bottom-[25%] left-[45%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconBike className="absolute bottom-[28%] right-[10%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        {/* Very bottom */}
        <IconSwimming className="absolute bottom-8 left-[20%] w-12 h-12 text-lime-400 opacity-[0.12]" />
        <IconStretching className="absolute bottom-12 left-[55%] w-14 h-14 text-lime-400 opacity-[0.12]" />
        <IconYoga className="absolute bottom-6 right-[12%] w-12 h-12 text-lime-400 opacity-[0.12]" />
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center">
          <div className="flex overflow-x-auto flex-1">
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
          {/* Disclaimer */}
          <div className="flex-shrink-0 px-3 hidden lg:block">
            <span className="text-[10px] text-[#4285F4]">
              IA nao substitui profissionais de saude
            </span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'visao-geral' && (
          <VisaoGeralTab personalInfo={personalInfo} treinos={treinos} dieta={dieta} />
        )}
        {activeTab === 'personal-info' && (
          <PersonalInfoTab personalInfo={personalInfo} onUpdate={onUpdatePersonalInfo} />
        )}
        {activeTab === 'treinos' && (
          <ModalidadesTab
            treinos={treinos}
            selectedModality={selectedModality}
            personalInfo={personalInfo}
            onUpdateTreinos={onUpdateTreinos}
            onSelectModality={onSelectModality}
          />
        )}
        {activeTab === 'exercicios' && <ExerciciosTab />}
        {activeTab === 'dieta' && <DietaTab dieta={dieta} onUpdate={onUpdateDieta} />}
      </div>
    </div>
  );
}
