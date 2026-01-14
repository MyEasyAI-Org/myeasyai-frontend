import React, { useState } from 'react';
import type { CreateResumeProfileInput, CareerLevel, TemplateStyle, ResumeLanguage } from '../types';
import { CAREER_LEVELS, TEMPLATE_STYLES, RESUME_LANGUAGES, INDUSTRIES } from '../constants';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: CreateResumeProfileInput) => Promise<void>;
  isSaving?: boolean;
}

export function CreateProfileModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: CreateProfileModalProps) {
  const [formData, setFormData] = useState<CreateResumeProfileInput>({
    name: '',
    career_level: 'mid',
    target_role: '',
    industry: 'Tecnologia',
    template_style: 'ats',
    preferred_language: 'pt-BR',
    is_default: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      career_level: 'mid',
      target_role: '',
      industry: 'Tecnologia',
      template_style: 'ats',
      preferred_language: 'pt-BR',
      is_default: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Novo Perfil de Currículo</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSaving}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Perfil */}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Nome do Perfil *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Currículo Tech Senior, CV Consultor..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Cargo Desejado */}
          <div>
            <label htmlFor="target_role" className="mb-1 block text-sm font-medium text-gray-700">
              Cargo Desejado *
            </label>
            <input
              id="target_role"
              type="text"
              required
              value={formData.target_role}
              onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
              placeholder="Ex: Software Engineer, Product Manager..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nível de Carreira */}
            <div>
              <label htmlFor="career_level" className="mb-1 block text-sm font-medium text-gray-700">
                Nível de Carreira *
              </label>
              <select
                id="career_level"
                value={formData.career_level}
                onChange={(e) => setFormData({ ...formData, career_level: e.target.value as CareerLevel })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {CAREER_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Indústria */}
            <div>
              <label htmlFor="industry" className="mb-1 block text-sm font-medium text-gray-700">
                Indústria *
              </label>
              <select
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Estilo do Template */}
            <div>
              <label htmlFor="template_style" className="mb-1 block text-sm font-medium text-gray-700">
                Estilo do Template *
              </label>
              <select
                id="template_style"
                value={formData.template_style}
                onChange={(e) => setFormData({ ...formData, template_style: e.target.value as TemplateStyle })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {TEMPLATE_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label} - {style.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Idioma */}
            <div>
              <label htmlFor="language" className="mb-1 block text-sm font-medium text-gray-700">
                Idioma *
              </label>
              <select
                id="language"
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as ResumeLanguage })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {RESUME_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Perfil Padrão */}
          <div className="flex items-center gap-2">
            <input
              id="is_default"
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="is_default" className="text-sm text-gray-700">
              Definir como perfil padrão
            </label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Criar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
