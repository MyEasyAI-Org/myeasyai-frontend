import { FaStar } from 'react-icons/fa';
import { Button } from './Button';
import { LoginModal } from './LoginModal';
import { SignupModal } from './SignupModal';
import type { User } from '@supabase/supabase-js';

type HeroProps = {
  isLoginOpen: boolean;
  onOpenLogin: () => void;
  onCloseLogin: () => void;
  isSignupOpen: boolean;
  onOpenSignup: () => void;
  onCloseSignup: () => void;
  user?: User | null;
  onDashboardClick?: () => void;
};

export function Hero({
  isLoginOpen,
  onOpenLogin,
  onCloseLogin,
  isSignupOpen,
  onOpenSignup,
  onCloseSignup,
  user,
  onDashboardClick,
}: HeroProps) {
  const handleSwitchToSignup = () => {
    onCloseLogin();
    onOpenSignup();
  };

  const handleSwitchToLogin = () => {
    onCloseSignup();
    onOpenLogin();
  };

  return (
    <section className="px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-slate-800 px-4 py-2">
            <FaStar
              className="mr-2 h-4 w-4 text-purple-400"
              aria-hidden="true"
            />
            <span className="text-sm text-slate-300">Sua IA, do seu jeito</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Construa e treine
            </span>
            <br />
            <span className="text-slate-100">assistentes virtuais</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-400">
            Construa e treine assistentes virtuais para o que voce precisa. IA
            adaptada ao seu contexto, integracao com cursos e aprendizado
            continuo.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {user ? (
              // Usuário logado - mostrar botão para Dashboard
              <>
                <Button variant="primary" onClick={onDashboardClick}>
                  Acessar Dashboard
                </Button>
                <Button variant="outline" href="#features">
                  Saiba mais
                </Button>
              </>
            ) : (
              // Usuário não logado - mostrar botão para cadastro
              <>
                <Button variant="primary" onClick={onOpenSignup}>
                  Quero experimentar
                </Button>
                <Button variant="outline" href="#features">
                  Saiba mais
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="relative rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
            <div className="relative">
              <img
                src="https://cdn.dribbble.com/userupload/44332009/file/84c558bf1e97ff630880c97a118c14c3.png?resize=752x&vertical=center"
                alt="Dashboard MyEasyAI"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={onCloseLogin}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={onCloseSignup}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </section>
  );
}
