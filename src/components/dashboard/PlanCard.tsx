import { ArrowRight, Check, Sparkles } from 'lucide-react';
import type { Plan, SubscriptionPlan } from '../../constants/plans';

type PlanCardProps = {
  plan: Plan;
  currentPlan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
};

export function PlanCard({ plan, currentPlan, onSelectPlan }: PlanCardProps) {
  const isCurrentPlan = currentPlan === plan.value;

  const handleSelectPlan = () => {
    console.log('🔵 [PlanCard] Button clicked:', { planValue: plan.value, currentPlan, isCurrentPlan });
    onSelectPlan(plan.value);
  };

  return (
    <div
      className={`relative flex h-full flex-col rounded-xl border p-6 transition-all ${
        isCurrentPlan
          ? 'border-blue-500 bg-blue-900/20'
          : plan.recommended
            ? 'border-purple-500 bg-gradient-to-br from-purple-900/30 to-blue-900/30 shadow-xl shadow-purple-500/20 scale-[1.02]'
            : 'border-slate-800 bg-slate-900/50'
      }`}
    >
      {/* Badge do plano recomendado */}
      {plan.recommended && !isCurrentPlan && (
        <>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Sparkles className="h-3 w-3" />
              RECOMENDADO
            </span>
          </div>
          {/* Indicador de economia */}
          <div className="absolute -right-2 top-6 rotate-12">
            <span className="rounded-md bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
              10x mais tokens!
            </span>
          </div>
        </>
      )}

      {plan.popular && !plan.recommended && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
            POPULAR
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            SEU PLANO
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className={`font-bold text-white ${plan.recommended && !isCurrentPlan ? 'text-2xl' : 'text-xl'}`}>
          {plan.name}
        </h3>

        {/* Nova estrutura de preço - 12x em destaque */}
        <div className="mt-4">
          <div className="text-xs text-slate-400 mb-1">12x de</div>
          <span
            className={`font-bold ${
              plan.recommended && !isCurrentPlan
                ? 'text-4xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                : 'text-4xl text-white'
            }`}
          >
            {plan.installmentPrice}
          </span>
          <div className="mt-1 text-xs text-slate-500">
            ou {plan.fullPrice} à vista
          </div>
        </div>

        <p className={`mt-2 text-sm ${plan.recommended && !isCurrentPlan ? 'text-purple-300 font-medium' : 'text-slate-400'}`}>
          {plan.tokens} tokens
        </p>
      </div>

      {/* Indicador de upgrade para quem está no Individual */}
      {plan.recommended && !isCurrentPlan && currentPlan === 'individual' && (
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 px-2 py-1.5">
          <ArrowRight className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] text-purple-300">
            Upgrade por apenas +R$ 20/mês
          </span>
        </div>
      )}

      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className={`mr-2 h-4 w-4 flex-shrink-0 ${plan.recommended && !isCurrentPlan ? 'text-purple-400' : 'text-green-400'}`} />
            <span className="text-xs text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleSelectPlan}
        disabled={isCurrentPlan}
        className={`mt-5 w-full rounded-lg px-4 py-2.5 font-semibold transition-all ${
          isCurrentPlan
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : plan.recommended
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {isCurrentPlan ? 'Plano Atual' : plan.recommended ? 'Fazer Upgrade!' : 'Selecionar Plano'}
      </button>
    </div>
  );
}
