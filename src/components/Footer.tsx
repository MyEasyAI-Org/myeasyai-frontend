import { InstagramIcon, YoutubeIcon } from "lucide-react";

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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

            <h3 className="mb-4 text-lg font-bold text-white">
              Vem com a gente nas redes também :)
            </h3>

            <div className="flex space-x-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-black transition-all hover:bg-slate-900"
              >
                <XIcon className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://www.youtube.com/@MyEasyAI"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#FF0000] transition-all hover:bg-[#CC0000]"
              >
                <YoutubeIcon className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://www.instagram.com/myeasyai"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 transition-all hover:from-purple-700 hover:via-pink-700 hover:to-orange-600"
              >
                <InstagramIcon className="h-5 w-5 text-white" />
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
