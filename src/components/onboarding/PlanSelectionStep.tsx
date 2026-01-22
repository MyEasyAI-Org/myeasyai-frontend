// Plan Selection Step for Onboarding
// Step 4: Select subscription plan and pay with embedded Stripe Elements

import { useState, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PLANS, getCurrencyForCountry, type PlanId } from '../../constants/stripe';
import { stripeService } from '../../services/StripeService';
import { EmbeddedPaymentForm } from './EmbeddedPaymentForm';

// Initialize Stripe once
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PlanSelectionStepProps {
  userEmail: string;
  userId: string;
  countryCode: string;
  onSuccess?: () => void;
}

type BillingPeriod = 'annual' | 'monthly';
type StepPhase = 'select-plan' | 'payment';

export function PlanSelectionStep({
  userEmail,
  userId,
  countryCode,
  onSuccess,
}: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('plus');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<StepPhase>('select-plan');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    customerId: string;
    priceId: string;
  } | null>(null);

  const currency = getCurrencyForCountry(countryCode);
  const isBrazil = countryCode === 'BR';

  // Calculate prices based on billing period for Brazil
  const getPriceDisplay = (plan: typeof PLANS[0]) => {
    const pricing = plan.pricing[currency];

    if (isBrazil) {
      if (billingPeriod === 'annual') {
        // À vista - desconto
        return {
          main: pricing.displayPrice,
          sub: 'à vista',
          note: `ou 12x de ${pricing.installmentPrice}`,
        };
      } else {
        // Parcelado 12x (com 20% de juros)
        const totalWithInterest = pricing.price * 1.2;
        return {
          main: pricing.installmentPrice || '',
          sub: 'por mês (12x)',
          note: `Total: R$ ${totalWithInterest.toFixed(2).replace('.', ',')}`,
        };
      }
    }

    // USD - always annual
    return {
      main: pricing.displayPrice,
      sub: '/ano',
      note: null,
    };
  };

  // Get price display for current selection
  const currentPlan = PLANS.find(p => p.id === selectedPlan);
  const currentPriceDisplay = currentPlan ? getPriceDisplay(currentPlan) : null;

  // Stripe Elements appearance
  const appearance = useMemo(() => ({
    theme: 'night' as const,
    variables: {
      colorPrimary: '#a855f7',
      colorBackground: '#1e293b',
      colorText: '#f1f5f9',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        backgroundColor: '#334155',
        border: '1px solid #475569',
      },
      '.Input:focus': {
        border: '1px solid #a855f7',
        boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
      },
      '.Label': {
        color: '#94a3b8',
      },
    },
  }), []);

  const handleContinueToPayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError(null);

    try {
      // Create SetupIntent and get client secret
      const response = await stripeService.createSubscription({
        email: userEmail,
        userId: userId,
        plan: selectedPlan,
        country: countryCode,
        billingPeriod: isBrazil ? billingPeriod : 'annual',
      });

      setClientSecret(response.clientSecret);
      setSubscriptionData({
        customerId: response.customerId,
        priceId: response.priceId,
      });
      setPhase('payment');
    } catch (err) {
      console.error('[PlanSelectionStep] Error creating subscription:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('[PlanSelectionStep] Payment successful');
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePaymentError = (message: string) => {
    console.error('[PlanSelectionStep] Payment error:', message);
    setError(message);
  };

  const handleBackToPlanSelection = () => {
    setPhase('select-plan');
    setClientSecret(null);
    setError(null);
  };

  // Render payment phase
  if (phase === 'payment' && clientSecret && stripePromise) {
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBackToPlanSelection}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar para planos
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stripe Elements */}
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance,
          }}
        >
          <EmbeddedPaymentForm
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            planName={currentPlan?.name || 'Plano'}
            priceDisplay={`${currentPriceDisplay?.main} ${currentPriceDisplay?.sub}`}
            customerId={subscriptionData?.customerId || ''}
            priceId={subscriptionData?.priceId || ''}
            userId={userId}
            plan={selectedPlan}
          />
        </Elements>
      </div>
    );
  }

  // Render plan selection phase
  return (
    <div className="space-y-6">
      {/* Billing Period Toggle - Only for Brazil */}
      {isBrazil && (
        <div className="flex justify-center gap-2 p-1 bg-slate-800/50 rounded-lg">
          <button
            type="button"
            onClick={() => setBillingPeriod('annual')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'annual'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            À Vista

          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            12x no Cartão
          </button>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const priceDisplay = getPriceDisplay(plan);

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute -top-3 right-4 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full">
                  Mais Popular
                </span>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Plan Name & Description */}
                  <h3 className="text-lg font-semibold text-slate-100">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="mt-3 space-y-1">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <svg
                          className="w-4 h-4 text-purple-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-slate-500 ml-6">
                        +{plan.features.length - 3} mais...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Price */}
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-slate-100">
                    {priceDisplay.main}
                  </div>
                  <div className="text-sm text-slate-400">
                    {priceDisplay.sub}
                  </div>
                  {priceDisplay.note && (
                    <div className="text-xs text-slate-500 mt-1">
                      {priceDisplay.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Indicator */}
              <div
                className={`absolute top-4 left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-slate-600 bg-transparent'
                }`}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinueToPayment}
        disabled={loading || !selectedPlan}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
          loading || !selectedPlan
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-purple-500/25'
        }`}
      >
        {loading ? (
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
          `Continuar com ${PLANS.find((p) => p.id === selectedPlan)?.name}`
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
    </div>
  );
}
