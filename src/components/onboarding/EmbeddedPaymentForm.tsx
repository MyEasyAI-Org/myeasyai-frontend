// Embedded Payment Form using Stripe Elements
// Integrates with the onboarding flow for in-modal payment

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface EmbeddedPaymentFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  planName: string;
  priceDisplay: string;
}

export function EmbeddedPaymentForm({
  onSuccess,
  onError,
  planName,
  priceDisplay,
}: EmbeddedPaymentFormProps) {
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
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[EmbeddedPaymentForm] Payment succeeded:', paymentIntent.id);
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is still processing
        setPaymentError('Pagamento em processamento. Aguarde...');
      } else {
        // Handle other statuses
        console.log('[EmbeddedPaymentForm] Payment status:', paymentIntent?.status);
        onSuccess();
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
            <h4 className="text-sm font-medium text-slate-300">Plano selecionado</h4>
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
          }}
        />
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
            Processando...
          </span>
        ) : (
          `Assinar ${planName}`
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
        Pagamento seguro via Stripe. Cancele quando quiser.
      </p>
    </form>
  );
}
