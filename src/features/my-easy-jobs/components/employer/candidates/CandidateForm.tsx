// =============================================
// MyEasyJobs - CandidateForm Component
// =============================================
// Modal form for adding/editing candidates for a job.
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { X, UserPlus, Loader2, Plus, Tag } from 'lucide-react';
import type { Candidate, CandidateFormData } from '../../../types';

// =============================================
// TYPES
// =============================================

interface CandidateFormProps {
  candidate?: Candidate | null;
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CandidateFormData) => Promise<void>;
  isSubmitting?: boolean;
}

// =============================================
// DEFAULTS
// =============================================

const EMPTY_FORM: CandidateFormData = {
  job_id: '',
  name: '',
  email: '',
  phone: '',
  resume_data: '',
  cover_letter: '',
  recruiter_notes: '',
  tags: [],
};

// =============================================
// COMPONENT
// =============================================

export function CandidateForm({
  candidate,
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CandidateFormProps) {
  const [form, setForm] = useState<CandidateFormData>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!candidate;

  // Reset form when modal opens or candidate changes
  useEffect(() => {
    if (isOpen) {
      if (candidate) {
        setForm({
          job_id: candidate.job_id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone || '',
          resume_data: candidate.resume_data || '',
          cover_letter: candidate.cover_letter || '',
          recruiter_notes: candidate.recruiter_notes || '',
          tags: candidate.tags || [],
        });
      } else {
        setForm({ ...EMPTY_FORM, job_id: jobId });
      }
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, candidate, jobId]);

  // Field change handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors]
  );

  // Tag management
  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (form.tags?.includes(tag)) {
      setTagInput('');
      return;
    }
    setForm((prev) => ({ ...prev, tags: [...(prev.tags || []), tag] }));
    setTagInput('');
  }, [tagInput, form.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag]
  );

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Email inválido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.name, form.email]);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      await onSubmit({
        ...form,
        job_id: jobId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        resume_data: form.resume_data?.trim() || undefined,
        cover_letter: form.cover_letter?.trim() || undefined,
        recruiter_notes: form.recruiter_notes?.trim() || undefined,
      });
    },
    [form, jobId, validate, onSubmit]
  );

  // Close handler
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    },
    [isSubmitting, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEditing ? 'Editar Candidato' : 'Adicionar Candidato'}
              </h2>
              <p className="text-sm text-slate-400">
                Adicionando candidato para:{' '}
                <span className="text-slate-300 font-medium">{jobTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label
              htmlFor="candidate-name"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              id="candidate-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Nome completo do candidato"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-colors"
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="candidate-email"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="candidate-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-colors"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label
              htmlFor="candidate-phone"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Telefone
            </label>
            <input
              id="candidate-phone"
              name="phone"
              type="text"
              value={form.phone || ''}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Curriculo */}
          <div>
            <label
              htmlFor="candidate-resume"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Curriculo (texto)
            </label>
            <textarea
              id="candidate-resume"
              name="resume_data"
              rows={6}
              value={form.resume_data || ''}
              onChange={handleChange}
              placeholder="Cole aqui o conteudo do curriculo..."
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-colors resize-none"
            />
          </div>

          {/* Carta de Apresentacao */}
          <div>
            <label
              htmlFor="candidate-cover-letter"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Carta de Apresentacao
            </label>
            <textarea
              id="candidate-cover-letter"
              name="cover_letter"
              rows={3}
              value={form.cover_letter || ''}
              onChange={handleChange}
              placeholder="Carta de apresentacao do candidato..."
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-colors resize-none"
            />
          </div>

          {/* Notas do Recrutador */}
          <div>
            <label
              htmlFor="candidate-notes"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Notas do Recrutador
            </label>
            <textarea
              id="candidate-notes"
              name="recruiter_notes"
              rows={3}
              value={form.recruiter_notes || ''}
              onChange={handleChange}
              placeholder="Anotacoes internas sobre o candidato..."
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Adicionar tag..."
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isSubmitting || !tagInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            {/* Tags display */}
            {form.tags && form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isSubmitting}
                      className="ml-0.5 p-0.5 hover:bg-slate-600 rounded-full transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Salvar Alteracoes' : 'Adicionar Candidato'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
