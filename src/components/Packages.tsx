import type { User } from '@supabase/supabase-js';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PLANS, type SubscriptionPlan } from '../constants/plans';
import { Button } from './Button';
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
    <section id="packages" className="bg-gradient-to-b from-slate-900/30 via-slate-800/40 to-slate-900/30 px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 sm:mb-12 md:mb-16 text-center">
          <h2 className="mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Quanto custa ter um{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              assistente de IA próprio?
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400">
            Planos para cada fase do seu negócio — do pequeno empreendedor à
            empresa com milhares de atendimentos diários
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.value}
              className={`relative rounded-xl sm:rounded-2xl border p-4 sm:p-6 md:p-8 transition-all hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.99] ${
                plan.popular
                  ? 'border-purple-500 bg-gradient-to-br from-purple-900/20 to-blue-900/20 shadow-lg shadow-purple-500/20'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 sm:-top-3 md:-top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 sm:px-3 md:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white shadow-lg whitespace-nowrap">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{plan.name}</h3>
                <div className="mt-3 sm:mt-4 md:mt-6">
                  <span
                    className={`font-bold text-white ${
                      plan.price === 'Customizado' ? 'text-xl sm:text-2xl md:text-3xl' : 'text-3xl sm:text-4xl md:text-5xl'
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.price !== 'Customizado' && (
                    <span className="text-sm sm:text-base text-slate-400">/mês</span>
                  )}
                </div>
                <p className="mt-1.5 sm:mt-2 md:mt-3 text-xs sm:text-sm text-slate-400">
                  {plan.tokens} tokens
                </p>
              </div>

              <ul className="mt-4 sm:mt-6 md:mt-8 space-y-2 sm:space-y-3 md:space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-1.5 sm:mr-2 md:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-green-400" />
                    <span className="text-xs sm:text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 sm:mt-6 md:mt-8">
                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  onClick={() => handleSelectPlan(plan.value)}
                  className="w-full"
                >
                  Obter agora!
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="mt-10 sm:mt-16 text-center">
          <p className="text-sm sm:text-base text-slate-400">
            Todos os planos incluem acesso à plataforma e atualizações gratuitas
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
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
