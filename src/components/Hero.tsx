import { Button } from "./Button";

export function Hero() {
  return (
    <section className="px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-slate-800 px-4 py-2">
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
              className="mr-2 h-4 w-4 text-purple-400"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
              <path d="M20 2v4" />
              <path d="M22 4h-4" />
              <circle cx="4" cy="20" r="2" />
            </svg>
            <span className="text-sm text-slate-300">Sua IA, do seu jeito</span>
          </div>

          <h1 className="mb-6 leading-tight text-5xl font-bold md:text-7xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Construa e treine
            </span>
            <br />
            <span className="text-slate-100">assistentes virtuais</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-400">
            Construa e treine assistentes virtuais para o que você precisa. IA
            adaptada ao seu contexto, integração com cursos e aprendizado
            contínuo.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              variant="primary"
              href="https://forms.gle/seu-formulario"
              target="_blank"
            >
              Quero experimentar
            </Button>
            <Button variant="outline" href="#features">
              Saiba mais
            </Button>
          </div>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="relative rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-2xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
            <div className="relative">
              <img
                src="https://cdn.dribbble.com/userupload/44332009/file/84c558bf1e97ff630880c97a118c14c3.png?resize=752x&vertical=center"
                alt="Dashboard MyEasyAi"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
