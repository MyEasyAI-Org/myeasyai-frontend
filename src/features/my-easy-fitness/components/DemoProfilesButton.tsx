/**
 * DemoProfilesButton
 *
 * Development-only button to quickly load demo profiles for testing.
 * Only renders in development mode (import.meta.env.DEV).
 */

import { useState } from 'react';
import { TestTube2, ChevronDown, User } from 'lucide-react';
import type { UserPersonalInfo } from '../types';
import { DEMO_PROFILES } from '../constants';

type DemoProfilesButtonProps = {
  onLoadProfile: (profile: UserPersonalInfo) => void;
};

export function DemoProfilesButton({ onLoadProfile }: DemoProfilesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only render in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors border border-amber-500/30"
      >
        <TestTube2 className="h-4 w-4" />
        <span className="hidden sm:inline">Demo</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999]"
          onClick={() => setIsOpen(false)}
        >
          {/* Dropdown menu */}
          <div
            className="absolute right-4 top-16 w-72 rounded-xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: '#0f172a', border: '2px solid #475569' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b-2 border-slate-600" style={{ backgroundColor: '#1e293b' }}>
              <p className="text-xs text-slate-200 font-medium">
                Carregar perfil demo para testes
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {DEMO_PROFILES.map((profile, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onLoadProfile(profile);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-600 last:border-b-0 cursor-pointer"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: '#166534' }}>
                    <User className="h-4 w-4 text-lime-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {profile.nome}
                    </p>
                    <p className="text-xs text-slate-300 truncate">
                      {profile.idade} anos, {profile.experienciaTreino || 'iniciante'} - {profile.preferenciaTreino || 'musculacao'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {profile.objetivo}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
