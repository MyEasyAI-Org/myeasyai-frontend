/**
 * ExerciseEditModal Component
 *
 * Full-screen modal for editing exercise details on mobile.
 * Features large, touch-friendly input fields.
 */

import { useState, useEffect } from 'react';
import { X, Trash2, Dumbbell, Save } from 'lucide-react';
import { EXERCISE_DATABASE, type ExerciseInfo } from '../../constants/exerciseDatabase';

interface Exercise {
  nome: string;
  series: number;
  repeticoes: string;
  descanso: string;
  observacao?: string;
}

interface ExerciseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
  onSave: (exercise: Exercise) => void;
  onDelete: () => void;
}

// Find exercise info from database
function findExerciseInfo(exerciseName: string): ExerciseInfo | null {
  const normalizedName = exerciseName.toLowerCase().trim();
  return (
    EXERCISE_DATABASE.find(
      (ex) =>
        ex.nome.toLowerCase() === normalizedName ||
        ex.nomeIngles.toLowerCase() === normalizedName ||
        ex.nome.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(ex.nome.toLowerCase())
    ) || null
  );
}

export function ExerciseEditModal({
  isOpen,
  onClose,
  exercise,
  onSave,
  onDelete,
}: ExerciseEditModalProps) {
  const [editedExercise, setEditedExercise] = useState<Exercise>(exercise);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const exerciseInfo = findExerciseInfo(exercise.nome);

  // Reset state when exercise changes
  useEffect(() => {
    setEditedExercise(exercise);
    setShowDeleteConfirm(false);
    setImageError(false);
  }, [exercise]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedExercise);
    onClose();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const updateField = (field: keyof Exercise, value: string | number) => {
    setEditedExercise((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col sm:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">Editar Exercício</h2>
        <button
          onClick={handleDelete}
          className={`p-2 -mr-2 rounded-lg transition-colors ${
            showDeleteConfirm
              ? 'text-red-400 bg-red-400/20'
              : 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
          }`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400 text-sm text-center">
              Clique novamente no ícone de lixeira para confirmar a exclusão
            </p>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full mt-2 text-sm text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Exercise Image */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
            {exerciseInfo && !imageError ? (
              <img
                src={exerciseInfo.imagemMovimento}
                alt={editedExercise.nome}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell className="w-10 h-10 text-slate-600" />
              </div>
            )}
          </div>
        </div>

        {/* Exercise Name */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Nome do Exercício
          </label>
          <input
            type="text"
            value={editedExercise.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
          />
        </div>

        {/* Series */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Séries
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={editedExercise.series}
            onChange={(e) => updateField('series', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg text-center focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
          />
        </div>

        {/* Repetitions */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Repetições
          </label>
          <input
            type="text"
            value={editedExercise.repeticoes}
            onChange={(e) => updateField('repeticoes', e.target.value)}
            placeholder="Ex: 10-12, 8, até a falha"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
          />
        </div>

        {/* Rest Time */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Descanso
          </label>
          <input
            type="text"
            value={editedExercise.descanso}
            onChange={(e) => updateField('descanso', e.target.value)}
            placeholder="Ex: 60s, 90s, 2min"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
          />
        </div>

        {/* Observation */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Observação (opcional)
          </label>
          <textarea
            value={editedExercise.observacao || ''}
            onChange={(e) => updateField('observacao', e.target.value)}
            placeholder="Anotações sobre o exercício..."
            rows={3}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 border-t border-slate-700 bg-slate-800 space-y-3">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-lime-500 hover:bg-lime-400 active:bg-lime-600 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Salvar Alterações
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
