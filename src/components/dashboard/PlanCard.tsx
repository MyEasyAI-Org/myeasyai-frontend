import { Check } from 'lucide-react';
import type { Plan } from '../../constants/plans';
import type { SubscriptionPlan } from '../../constants/plans';

type PlanCardProps = {
  plan: Plan;
  currentPlan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
};

export function PlanCard({ plan, currentPlan, onSelectPlan }: PlanCardProps) {
  const isCurrentPlan = currentPlan === plan.value;

  return (
    <div
      className={`relative rounded-lg border p-6 ${
        isCurrentPlan
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-slate-800 bg-slate-900/50'
      } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
            POPULAR
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          {plan.price !== 'Customizado' && (
            <span className="text-slate-400">/mês</span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-400">{plan.tokens} tokens</p>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-400" />
            <span className="text-sm text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelectPlan(plan.value)}
        disabled={isCurrentPlan}
        className={`mt-6 w-full rounded-lg px-4 py-2 font-semibold transition-colors ${
          isCurrentPlan
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
      </button>
    </div>
  );
}
