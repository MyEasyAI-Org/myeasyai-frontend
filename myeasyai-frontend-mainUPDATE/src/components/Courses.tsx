export function Courses() {
  return (
    <section id="cursos" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Além de criar IA, aprenda com nossos cursos exclusivos
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            Domine as técnicas mais avançadas de IA e maximize o potencial dos
            seus assistentes virtuais
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              color: "from-blue-500 to-cyan-400",
              title: "Fundamentos de IA",
              desc: "Aprenda os conceitos básicos de inteligência artificial e machine learning",
              tagColor: "text-blue-400",
              borderHover: "hover:border-blue-500/50",
            },
            {
              color: "from-purple-500 to-purple-600",
              title: "Treinamento Avançado",
              desc: "Técnicas avançadas para otimizar e personalizar seus assistentes virtuais",
              tagColor: "text-purple-400",
              borderHover: "hover:border-purple-500/50",
            },
            {
              color: "from-cyan-400 to-cyan-500",
              title: "Integração Empresarial",
              desc: "Como implementar IA em ambientes corporativos e escalar soluções",
              tagColor: "text-cyan-400",
              borderHover: "hover:border-cyan-500/50",
            },
          ].map((c) => (
            <div
              key={c.title}
              className={`rounded-xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 ${c.borderHover}`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${c.color}`}
              >
                {/* ícone genérico de categoria */}
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
                  className="h-6 w-6 text-white"
                >
                  <path d="M12 18V5" />
                  <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                  <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                  <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">{c.title}</h3>
              <p className="mb-4 text-slate-400">{c.desc}</p>
              <div className={`font-semibold ${c.tagColor}`}>Em breve</div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="rounded-lg border border-slate-700 px-8 py-3 font-semibold text-slate-300 transition-colors hover:bg-slate-800">
            Saiba mais sobre os cursos
          </button>
        </div>
      </div>
    </section>
  );
}
