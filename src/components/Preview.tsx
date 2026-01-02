export function Preview() {
  return (
    <section id="preview" className="bg-gradient-to-b from-transparent via-slate-900/20 to-transparent px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 sm:mb-12 md:mb-16 text-center">
          <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold">
            Crie seu assistente de atendimento{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              em 3 passos simples
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-slate-400">
            Configure, treine e publique — seu assistente estará pronto para
            atender clientes em minutos
          </p>
        </div>

        <div className="grid items-center gap-6 sm:gap-10 md:gap-12 lg:grid-cols-2">
          {/* Text content - appears first on mobile */}
          <div className="order-2 lg:order-1">
            <h3 className="mb-3 sm:mb-4 md:mb-6 text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
              Interface conversacional intuitiva
            </h3>

            <div className="space-y-3 sm:space-y-4">
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
                <div key={item.title} className="flex items-start space-x-2 sm:space-x-3">
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
                    className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 flex-shrink-0 text-green-400"
                  >
                    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm sm:text-base text-slate-200">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm md:text-base text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image - appears second on mobile but visually first on desktop */}
          <div className="relative order-1 lg:order-2">
            <div className="rounded-lg sm:rounded-xl border border-slate-700 bg-slate-800 p-2 sm:p-3 md:p-4 lg:p-6 shadow-2xl">
              <img
                src="https://thumbs.dreamstime.com/z/ai-assistant-chat-box-ui-template-prototype-modern-featuring-user-prompt-input-message-send-button-clean-interface-381136064.jpg"
                alt="Interface de chat do assistente virtual"
                className="w-full rounded-md sm:rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
