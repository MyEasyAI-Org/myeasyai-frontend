import { ArrowRight, Check, Sparkles, Lock, Zap } from 'lucide-react';
import type { Plan, SubscriptionPlan } from '../../constants/plans';
import { getPlanByValue } from '../../constants/plans';

type PlanCardProps = {
  plan: Plan;
  currentPlan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
};

export function PlanCard({ plan, currentPlan, onSelectPlan }: PlanCardProps) {
  const isCurrentPlan = currentPlan === plan.value;

  // Determine if this plan is a downgrade (lower price than current)
  const currentPlanData = getPlanByValue(currentPlan);
  const isDowngrade = currentPlanData ? plan.priceNumeric < currentPlanData.priceNumeric : false;

  const handleSelectPlan = () => {
    // Don't allow downgrade
    if (isDowngrade) return;
    console.log('🔵 [PlanCard] Button clicked:', { planValue: plan.value, currentPlan, isCurrentPlan });
    onSelectPlan(plan.value);
  };

  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border-2 p-6 transition-all duration-300 ${
        isCurrentPlan
          ? 'border-blue-500/50 bg-gradient-to-b from-blue-900/30 to-slate-900/80 shadow-lg shadow-blue-500/10'
          : plan.recommended
            ? 'border-purple-500/50 bg-gradient-to-b from-purple-900/40 via-slate-900/80 to-slate-900/90 shadow-xl shadow-purple-500/20 scale-[1.02] hover:scale-[1.03]'
            : isDowngrade
              ? 'border-slate-700/50 bg-slate-900/30 opacity-60'
              : 'border-slate-700/50 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
      }`}
    >
      {/* Badge do plano recomendado */}
      {plan.recommended && !isCurrentPlan && (
        <>
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 transform">
            <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              RECOMENDADO
            </span>
          </div>
          {/* Indicador de economia */}
          <div className="absolute -right-2 top-8 rotate-12">
            <span className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
              10x mais tokens!
            </span>
          </div>
        </>
      )}

      {plan.popular && !plan.recommended && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
            POPULAR
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 transform">
          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30">
            <Check className="h-3.5 w-3.5" />
            SEU PLANO
          </span>
        </div>
      )}

      <div className="text-center pt-2">
        <h3 className={`font-bold text-white ${plan.recommended && !isCurrentPlan ? 'text-2xl' : 'text-xl'}`}>
          {plan.name}
        </h3>

        {/* Nova estrutura de preço - 12x em destaque */}
        <div className="mt-5">
          <div className="text-xs text-slate-400 mb-1 uppercase tracking-wide">12x de</div>
          <span
            className={`font-bold ${
              plan.recommended && !isCurrentPlan
                ? 'text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'
                : isCurrentPlan
                  ? 'text-4xl text-blue-400'
                  : 'text-4xl text-white'
            }`}
          >
            {plan.installmentPrice}
          </span>
          <div className="mt-2 text-xs text-slate-500">
            ou <span className="text-slate-400 font-medium">{plan.fullPrice}</span> à vista
          </div>
        </div>

        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
          plan.recommended && !isCurrentPlan
            ? 'bg-purple-500/10 text-purple-300'
            : isCurrentPlan
              ? 'bg-blue-500/10 text-blue-300'
              : 'bg-slate-700/50 text-slate-400'
        }`}>
          <Zap className="h-3.5 w-3.5" />
          {plan.tokens} tokens
        </div>
      </div>

      {/* Indicador de upgrade para quem está no Individual */}
      {plan.recommended && !isCurrentPlan && currentPlan === 'individual' && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 px-3 py-2">
          <ArrowRight className="h-4 w-4 text-purple-400" />
          <span className="text-xs text-purple-300 font-medium">
            Upgrade por apenas +R$ 20/mês
          </span>
        </div>
      )}

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <div className={`flex-shrink-0 rounded-full p-0.5 ${
              plan.recommended && !isCurrentPlan
                ? 'bg-purple-500/20'
                : isCurrentPlan
                  ? 'bg-blue-500/20'
                  : 'bg-green-500/20'
            }`}>
              <Check className={`h-3.5 w-3.5 ${
                plan.recommended && !isCurrentPlan
                  ? 'text-purple-400'
                  : isCurrentPlan
                    ? 'text-blue-400'
                    : 'text-green-400'
              }`} />
            </div>
            <span className="text-sm text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleSelectPlan}
        disabled={isCurrentPlan || isDowngrade}
        className={`mt-6 w-full rounded-xl px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-default'
            : isDowngrade
              ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : plan.recommended
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 cursor-pointer active:scale-[0.98]'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 cursor-pointer active:scale-[0.98]'
        }`}
      >
        {isCurrentPlan ? (
          <>
            <Check className="h-4 w-4" />
            <span>Plano Atual</span>
          </>
        ) : isDowngrade ? (
          <>
            <Lock className="h-4 w-4" />
            <span>Plano Inferior</span>
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            <span>Fazer Upgrade</span>
          </>
        )}
      </button>
    </div>
  );
}
