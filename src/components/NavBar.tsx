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
            <button
              onClick={() => window.location.hash = '#dashboard-preview'}
              className="text-amber-400 transition-colors hover:text-amber-300 font-semibold"
            >
              Demo Dashboard
            </button>
          </div>

          <div className="flex space-x-2 sm:space-x-3">
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
