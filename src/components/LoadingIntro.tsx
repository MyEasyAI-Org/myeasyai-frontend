import { useEffect, useState } from 'react';

export function LoadingIntro() {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    // Sequência de animações
    const timer1 = setTimeout(() => setShowLogo(true), 300);
    const timer2 = setTimeout(() => setShowText(true), 800);
    const timer3 = setTimeout(() => setShowGlow(true), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <div className="w-1 h-1 bg-blue-400/30 rounded-full" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo container */}
        <div
          className={`relative transition-all duration-1000 ease-out ${
            showLogo
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-75 translate-y-10'
          }`}
        >
          {/* Glow effect rings */}
          {showGlow && (
            <>
              <div className="absolute inset-0 animate-pulse">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl" />
              </div>
              <div
                className="absolute inset-0 animate-ping"
                style={{ animationDuration: '2s' }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-lg mx-auto my-auto" />
              </div>
              <div
                className="absolute inset-0 animate-pulse"
                style={{ animationDuration: '3s' }}
              >
                <div className="w-28 h-28 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl -mx-2 -my-2" />
              </div>
            </>
          )}

          {/* Logo icon */}
          <div
            className={`relative transition-all duration-700 ${
              showGlow ? 'animate-pulse' : ''
            }`}
          >
            <img
              src="/bone-logo.png"
              alt="MyEasyAI Logo"
              className={`h-32 w-32 object-contain transition-all duration-500 ${
                showGlow ? 'drop-shadow-2xl' : ''
              }`}
            />
          </div>
        </div>

        {/* Text container */}
        <div
          className={`relative transition-all duration-1000 ease-out delay-300 ${
            showText
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-5'
          }`}
        >
          {/* Text glow background */}
          {showGlow && (
            <div className="absolute inset-0 blur-xl">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-6xl font-bold text-transparent opacity-30 animate-pulse">
                MyEasyAI
              </span>
            </div>
          )}

          {/* Main text */}
          <h1
            className={`relative bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-6xl font-bold text-transparent transition-all duration-700 ${
              showGlow ? 'drop-shadow-2xl' : ''
            }`}
          >
            MyEasyAI
          </h1>

          {/* Shimmer effect */}
          {showGlow && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
          )}
        </div>

        {/* Subtitle */}
        <div
          className={`transition-all duration-1000 ease-out delay-700 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <p
            className={`text-slate-300 text-lg font-medium tracking-wide transition-all duration-500 ${
              showGlow ? 'text-slate-200' : ''
            }`}
          >
            Welcome to the future of AI
          </p>
        </div>

        {/* Loading dots */}
        <div
          className={`flex space-x-2 transition-all duration-1000 ease-out delay-1000 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <div
          className={`w-64 h-1 bg-slate-700/50 rounded-full overflow-hidden transition-all duration-1000 ease-out delay-1200 ${
            showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-progress origin-left" />
        </div>
      </div>

      {/* Custom animations styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-progress {
          animation: progress 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
