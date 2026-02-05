import { useState, useEffect } from 'react';
import { ArrowUpCircle, X, AlertTriangle, CreditCard, Check, Loader2, Zap, Sparkles, Shield, Calendar, Receipt, Ban, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PLANS, getPlanByValue, getPlanChangeType, type SubscriptionPlan } from '../../constants/plans';
import type { SubscriptionData } from '../../hooks/useUserData';
import { PlanCard } from './PlanCard';
import { stripeService, type ProrationPreviewResponse, type PaymentHistoryItem } from '../../services/StripeService';
import { authService } from '../../services/AuthServiceV2';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// PIX Upgrade data type
interface PixUpgradeData {
  clientSecret: string;
  paymentIntentId: string;
  amountDue: number;
  currency: string;
  oldPlan: string;
  newPlan: string;
  daysRemaining: number;
}

// PIX Upgrade Payment Form Component
function PixUpgradePaymentForm({
  pixData,
  onSuccess,
  onCancel,
}: {
  pixData: PixUpgradeData;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe não carregado. Recarregue a página.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Erro ao processar pagamento');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // PIX payment is processing - poll for status
        toast.info('Pagamento PIX em processamento...', {
          description: 'Aguarde a confirmação do pagamento.',
        });
        // Start polling for payment confirmation
        pollPixPaymentStatus(paymentIntent.id, onSuccess);
      }
    } catch (err) {
      console.error('[PixUpgradePaymentForm] Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll for PIX payment status
  const pollPixPaymentStatus = async (paymentIntentId: string, onSuccessCallback: (id: string) => void) => {
    const user = authService.getUser();
    if (!user?.uuid) return;

    const maxAttempts = 60; // 5 minutes (5 seconds * 60)
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const result = await stripeService.confirmPixUpgrade({
          paymentIntentId,
          userId: user.uuid,
        });

        if (result.success) {
          onSuccessCallback(paymentIntentId);
          return;
        }

        if (result.status === 'processing' && attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else if (attempts >= maxAttempts) {
          setError('Tempo esgotado. Verifique seu pagamento no app do banco.');
        }
      } catch (err) {
        console.error('[PixUpgradePaymentForm] Polling error:', err);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    setTimeout(poll, 5000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Info */}
      <div className="rounded-xl p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Valor do upgrade via PIX</span>
          <span className="text-2xl font-bold text-green-400">
            {formatCurrency(pixData.amountDue, pixData.currency)}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Upgrade de <span className="font-medium text-slate-400">{pixData.oldPlan.toUpperCase()}</span> para{' '}
          <span className="font-medium text-green-400">{pixData.newPlan.toUpperCase()}</span>
          {pixData.daysRemaining > 0 && ` • ${pixData.daysRemaining} dias restantes`}
        </p>
      </div>

      {/* Payment Element */}
      <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700">
        {!elementReady && (
          <div className="text-center py-4 text-slate-400">
            <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
            Carregando PIX...
          </div>
        )}
        <div className={!elementReady ? 'hidden' : ''}>
          <PaymentElement
            options={{ layout: 'tabs' }}
            onReady={() => setElementReady(true)}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-medium disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isProcessing || !elementReady}
          className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>Pagar com PIX</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

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
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [prorationPreview, setProrationPreview] = useState<ProrationPreviewResponse | null>(null);
  const [upfrontBlockedError, setUpfrontBlockedError] = useState<{ message: string; periodEnd?: string } | null>(null);
  // PIX Upgrade states
  const [pixUpgradeData, setPixUpgradeData] = useState<PixUpgradeData | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  // Custom subscription management states
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isPaymentHistoryExpanded, setIsPaymentHistoryExpanded] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  console.log('🟡 [SubscriptionTab] Current subscription:', subscription);

  // Fetch payment history on mount
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      const user = authService.getUser();
      if (!user?.uuid) return;

      setIsLoadingPayments(true);
      try {
        const history = await stripeService.getPaymentHistory(user.uuid);
        setPaymentHistory(history.payments);
        console.log('[SubscriptionTab] Payment history loaded:', history.total);
      } catch (error) {
        console.error('[SubscriptionTab] Error fetching payment history:', error);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  // Handle cancel subscription
  const handleCancelSubscription = async (immediate: boolean = false) => {
    const user = authService.getUser();
    if (!user?.uuid) {
      toast.error('Erro ao cancelar', {
        description: 'Usuário não encontrado.',
      });
      return;
    }

    setIsCancelling(true);
    try {
      const result = await stripeService.cancelSubscription({
        userId: user.uuid,
        immediate,
      });

      if (result.success) {
        toast.success(result.cancelled ? 'Assinatura cancelada' : 'Cancelamento agendado', {
          description: result.message,
        });
        setIsCancelModalOpen(false);
        // Refresh to show updated status
        window.location.reload();
      }
    } catch (error) {
      console.error('[SubscriptionTab] Error cancelling subscription:', error);
      toast.error('Erro ao cancelar', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle reactivate subscription
  const handleReactivateSubscription = async () => {
    const user = authService.getUser();
    if (!user?.uuid) {
      toast.error('Erro ao reativar', {
        description: 'Usuário não encontrado.',
      });
      return;
    }

    setIsReactivating(true);
    try {
      const result = await stripeService.reactivateSubscription(user.uuid);

      if (result.success) {
        toast.success('Assinatura reativada', {
          description: result.message,
        });
        // Refresh to show updated status
        window.location.reload();
      }
    } catch (error) {
      console.error('[SubscriptionTab] Error reactivating subscription:', error);
      toast.error('Erro ao reativar', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setIsReactivating(false);
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

      // Check if PIX payment is required
      if (result.requiresPixPayment && result.clientSecret && result.paymentIntentId) {
        console.log('[SubscriptionTab] PIX payment required for upgrade:', result);
        setPixUpgradeData({
          clientSecret: result.clientSecret,
          paymentIntentId: result.paymentIntentId,
          amountDue: result.amountDue || 0,
          currency: result.currency || 'brl',
          oldPlan: result.oldPlan || subscription.plan,
          newPlan: result.newPlan,
          daysRemaining: result.daysRemaining || 0,
        });
        setIsConfirmModalOpen(false);
        setIsPixModalOpen(true);
        setIsProcessing(false);
        return;
      }

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

  // Handle PIX upgrade payment success
  const handlePixUpgradeSuccess = async (paymentIntentId: string) => {
    const user = authService.getUser();
    if (!user?.uuid) return;

    try {
      const result = await stripeService.confirmPixUpgrade({
        paymentIntentId,
        userId: user.uuid,
      });

      if (result.success) {
        toast.success('Upgrade realizado com sucesso!', {
          description: `Você agora está no plano ${result.newPlan?.toUpperCase()}.`,
        });
        window.location.reload();
      } else {
        toast.error('Erro ao confirmar upgrade', {
          description: result.message || 'Tente novamente.',
        });
      }
    } catch (error) {
      console.error('[SubscriptionTab] Error confirming PIX upgrade:', error);
      toast.error('Erro ao confirmar upgrade', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
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

      {/* Subscription Details Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-slate-900/80 p-6">
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Detalhes da Assinatura</h2>
          </div>

          {/* Subscription Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Plan */}
            <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">Plano Atual</span>
              </div>
              <p className="text-xl font-bold text-white capitalize">{subscription.plan}</p>
              {subscription.billing_cycle && (
                <p className="text-xs text-slate-500 mt-1">
                  Ciclo: {subscription.billing_cycle === 'annual' ? 'Anual' : 'Mensal'}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${
                  subscription.status === 'active' ? 'text-green-400' :
                  subscription.status === 'cancelled' ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {subscription.status === 'active' ? 'Ativo' :
                   subscription.status === 'cancelled' ? 'Cancelado' :
                   subscription.status === 'past_due' ? 'Pendente' :
                   subscription.status}
                </span>
                {subscription.cancel_at_period_end && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Cancela em breve
                  </span>
                )}
              </div>
            </div>

            {/* Renewal Date */}
            <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  {subscription.cancel_at_period_end ? 'Encerra em' : 'Renova em'}
                </span>
              </div>
              <p className="text-xl font-bold text-white">
                {subscription.end_date
                  ? new Date(subscription.end_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </p>
              {subscription.end_date && (
                <p className="text-xs text-slate-500 mt-1">
                  {(() => {
                    const daysRemaining = Math.ceil(
                      (new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Expirado';
                  })()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {subscription.cancel_at_period_end ? (
              <button
                onClick={handleReactivateSubscription}
                disabled={isReactivating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
              >
                {isReactivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reativando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Reativar Assinatura</span>
                  </>
                )}
              </button>
            ) : (
              subscription.status === 'active' && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-slate-700 transition-all cursor-pointer"
                >
                  <Ban className="h-4 w-4" />
                  <span>Cancelar Assinatura</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 via-slate-900/60 to-slate-900/80">
        {/* Header - always visible */}
        <button
          onClick={() => setIsPaymentHistoryExpanded(!isPaymentHistoryExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-slate-800/20 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
              <Receipt className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white">Histórico de Pagamentos</h2>
              <p className="text-sm text-slate-400">{paymentHistory.length} pagamentos encontrados</p>
            </div>
          </div>
          {isPaymentHistoryExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>

        {/* Expandable Content */}
        {isPaymentHistoryExpanded && (
          <div className="px-6 pb-6 border-t border-slate-700/50">
            {isLoadingPayments ? (
              <div className="py-8 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                <span className="text-slate-400">Carregando histórico...</span>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p>Nenhum pagamento encontrado</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Payment method icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.paymentMethod === 'PIX'
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-blue-500/10 border border-blue-500/20'
                      }`}>
                        {payment.paymentMethod === 'PIX' ? (
                          <span className="text-green-400 font-bold text-xs">PIX</span>
                        ) : (
                          <CreditCard className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {payment.description || (payment.plan ? `Plano ${payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)}` : 'Pagamento')}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(payment.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                          {' · '}
                          {payment.paymentMethod}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className={`text-xs ${
                        payment.status === 'succeeded' || payment.status === 'paid'
                          ? 'text-green-400'
                          : 'text-amber-400'
                      }`}>
                        {payment.status === 'succeeded' || payment.status === 'paid' ? 'Pago' : payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
                <div className={`rounded-xl p-4 border ${prorationPreview.isPixUpgrade ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300 font-medium">Valor a pagar agora</span>
                    <span className={`text-2xl font-bold ${prorationPreview.isPixUpgrade ? 'text-green-400' : 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'}`}>
                      {formatCurrency(prorationPreview.amountDue, prorationPreview.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {prorationPreview.isPixUpgrade && prorationPreview.daysRemaining ? (
                      <>Proporcional aos {prorationPreview.daysRemaining} dias restantes. <span className="text-green-400 font-medium">Pagamento via PIX.</span></>
                    ) : prorationPreview.isUpfrontPayment && prorationPreview.daysRemaining ? (
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

      {/* Cancel Subscription Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/98 border border-slate-700/50 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600/20 via-rose-600/20 to-red-600/20 px-6 py-5 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/20">
                    <Ban className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Cancelar Assinatura</h3>
                    <p className="text-xs text-slate-400">Esta ação pode ser revertida</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors group"
                >
                  <X className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Tem certeza que deseja cancelar?</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Ao cancelar, você continuará tendo acesso ao plano{' '}
                    <span className="font-medium text-white">{subscription.plan.toUpperCase()}</span> até{' '}
                    <span className="font-medium text-white">
                      {subscription.end_date
                        ? new Date(subscription.end_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'o fim do período'}
                    </span>.
                  </p>
                </div>
              </div>

              {/* What you'll lose */}
              <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700/50">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">O que você perderá:</p>
                <ul className="space-y-2">
                  {getPlanByValue(subscription.plan)?.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 space-y-3">
              <button
                onClick={() => handleCancelSubscription(false)}
                disabled={isCancelling}
                className="w-full px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5" />
                    <span>Cancelar ao fim do período</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-medium disabled:opacity-50 cursor-pointer"
              >
                Manter minha assinatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIX Upgrade Payment Modal */}
      {isPixModalOpen && pixUpgradeData && stripePromise && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/98 border border-slate-700/50 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 px-6 py-5 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Upgrade via PIX</h3>
                    <p className="text-sm text-slate-400">Pague com PIX para fazer o upgrade</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsPixModalOpen(false);
                    setPixUpgradeData(null);
                    setSelectedPlan(null);
                  }}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: pixUpgradeData.clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#22c55e',
                      colorBackground: '#1e293b',
                      colorText: '#e2e8f0',
                      colorDanger: '#ef4444',
                      fontFamily: 'system-ui, sans-serif',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <PixUpgradePaymentForm
                  pixData={pixUpgradeData}
                  onSuccess={handlePixUpgradeSuccess}
                  onCancel={() => {
                    setIsPixModalOpen(false);
                    setPixUpgradeData(null);
                    setSelectedPlan(null);
                  }}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
