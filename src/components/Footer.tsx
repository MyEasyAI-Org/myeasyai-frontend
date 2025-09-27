export function Footer() {
  return (
    <footer
      id="contato"
      className="border-t border-slate-800 bg-slate-900 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
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
                  className="h-5 w-5 text-white"
                >
                  <path d="M12 18V5" />
                  <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                  <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                  <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                  <path d="M18 18a4 4 0 0 0 2-7.464" />
                  <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
                  <path d="M6 18a4 4 0 0 1-2-7.464" />
                  <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
                </svg>
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                MyEasyAI
              </span>
            </div>
            <p className="mb-4 max-w-md text-slate-400">
              Transformando a forma como você interage com inteligência
              artificial. Crie assistentes virtuais personalizados para suas
              necessidades.
            </p>

            <div className="flex space-x-4">
              {['X', 'Li', 'Ig'].map((s) => (
                <div
                  key={s}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
                >
                  <span className="text-sm font-semibold text-slate-400">
                    {s}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-200">Produto</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#preview"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  Preview
                </a>
              </li>
              <li>
                <a
                  href="#cursos"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  Cursos
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  Preços
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-200">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  Contato
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  Documentação
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-400 transition-colors hover:text-blue-400"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>© 2025 MyEasyAI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
