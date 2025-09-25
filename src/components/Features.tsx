export function Features() {
  return (
    <section
      id="features"
      className="bg-slate-800/50 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">
            Por que escolher MyEasyAi?
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            Transforme suas ideias em assistentes virtuais inteligentes com
            nossa plataforma inovadora
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="group rounded-xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:border-blue-500/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform group-hover:scale-110">
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
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-blue-400">
              Fácil de usar
            </h3>
            <p className="leading-relaxed text-slate-400">
              Interface intuitiva que permite criar assistentes virtuais sem
              conhecimento técnico avançado
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:border-purple-500/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 transition-transform group-hover:scale-110">
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
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-purple-400">
              IA adaptada ao seu contexto
            </h3>
            <p className="leading-relaxed text-slate-400">
              Assistentes que aprendem e se adaptam às suas necessidades
              específicas e contexto de trabalho
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:border-cyan-500/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 transition-transform group-hover:scale-110">
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
                <path d="M12 7v14" />
                <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-cyan-400">
              Integração com cursos
            </h3>
            <p className="leading-relaxed text-slate-400">
              Aprendizado contínuo através de cursos integrados e atualização
              constante de conhecimento
            </p>
          </div>

          {/* Card 4 */}
          <div className="group rounded-xl border border-slate-700 bg-slate-800 p-6 transition-all duration-300 hover:border-green-500/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 transition-transform group-hover:scale-110">
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
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-green-400">
              Segurança e escalabilidade
            </h3>
            <p className="leading-relaxed text-slate-400">
              Infraestrutura robusta e segura que cresce junto com suas
              necessidades
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
