import { useState, useEffect } from 'react';
import type { UserProfile, CadastralInfo } from '../../hooks/useUserData';
import { DangerZoneModal } from './DangerZoneModal';

type EditableProfile = UserProfile & {
  country?: string;
  postal_code?: string;
  address?: string;
  preferred_language?: string;
};

type ProfileTabProps = {
  profile: UserProfile;
  cadastralInfo: CadastralInfo;
  userUuid: string | null;
  onUpdateProfile: (profile: Partial<EditableProfile>) => Promise<void>;
};

export function ProfileTab({
  profile,
  cadastralInfo,
  userUuid,
  onUpdateProfile,
}: ProfileTabProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<EditableProfile>({
    ...profile,
    country: cadastralInfo.country,
    postal_code: cadastralInfo.postal_code,
    address: cadastralInfo.address,
    preferred_language: cadastralInfo.preferred_language,
  });

  useEffect(() => {
    setEditedProfile({
      ...profile,
      country: cadastralInfo.country,
      postal_code: cadastralInfo.postal_code,
      address: cadastralInfo.address,
      preferred_language: cadastralInfo.preferred_language,
    });
  }, [profile, cadastralInfo]);

  const handleSaveProfile = async () => {
    if (!userUuid) return;

    try {
      await onUpdateProfile(editedProfile);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const getLanguageName = (lang: string) => {
    const languages: Record<string, string> = {
      pt: 'Portugues',
      en: 'English',
      es: 'Espanol',
      fr: 'Francais',
    };
    return languages[lang] || lang || 'Portugues';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Perfil</h1>
        <p className="mt-2 text-slate-400">
          Gerencie as informacoes do seu perfil.
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {profile.name[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.preferred_name || profile.name}</h2>
            <p className="text-slate-400">{profile.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Nome Completo
              </label>
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, name: e.target.value })
                }
                disabled={!isEditingProfile}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Apelido (como deseja ser chamado)
              </label>
              <input
                type="text"
                value={editedProfile.preferred_name || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, preferred_name: e.target.value })
                }
                disabled={!isEditingProfile}
                placeholder="Ex: Joao, Jo, etc."
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">
              Email
            </label>
            <input
              type="email"
              value={editedProfile.email}
              disabled
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50"
            />
            <p className="mt-1 text-xs text-slate-500">
              O email nao pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400">
              Biografia
            </label>
            <textarea
              value={editedProfile.bio || ''}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, bio: e.target.value })
              }
              disabled={!isEditingProfile}
              rows={3}
              placeholder="Conte um pouco sobre voce..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50 placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Telefone
              </label>
              <input
                type="tel"
                value={editedProfile.phone || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, phone: e.target.value })
                }
                disabled={!isEditingProfile}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400">
                Empresa
              </label>
              <input
                type="text"
                value={editedProfile.company || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, company: e.target.value })
                }
                disabled={!isEditingProfile}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Cadastral Information Section */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Informacoes de Cadastro</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400">
                  Pais de Residencia
                </label>
                <select
                  value={editedProfile.country || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, country: e.target.value })
                  }
                  disabled={!isEditingProfile}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  <option value="BR">Brasil</option>
                  <option value="US">Estados Unidos</option>
                  <option value="PT">Portugal</option>
                  <option value="ES">Espanha</option>
                  <option value="FR">Franca</option>
                  <option value="DE">Alemanha</option>
                  <option value="UK">Reino Unido</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400">
                  CEP / Codigo Postal
                </label>
                <input
                  type="text"
                  value={editedProfile.postal_code || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, postal_code: e.target.value })
                  }
                  disabled={!isEditingProfile}
                  placeholder="Ex: 01310-100"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-400">
                Endereco Completo
              </label>
              <input
                type="text"
                value={editedProfile.address || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, address: e.target.value })
                }
                disabled={!isEditingProfile}
                placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50 placeholder:text-slate-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-400">
                Idioma Preferido
              </label>
              <select
                value={editedProfile.preferred_language || 'pt'}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, preferred_language: e.target.value })
                }
                disabled={!isEditingProfile}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
              >
                <option value="pt">Portugues</option>
                <option value="en">English</option>
                <option value="es">Espanol</option>
                <option value="fr">Francais</option>
              </select>
            </div>

            {/* Read-only info */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-400">
                  Membro desde
                </label>
                <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                  {cadastralInfo.created_at
                    ? new Date(cadastralInfo.created_at).toLocaleDateString('pt-BR')
                    : 'Nao informado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400">
                  Ultima vez online
                </label>
                <div className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50">
                  {cadastralInfo.last_online
                    ? new Date(cadastralInfo.last_online).toLocaleString('pt-BR')
                    : 'Agora'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Editar Perfil
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setEditedProfile({
                      ...profile,
                      country: cadastralInfo.country,
                      postal_code: cadastralInfo.postal_code,
                      address: cadastralInfo.address,
                      preferred_language: cadastralInfo.preferred_language,
                    });
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-white hover:bg-slate-700"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone Modal */}
      <DangerZoneModal />
    </div>
  );
}
