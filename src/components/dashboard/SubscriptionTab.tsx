import { ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PLANS, type SubscriptionPlan } from '../../constants/plans';
import type { SubscriptionData } from '../../hooks/useUserData';
import { PlanCard } from './PlanCard';

type SubscriptionTabProps = {
  subscription: SubscriptionData;
};

export function SubscriptionTab({ subscription }: SubscriptionTabProps) {
  const handleChangePlan = (newPlan: SubscriptionPlan) => {
    toast.success('Solicitação enviada!', {
      description: `Mudança para o plano ${newPlan.toUpperCase()} foi solicitada.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Planos de Assinatura
        </h1>
        <p className="mt-2 text-slate-400">
          Escolha o plano ideal para suas necessidades.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.value}
            plan={plan}
            currentPlan={subscription.plan}
            onSelectPlan={handleChangePlan}
          />
        ))}
      </div>

      {/* Change Plan Section */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-bold text-white">Trocar de Plano</h2>
        <p className="mt-2 text-slate-400">
          Você está atualmente no plano{' '}
          <span className="font-semibold text-blue-400">
            {subscription.plan.toUpperCase()}
          </span>
          . Selecione um novo plano acima para fazer upgrade ou downgrade.
        </p>
        <div className="mt-4 flex items-center space-x-2 text-sm text-slate-400">
          <ArrowUpCircle className="h-5 w-5 text-green-400" />
          <span>Alterações entram em vigor imediatamente</span>
        </div>
      </div>
    </div>
  );
}
