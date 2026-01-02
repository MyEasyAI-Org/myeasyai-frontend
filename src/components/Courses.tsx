import { Button } from './Button';

export function Courses() {
  return (
    <section id="cursos" className="bg-gradient-to-b from-slate-900/30 via-slate-800/40 to-slate-900/30 px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center">
          <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            Além de criar IA, aprenda com nossos cursos exclusivos
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-slate-400">
            Domine as técnicas mais avançadas de IA e maximize o potencial dos
            seus assistentes virtuais
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              color: 'from-blue-500 to-cyan-400',
              title: 'Fundamentos de IA',
              desc: 'Aprenda os conceitos básicos de inteligência artificial e machine learning',
              tagColor: 'text-blue-400',
              borderHover: 'hover:border-blue-500/50',
            },
            {
              color: 'from-purple-500 to-purple-600',
              title: 'Treinamento Avançado',
              desc: 'Técnicas avançadas para otimizar e personalizar seus assistentes virtuais',
              tagColor: 'text-purple-400',
              borderHover: 'hover:border-purple-500/50',
            },
            {
              color: 'from-cyan-400 to-cyan-500',
              title: 'Integração Empresarial',
              desc: 'Como implementar IA em ambientes corporativos e escalar soluções',
              tagColor: 'text-cyan-400',
              borderHover: 'hover:border-cyan-500/50',
            },
          ].map((c) => (
            <div
              key={c.title}
              className={`rounded-lg sm:rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-5 md:p-6 transition-all duration-300 active:scale-[0.98] ${c.borderHover}`}
            >
              <div
                className={`mb-2.5 sm:mb-3 md:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-gradient-to-r ${c.color}`}
              >
                {/* generic category icon */}
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
                  className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white"
                >
                  <path d="M12 18V5" />
                  <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                  <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                  <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                </svg>
              </div>
              <h3 className="mb-1.5 sm:mb-2 md:mb-3 text-base sm:text-lg md:text-xl font-semibold">{c.title}</h3>
              <p className="mb-2.5 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base text-slate-400">{c.desc}</p>
              <div className={`font-semibold text-xs sm:text-sm md:text-base ${c.tagColor}`}>Em breve</div>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 md:mt-12 text-center">
          <Button variant="outline" className="w-full sm:w-auto">Saiba mais sobre os cursos</Button>
        </div>
      </div>
    </section>
  );
}
