type LoadingScreenProps = {
  loadingStep: string;
  loadingProgress: number;
};

export function LoadingScreen({
  loadingStep,
  loadingProgress,
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background animated particles (stars) */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
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
            <div className="w-1 h-1 bg-blue-400/40 rounded-full" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo container with glow effects */}
        <div className="relative">
          {/* Glow effect rings */}
          <div className="absolute inset-0 animate-pulse">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl" />
          </div>
          <div
            className="absolute inset-0 animate-ping"
            style={{ animationDuration: '2s' }}
          >
            <div className="w-28 h-28 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full blur-lg mx-auto my-auto" />
          </div>
          <div
            className="absolute inset-0 animate-pulse"
            style={{ animationDuration: '3s' }}
          >
            <div className="w-36 h-36 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl -mx-2 -my-2" />
          </div>

          {/* Logo icon */}
          <div className="relative animate-pulse">
            <img
              src="/bone-logo.png"
              alt="MyEasyAI Logo"
              className="h-32 w-32 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Text container with shimmer effect */}
        <div className="relative">
          {/* Text glow background */}
          <div className="absolute inset-0 blur-xl">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent opacity-30 animate-pulse">
              MyEasyAI Dashboard
            </span>
          </div>

          {/* Main text */}
          <h1 className="relative bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent drop-shadow-2xl">
            MyEasyAI Dashboard
          </h1>

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
        </div>

        {/* Subtitle with dynamic status */}
        <div className="text-center space-y-2">
          <p className="text-slate-200 text-lg font-medium tracking-wide">
            {loadingStep}
          </p>
          <p className="text-slate-400 text-sm">
            {loadingProgress < 50 && '✨ Preparando sua experiência...'}
            {loadingProgress >= 50 &&
              loadingProgress < 100 &&
              '🚀 Quase lá...'}
            {loadingProgress >= 100 && '🎉 Tudo pronto!'}
          </p>
        </div>

        {/* Improved loading dots */}
        <div className="flex space-x-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>

        {/* Dynamic progress indicator */}
        <div className="w-80 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">Progresso</span>
            <span className="text-slate-400">
              {Math.round(loadingProgress)}%
            </span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-60 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced animations styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }

        .animate-shimmer {
          animation: shimmer 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
