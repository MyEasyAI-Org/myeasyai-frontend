import { useState, useEffect, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import type { JobPosting, JobPostingFormData } from '../../../types';
import {
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_MODE_LABELS,
  JOB_STATUS_LABELS,
} from '../../../constants';

// ============================================================================
// TYPES
// ============================================================================

interface JobFormProps {
  job?: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: JobPostingFormData) => Promise<void>;
  isSubmitting?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EMPTY_FORM: JobPostingFormData = {
  title: '',
  description: '',
  requirements: [],
  responsibilities: [],
  location: '',
  work_mode: 'on_site',
  job_type: 'full_time',
  experience_level: 'mid',
  status: 'draft',
  skills_required: [],
  benefits: [],
};

// ============================================================================
// CHIP INPUT COMPONENT
// ============================================================================

interface ChipInputProps {
  label: string;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}

function ChipInput({ label, items, onAdd, onRemove, placeholder }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Adicionar ${label.toLowerCase()}...`}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-full bg-slate-700/60 px-3 py-1 text-xs font-medium text-slate-300"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-0.5 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-600 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// JOB FORM COMPONENT
// ============================================================================

export function JobForm({ job, isOpen, onClose, onSubmit, isSubmitting = false }: JobFormProps) {
  const [formData, setFormData] = useState<JobPostingFormData>(EMPTY_FORM);

  const isEditing = Boolean(job);

  // Reset form when modal opens or job changes
  useEffect(() => {
    if (isOpen) {
      if (job) {
        setFormData({
          title: job.title,
          description: job.description,
          requirements: [...job.requirements],
          responsibilities: [...job.responsibilities],
          location: job.location || '',
          work_mode: job.work_mode,
          job_type: job.job_type,
          experience_level: job.experience_level,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          status: job.status,
          skills_required: [...job.skills_required],
          benefits: [...job.benefits],
        });
      } else {
        setFormData({ ...EMPTY_FORM, requirements: [], responsibilities: [], skills_required: [], benefits: [] });
      }
    }
  }, [isOpen, job]);

  const handleChange = useCallback(
    (field: keyof JobPostingFormData, value: string | number | undefined) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleChipAdd = useCallback(
    (field: 'requirements' | 'responsibilities' | 'skills_required' | 'benefits', item: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), item],
      }));
    },
    []
  );

  const handleChipRemove = useCallback(
    (field: 'requirements' | 'responsibilities' | 'skills_required' | 'benefits', index: number) => {
      setFormData((prev) => ({
        ...prev,
        [field]: (prev[field] || []).filter((_, i) => i !== index),
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {isEditing ? 'Editar Vaga' : 'Nova Vaga'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Titulo da Vaga <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Desenvolvedor Full Stack Senior"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Descricao <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva a vaga, responsabilidades e o que o candidato pode esperar..."
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Job Type, Level, Work Mode */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Tipo de Vaga
                </label>
                <select
                  value={formData.job_type}
                  onChange={(e) => handleChange('job_type', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Nivel
                </label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => handleChange('experience_level', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Modalidade
                </label>
                <select
                  value={formData.work_mode}
                  onChange={(e) => handleChange('work_mode', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {Object.entries(WORK_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location, Salary Min, Salary Max */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Localizacao
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Ex: Sao Paulo, SP"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Salario Min.
                </label>
                <input
                  type="number"
                  value={formData.salary_min ?? ''}
                  onChange={(e) =>
                    handleChange('salary_min', e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="Ex: 5000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Salario Max.
                </label>
                <input
                  type="number"
                  value={formData.salary_max ?? ''}
                  onChange={(e) =>
                    handleChange('salary_max', e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="Ex: 12000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Requirements Chips */}
            <ChipInput
              label="Requisitos"
              items={formData.requirements || []}
              onAdd={(item) => handleChipAdd('requirements', item)}
              onRemove={(index) => handleChipRemove('requirements', index)}
              placeholder="Ex: 3 anos de experiencia em React"
            />

            {/* Skills Required Chips */}
            <ChipInput
              label="Habilidades Necessarias"
              items={formData.skills_required || []}
              onAdd={(item) => handleChipAdd('skills_required', item)}
              onRemove={(index) => handleChipRemove('skills_required', index)}
              placeholder="Ex: TypeScript, Node.js"
            />

            {/* Benefits Chips */}
            <ChipInput
              label="Beneficios"
              items={formData.benefits || []}
              onAdd={(item) => handleChipAdd('benefits', item)}
              onRemove={(index) => handleChipRemove('benefits', index)}
              placeholder="Ex: Plano de saude, Vale refeicao"
            />

            {/* Responsibilities Chips */}
            <ChipInput
              label="Responsabilidades"
              items={formData.responsibilities || []}
              onAdd={(item) => handleChipAdd('responsibilities', item)}
              onRemove={(index) => handleChipRemove('responsibilities', index)}
              placeholder="Ex: Desenvolver e manter aplicacoes web"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar'
                  : 'Criar Vaga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
