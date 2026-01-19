import { ChevronDown, Plus, Store, Settings, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { ContentBusinessProfile } from '../types';

interface ProfileSelectorProps {
  profiles: ContentBusinessProfile[];
  currentProfile: ContentBusinessProfile | null;
  isLoading?: boolean;
  onSelectProfile: (profile: ContentBusinessProfile) => void;
  onCreateProfile: () => void;
  onEditProfile?: (profile: ContentBusinessProfile) => void;
}

// Map niche to emoji
const NICHE_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  retail: '🛍️',
  consulting: '💼',
  health: '🏥',
  beauty: '💄',
  education: '📚',
  technology: '💻',
  fitness: '💪',
  real_estate: '🏠',
  services: '🔧',
  other: '📌',
};

export function ProfileSelector({
  profiles,
  currentProfile,
  isLoading,
  onSelectProfile,
  onCreateProfile,
  onEditProfile,
}: ProfileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileIcon = (profile: ContentBusinessProfile) => {
    if (profile.icon) return profile.icon;
    return NICHE_ICONS[profile.business_niche] || '📌';
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-lg animate-pulse">
        <div className="w-6 h-6 bg-slate-700 rounded" />
        <div className="w-24 h-4 bg-slate-700 rounded" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
      >
        {currentProfile ? (
          <>
            <span className="text-lg">{getProfileIcon(currentProfile)}</span>
            <span className="text-sm text-white font-medium max-w-[150px] truncate">
              {currentProfile.name}
            </span>
          </>
        ) : (
          <>
            <Store className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-400">Selecionar perfil</span>
          </>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-700/50">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Perfis de Negocio</p>
          </div>

          {/* Profile list */}
          <div className="max-h-64 overflow-y-auto">
            {profiles.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Store className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhum perfil criado</p>
                <p className="text-xs text-slate-500 mt-1">
                  Crie um perfil para salvar suas preferencias
                </p>
              </div>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="group flex items-center justify-between px-3 py-2 hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => {
                    onSelectProfile(profile);
                    setIsOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSelectProfile(profile);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-lg flex-shrink-0">{getProfileIcon(profile)}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{profile.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {profile.target_audience || profile.business_niche}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.is_default && (
                      <span className="text-xs text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                        Padrao
                      </span>
                    )}
                    {currentProfile?.id === profile.id && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                    {onEditProfile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProfile(profile);
                          setIsOpen(false);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-opacity"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Create new button */}
          <div className="border-t border-slate-700/50">
            <button
              onClick={() => {
                onCreateProfile();
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-3 py-2.5 text-sm text-orange-400 hover:bg-slate-800/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar novo perfil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
