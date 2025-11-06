import { useCallback, useEffect, useRef } from 'react';

interface UseInactivityTimeoutProps {
  timeout: number; // tempo em milissegundos
  onTimeout: () => void;
  enabled?: boolean;
}

export const useInactivityTimeout = ({
  timeout,
  onTimeout,
  enabled = true,
}: UseInactivityTimeoutProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Limpar timer existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configurar novo timer
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout, enabled]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    // Lista de eventos que indicam atividade do usuário
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ];

    // Função para resetar o timer em qualquer atividade
    const handleActivity = () => {
      resetTimer();
    };

    // Adicionar listeners para todos os eventos
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Iniciar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimer();
    };
  }, [resetTimer, clearTimer, enabled]);

  return { resetTimer, clearTimer };
};
