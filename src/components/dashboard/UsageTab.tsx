import type { SubscriptionData } from '../../hooks/useUserData';
import { calculateTokensPercentage } from '../../utils/dashboard/calculationUtils';

type UsageTabProps = {
  subscription: SubscriptionData;
};

export function UsageTab({ subscription }: UsageTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Uso e Tokens</h1>
        <p className="mt-2 text-slate-400">
          Acompanhe seu uso de tokens e requisições.
        </p>
      </div>

      {/* Token Usage */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-bold text-white">Uso de Tokens</h2>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Tokens usados este mês</span>
            <span className="font-semibold text-white">
              {subscription.tokens_used.toLocaleString()} /{' '}
              {subscription.tokens_limit.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-4 w-full rounded-full bg-slate-800">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${calculateTokensPercentage(subscription)}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {(100 - calculateTokensPercentage(subscription)).toFixed(1)}%
            disponível
          </p>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white">Requisições</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Este mês</span>
              <span className="text-2xl font-bold text-white">
                {subscription.requests_this_month}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Média diária</span>
              <span className="text-2xl font-bold text-white">
                {Math.round(
                  subscription.requests_this_month / new Date().getDate(),
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold text-white">
            Período de Renovação
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Início do ciclo</span>
              <span className="font-semibold text-white">
                {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Próxima renovação</span>
              <span className="font-semibold text-white">
                {new Date(
                  new Date().setMonth(new Date().getMonth() + 1),
                ).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
