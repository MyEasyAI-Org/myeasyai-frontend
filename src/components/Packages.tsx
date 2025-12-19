import type { User } from '@supabase/supabase-js';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PLANS, type SubscriptionPlan } from '../constants/plans';
import { LoginModal } from './LoginModal';
import { SignupModal } from './SignupModal';

type PackagesProps = {
  user?: User | null;
};

export function Packages({ user }: PackagesProps) {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    if (user) {
      // Se já está logado, pode processar o upgrade direto
      toast.success('Solicitação enviada!', {
        description: `Mudança para o plano ${plan.toUpperCase()} foi solicitada.`,
      });
    } else {
      // Se não está logado, abrir modal de cadastro
      setIsSignupOpen(true);
    }
  };

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  return (
    <section id="packages" className="bg-gradient-to-b from-slate-900/30 via-slate-800/40 to-slate-900/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Escolha seu{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Pacote Ideal
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Planos flexíveis para todas as necessidades. Comece gratuitamente e
            escale conforme seu negócio cresce.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.value}
              className={`relative rounded-2xl border p-8 transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-lg shadow-purple-500/20'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-slate-400">/mês</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  {plan.tokens} tokens
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.value)}
                className={`mt-8 w-full rounded-xl px-6 py-3 font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
                    : 'border border-slate-700 bg-slate-800 text-white hover:border-purple-500 hover:bg-slate-700'
                }`}
              >
                Obter agora!
              </button>
            </div>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="mt-16 text-center">
          <p className="text-slate-400">
            Todos os planos incluem acesso à plataforma e atualizações gratuitas
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Cancele a qualquer momento, sem taxas ocultas
          </p>
        </div>
      </div>

      {/* Modais de autenticação */}
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
        selectedPlan={selectedPlan}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </section>
  );
}
