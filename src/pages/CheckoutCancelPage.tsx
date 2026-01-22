// Checkout Cancel Page
// Shows when user cancels Stripe checkout and redirects back to plan selection

import { useNavigate } from 'react-router-dom';

export function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Cancelado
        </h1>

        <p className="text-slate-400 mb-8">
          Voce cancelou o processo de pagamento. Nao se preocupe, nenhuma cobranca foi realizada.
        </p>

        {/* Info Box */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8 text-left">
          <h3 className="text-slate-200 font-medium mb-2">
            Por que assinar o MyEasyAI?
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Crie sites profissionais em minutos
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Integracoes com IA e chatbots
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Suporte dedicado e atualizacoes constantes
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-purple-500/25"
          >
            Tentar novamente
          </button>

          <button
            onClick={() => navigate('/', { replace: true })}
            className="w-full py-3 rounded-xl font-medium text-slate-400 hover:text-slate-300 transition-colors"
          >
            Voltar para a pagina inicial
          </button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-slate-500">
          Precisa de ajuda?{' '}
          <a
            href="/support"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Entre em contato com nosso suporte
          </a>
        </p>
      </div>
    </div>
  );
}
