// Stripe Service for MyEasyAI
// Handles all Stripe-related operations via the backend Worker

// API Base URL (same as D1 API)
const API_BASE_URL = import.meta.env.VITE_CLOUDFLARE_D1_API_URL || '';

// Stripe Publishable Key (test mode)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export interface SubscriptionStatus {
  plan: string | null;
  status: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface CreateSubscriptionResponse {
  setupIntentId: string;
  clientSecret: string;
  customerId: string;
  priceId: string;
  status: string;
  intentType: 'setup_intent';
}

export interface ConfirmSubscriptionResponse {
  subscriptionId: string;
  status: string;
}

class StripeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/stripe`;
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return !!STRIPE_PUBLISHABLE_KEY;
  }

  /**
   * Get Stripe publishable key
   */
  getPublishableKey(): string {
    return STRIPE_PUBLISHABLE_KEY;
  }

  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession(params: {
    email: string;
    userId: string;
    plan: 'individual' | 'plus' | 'premium';
    country: string;
    billingPeriod?: 'annual' | 'monthly';
    successUrl?: string;
    cancelUrl?: string;
  }): Promise<CheckoutSessionResponse> {
    const response = await fetch(`${this.baseUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        userId: params.userId,
        plan: params.plan,
        country: params.country,
        billingPeriod: params.billingPeriod || 'monthly',
        successUrl: params.successUrl || `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: params.cancelUrl || `${window.location.origin}/checkout/cancel`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    return response.json();
  }

  /**
   * Create a Stripe Customer Portal session
   */
  async createPortalSession(params: {
    userId: string;
    returnUrl?: string;
  }): Promise<PortalSessionResponse> {
    const response = await fetch(`${this.baseUrl}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: params.userId,
        returnUrl: params.returnUrl || `${window.location.origin}/dashboard`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create portal session');
    }

    return response.json();
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    const response = await fetch(`${this.baseUrl}/subscription/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          plan: null,
          status: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          periodEnd: null,
          cancelAtPeriodEnd: false,
        };
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get subscription status');
    }

    return response.json();
  }

  /**
   * Create a subscription for embedded payment (Stripe Elements)
   * Returns client_secret to confirm payment in the frontend
   */
  async createSubscription(params: {
    email: string;
    userId: string;
    plan: 'individual' | 'plus' | 'premium';
    country: string;
    billingPeriod?: 'annual' | 'monthly';
  }): Promise<CreateSubscriptionResponse> {
    const response = await fetch(`${this.baseUrl}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        userId: params.userId,
        plan: params.plan,
        country: params.country,
        billingPeriod: params.billingPeriod || 'monthly',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create subscription');
    }

    return response.json();
  }

  /**
   * Confirm subscription after SetupIntent is confirmed
   * Creates the actual subscription now that payment method is attached
   */
  async confirmSubscription(params: {
    customerId: string;
    priceId: string;
    userId: string;
    plan: string;
    paymentMethodId?: string;
  }): Promise<ConfirmSubscriptionResponse> {
    const response = await fetch(`${this.baseUrl}/confirm-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to confirm subscription');
    }

    return response.json();
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(params: {
    email: string;
    userId: string;
    plan: 'individual' | 'plus' | 'premium';
    country: string;
    billingPeriod?: 'annual' | 'monthly';
  }): Promise<void> {
    const session = await this.createCheckoutSession(params);

    // Redirect to Stripe Checkout
    if (session.url) {
      window.location.href = session.url;
    } else {
      throw new Error('No checkout URL received');
    }
  }

  /**
   * Redirect to Customer Portal
   */
  async redirectToPortal(userId: string): Promise<void> {
    const portal = await this.createPortalSession({ userId });

    if (portal.url) {
      window.location.href = portal.url;
    } else {
      throw new Error('No portal URL received');
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus(userId);
      return status.status === 'active' || status.status === 'trialing';
    } catch {
      return false;
    }
  }

  /**
   * Check if user needs to complete payment
   */
  async needsPayment(userId: string): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus(userId);
      return !status.status || status.status === 'inactive' || status.status === 'cancelled';
    } catch {
      return true;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;
