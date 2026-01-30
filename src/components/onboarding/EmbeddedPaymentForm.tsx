// Embedded Payment Form using Stripe Elements
// Integrates with the onboarding flow for in-modal payment
// Uses SetupIntent flow: collect payment method, then create subscription

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripeService } from '../../services/StripeService';

interface EmbeddedPaymentFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  planName: string;
  priceDisplay: string;
  customerId: string;
  priceId: string;
  userId: string;
  plan: string;
  countryCode: string;
  intentType: 'setup_intent' | 'payment_intent';
  paymentIntentId?: string;
}

export function EmbeddedPaymentForm({
  onSuccess,
  onError,
  planName,
  priceDisplay,
  customerId,
  priceId,
  userId,
  plan,
  countryCode,
  intentType,
  paymentIntentId,
}: EmbeddedPaymentFormProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // PAYMENT INTENT FLOW (PIX/Card for Brazil annual - one-time payment)
      if (intentType === 'payment_intent') {
        console.log('[EmbeddedPaymentForm] Using PaymentIntent flow (PIX enabled)');

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
          },
          redirect: 'if_required',
        });

        if (error) {
          console.error('[EmbeddedPaymentForm] Payment error:', error);
          const errorMessage = error.message || 'Erro ao processar pagamento';
          setPaymentError(errorMessage);
          onError(errorMessage);
          return;
        }

        if (paymentIntent) {
          console.log('[EmbeddedPaymentForm] PaymentIntent status:', paymentIntent.status);

          if (paymentIntent.status === 'succeeded') {
            // Payment succeeded! Confirm with backend to activate subscription
            try {
              const result = await stripeService.confirmPixPayment({
                paymentIntentId: paymentIntent.id,
                userId,
                plan,
              });

              if (result.success) {
                console.log('[EmbeddedPaymentForm] PIX payment confirmed, subscription active');
                onSuccess();
              } else {
                setPaymentError(result.message || 'Erro ao confirmar pagamento');
                onError(result.message || 'Erro ao confirmar pagamento');
              }
            } catch (confirmError) {
              console.error('[EmbeddedPaymentForm] Confirm error:', confirmError);
              const errorMessage = confirmError instanceof Error ? confirmError.message : 'Erro ao confirmar pagamento';
              setPaymentError(errorMessage);
              onError(errorMessage);
            }
          } else if (paymentIntent.status === 'processing') {
            // PIX payments may take a moment to process
            setPaymentError('Pagamento PIX em processamento. Aguarde a confirmação...');
          } else if (paymentIntent.status === 'requires_action') {
            // User needs to complete action (e.g., scan QR code for PIX)
            setPaymentError('Complete o pagamento no seu aplicativo bancário.');
          } else {
            setPaymentError(`Status do pagamento: ${paymentIntent.status}`);
          }
        }
        return;
      }

      // SETUP INTENT FLOW (Card for recurring subscriptions)
      console.log('[EmbeddedPaymentForm] Using SetupIntent flow (recurring subscription)');

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('[EmbeddedPaymentForm] Setup error:', error);
        const errorMessage = error.message || 'Erro ao processar pagamento';
        setPaymentError(errorMessage);
        onError(errorMessage);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Get the payment method ID from the confirmed SetupIntent
        const paymentMethodId = typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : (setupIntent.payment_method as { id: string } | null)?.id;

        console.log('[EmbeddedPaymentForm] SetupIntent succeeded:', setupIntent.id, 'paymentMethod:', paymentMethodId);

        // Step 2: Create the actual subscription now that payment method is saved
        try {
          const subscription = await stripeService.confirmSubscription({
            customerId,
            priceId,
            userId,
            plan,
            paymentMethodId,
          });

          console.log('[EmbeddedPaymentForm] Subscription created:', subscription.subscriptionId);
          onSuccess();
        } catch (subError) {
          console.error('[EmbeddedPaymentForm] Subscription error:', subError);
          const errorMessage = subError instanceof Error ? subError.message : 'Erro ao criar assinatura';
          setPaymentError(errorMessage);
          onError(errorMessage);
        }
      } else if (setupIntent && setupIntent.status === 'processing') {
        setPaymentError('Pagamento em processamento. Aguarde...');
      } else {
        console.log('[EmbeddedPaymentForm] SetupIntent status:', setupIntent?.status);
        // Get payment method if available
        const paymentMethodId = setupIntent?.payment_method
          ? (typeof setupIntent.payment_method === 'string'
              ? setupIntent.payment_method
              : (setupIntent.payment_method as { id: string } | null)?.id)
          : undefined;

        // Try to create subscription anyway
        try {
          await stripeService.confirmSubscription({
            customerId,
            priceId,
            userId,
            plan,
            paymentMethodId,
          });
          onSuccess();
        } catch {
          onError('Status de pagamento desconhecido');
        }
      }
    } catch (err) {
      console.error('[EmbeddedPaymentForm] Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setPaymentError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Plan Summary */}
      <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-slate-300">{t('plans.selectedPlan', 'Plano selecionado')}</h4>
            <p className="text-lg font-semibold text-slate-100">{planName}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-purple-400">{priceDisplay}</p>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: {
                  country: countryCode,
                },
              },
            },
          }}
        />
      </div>

      {/* Link Optional Info */}
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="flex gap-2">
          <svg
            className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-blue-300">
            {t('plans.linkOptionalNote', 'A opcao de salvar seus dados com Link e totalmente opcional. Se preferir, deixe esses campos em branco e clique no botao abaixo para continuar com a compra normalmente.')}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {paymentError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
          !stripe || isProcessing
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-purple-500/25'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('common.loading')}
          </span>
        ) : (
          `${t('plans.subscribe', 'Assinar')} ${planName}`
        )}
      </button>

      {/* Security Note */}
      <p className="text-xs text-slate-500 text-center">
        <svg
          className="w-3 h-3 inline-block mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        {t('plans.securityNote', 'Pagamento seguro via Stripe. Cancele quando quiser.')}
      </p>
    </form>
  );
}
