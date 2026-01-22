// Plan Selection Step for Onboarding
// Step 4: Select subscription plan and proceed to Stripe Checkout

import { useState } from 'react';
import { PLANS, getCurrencyForCountry, type PlanId } from '../../constants/stripe';
import { stripeService } from '../../services/StripeService';

interface PlanSelectionStepProps {
  userEmail: string;
  userId: string;
  countryCode: string;
  onSuccess?: () => void;
}

export function PlanSelectionStep({
  userEmail,
  userId,
  countryCode,
}: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('plus');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = getCurrencyForCountry(countryCode);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError(null);

    try {
      await stripeService.redirectToCheckout({
        email: userEmail,
        userId: userId,
        plan: selectedPlan,
        country: countryCode,
      });
      // Note: redirectToCheckout will redirect the page, so we won't reach here
    } catch (err) {
      console.error('[PlanSelectionStep] Error creating checkout:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Cards */}
      <div className="grid gap-4">
        {PLANS.map((plan) => {
          const pricing = plan.pricing[currency];
          const isSelected = selectedPlan === plan.id;

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
                  {currency === 'brl' && pricing.installments ? (
                    <>
                      <div className="text-2xl font-bold text-slate-100">
                        {pricing.installmentPrice}
                      </div>
                      <div className="text-sm text-slate-400">
                        em {pricing.installments}x
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        ou {pricing.displayPrice}/ano
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-slate-100">
                        {pricing.displayPrice}
                      </div>
                      <div className="text-sm text-slate-400">/ano</div>
                    </>
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

      {/* Subscribe Button */}
      <button
        onClick={handleSubscribe}
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
          `Assinar ${PLANS.find((p) => p.id === selectedPlan)?.name}`
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
