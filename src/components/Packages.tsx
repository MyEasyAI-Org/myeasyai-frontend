import type { User } from '@supabase/supabase-js';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
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
    <section id="packages" className="bg-gradient-to-b from-slate-900/30 via-slate-800/40 to-slate-900/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Quanto custa ter um{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              assistente de IA próprio?
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Planos para cada fase do seu negócio — do pequeno empreendedor à
            empresa com milhares de atendimentos diários
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.value}
              className={`relative rounded-2xl border p-8 transition-all hover:scale-105 ${
                plan.recommended
                  ? 'border-purple-500 bg-gradient-to-br from-purple-900/30 to-blue-900/30 shadow-xl shadow-purple-500/30 scale-[1.02] lg:-mt-4 lg:mb-4'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              {/* Badge do plano Plus - mais destacado */}
              {plan.recommended && (
                <>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg animate-pulse">
                      <Sparkles className="h-3.5 w-3.5" />
                      RECOMENDADO
                    </span>
                  </div>
                  {/* Indicador de economia */}
                  <div className="absolute -right-2 top-8 rotate-12">
                    <span className="rounded-lg bg-green-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                      10x mais tokens!
                    </span>
                  </div>
                </>
              )}

              {plan.popular && !plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className={`font-bold text-white ${plan.recommended ? 'text-3xl' : 'text-2xl'}`}>
                  {plan.name}
                </h3>

                {/* Nova estrutura de preço - 12x em destaque */}
                <div className="mt-6">
                  <div className="text-sm text-slate-400 mb-1">12x de</div>
                  <span
                    className={`font-bold ${
                      plan.recommended
                        ? 'text-5xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                        : 'text-5xl text-white'
                    }`}
                  >
                    {plan.installmentPrice}
                  </span>
                  <div className="mt-2 text-sm text-slate-500">
                    ou {plan.fullPrice} à vista
                  </div>
                </div>

                <p className={`mt-3 text-sm ${plan.recommended ? 'text-purple-300 font-medium' : 'text-slate-400'}`}>
                  {plan.tokens} tokens
                </p>
              </div>

              {/* Indicador de upgrade para quem está no Individual */}
              {plan.recommended && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/30 px-3 py-2">
                  <ArrowRight className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-purple-300">
                    Upgrade do Individual por apenas +R$ 20/mês
                  </span>
                </div>
              )}

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className={`mr-3 h-5 w-5 flex-shrink-0 ${plan.recommended ? 'text-purple-400' : 'text-green-400'}`} />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex justify-center">
                <Button
                  variant={plan.recommended ? 'primary' : 'secondary'}
                  onClick={() => handleSelectPlan(plan.value)}
                  className={plan.recommended ? 'w-full shadow-lg shadow-purple-500/30' : ''}
                >
                  {plan.recommended ? 'Começar agora!' : 'Obter agora!'}
                </Button>
              </div>
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
