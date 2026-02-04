import { useState, useEffect } from 'react';
import { ArrowUpCircle, X, AlertTriangle, ExternalLink, CreditCard, Check, Loader2, Zap, Sparkles, Shield } from 'lucide-react';
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
  const [upfrontBlockedError, setUpfrontBlockedError] = useState<{ message: string; periodEnd?: string } | null>(null);

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
      setUpfrontBlockedError(null);
      return;
    }

    const fetchPreview = async () => {
      const user = authService.getUser();
      if (!user?.uuid) return;

      setIsLoadingPreview(true);
      setUpfrontBlockedError(null);
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
        // Check if this is a blocked user (PIX or downgrade for upfront)
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Block: PIX users or downgrade for upfront users
        if (errorMessage.includes('PIX') || errorMessage.includes('Downgrade não disponível')) {
          setUpfrontBlockedError({
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
        // Check if this was an upfront payment upgrade
        const description = result.amountCharged && result.currency
          ? `Você agora está no plano ${selectedPlan.toUpperCase()}. Cobrança de ${formatCurrency(result.amountCharged, result.currency)} aplicada.`
          : `Você agora está no plano ${selectedPlan.toUpperCase()}. A cobrança proporcional foi aplicada.`;

        toast.success('Plano alterado com sucesso!', { description });
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Planos de Assinatura
        </h1>
        <p className="mt-1 text-slate-400">
          Escolha o plano ideal para suas necessidades
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
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-slate-900/60 to-slate-900/80 p-6">
        {/* Background decoration */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Fazer Upgrade</h2>
          </div>

          <p className="text-slate-400 leading-relaxed">
            Você está atualmente no plano{' '}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {subscription.plan.toUpperCase()}
            </span>
            . Selecione um plano superior acima para fazer upgrade e desbloquear mais recursos.
          </p>

          <div className="mt-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-green-400" />
              </div>
              <span>Upgrades entram em vigor imediatamente</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <span>Pagamento seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Subscription Section - Stripe Customer Portal */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-slate-900/80 p-6">
        {/* Background decoration */}
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Gerenciar Assinatura</h2>
          </div>

          <p className="text-slate-400 leading-relaxed">
            Acesse o portal de pagamentos para atualizar seu cartão, ver faturas,
            cancelar assinatura ou alterar seu plano.
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <button
              onClick={handleOpenCustomerPortal}
              disabled={isLoadingPortal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Abrindo portal...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  <span>Abrir Portal de Pagamentos</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-slate-600" />
              <span>Redirecionamento seguro via Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {isConfirmModalOpen && selectedPlanData && currentPlanData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/98 border border-slate-700/50 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 px-6 py-5 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
                    <ArrowUpCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Fazer Upgrade</h3>
                    <p className="text-xs text-slate-400">Melhore seu plano agora</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setSelectedPlan(null);
                  }}
                  className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors group"
                >
                  <X className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {(() => {
                // Determine billing period: from preview, subscription data, or default to annual
                const billingPeriod = prorationPreview?.billingPeriod
                  || (subscription.billing_cycle === 'monthly' ? 'monthly' : 'annual');
                const isAnnual = billingPeriod === 'annual';

                return (
                  <>
                    {/* Plans comparison */}
                    <div className="relative">
                      {/* From */}
                      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-400">{currentPlanData.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Plano Atual</p>
                            <p className="text-base font-semibold text-slate-300">{currentPlanData.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-400">
                              {isAnnual ? currentPlanData.fullPrice : `12x ${currentPlanData.installmentPrice}`}
                            </p>
                            <p className="text-xs text-slate-500">{isAnnual ? 'por ano' : 'por mês'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Arrow connector */}
                      <div className="absolute left-1/2 -translate-x-1/2 -my-2 z-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <ArrowUpCircle className="h-5 w-5 text-white rotate-180" />
                        </div>
                      </div>

                      {/* To */}
                      <div className="mt-4 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                            <span className="text-lg font-bold text-purple-300">{selectedPlanData.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-purple-400/80 uppercase tracking-wide">Novo Plano</p>
                            <p className="text-base font-bold text-purple-300">{selectedPlanData.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-purple-300">
                              {isAnnual ? selectedPlanData.fullPrice : `12x ${selectedPlanData.installmentPrice}`}
                            </p>
                            <p className="text-xs text-purple-400/70">{isAnnual ? 'por ano' : 'por mês'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Difference Summary */}
                    {(() => {
                      const monthlyDiff = (selectedPlanData.installmentPriceNumeric - currentPlanData.installmentPriceNumeric) / 100;
                      const annualDiff = (selectedPlanData.fullPriceNumeric - currentPlanData.fullPriceNumeric) / 100;
                      return (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <span className="text-green-400 text-sm">+</span>
                            </div>
                            <span className="text-sm text-slate-300">
                              {isAnnual ? 'Diferença anual' : 'Diferença mensal'}
                            </span>
                          </div>
                          <span className="text-xl font-bold text-green-400">
                            +R$ {(isAnnual ? annualDiff : monthlyDiff).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })()}

                    {/* No Downgrade Warning */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-amber-200/90 font-medium">
                          Importante: Upgrade é permanente
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Após o upgrade, não será possível voltar para o plano <span className="font-medium text-amber-400">{currentPlanData.name}</span> até a próxima renovação.
                        </p>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Upfront Payment User Blocked Message (PIX or Card à vista) */}
              {upfrontBlockedError && (
                <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-red-300 font-medium">Mudança não disponível</p>
                      <p className="text-xs text-red-400/70 mt-1">
                        {upfrontBlockedError.message}
                      </p>
                      {upfrontBlockedError.periodEnd && (
                        <p className="text-xs text-slate-400 mt-2">
                          Renovação em:{' '}
                          <span className="font-medium text-slate-300">
                            {new Date(upfrontBlockedError.periodEnd).toLocaleDateString('pt-BR', {
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
                <div className="flex items-center justify-center gap-3 py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                  <span className="text-slate-400">Calculando valor...</span>
                </div>
              ) : !upfrontBlockedError && prorationPreview && prorationPreview.amountDue > 0 ? (
                <div className="rounded-xl p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 font-medium">Valor a pagar agora</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {formatCurrency(prorationPreview.amountDue, prorationPreview.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {prorationPreview.isUpfrontPayment && prorationPreview.daysRemaining ? (
                      <>Proporcional aos {prorationPreview.daysRemaining} dias restantes. Cobrança automática no cartão.</>
                    ) : (
                      <>Calculado proporcionalmente ao período restante da sua assinatura.</>
                    )}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Footer with buttons */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50">
              <div className="flex gap-3">
                {upfrontBlockedError ? (
                  <button
                    onClick={() => {
                      setIsConfirmModalOpen(false);
                      setSelectedPlan(null);
                      setUpfrontBlockedError(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-medium"
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
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-medium disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmChange}
                      disabled={isProcessing || isLoadingPreview}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 cursor-pointer active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          <span>
                            {prorationPreview && prorationPreview.amountDue > 0
                              ? `Confirmar • ${formatCurrency(prorationPreview.amountDue, prorationPreview.currency)}`
                              : 'Confirmar Upgrade'}
                          </span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
