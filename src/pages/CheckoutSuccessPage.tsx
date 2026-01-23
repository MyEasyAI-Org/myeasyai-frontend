// Checkout Success Page
// Shows after successful Stripe payment and redirects to dashboard

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { stripeService } from '../services/StripeService';
import { authService } from '../services/AuthServiceV2';

export function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const user = authService.getUser();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user?.uuid) {
        setError('Usuario nao encontrado');
        setLoading(false);
        return;
      }

      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check subscription status
        const status = await stripeService.getSubscriptionStatus(user.uuid);

        if (status.status === 'active' || status.status === 'trialing') {
          setSubscriptionStatus(status.plan || 'active');
          // Redirect to dashboard after showing success message
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 3000);
        } else {
          // Subscription not yet active, might be processing
          setSubscriptionStatus('processing');
          // Try again in a few seconds
          setTimeout(async () => {
            const retryStatus = await stripeService.getSubscriptionStatus(user.uuid);
            if (retryStatus.status === 'active' || retryStatus.status === 'trialing') {
              setSubscriptionStatus(retryStatus.plan || 'active');
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 2000);
            } else {
              // Still not active, but payment was successful, redirect anyway
              navigate('/dashboard', { replace: true });
            }
          }, 3000);
        }
      } catch (err) {
        console.error('[CheckoutSuccess] Error verifying payment:', err);
        // Even on error, redirect to dashboard - webhook might process later
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [user, navigate, sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
            <svg
              className="w-12 h-12 text-white"
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
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Pagamento Confirmado!
        </h1>

        {loading ? (
          <p className="text-slate-400 mb-8">
            Verificando sua assinatura...
          </p>
        ) : error ? (
          <p className="text-red-400 mb-8">{error}</p>
        ) : subscriptionStatus === 'processing' ? (
          <p className="text-slate-400 mb-8">
            Processando sua assinatura...
          </p>
        ) : (
          <p className="text-slate-400 mb-8">
            Sua assinatura <span className="text-purple-400 font-semibold capitalize">{subscriptionStatus}</span> foi ativada com sucesso!
          </p>
        )}

        {/* Redirect Notice */}
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <svg
            className="w-5 h-5 animate-spin"
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
          <span>Redirecionando para o dashboard...</span>
        </div>

        {/* Manual Link */}
        <button
          onClick={() => navigate('/dashboard', { replace: true })}
          className="mt-8 text-purple-400 hover:text-purple-300 transition-colors underline"
        >
          Ir para o dashboard agora
        </button>
      </div>
    </div>
  );
}
