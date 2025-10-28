import { Twitter, Linkedin, Instagram } from 'lucide-react';

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
              <img
                src="/bone-logo.png"
                alt="MyEasyAI Logo"
                className="h-8 w-8 object-contain"
              />
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
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
              >
                <Twitter className="h-5 w-5 text-slate-400" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
              >
                <Linkedin className="h-5 w-5 text-slate-400" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
              >
                <Instagram className="h-5 w-5 text-slate-400" />
              </a>
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
