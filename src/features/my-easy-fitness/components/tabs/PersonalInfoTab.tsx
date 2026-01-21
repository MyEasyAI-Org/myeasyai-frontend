/**
 * PersonalInfoTab Component
 *
 * Tab for viewing and editing user personal information.
 */

import { memo, useCallback } from 'react';
import { User, Target, Heart, Dumbbell, Apple } from 'lucide-react';
import type { UserPersonalInfo } from '../../types';
import { TAB_WATERMARKS } from '../../constants';
import { EditableField, EditableListField, WatermarkIcon } from '../shared';

type PersonalInfoTabProps = {
  personalInfo: UserPersonalInfo;
  onUpdate: (personalInfo: UserPersonalInfo) => void;
};

type ListFieldKey = 'restricoesMedicas' | 'lesoes' | 'restricoesAlimentares' | 'comidasFavoritas' | 'comidasEvitar';

export const PersonalInfoTab = memo(function PersonalInfoTab({ personalInfo, onUpdate }: PersonalInfoTabProps) {
  const updateField = useCallback((field: keyof UserPersonalInfo, value: string) => {
    if (field === 'idade' || field === 'peso' || field === 'altura' || field === 'diasTreinoSemana' || field === 'tempoTreinoMinutos' || field === 'numeroRefeicoes') {
      onUpdate({ ...personalInfo, [field]: parseFloat(value) || 0 });
    } else {
      onUpdate({ ...personalInfo, [field]: value });
    }
  }, [personalInfo, onUpdate]);

  const addToList = useCallback((field: ListFieldKey, item: string) => {
    onUpdate({
      ...personalInfo,
      [field]: [...personalInfo[field], item],
    });
  }, [personalInfo, onUpdate]);

  const removeFromList = useCallback((field: ListFieldKey, index: number) => {
    onUpdate({
      ...personalInfo,
      [field]: personalInfo[field].filter((_, i) => i !== index),
    });
  }, [personalInfo, onUpdate]);

  return (
    <div className="relative p-6 space-y-6 overflow-hidden">
      {/* Tab Watermark */}
      <WatermarkIcon src={TAB_WATERMARKS.personalInfo} size="lg" />

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
            label="Sexo Atribuído no Nascimento"
            value={personalInfo.sexo}
            onSave={(v) => updateField('sexo', v)}
            type="select"
            options={[
              { value: 'masculino', label: 'Masculino' },
              { value: 'feminino', label: 'Feminino' },
              { value: 'prefiro-nao-declarar', label: 'Prefiro não declarar' },
            ]}
          />
          <EditableField
            label="Gênero"
            value={personalInfo.genero}
            onSave={(v) => updateField('genero', v)}
            type="select"
            options={[
              { value: 'mulher-cis', label: 'Mulher cis' },
              { value: 'mulher-trans', label: 'Mulher trans' },
              { value: 'homem-cis', label: 'Homem cis' },
              { value: 'homem-trans', label: 'Homem trans' },
              { value: 'outro', label: 'Outro' },
              { value: 'prefiro-nao-declarar', label: 'Prefiro não declarar' },
            ]}
          />
          {personalInfo.genero === 'outro' && (
            <EditableField
              label="Especificar gênero"
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

      {/* Objetivo e Nível */}
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
            label="Nível de Atividade"
            value={personalInfo.nivelAtividade}
            onSave={(v) => updateField('nivelAtividade', v)}
            type="select"
            options={[
              { value: 'sedentario', label: 'Sedentário' },
              { value: 'leve', label: 'Levemente ativo' },
              { value: 'moderado', label: 'Moderadamente ativo' },
              { value: 'intenso', label: 'Muito ativo' },
            ]}
          />
        </div>
      </div>

      {/* Restrições */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-lime-400" />
          Saúde
        </h3>
        <div className="space-y-4">
          <EditableListField
            label="Restrições Médicas"
            items={personalInfo.restricoesMedicas}
            onAdd={(item) => addToList('restricoesMedicas', item)}
            onRemove={(index) => removeFromList('restricoesMedicas', index)}
            placeholder="Adicionar restrição..."
            colorScheme="red"
          />
          <EditableListField
            label="Lesões"
            items={personalInfo.lesoes}
            onAdd={(item) => addToList('lesoes', item)}
            onRemove={(index) => removeFromList('lesoes', index)}
            placeholder="Adicionar lesão..."
            colorScheme="orange"
          />
        </div>
      </div>

      {/* Preferências de Treino */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-lime-400" />
          Preferências de Treino
        </h3>
        <div className="space-y-1">
          <EditableField
            label="Modalidade"
            value={personalInfo.preferenciaTreino}
            onSave={(v) => updateField('preferenciaTreino', v)}
            type="select"
            options={[
              { value: 'musculacao', label: 'Musculação' },
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
            label="Tempo por Sessão"
            value={personalInfo.tempoTreinoMinutos || ''}
            onSave={(v) => updateField('tempoTreinoMinutos', v)}
            type="number"
            suffix=" min"
          />
          <EditableField
            label="Experiência"
            value={personalInfo.experienciaTreino}
            onSave={(v) => updateField('experienciaTreino', v)}
            type="select"
            options={[
              { value: 'iniciante', label: 'Iniciante' },
              { value: 'intermediario', label: 'Intermediário' },
              { value: 'avancado', label: 'Avançado' },
            ]}
          />
        </div>
      </div>

      {/* Preferências de Dieta */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Apple className="h-5 w-5 text-lime-400" />
          Preferências de Dieta
        </h3>
        <div className="space-y-4">
          <EditableField
            label="Número de Refeições"
            value={personalInfo.numeroRefeicoes || ''}
            onSave={(v) => updateField('numeroRefeicoes', v)}
            type="number"
            suffix=" refeições/dia"
          />
          <EditableField
            label="Horário de Treino"
            value={personalInfo.horarioTreino}
            onSave={(v) => updateField('horarioTreino', v)}
            type="select"
            options={[
              { value: 'manha', label: 'Manhã' },
              { value: 'tarde', label: 'Tarde' },
              { value: 'noite', label: 'Noite' },
            ]}
          />
          <EditableListField
            label="Restrições Alimentares"
            items={personalInfo.restricoesAlimentares}
            onAdd={(item) => addToList('restricoesAlimentares', item)}
            onRemove={(index) => removeFromList('restricoesAlimentares', index)}
            placeholder="Ex: lactose, glúten, vegetariano..."
            colorScheme="yellow"
          />
          <EditableListField
            label="Comidas Favoritas"
            items={personalInfo.comidasFavoritas}
            onAdd={(item) => addToList('comidasFavoritas', item)}
            onRemove={(index) => removeFromList('comidasFavoritas', index)}
            placeholder="Adicionar comida favorita..."
            colorScheme="green"
          />
          <EditableListField
            label="Comidas a Evitar"
            items={personalInfo.comidasEvitar}
            onAdd={(item) => addToList('comidasEvitar', item)}
            onRemove={(index) => removeFromList('comidasEvitar', index)}
            placeholder="Adicionar comida a evitar..."
            colorScheme="red"
          />
        </div>
      </div>
    </div>
  );
});
