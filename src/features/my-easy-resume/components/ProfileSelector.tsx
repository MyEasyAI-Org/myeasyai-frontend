import React from 'react';
import type { ResumeProfile } from '../types';

interface ProfileSelectorProps {
  profiles: ResumeProfile[];
  currentProfile: ResumeProfile | null;
  onSelectProfile: (profile: ResumeProfile) => void;
  onCreateProfile: () => void;
  isLoading?: boolean;
}

export function ProfileSelector({
  profiles,
  currentProfile,
  onSelectProfile,
  onCreateProfile,
  isLoading = false,
}: ProfileSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
        Carregando perfis...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="profile-select" className="text-sm font-medium text-gray-700">
        Perfil:
      </label>
      <select
        id="profile-select"
        value={currentProfile?.id || ''}
        onChange={(e) => {
          const profile = profiles.find((p) => p.id === e.target.value);
          if (profile) onSelectProfile(profile);
        }}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
      >
        {profiles.length === 0 && (
          <option value="">Nenhum perfil disponível</option>
        )}
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name} {profile.is_default && '(Padrão)'}
          </option>
        ))}
      </select>
      <button
        onClick={onCreateProfile}
        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        + Novo Perfil
      </button>
    </div>
  );
}
