import { useState, useEffect } from 'react';
import type { UserProfile, CadastralInfo } from '../../hooks/useUserData';
import { ProfileCadastralInfo } from './ProfileCadastralInfo';
import { DangerZoneModal } from './DangerZoneModal';

type ProfileTabProps = {
  profile: UserProfile;
  cadastralInfo: CadastralInfo;
  userUuid: string | null;
  onUpdateProfile: (profile: UserProfile) => Promise<void>;
};

export function ProfileTab({
  profile,
  cadastralInfo,
  userUuid,
  onUpdateProfile,
}: ProfileTabProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!userUuid) return;

    try {
      await onUpdateProfile(editedProfile);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Perfil</h1>
        <p className="mt-2 text-slate-400">
          Gerencie as informações do seu perfil.
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {profile.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-slate-400">{profile.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400">
              Nome
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
              Email
            </label>
            <input
              type="email"
              value={editedProfile.email}
              disabled
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white opacity-50"
            />
            <p className="mt-1 text-xs text-slate-500">
              O email não pode ser alterado
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
              placeholder="Conte um pouco sobre você... 😊"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white disabled:opacity-50 placeholder:text-slate-500"
            />
          </div>

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

          <div className="flex space-x-4">
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
                    setEditedProfile(profile);
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

      {/* Cadastral Information */}
      <ProfileCadastralInfo cadastralInfo={cadastralInfo} />

      {/* Danger Zone Modal */}
      <DangerZoneModal />
    </div>
  );
}
