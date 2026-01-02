export function MidStats() {
  return (
    <section className="bg-gradient-to-b from-transparent via-slate-900/20 to-transparent px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <div className="mb-5 sm:mb-6 md:mb-8 inline-flex items-center rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-purple-600/20 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3">
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
            className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-400"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <path d="M16 3.128a4 4 0 0 1 0 7.744" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <span className="font-semibold text-xs sm:text-sm md:text-base text-blue-400">
            Mais de 1.000 usuários em breve
          </span>
        </div>

        <h2 className="mb-3 sm:mb-4 md:mb-6 text-xl sm:text-2xl md:text-3xl font-bold">
          Junte-se à revolução da IA personalizada
        </h2>
        <p className="mx-auto mb-6 sm:mb-8 md:mb-10 max-w-3xl text-sm sm:text-base md:text-lg lg:text-xl text-slate-400">
          Seja um dos primeiros a experimentar a próxima geração de assistentes
          virtuais. Criado com base em anos de experiência em IA e
          desenvolvimento de soluções inovadoras.
        </p>

        <div className="mt-6 sm:mt-8 md:mt-12 grid gap-4 sm:gap-6 md:gap-8 grid-cols-3">
          <div className="text-center px-1">
            <div className="mb-0.5 sm:mb-1 md:mb-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-400">99%</div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-400 leading-tight">Facilidade de uso</div>
          </div>
          <div className="text-center px-1">
            <div className="mb-0.5 sm:mb-1 md:mb-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-purple-400">24/7</div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-400 leading-tight">Disponibilidade</div>
          </div>
          <div className="text-center px-1">
            <div className="mb-0.5 sm:mb-1 md:mb-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-cyan-400">∞</div>
            <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-400 leading-tight">Possibilidades</div>
          </div>
        </div>
      </div>
    </section>
  );
}
