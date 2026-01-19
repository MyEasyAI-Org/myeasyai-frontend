/**
 * DietaTab Component
 *
 * Diet tab showing macros and meal plan with editable fields.
 */

import { memo, useCallback } from 'react';
import { Apple, Flame, Calendar, Plus, Trash2, X } from 'lucide-react';
import type { Dieta, Alimento } from '../../types';

type DietaTabProps = {
  dieta: Dieta | null;
  onUpdate: (dieta: Dieta | null) => void;
};

export const DietaTab = memo(function DietaTab({ dieta, onUpdate }: DietaTabProps) {
  const updateMacro = useCallback((field: keyof Dieta, value: number) => {
    if (!dieta) return;
    onUpdate({ ...dieta, [field]: value });
  }, [dieta, onUpdate]);

  const updateRefeicao = useCallback((index: number, field: string, value: string) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    newRefeicoes[index] = { ...newRefeicoes[index], [field]: value };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  }, [dieta, onUpdate]);

  const updateAlimento = useCallback((refeicaoIndex: number, alimentoIndex: number, updates: Partial<Alimento>) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    const newAlimentos = [...newRefeicoes[refeicaoIndex].alimentos];
    newAlimentos[alimentoIndex] = { ...newAlimentos[alimentoIndex], ...updates };
    newRefeicoes[refeicaoIndex] = { ...newRefeicoes[refeicaoIndex], alimentos: newAlimentos };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  }, [dieta, onUpdate]);

  const removeAlimento = useCallback((refeicaoIndex: number, alimentoIndex: number) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    newRefeicoes[refeicaoIndex] = {
      ...newRefeicoes[refeicaoIndex],
      alimentos: newRefeicoes[refeicaoIndex].alimentos.filter((_, i) => i !== alimentoIndex),
    };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  }, [dieta, onUpdate]);

  const addAlimento = useCallback((refeicaoIndex: number) => {
    if (!dieta) return;
    const newRefeicoes = [...dieta.refeicoes];
    newRefeicoes[refeicaoIndex] = {
      ...newRefeicoes[refeicaoIndex],
      alimentos: [...newRefeicoes[refeicaoIndex].alimentos, { nome: 'Novo alimento', gramas: 100 }],
    };
    onUpdate({ ...dieta, refeicoes: newRefeicoes });
  }, [dieta, onUpdate]);

  const removeRefeicao = useCallback((index: number) => {
    if (!dieta) return;
    onUpdate({ ...dieta, refeicoes: dieta.refeicoes.filter((_, i) => i !== index) });
  }, [dieta, onUpdate]);

  const addRefeicao = useCallback(() => {
    if (!dieta) return;
    onUpdate({
      ...dieta,
      refeicoes: [...dieta.refeicoes, { nome: 'Nova refeição', horario: '12:00', alimentos: [] }],
    });
  }, [dieta, onUpdate]);

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
              <p className="text-xs text-slate-400">g Proteínas</p>
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

          {/* Refeições */}
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
              Adicionar refeição
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
            Peça ao assistente para criar um plano alimentar personalizado para você.
          </p>
        </div>
      )}
    </div>
  );
});
