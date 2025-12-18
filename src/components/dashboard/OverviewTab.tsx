import { BarChart3, Clock, CreditCard, TrendingUp } from 'lucide-react';
import type { CadastralInfo, SubscriptionData, UserProfile } from '../../hooks/useUserData';
import { calculateTokensPercentage } from '../../utils/dashboard/calculationUtils';
import { getPlanColor } from '../../utils/dashboard/planUtils';
import { StatCard } from './StatCard';

type OverviewTabProps = {
  profile: UserProfile;
  subscription: SubscriptionData;
  cadastralInfo: CadastralInfo;
};

export function OverviewTab({ profile, subscription, cadastralInfo }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Bem-vindo, {profile.preferred_name || profile.name}!
        </h1>
        <p className="mt-2 text-slate-400">
          Aqui está um resumo da sua conta e atividades recentes.
        </p>
      </div>

      {/* Current Subscription Card */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Assinatura Atual
            </h2>
            <div
              className={`mt-2 inline-block rounded-full bg-gradient-to-r ${getPlanColor(subscription.plan)} px-4 py-1 text-sm font-semibold text-white`}
            >
              {subscription.plan.toUpperCase()}
            </div>
            <p className="mt-2 text-slate-400">
              Status:{' '}
              <span className="text-green-400">
                {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </p>
          </div>
          <CreditCard className="h-16 w-16 text-blue-400" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Tokens Usados"
          value={subscription.tokens_used.toLocaleString()}
          subtitle={`de ${subscription.tokens_limit.toLocaleString()}`}
          icon={TrendingUp}
          iconColor="text-purple-400"
          showProgress={true}
          progressPercentage={calculateTokensPercentage(subscription)}
        />

        <StatCard
          title="Requisições este Mês"
          value={subscription.requests_this_month}
          icon={BarChart3}
          iconColor="text-blue-400"
        />

        <StatCard
          title="Membro desde"
          value={cadastralInfo.created_at
            ? new Date(cadastralInfo.created_at).toLocaleDateString('pt-BR')
            : 'Não informado'}
          icon={Clock}
          iconColor="text-amber-400"
        />
      </div>
    </div>
  );
}
