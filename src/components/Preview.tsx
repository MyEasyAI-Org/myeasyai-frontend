export function Preview() {
  return (
    <section id="preview" className="bg-gradient-to-b from-transparent via-slate-900/20 to-transparent px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Veja como funciona</h2>
          <p className="mx-auto max-w-2xl text-xl text-slate-400">
            Uma prévia de como será sua experiência criando e interagindo com
            assistentes virtuais
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-6 text-2xl font-bold text-blue-400">
              Interface conversacional intuitiva
            </h3>

            <div className="space-y-4">
              {[
                {
                  title: 'Treinamento simplificado',
                  desc: 'Configure seu assistente em minutos através de conversas naturais',
                },
                {
                  title: 'Respostas personalizadas',
                  desc: 'IA que entende seu negócio e oferece soluções específicas',
                },
                {
                  title: 'Integração fácil',
                  desc: 'Conecte com suas ferramentas favoritas sem complicação',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start space-x-3">
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
                    className="mt-1 h-6 w-6 flex-shrink-0 text-green-400"
                  >
                    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-slate-200">
                      {item.title}
                    </h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
              <img
                src="https://thumbs.dreamstime.com/z/ai-assistant-chat-box-ui-template-prototype-modern-featuring-user-prompt-input-message-send-button-clean-interface-381136064.jpg"
                alt="Interface de chat do assistente virtual"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
