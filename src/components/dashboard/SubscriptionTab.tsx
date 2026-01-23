import { useState, useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, X, AlertTriangle, ExternalLink, CreditCard, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PLANS, getPlanByValue, getPlanChangeType, type SubscriptionPlan } from '../../constants/plans';
import type { SubscriptionData } from '../../hooks/useUserData';
import { PlanCard } from './PlanCard';
import { stripeService, type ProrationPreviewResponse } from '../../services/StripeService';
import { authService } from '../../services/AuthServiceV2';

type SubscriptionTabProps = {
  subscription: SubscriptionData;
};

// Helper to format currency
function formatCurrency(amount: number, currency: string): string {
  const value = amount / 100; // Stripe uses cents
  if (currency === 'brl') {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function SubscriptionTab({ subscription }: SubscriptionTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [prorationPreview, setProrationPreview] = useState<ProrationPreviewResponse | null>(null);
  const [pixBlockedError, setPixBlockedError] = useState<{ message: string; periodEnd?: string } | null>(null);

  console.log('🟡 [SubscriptionTab] Current subscription:', subscription);

  // Handle opening Stripe Customer Portal
  const handleOpenCustomerPortal = async () => {
    const user = authService.getUser();
    if (!user?.uuid) {
      toast.error('Erro ao abrir portal', {
        description: 'Usuario nao encontrado.',
      });
      return;
    }

    setIsLoadingPortal(true);
    try {
      await stripeService.redirectToPortal(user.uuid);
      // Note: redirectToPortal will redirect the page, so we won't reach here
    } catch (error) {
      console.error('[SubscriptionTab] Error opening portal:', error);
      toast.error('Erro ao abrir portal', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
      setIsLoadingPortal(false);
    }
  };

  // Fetch proration preview when plan is selected
  useEffect(() => {
    if (!selectedPlan || !isConfirmModalOpen) {
      setProrationPreview(null);
      setPixBlockedError(null);
      return;
    }

    const fetchPreview = async () => {
      const user = authService.getUser();
      if (!user?.uuid) return;

      setIsLoadingPreview(true);
      setPixBlockedError(null);
      try {
        const preview = await stripeService.previewProration({
          userId: user.uuid,
          newPlan: selectedPlan,
          country: 'BR', // TODO: Get from user profile
        });
        setProrationPreview(preview);
        console.log('🟢 [SubscriptionTab] Proration preview:', preview);
      } catch (error) {
        console.error('[SubscriptionTab] Error fetching proration preview:', error);
        // Check if this is a PIX user error
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('PIX') || errorMessage.includes('à vista')) {
          // Extract period end if available from subscription data
          setPixBlockedError({
            message: errorMessage,
            periodEnd: subscription.end_date || undefined,
          });
        }
        // Don't show error toast, handle in UI
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [selectedPlan, isConfirmModalOpen, subscription.end_date]);

  const handleSelectPlan = (newPlan: SubscriptionPlan) => {
    console.log('🟢 [SubscriptionTab] handleSelectPlan called:', { newPlan, currentPlan: subscription.plan });
    if (newPlan === subscription.plan) {
      console.log('🔴 [SubscriptionTab] Same plan, ignoring');
      return;
    }
    console.log('🟢 [SubscriptionTab] Opening modal for plan:', newPlan);
    setProrationPreview(null);
    setSelectedPlan(newPlan);
    setIsConfirmModalOpen(true);
  };

  // Update subscription via Stripe API (handles proration)
  const handleConfirmChange = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const user = authService.getUser();
      if (!user?.uuid) {
        toast.error('Erro ao alterar plano', {
          description: 'Usuário não encontrado.',
        });
        return;
      }

      // Call Stripe API to update subscription with proration
      const result = await stripeService.updateSubscription({
        userId: user.uuid,
        newPlan: selectedPlan,
        country: 'BR', // TODO: Get from user profile
      });

      if (result.success) {
        toast.success('Plano alterado com sucesso!', {
          description: `Você agora está no plano ${selectedPlan.toUpperCase()}. A cobrança proporcional foi aplicada.`,
        });
        // Refresh the page to show updated plan
        window.location.reload();
      } else {
        toast.error('Erro ao alterar plano', {
          description: 'Tente novamente mais tarde.',
        });
      }
    } catch (error) {
      console.error('[SubscriptionTab] Error updating subscription:', error);
      toast.error('Erro ao alterar plano', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
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

      {/* Manage Subscription Section - Stripe Customer Portal */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-400" />
              Gerenciar Assinatura
            </h2>
            <p className="mt-2 text-slate-400">
              Acesse o portal de pagamentos para atualizar seu cartao, ver faturas,
              cancelar assinatura ou alterar seu plano.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCustomerPortal}
          disabled={isLoadingPortal}
          className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingPortal ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Abrindo portal...</span>
            </>
          ) : (
            <>
              <ExternalLink className="h-5 w-5" />
              <span>Abrir Portal de Pagamentos</span>
            </>
          )}
        </button>

        <p className="mt-3 text-xs text-slate-500">
          Voce sera redirecionado para o portal seguro do Stripe.
        </p>
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
              {(() => {
                // Determine billing period: from preview, subscription data, or default to annual
                const billingPeriod = prorationPreview?.billingPeriod
                  || (subscription.billing_cycle === 'monthly' ? 'monthly' : 'annual');
                const isAnnual = billingPeriod === 'annual';

                return (
                  <>
                    {/* From */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Plano Atual</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-slate-300">{currentPlanData.name}</span>
                        <span className="text-slate-400">
                          {isAnnual
                            ? `${currentPlanData.fullPrice}/ano`
                            : `12x ${currentPlanData.installmentPrice}`}
                        </span>
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
                          {isAnnual
                            ? `${selectedPlanData.fullPrice}/ano`
                            : `12x ${selectedPlanData.installmentPrice}`}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {selectedPlanData.limits.maxSites === -1 ? 'Sites ilimitados' : `${selectedPlanData.limits.maxSites} site${selectedPlanData.limits.maxSites > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* PIX User Blocked Message */}
            {pixBlockedError && (
              <div className="rounded-xl p-4 bg-amber-900/20 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-300 font-medium">Mudança de plano não disponível</p>
                    <p className="text-xs text-amber-400/70 mt-1">
                      {pixBlockedError.message}
                    </p>
                    {pixBlockedError.periodEnd && (
                      <p className="text-xs text-slate-400 mt-2">
                        Renovação em:{' '}
                        <span className="font-medium text-slate-300">
                          {new Date(pixBlockedError.periodEnd).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Proration Preview */}
            {isLoadingPreview ? (
              <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Calculando diferença...</span>
              </div>
            ) : !pixBlockedError && prorationPreview && prorationPreview.amountDue > 0 ? (
              <div className={`rounded-xl p-4 ${changeType === 'upgrade' ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-slate-800/50 border border-slate-600'}`}>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Valor a Pagar Agora</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Diferença proporcional</span>
                  <span className="text-xl font-bold text-blue-400">
                    {formatCurrency(prorationPreview.amountDue, prorationPreview.currency)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Esse valor é calculado proporcionalmente ao tempo restante do seu período atual.
                </p>
              </div>
            ) : !pixBlockedError && prorationPreview && prorationPreview.amountDue <= 0 ? (
              <div className="rounded-xl p-4 bg-slate-800/50 border border-slate-600">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Crédito</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Você receberá crédito de</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatCurrency(Math.abs(prorationPreview.amountDue), prorationPreview.currency)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Esse crédito será aplicado nas suas próximas faturas.
                </p>
              </div>
            ) : null}

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
              {pixBlockedError ? (
                // PIX users can only close the modal
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setSelectedPlan(null);
                    setPixBlockedError(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Entendi
                </button>
              ) : (
                <>
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
                    disabled={isProcessing || isLoadingPreview}
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
                        <span>
                          {prorationPreview && prorationPreview.amountDue > 0
                            ? `Pagar ${formatCurrency(prorationPreview.amountDue, prorationPreview.currency)}`
                            : `Confirmar ${changeType === 'upgrade' ? 'Upgrade' : 'Mudança'}`}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
