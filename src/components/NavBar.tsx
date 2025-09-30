import { Button } from './Button';
import type { User } from '@supabase/supabase-js';

type NavBarProps = {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  user?: User | null;
  onDashboardClick?: () => void;
  onLogout?: () => void;
};

export default function NavBar({ 
  onLoginClick, 
  onSignupClick, 
  user, 
  onDashboardClick, 
  onLogout 
}: NavBarProps) {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M12 18V5" />
                <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                <path d="M18 18a4 4 0 0 0 2-7.464" />
                <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
                <path d="M6 18a4 4 0 0 1-2-7.464" />
                <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
              </svg>
            </div>
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

          <div className="flex space-x-3">
            {user ? (
              // Usuário logado - mostrar Dashboard e Sair
              <>
                <Button variant="ghostNav" onClick={onDashboardClick}>
                  Dashboard
                </Button>
                <Button variant="nav" onClick={onLogout}>
                  Sair
                </Button>
              </>
            ) : (
              // Usuário não logado - mostrar Inscreva-se e Login
              <>
                <Button variant="ghostNav" onClick={onSignupClick}>
                  Inscreva-se
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
