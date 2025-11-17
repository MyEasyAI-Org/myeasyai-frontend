import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const dismissedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      // Método 1: Verificar se está em modo standalone
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;

      // Método 2: Verificar se foi instalado via Chrome
      const isInstalledPWA =
        window.navigator && 'standalone' in window.navigator
          ? (window.navigator as any).standalone
          : false;

      // Método 3: Verificar user agent
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;

      return (
        isStandalone || isInstalledPWA || isInWebAppiOS || isInWebAppChrome
      );
    };

    // Se já estiver instalado, não mostrar banner
    if (checkIfInstalled()) {
      setIsInstalled(true);
      setShowBanner(false);
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('💾 PWA install prompt disponível');
      // Prevenir o comportamento padrão para controlarmos quando mostrar
      e.preventDefault();

      // Não processar se já foi rejeitado pelo usuário
      if (dismissedRef.current) {
        return;
      }

      // Armazenar o evento e mostrar o banner customizado
      setDeferredPrompt(e);

      // Pequeno delay para garantir que o DOM está pronto
      setTimeout(() => {
        setShowBanner(true);
      }, 100);
    };

    // Listener para detectar quando foi instalado
    const handleAppInstalled = () => {
      console.log('✅ PWA foi instalado');
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      dismissedRef.current = false; // Reset para futuras sessões
    };

    // Adicionar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (fallbackTimerRef.current !== null) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, []); // Remover dependências para evitar re-execução

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: instruir instalação manual
      toast.info('Como instalar o app', {
        description: '• Chrome: Clique no ícone de instalação na barra de endereços\n• Edge: Menu → Apps → "Instalar este site como um app"\n• Firefox: Adicione aos favoritos e acesse pelo menu',
        duration: 6000,
      });
      return;
    }

    try {
      console.log('🚀 Iniciando instalação do PWA...');

      // Ocultar banner imediatamente para melhor UX
      setShowBanner(false);

      // Chamar o prompt de instalação
      await deferredPrompt.prompt();

      // Aguardar a escolha do usuário
      const choiceResult = await deferredPrompt.userChoice;
      console.log('📊 Resultado da escolha:', choiceResult.outcome);

      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuário aceitou a instalação');
        setIsInstalled(true);
      } else {
        console.log('❌ Usuário rejeitou a instalação');
        // Marcar como dispensado para não mostrar novamente nesta sessão
        dismissedRef.current = true;
      }

      // Limpar o prompt após uso
      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error);
      // Se houve erro, mostrar banner novamente
      if (!dismissedRef.current) {
        setShowBanner(true);
      }
    }
  };

  const handleDismiss = () => {
    dismissedRef.current = true;
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  // Não mostrar se estiver instalado
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm px-4">
      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
            <h3 className="text-sm font-semibold leading-tight text-slate-100">
              MyEasyAI no bolso
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              Instale o app e continue criando assistentes rapidinho, onde
              estiver.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Button variant="primary" onClick={handleInstallClick}>
                <span className="px-2 py-1 text-xs">Instalar</span>
              </Button>
              <button
                onClick={handleDismiss}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-300"
              >
                Mais tarde
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 transition-colors hover:text-slate-300"
          >
            <span className="sr-only">Fechar banner</span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
