import { Check, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { GeneratedResume } from '../types';

interface ResumePreviewProps {
  resume: GeneratedResume | null;
  onSave?: () => void;
  onExport?: () => void;
  onUpdate?: (updatedResume: GeneratedResume) => void;
  isSaving?: boolean;
}

export function ResumePreview({ resume, onSave, onExport, onUpdate, isSaving = false }: ResumePreviewProps) {
  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Handle starting edit
  const handleStartEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  // Handle saving edit
  const handleSaveEdit = () => {
    if (!editingField || !editInputRef.current || !resume || !onUpdate) return;

    const currentValue = editInputRef.current.value;
    const parts = editingField.split('.');
    const updatedResume = { ...resume };

    try {
      if (parts[0] === 'personalInfo') {
        // Handle personalInfo fields
        updatedResume.personalInfo = {
          ...updatedResume.personalInfo,
          [parts[1]]: currentValue,
        };
      } else if (parts[0] === 'professionalSummary') {
        updatedResume.professionalSummary = currentValue;
      } else if (parts[0] === 'experiences') {
        // Handle experiences array
        const index = parseInt(parts[1], 10);
        const field = parts[2];
        updatedResume.experiences = [...updatedResume.experiences];
        updatedResume.experiences[index] = {
          ...updatedResume.experiences[index],
          [field]: currentValue,
        };
      } else if (parts[0] === 'education') {
        // Handle education array
        const index = parseInt(parts[1], 10);
        const field = parts[2];
        updatedResume.education = [...updatedResume.education];
        updatedResume.education[index] = {
          ...updatedResume.education[index],
          [field]: currentValue,
        };
      } else if (parts[0] === 'projects') {
        // Handle projects array
        const index = parseInt(parts[1], 10);
        const field = parts[2];
        updatedResume.projects = updatedResume.projects ? [...updatedResume.projects] : [];
        if (updatedResume.projects[index]) {
          updatedResume.projects[index] = {
            ...updatedResume.projects[index],
            [field]: currentValue,
          };
        }
      } else if (parts[0] === 'certifications') {
        // Handle certifications array
        const index = parseInt(parts[1], 10);
        const field = parts[2];
        updatedResume.certifications = updatedResume.certifications ? [...updatedResume.certifications] : [];
        if (updatedResume.certifications[index]) {
          updatedResume.certifications[index] = {
            ...updatedResume.certifications[index],
            [field]: currentValue,
          };
        }
      }

      onUpdate(updatedResume);
      setEditingField(null);
      setTempValue('');
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  // Render editable text
  const renderEditableText = (
    field: string,
    value: string,
    className = '',
    multiline = false,
    as: 'span' | 'h1' | 'h2' | 'h3' | 'p' = 'span'
  ) => {
    const isEditing = editingField === field;
    const isHovered = hoveredElement === field;
    const Tag = as;

    if (isEditing) {
      return (
        <div className="relative inline-block w-full">
          {multiline ? (
            <textarea
              ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
              defaultValue={tempValue}
              className="w-full rounded-lg border-2 border-purple-500 bg-white px-3 py-2 shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
            />
          ) : (
            <input
              ref={editInputRef as React.RefObject<HTMLInputElement>}
              type="text"
              defaultValue={tempValue}
              className="w-full rounded-lg border-2 border-purple-500 bg-white px-3 py-2 shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          {/* Save/Cancel Buttons */}
          <div className="absolute -top-10 right-0 z-50 flex items-center space-x-2 rounded-lg bg-slate-900 px-3 py-1.5 shadow-lg">
            <button
              type="button"
              onClick={handleSaveEdit}
              className="rounded bg-green-600 p-1.5 text-white transition-colors hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded bg-red-600 p-1.5 text-white transition-colors hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    // View mode - only enable editing if onUpdate is provided
    if (!onUpdate) {
      return <Tag className={className}>{value}</Tag>;
    }

    return (
      <Tag
        className={`${className} ${isHovered ? 'outline-2 outline-purple-500 outline-offset-2' : ''} group relative cursor-pointer transition-all`}
        onClick={() => handleStartEdit(field, value)}
        onMouseEnter={() => setHoveredElement(field)}
        onMouseLeave={() => setHoveredElement(null)}
      >
        {value}
        {isHovered && (
          <span className="absolute -top-6 left-0 z-50 whitespace-nowrap rounded bg-purple-600 px-2 py-1 text-xs text-white">
            ✏️ Clique para editar
          </span>
        )}
      </Tag>
    );
  };

  if (!resume) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum currículo gerado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete o assistente para gerar seu currículo profissional
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header com ações */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Preview do Currículo</h3>
        <div className="flex gap-2">
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar na Biblioteca'}
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Exportar PDF
            </button>
          )}
        </div>
      </div>

      {/* Resume Content - ATS-Friendly Template */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Personal Info */}
          <div className="border-b-2 border-gray-300 pb-4">
            {renderEditableText(
              'personalInfo.fullName',
              resume.personalInfo.fullName,
              'text-3xl font-bold text-gray-900',
              false,
              'h1'
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {resume.personalInfo.email &&
                renderEditableText('personalInfo.email', resume.personalInfo.email)}
              {resume.personalInfo.phone &&
                renderEditableText('personalInfo.phone', resume.personalInfo.phone)}
              {resume.personalInfo.location &&
                renderEditableText('personalInfo.location', resume.personalInfo.location)}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {resume.personalInfo.linkedinUrl && (
                <a href={resume.personalInfo.linkedinUrl} className="text-blue-600 hover:underline">
                  LinkedIn
                </a>
              )}
              {resume.personalInfo.portfolioUrl && (
                <a href={resume.personalInfo.portfolioUrl} className="text-blue-600 hover:underline">
                  Portfolio
                </a>
              )}
              {resume.personalInfo.githubUrl && (
                <a href={resume.personalInfo.githubUrl} className="text-blue-600 hover:underline">
                  GitHub
                </a>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {resume.professionalSummary && (
            <div>
              <h2 className="mb-2 text-xl font-bold uppercase text-gray-900">Resumo Profissional</h2>
              {renderEditableText(
                'professionalSummary',
                resume.professionalSummary,
                'text-sm leading-relaxed text-gray-700',
                true,
                'p'
              )}
            </div>
          )}

          {/* Experience */}
          {resume.experiences.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-bold uppercase text-gray-900">Experiência Profissional</h2>
              <div className="space-y-4">
                {resume.experiences.map((exp, index) => (
                  <div key={exp.id}>
                    <div className="flex justify-between">
                      <div>
                        {renderEditableText(
                          `experiences.${index}.position`,
                          exp.position,
                          'font-bold text-gray-900',
                          false,
                          'h3'
                        )}
                        {renderEditableText(
                          `experiences.${index}.company`,
                          exp.company,
                          'text-sm text-gray-700',
                          false,
                          'p'
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {exp.location && renderEditableText(`experiences.${index}.location`, exp.location)}
                        <p>
                          {exp.startDate} - {exp.endDate || 'Presente'}
                        </p>
                      </div>
                    </div>
                    {exp.description &&
                      renderEditableText(
                        `experiences.${index}.description`,
                        exp.description,
                        'mt-2 text-sm text-gray-700',
                        true,
                        'p'
                      )}
                    {exp.achievements.length > 0 && (
                      <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-bold uppercase text-gray-900">Educação</h2>
              <div className="space-y-3">
                {resume.education.map((edu, index) => (
                  <div key={edu.id}>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {renderEditableText(`education.${index}.degree`, edu.degree)} em{' '}
                          {renderEditableText(`education.${index}.field`, edu.field)}
                        </h3>
                        {renderEditableText(
                          `education.${index}.institution`,
                          edu.institution,
                          'text-sm text-gray-700',
                          false,
                          'p'
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {edu.location && renderEditableText(`education.${index}.location`, edu.location)}
                        <p>
                          {edu.startDate} - {edu.endDate || 'Presente'}
                        </p>
                      </div>
                    </div>
                    {edu.honors && (
                      <p className="mt-1 text-sm italic text-gray-600">
                        {renderEditableText(`education.${index}.honors`, edu.honors)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <div>
              <h2 className="mb-2 text-xl font-bold uppercase text-gray-900">Habilidades</h2>
              <div className="space-y-2">
                {['technical', 'soft', 'tool', 'language'].map((category) => {
                  const categorySkills = resume.skills.filter((s) => s.category === category);
                  if (categorySkills.length === 0) return null;

                  const categoryLabels: Record<string, string> = {
                    technical: 'Técnicas',
                    soft: 'Comportamentais',
                    tool: 'Ferramentas',
                    language: 'Idiomas',
                  };

                  return (
                    <div key={category}>
                      <span className="font-semibold text-gray-900">{categoryLabels[category]}:</span>{' '}
                      <span className="text-sm text-gray-700">
                        {categorySkills.map((s) => s.name).join(' • ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Languages */}
          {resume.languages && resume.languages.length > 0 && (
            <div>
              <h2 className="mb-2 text-xl font-bold uppercase text-gray-900">Idiomas</h2>
              <div className="flex flex-wrap gap-3 text-sm">
                {resume.languages.map((lang) => (
                  <div key={lang.id}>
                    <span className="font-semibold text-gray-900">{lang.name}:</span>{' '}
                    <span className="text-gray-700">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {resume.certifications && resume.certifications.length > 0 && (
            <div>
              <h2 className="mb-2 text-xl font-bold uppercase text-gray-900">Certificações</h2>
              <ul className="space-y-2 text-sm">
                {resume.certifications.map((cert, index) => (
                  <li key={cert.id}>
                    {renderEditableText(
                      `certifications.${index}.name`,
                      cert.name,
                      'font-semibold text-gray-900'
                    )}
                    <span className="text-gray-700"> - {cert.issuer}</span>
                    <span className="text-gray-600"> ({cert.dateObtained})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-bold uppercase text-gray-900">Projetos</h2>
              <div className="space-y-3">
                {resume.projects.map((project, index) => (
                  <div key={project.id}>
                    {renderEditableText(
                      `projects.${index}.name`,
                      project.name,
                      'font-bold text-gray-900',
                      false,
                      'h3'
                    )}
                    {renderEditableText(
                      `projects.${index}.description`,
                      project.description,
                      'mt-1 text-sm text-gray-700',
                      true,
                      'p'
                    )}
                    {project.technologies.length > 0 && (
                      <p className="mt-1 text-sm text-gray-600">
                        <span className="font-semibold">Tecnologias:</span> {project.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
