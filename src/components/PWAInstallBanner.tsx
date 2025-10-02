import { useState, useEffect } from 'react';
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      // Método 1: Verificar se está em modo standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Método 2: Verificar se foi instalado via Chrome
      const isInstalledPWA = window.navigator && 'standalone' in window.navigator 
        ? (window.navigator as any).standalone 
        : false;
      
      // Método 3: Verificar user agent
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      return isStandalone || isInstalledPWA || isInWebAppiOS || isInWebAppChrome;
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
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    // Listener para detectar quando foi instalado
    const handleAppInstalled = () => {
      console.log('✅ PWA foi instalado');
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    // Adicionar listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para navegadores que não suportam beforeinstallprompt mas permitem instalação
    // Mostrar banner após 3 segundos se não estiver instalado
    const fallbackTimer = setTimeout(() => {
      if (!isInstalled && !deferredPrompt) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: instruir instalação manual
      alert('Para instalar o app:\n\n• Chrome: Clique no ícone de instalação na barra de endereços\n• Edge: Menu ⋯ → Apps → "Instalar este site como um app"\n• Firefox: Adicione aos favoritos e acesse pelo menu');
      return;
    }

    try {
      console.log('🚀 Iniciando instalação do PWA...');
      await deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      console.log('📊 Resultado da escolha:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuário aceitou a instalação');
      } else {
        console.log('❌ Usuário rejeitou a instalação');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Mostrar novamente em 1 hora
    setTimeout(() => {
      if (!isInstalled) {
        setShowBanner(true);
      }
    }, 60 * 60 * 1000); // 1 hora
  };

  // Não mostrar se estiver instalado
  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-start space-x-3">
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
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-100">
              Instalar MyEasyAI
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Instale o app para acesso mais rápido e melhor experiência.
            </p>
            
            <div className="flex space-x-2 mt-3">
              <Button 
                variant="primary" 
                onClick={handleInstallClick}
              >
                <span className="text-xs px-2 py-1">Instalar</span>
              </Button>
              <button 
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1"
              >
                Mais tarde
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
