// Embedded Payment Form using Stripe Elements
// Integrates with the onboarding flow for in-modal payment
// Uses SetupIntent flow: collect payment method, then create subscription

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
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
  const [elementReady, setElementReady] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isHTTP = window.location.protocol === 'http:';

  // Debug: Log when stripe and elements are available
  useEffect(() => {
    console.log('[EmbeddedPaymentForm] Component mounted');
    console.log('[EmbeddedPaymentForm] Environment:', {
      isLocalhost,
      isHTTP,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
    });
    console.log('[EmbeddedPaymentForm] Props:', {
      intentType,
      paymentIntentId,
      customerId,
      priceId,
      countryCode,
      planName,
    });
    if (isLocalhost && isHTTP) {
      console.warn('[EmbeddedPaymentForm] WARNING: Running on HTTP localhost. Stripe PaymentElement may have issues. Consider using HTTPS.');
    }
  }, [intentType, paymentIntentId, customerId, priceId, countryCode, planName, isLocalhost, isHTTP]);

  useEffect(() => {
    console.log('[EmbeddedPaymentForm] Stripe instance:', stripe ? 'LOADED' : 'NOT LOADED');
    console.log('[EmbeddedPaymentForm] Elements instance:', elements ? 'LOADED' : 'NOT LOADED');
  }, [stripe, elements]);

  // Timeout detector - if element doesn't load in 15 seconds, show error
  useEffect(() => {
    if (elementReady) return;

    const timeoutId = setTimeout(() => {
      if (!elementReady) {
        console.error('[EmbeddedPaymentForm] PaymentElement TIMEOUT - element did not load in 15 seconds');
        setLoadTimeout(true);
        setPaymentError('O formulário de pagamento não carregou. Verifique sua conexão com a internet ou tente usar HTTPS.');
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [elementReady]);

  const handlePaymentElementReady = () => {
    console.log('[EmbeddedPaymentForm] PaymentElement is READY');
    setElementReady(true);
    setLoadTimeout(false);
  };

  const handleLoaderStart = () => {
    console.log('[EmbeddedPaymentForm] PaymentElement loader STARTED');
  };

  const handlePaymentElementChange = (event: StripePaymentElementChangeEvent) => {
    console.log('[EmbeddedPaymentForm] PaymentElement changed:', {
      complete: event.complete,
      empty: event.empty,
      value: event.value,
    });
  };

  const handlePaymentElementLoadError = (event: { elementType: string; error: Error }) => {
    console.error('[EmbeddedPaymentForm] PaymentElement LOAD ERROR:', event.error);
    setPaymentError(`Erro ao carregar formulário: ${event.error.message}`);
  };

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
        {!elementReady && !loadTimeout && (
          <div className="text-center py-4 text-slate-400">
            <svg className="animate-spin h-6 w-6 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Carregando formulário de pagamento...
          </div>
        )}
        {loadTimeout && (
          <div className="text-center py-4 text-amber-400">
            <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm mb-3">O formulário de pagamento está demorando para carregar.</p>
            {isLocalhost && isHTTP ? (
              <div className="text-xs text-slate-400 mb-3 space-y-1">
                <p className="text-amber-300 font-medium">Detectado: localhost via HTTP</p>
                <p>O Stripe pode ter problemas em HTTP local. Opções:</p>
                <ul className="list-disc list-inside text-left pl-4">
                  <li>Use o site em produção (HTTPS): <a href="https://myeasyai.com" className="text-blue-400 underline">myeasyai.com</a></li>
                  <li>Use ngrok para criar um túnel HTTPS</li>
                  <li>Configure vite para usar HTTPS local</li>
                </ul>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-3">
                Verifique sua conexão com a internet e tente novamente.
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        )}
        <div className={loadTimeout ? 'hidden' : ''}>
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
            onReady={handlePaymentElementReady}
            onChange={handlePaymentElementChange}
            onLoadError={handlePaymentElementLoadError}
            onLoaderStart={handleLoaderStart}
          />
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
