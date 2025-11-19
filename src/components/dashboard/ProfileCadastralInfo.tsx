import { useState } from 'react';
import type { CadastralInfo } from '../../hooks/useUserData';

type ProfileCadastralInfoProps = {
  cadastralInfo: CadastralInfo;
};

export function ProfileCadastralInfo({
  cadastralInfo,
}: ProfileCadastralInfoProps) {
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);

  const getLanguageName = (lang: string) => {
    const languages: Record<string, string> = {
      pt: 'Português',
      en: 'English',
      es: 'Español',
      fr: 'Français',
    };
    return languages[lang] || 'Não informado';
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        Informações de Cadastro
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-400">
            País de Residência
          </label>
          <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
            {cadastralInfo.country || 'Não informado'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            CEP / Código Postal
          </label>
          <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
            {cadastralInfo.postal_code || 'Não informado'}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-400">
            Endereço Completo
          </label>
          <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
            {cadastralInfo.address || 'Não informado'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Idioma Preferido
          </label>
          <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
            {getLanguageName(cadastralInfo.preferred_language || '')}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Última vez online
          </label>
          <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
            {cadastralInfo.last_online
              ? new Date(cadastralInfo.last_online).toLocaleString('pt-BR')
              : 'Agora'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400">
            Membro desde
          </label>
          <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
            {cadastralInfo.created_at
              ? new Date(cadastralInfo.created_at).toLocaleDateString('pt-BR')
              : 'Não informado'}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        💡 Essas informações foram coletadas durante seu cadastro. Para
        atualizar, entre em contato com o suporte.
      </p>
    </div>
  );
}
