import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PLANS, getPlanByValue, getPlanChangeType, type SubscriptionPlan } from '../../constants/plans';
import type { SubscriptionData } from '../../hooks/useUserData';
import { PlanCard } from './PlanCard';

type SubscriptionTabProps = {
  subscription: SubscriptionData;
  onPlanChange?: (newPlan: SubscriptionPlan) => Promise<boolean>;
};

export function SubscriptionTab({ subscription, onPlanChange }: SubscriptionTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('🟡 [SubscriptionTab] Current subscription:', subscription);

  const handleSelectPlan = (newPlan: SubscriptionPlan) => {
    console.log('🟢 [SubscriptionTab] handleSelectPlan called:', { newPlan, currentPlan: subscription.plan });
    if (newPlan === subscription.plan) {
      console.log('🔴 [SubscriptionTab] Same plan, ignoring');
      return;
    }
    console.log('🟢 [SubscriptionTab] Opening modal for plan:', newPlan);
    setSelectedPlan(newPlan);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      if (onPlanChange) {
        const success = await onPlanChange(selectedPlan);
        if (success) {
          toast.success('Plano alterado com sucesso!', {
            description: `Você agora está no plano ${selectedPlan.toUpperCase()}.`,
          });
        } else {
          toast.error('Erro ao alterar plano', {
            description: 'Tente novamente mais tarde.',
          });
        }
      } else {
        // Simular mudança se não houver handler
        toast.success('Solicitação enviada!', {
          description: `Mudança para o plano ${selectedPlan.toUpperCase()} foi solicitada.`,
        });
      }
    } catch (error) {
      toast.error('Erro ao processar', {
        description: String(error),
      });
    } finally {
      setIsProcessing(false);
      setIsConfirmModalOpen(false);
      setSelectedPlan(null);
    }
  };

  const currentPlanData = getPlanByValue(subscription.plan);
  const selectedPlanData = selectedPlan ? getPlanByValue(selectedPlan) : null;
  const changeType = selectedPlan ? getPlanChangeType(subscription.plan, selectedPlan) : 'same';

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

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.value}
            plan={plan}
            currentPlan={subscription.plan}
            onSelectPlan={handleSelectPlan}
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

      {/* Modal de Confirmação */}
      {isConfirmModalOpen && selectedPlanData && currentPlanData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {changeType === 'upgrade' ? 'Fazer Upgrade' : 'Alterar Plano'}
              </h3>
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedPlan(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Comparison */}
            <div className="space-y-4">
              {/* From */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Plano Atual</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-300">{currentPlanData.name}</span>
                  <span className="text-slate-400">{currentPlanData.price}/mês</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {currentPlanData.limits.maxSites === -1 ? 'Sites ilimitados' : `${currentPlanData.limits.maxSites} site${currentPlanData.limits.maxSites > 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                {changeType === 'upgrade' ? (
                  <ArrowUpCircle className="h-8 w-8 text-green-400" />
                ) : (
                  <ArrowDownCircle className="h-8 w-8 text-orange-400" />
                )}
              </div>

              {/* To */}
              <div className={`rounded-xl p-4 ${changeType === 'upgrade' ? 'bg-green-900/20 border border-green-500/30' : 'bg-orange-900/20 border border-orange-500/30'}`}>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Novo Plano</p>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-semibold ${changeType === 'upgrade' ? 'text-green-400' : 'text-orange-400'}`}>
                    {selectedPlanData.name}
                  </span>
                  <span className={changeType === 'upgrade' ? 'text-green-300' : 'text-orange-300'}>
                    {selectedPlanData.price}/mês
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedPlanData.limits.maxSites === -1 ? 'Sites ilimitados' : `${selectedPlanData.limits.maxSites} site${selectedPlanData.limits.maxSites > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Warning for downgrade */}
            {changeType === 'downgrade' && (
              <div className="flex items-start gap-3 bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-300 font-medium">Atenção ao fazer downgrade</p>
                  <p className="text-xs text-amber-400/70 mt-1">
                    Você pode perder acesso a alguns recursos e sites se exceder o limite do novo plano.
                  </p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setSelectedPlan(null);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmChange}
                disabled={isProcessing}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  changeType === 'upgrade'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Confirmar {changeType === 'upgrade' ? 'Upgrade' : 'Mudança'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
