import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import type { User } from '@supabase/supabase-js';

type NavBarProps = {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  user?: User | null;
  userName?: string;
  onDashboardClick?: () => void;
  onLogout?: () => void;
};

export default function NavBar({
  onLoginClick,
  onSignupClick,
  user,
  userName = 'Usuário',
  onDashboardClick,
  onLogout
}: NavBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-800 bg-black-main/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="/bone-logo.png"
              alt="MyEasyAI Logo"
              className="h-12 w-12 object-contain"
            />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
              MyEasyAI
            </span>
          </div>

          <div className="hidden space-x-8 md:flex">
            <a
              href="#features"
              className="text-slate-300 transition-colors hover:text-blue-400"
            >
              Features
            </a>
            <a
              href="#preview"
              className="text-slate-300 transition-colors hover:text-blue-400"
            >
              Preview
            </a>
            <a
              href="#cursos"
              className="text-slate-300 transition-colors hover:text-blue-400"
            >
              Cursos
            </a>
            <a
              href="#contato"
              className="text-slate-300 transition-colors hover:text-blue-400"
            >
              Contato
            </a>
          </div>

          <div className="flex space-x-2 sm:space-x-3">
            {user ? (
              // Usuário logado - mostrar dropdown menu
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center justify-center space-x-2 border border-slate-600 bg-slate-700/80 px-4 py-2.5 text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-600 whitespace-nowrap ${
                    isDropdownOpen ? 'rounded-t-2xl border-b-transparent' : 'rounded-2xl'
                  }`}
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Oi, {userName}!</span>
                  <svg
                    className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 min-w-full rounded-b-2xl border border-t-0 border-slate-600 bg-slate-700/80 shadow-xl whitespace-nowrap">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onDashboardClick?.();
                      }}
                      className="block w-full border-t border-slate-600 px-4 py-2.5 text-left text-slate-100 transition-colors hover:bg-slate-600 hover:text-blue-400"
                    >
                      Dashboard
                    </button>
                    <div className="border-t border-slate-600"></div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="block w-full rounded-b-2xl px-4 py-2.5 text-left text-slate-100 transition-colors hover:bg-slate-600 hover:text-red-400"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Usuário não logado - mostrar Inscreva-se e Login
              <>
                <Button variant="ghostNav" onClick={onSignupClick}>
                  <span className="hidden sm:inline">Inscreva-se</span>
                  <span className="sm:hidden">Cadastrar</span>
                </Button>
                <Button variant="nav" onClick={onLoginClick}>
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
