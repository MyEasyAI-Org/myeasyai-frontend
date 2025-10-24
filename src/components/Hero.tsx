import type { User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Button } from './Button';
import { LoginModal } from './LoginModal';
import { SignupModal } from './SignupModal';

// Declaração de tipos para YouTube Player API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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

// Componente do player de vídeo do YouTube
function YouTubePlayer() {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Carregar a API do YouTube se ainda não foi carregada
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Função que será chamada quando a API estiver pronta
    const onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: 'mYAgOPlLwp0',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (playerRef.current && isMuted) {
      e.preventDefault();
      e.stopPropagation();
      playerRef.current.unMute();
      setIsMuted(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ paddingBottom: '56.25%' }} // Aspect ratio 16:9
    >
      <div
        id="youtube-player"
        className="absolute inset-0 h-full w-full rounded-lg"
      />
      {isMuted && (
        <div
          onClick={handleClick}
          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20"
        >
          <div className="rounded-full bg-black/70 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
            Clique para ativar o som
          </div>
        </div>
      )}
    </div>
  );
}

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
          <button
            onClick={onOpenSignup}
            className="mb-8 inline-flex items-center rounded-full bg-slate-800 px-4 py-2 transition-all hover:scale-105 hover:bg-slate-700 cursor-pointer"
          >
            <FaStar
              className="mr-2 h-4 w-4 text-purple-400"
              aria-hidden="true"
            />
            <span className="text-sm text-slate-300">Sua IA, do seu jeito</span>
          </button>

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
              <YouTubePlayer />
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
