import { useEffect, useState } from 'react';

type LoadingBarProps = {
  isLoading: boolean;
  duration?: number; // em milissegundos
};

export function LoadingBar({ isLoading, duration = 1500 }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    // Iniciar a barra
    setProgress(10);

    // Animar até 90% durante a duração especificada
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        // Incremento gradual
        return prev + (90 - prev) * 0.1;
      });
    }, 50);

    // Após a duração, completar rapidamente
    const completeTimeout = setTimeout(() => {
      setProgress(100);
      // Fade out após completar
      setTimeout(() => {
        setProgress(0);
      }, 300);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimeout);
    };
  }, [isLoading, duration]);

  if (progress === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-lg shadow-purple-500/50"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
