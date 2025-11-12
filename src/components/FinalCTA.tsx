export function FinalCta() {
  return (
    <section className="bg-gradient-to-b from-transparent via-slate-900/20 to-transparent px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          Pronto para criar seu primeiro assistente virtual?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
          Junte-se à lista de espera e seja um dos primeiros a experimentar o
          futuro da IA personalizada
        </p>
        <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="group flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-700">
            <span>Inscreva-se na lista de espera</span>
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
              className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-slate-400">
          Sem spam. Você receberá apenas atualizações importantes sobre o
          lançamento.
        </p>
      </div>
    </section>
  );
}
