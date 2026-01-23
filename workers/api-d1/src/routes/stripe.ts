// Stripe Integration Routes for MyEasyAI
// Handles checkout sessions, customer portal, and webhooks

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { Env, Variables } from '../index';
import { users } from '../db/schema';

// Extend Env to include Stripe secrets
interface StripeEnv extends Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

// Stripe Price IDs (TEST MODE) - RECURRING SUBSCRIPTIONS
const PRICE_IDS = {
  // BRL - À Vista (Annual upfront)
  individual_brl_annual: 'price_1SsVGZ2FRnSpHchtqo4P3FAF',
  plus_brl_annual: 'price_1SsVId2FRnSpHchtZ61C8a7M',
  premium_brl_annual: 'price_1SsVJN2FRnSpHchtYSZ0847B',
  // BRL - Parcelado 12x (Monthly)
  individual_brl_monthly: 'price_1SsVKL2FRnSpHcht37v05CRQ',
  plus_brl_monthly: 'price_1SsVL02FRnSpHcht7a9dZxiB',
  premium_brl_monthly: 'price_1SsVLd2FRnSpHchtxFc7sGrG',
  // USD - Annual
  individual_usd: 'price_1SsVMB2FRnSpHchtNaOzfcuk',
  plus_usd: 'price_1SsVMZ2FRnSpHchtrqq2HEhI',
  premium_usd: 'price_1SsVMx2FRnSpHchteTGyrw7W',
};

// Map plan + currency + billing period to price ID
function getPriceId(plan: string, currency: string, billingPeriod: 'annual' | 'monthly' = 'monthly'): string {
  // For USD, always use annual (no monthly option)
  if (currency.toLowerCase() === 'usd') {
    const key = `${plan}_usd` as keyof typeof PRICE_IDS;
    return PRICE_IDS[key] || PRICE_IDS.individual_usd;
  }
  // For BRL, use the specified billing period
  const key = `${plan}_brl_${billingPeriod}` as keyof typeof PRICE_IDS;
  return PRICE_IDS[key] || PRICE_IDS.individual_brl_monthly;
}

// Map Stripe price ID back to plan name
function getPlanFromPriceId(priceId: string): string {
  for (const [key, value] of Object.entries(PRICE_IDS)) {
    if (value === priceId) {
      return key.split('_')[0]; // 'individual_brl' -> 'individual'
    }
  }
  return 'individual';
}

// Get billing period from Stripe price ID
function getBillingPeriodFromPriceId(priceId: string): 'monthly' | 'annual' {
  for (const [key, value] of Object.entries(PRICE_IDS)) {
    if (value === priceId) {
      // Key format: plan_currency_period (e.g., 'individual_brl_monthly', 'plus_brl_annual')
      // USD keys don't have period suffix, they're always annual
      if (key.endsWith('_monthly')) {
        return 'monthly';
      }
      return 'annual';
    }
  }
  // Default to annual if not found
  return 'annual';
}

// Price amounts in centavos (BRL) or cents (USD) - for PaymentIntent
// These are the ANNUAL prices (à vista)
const PRICE_AMOUNTS = {
  // BRL - Annual prices in centavos (R$ 297,00 = 29700)
  individual_brl: 29700,
  plus_brl: 49700,
  premium_brl: 99700,
  // USD - Annual prices in cents ($59 = 5900)
  individual_usd: 5900,
  plus_usd: 9900,
  premium_usd: 19900,
};

// Get price amount in minor units (centavos/cents) for PaymentIntent
function getPriceAmount(plan: string, currency: 'brl' | 'usd'): number {
  const key = `${plan}_${currency}` as keyof typeof PRICE_AMOUNTS;
  return PRICE_AMOUNTS[key] || PRICE_AMOUNTS.individual_brl;
}

// Helper: Get customer's saved payment methods
async function getCustomerPaymentMethods(
  customerId: string,
  stripeSecretKey: string
): Promise<{ hasCard: boolean; paymentMethodId: string | null }> {
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_methods?customer=${customerId}&type=card`,
      {
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('[Stripe] Failed to get payment methods');
      return { hasCard: false, paymentMethodId: null };
    }

    const data = await response.json() as { data: Array<{ id: string }> };
    const hasCard = data.data && data.data.length > 0;
    const paymentMethodId = hasCard ? data.data[0].id : null;

    console.log('[Stripe] Customer payment methods:', customerId, 'hasCard:', hasCard);
    return { hasCard, paymentMethodId };
  } catch (error) {
    console.error('[Stripe] Error getting payment methods:', error);
    return { hasCard: false, paymentMethodId: null };
  }
}

// Helper: Calculate manual proration for upfront payment users
function calculateManualProration(
  currentPlan: string,
  newPlan: string,
  currency: 'brl' | 'usd',
  periodEndDate: string
): { amountDue: number; daysRemaining: number; totalDays: number } {
  const currentPrice = getPriceAmount(currentPlan, currency);
  const newPrice = getPriceAmount(newPlan, currency);

  // Calculate days remaining in subscription
  const now = new Date();
  const periodEnd = new Date(periodEndDate);
  const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Total days in a year
  const totalDays = 365;

  // Calculate prorated difference
  // (newPrice - currentPrice) * (daysRemaining / totalDays)
  const priceDifference = newPrice - currentPrice;
  const prorationFactor = daysRemaining / totalDays;
  const amountDue = Math.ceil(priceDifference * prorationFactor);

  console.log('[Stripe] Manual proration:', {
    currentPlan,
    newPlan,
    currentPrice,
    newPrice,
    daysRemaining,
    prorationFactor,
    amountDue,
  });

  return { amountDue, daysRemaining, totalDays };
}

export const stripeRoutes = new Hono<{ Bindings: StripeEnv; Variables: Variables }>();

/**
 * POST /stripe/create-checkout-session
 * Creates a Stripe Checkout session for subscription
 */
stripeRoutes.post('/create-checkout-session', async (c) => {
  try {
    const { email, userId, plan, country, billingPeriod, successUrl, cancelUrl } = await c.req.json();

    if (!email || !userId || !plan) {
      return c.json({ error: 'Missing required fields: email, userId, plan' }, 400);
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      console.error('[Stripe] STRIPE_SECRET_KEY not configured');
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    // Determine currency based on country
    const currency = country === 'BR' ? 'brl' : 'usd';
    // For BRL: billingPeriod can be 'annual' (à vista) or 'monthly' (12x)
    // For USD: always annual
    const period = billingPeriod || 'monthly';
    const priceId = getPriceId(plan, currency, period);

    // Check if user already has a Stripe customer
    const db = c.get('db');
    const existingUser = await db.select().from(users).where(eq(users.uuid, userId)).get();

    let customerId = existingUser?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      // Create new customer
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          'metadata[userId]': userId,
          'metadata[country]': country || '',
        }).toString(),
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.text();
        console.error('[Stripe] Failed to create customer:', error);
        return c.json({ error: 'Failed to create customer', details: error }, 500);
      }

      const customer = await customerResponse.json() as { id: string };
      customerId = customer.id;

      // Save customer ID to database
      await db.update(users)
        .set({ stripe_customer_id: customerId })
        .where(eq(users.uuid, userId));
    }

    // Build checkout session params
    const sessionParams: Record<string, string> = {
      customer: customerId,
      'payment_method_types[0]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      mode: 'subscription',
      success_url: successUrl || `${c.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${c.env.FRONTEND_URL}/checkout/cancel`,
      'metadata[userId]': userId,
      'metadata[plan]': plan,
      'subscription_data[metadata][userId]': userId,
      'subscription_data[metadata][plan]': plan,
    };

    // Note: Stripe installments are only for one-time payments, not subscriptions
    // For subscriptions, we use monthly recurring billing instead

    // Create checkout session
    const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(sessionParams).toString(),
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('[Stripe] Failed to create checkout session:', error);
      // Return detailed error in development
      return c.json({ error: 'Failed to create checkout session', details: error }, 500);
    }

    const session = await sessionResponse.json() as { id: string; url: string };

    console.log(`[Stripe] Checkout session created: ${session.id} for user ${userId}`);

    return c.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /stripe/create-portal-session
 * Creates a Stripe Customer Portal session for managing subscription
 */
stripeRoutes.post('/create-portal-session', async (c) => {
  try {
    const { userId, returnUrl } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'Missing required field: userId' }, 400);
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    // Get user's Stripe customer ID
    const db = c.get('db');
    const user = await db.select().from(users).where(eq(users.uuid, userId)).get();

    if (!user?.stripe_customer_id) {
      return c.json({ error: 'No Stripe customer found for this user' }, 404);
    }

    // Create portal session
    const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: user.stripe_customer_id,
        return_url: returnUrl || `${c.env.FRONTEND_URL}/dashboard`,
      }).toString(),
    });

    if (!portalResponse.ok) {
      const error = await portalResponse.text();
      console.error('[Stripe] Failed to create portal session:', error);
      return c.json({ error: 'Failed to create portal session' }, 500);
    }

    const portal = await portalResponse.json() as { url: string };

    console.log(`[Stripe] Portal session created for user ${userId}`);

    return c.json({ url: portal.url });
  } catch (error) {
    console.error('[Stripe] Error creating portal session:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /stripe/subscription/:userId
 * Get subscription status for a user
 */
stripeRoutes.get('/subscription/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const db = c.get('db');
    const user = await db.select().from(users).where(eq(users.uuid, userId)).get();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      plan: user.subscription_plan,
      status: user.subscription_status,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id,
      periodEnd: user.subscription_period_end,
      cancelAtPeriodEnd: user.subscription_cancel_at_period_end,
    });
  } catch (error) {
    console.error('[Stripe] Error getting subscription:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /stripe/webhook
 * Handle Stripe webhook events
 */
stripeRoutes.post('/webhook', async (c) => {
  try {
    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    const STRIPE_WEBHOOK_SECRET = c.env.STRIPE_WEBHOOK_SECRET;

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      console.error('[Stripe Webhook] Missing Stripe configuration');
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    const signature = c.req.header('stripe-signature');
    if (!signature) {
      return c.json({ error: 'Missing stripe-signature header' }, 400);
    }

    const body = await c.req.text();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature, STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      console.error('[Stripe Webhook] Invalid signature');
      return c.json({ error: 'Invalid signature' }, 400);
    }

    const event = JSON.parse(body) as StripeEvent;
    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    const db = c.get('db');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as CheckoutSession;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'individual';

        if (userId) {
          await db.update(users)
            .set({
              subscription_status: 'active',
              subscription_plan: plan,
              stripe_subscription_id: session.subscription as string,
            })
            .where(eq(users.uuid, userId));

          console.log(`[Stripe Webhook] Activated subscription for user ${userId}, plan: ${plan}`);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const status = subscription.status === 'active' || subscription.status === 'trialing'
            ? 'active'
            : subscription.status === 'past_due'
              ? 'past_due'
              : 'inactive';

          // Get plan from price ID
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const plan = priceId ? getPlanFromPriceId(priceId) : undefined;

          await db.update(users)
            .set({
              subscription_status: status,
              subscription_plan: plan || undefined,
              stripe_subscription_id: subscription.id,
              subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              subscription_cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .where(eq(users.uuid, userId));

          console.log(`[Stripe Webhook] Updated subscription for user ${userId}, status: ${status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await db.update(users)
            .set({
              subscription_status: 'cancelled',
              stripe_subscription_id: null,
              subscription_period_end: null,
              subscription_cancel_at_period_end: false,
            })
            .where(eq(users.uuid, userId));

          console.log(`[Stripe Webhook] Cancelled subscription for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Invoice;
        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const user = await db.select().from(users)
          .where(eq(users.stripe_customer_id, customerId))
          .get();

        if (user) {
          await db.update(users)
            .set({ subscription_status: 'past_due' })
            .where(eq(users.uuid, user.uuid));

          console.log(`[Stripe Webhook] Payment failed for user ${user.uuid}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Invoice;
        const customerId = invoice.customer as string;

        // Find user by Stripe customer ID
        const user = await db.select().from(users)
          .where(eq(users.stripe_customer_id, customerId))
          .get();

        if (user && user.subscription_status === 'past_due') {
          await db.update(users)
            .set({ subscription_status: 'active' })
            .where(eq(users.uuid, user.uuid));

          console.log(`[Stripe Webhook] Payment succeeded, reactivated user ${user.uuid}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

/**
 * POST /stripe/update-price-ids
 * Update price IDs (admin only - for initial setup)
 * In production, you'd want proper admin authentication
 */
stripeRoutes.post('/update-price-ids', async (c) => {
  try {
    const { priceIds } = await c.req.json();

    // This is a simple way to update price IDs
    // In production, you might want to store these in a config table or KV store
    Object.assign(PRICE_IDS, priceIds);

    console.log('[Stripe] Price IDs updated:', PRICE_IDS);

    return c.json({ success: true, priceIds: PRICE_IDS });
  } catch (error) {
    console.error('[Stripe] Error updating price IDs:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /stripe/price-ids
 * Get current price IDs (for debugging)
 */
stripeRoutes.get('/price-ids', async (c) => {
  return c.json({ priceIds: PRICE_IDS });
});

/**
 * GET /stripe/debug
 * Check Stripe configuration (for debugging)
 */
stripeRoutes.get('/debug', async (c) => {
  const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
  const hasKey = !!STRIPE_SECRET_KEY;
  const keyPrefix = hasKey ? STRIPE_SECRET_KEY.substring(0, 12) + '...' : 'NOT SET';

  // Test Stripe API connection
  let stripeStatus = 'unknown';
  let stripeError = null;

  if (hasKey) {
    try {
      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      });
      if (response.ok) {
        stripeStatus = 'connected';
      } else {
        const error = await response.text();
        stripeStatus = 'error';
        stripeError = error;
      }
    } catch (err) {
      stripeStatus = 'error';
      stripeError = String(err);
    }
  }

  return c.json({
    hasStripeKey: hasKey,
    keyPrefix,
    stripeStatus,
    stripeError,
    frontendUrl: c.env.FRONTEND_URL,
  });
});

/**
 * POST /stripe/create-subscription
 * Creates a Stripe Subscription with embedded payment (for Stripe Elements)
 * Returns client_secret for confirming payment in the frontend
 *
 * For Brazil + Annual (à vista): Uses PaymentIntent with PIX + Card options (one-time payment)
 * For Brazil + Monthly (12x): Uses SetupIntent with Card only (recurring subscription)
 * For Other countries: Uses SetupIntent with Card only (recurring subscription)
 */
stripeRoutes.post('/create-subscription', async (c) => {
  try {
    const { email, userId, plan, country, billingPeriod } = await c.req.json();

    if (!email || !userId || !plan) {
      return c.json({ error: 'Missing required fields: email, userId, plan' }, 400);
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      console.error('[Stripe] STRIPE_SECRET_KEY not configured');
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    // Determine currency based on country
    const currency = country === 'BR' ? 'brl' : 'usd';
    const period = billingPeriod || 'monthly';
    const priceId = getPriceId(plan, currency, period);

    const db = c.get('db');
    const existingUser = await db.select().from(users).where(eq(users.uuid, userId)).get();

    let customerId = existingUser?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          'metadata[userId]': userId,
          'metadata[country]': country || '',
        }).toString(),
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.text();
        console.error('[Stripe] Failed to create customer:', error);
        return c.json({ error: 'Failed to create customer', details: error }, 500);
      }

      const customer = await customerResponse.json() as { id: string };
      customerId = customer.id;

      // Save customer ID to database
      await db.update(users)
        .set({ stripe_customer_id: customerId })
        .where(eq(users.uuid, userId));
    }

    // BRAZIL + ANNUAL (À VISTA): Use PaymentIntent with PIX + Card
    // This allows one-time payment via PIX or Card
    const isBrazilAnnual = country === 'BR' && period === 'annual';

    if (isBrazilAnnual) {
      // Get the price amount from our constants
      const priceAmount = getPriceAmount(plan, 'brl');

      console.log(`[Stripe] Creating PaymentIntent for Brazil annual (PIX enabled): ${plan} = ${priceAmount} BRL`);

      // Create PaymentIntent with both card and pix
      const paymentIntentParams = new URLSearchParams();
      paymentIntentParams.append('amount', priceAmount.toString());
      paymentIntentParams.append('currency', 'brl');
      paymentIntentParams.append('customer', customerId);
      paymentIntentParams.append('payment_method_types[0]', 'card');
      paymentIntentParams.append('payment_method_types[1]', 'pix');
      paymentIntentParams.append('metadata[userId]', userId);
      paymentIntentParams.append('metadata[plan]', plan);
      paymentIntentParams.append('metadata[priceId]', priceId);
      paymentIntentParams.append('metadata[isAnnualBrazil]', 'true');
      paymentIntentParams.append('description', `MyEasyAI ${plan} - Plano Anual`);

      const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: paymentIntentParams.toString(),
      });

      if (!paymentIntentResponse.ok) {
        const error = await paymentIntentResponse.text();
        console.error('[Stripe] Failed to create payment intent:', error);
        return c.json({ error: 'Failed to create payment intent', details: error }, 500);
      }

      const paymentIntent = await paymentIntentResponse.json() as {
        id: string;
        client_secret: string;
        status: string;
      };

      console.log(`[Stripe] PaymentIntent created: ${paymentIntent.id} for user ${userId} (PIX enabled)`);

      return c.json({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        customerId: customerId,
        priceId: priceId,
        status: paymentIntent.status,
        intentType: 'payment_intent', // Frontend needs to know this is a PaymentIntent
        pixEnabled: true,
      });
    }

    // OTHER CASES: Use SetupIntent with Card only (for recurring subscriptions)
    const setupIntentResponse = await fetch('https://api.stripe.com/v1/setup_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customerId,
        'payment_method_types[]': 'card',
        'metadata[userId]': userId,
        'metadata[plan]': plan,
        'metadata[priceId]': priceId,
        usage: 'off_session',
      }).toString(),
    });

    if (!setupIntentResponse.ok) {
      const error = await setupIntentResponse.text();
      console.error('[Stripe] Failed to create setup intent:', error);
      return c.json({ error: 'Failed to create setup intent', details: error }, 500);
    }

    const setupIntent = await setupIntentResponse.json() as {
      id: string;
      client_secret: string;
      status: string;
    };

    console.log(`[Stripe] SetupIntent created: ${setupIntent.id} for user ${userId}`);

    return c.json({
      setupIntentId: setupIntent.id,
      clientSecret: setupIntent.client_secret,
      customerId: customerId,
      priceId: priceId,
      status: setupIntent.status,
      intentType: 'setup_intent',
      pixEnabled: false,
    });
  } catch (error) {
    console.error('[Stripe] Error creating subscription:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /stripe/confirm-subscription
 * After SetupIntent is confirmed, create the actual subscription
 * Called from frontend after user confirms payment method
 */
stripeRoutes.post('/confirm-subscription', async (c) => {
  try {
    const body = await c.req.json();
    const { customerId, priceId, userId, plan, paymentMethodId } = body;

    console.log('[Stripe] confirm-subscription called with:', { customerId, priceId, userId, plan, paymentMethodId: paymentMethodId ? 'present' : 'missing' });

    if (!customerId || !priceId || !userId) {
      return c.json({ error: 'Missing required fields: customerId, priceId, userId' }, 400);
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    // Create the subscription with the payment method from the confirmed SetupIntent
    const subscriptionParams = new URLSearchParams();
    subscriptionParams.append('customer', customerId);
    subscriptionParams.append('items[0][price]', priceId);
    if (paymentMethodId) {
      subscriptionParams.append('default_payment_method', paymentMethodId);
    }
    subscriptionParams.append('metadata[userId]', userId);
    subscriptionParams.append('metadata[plan]', plan || 'individual');
    subscriptionParams.append('expand[0]', 'latest_invoice');

    console.log('[Stripe] Creating subscription with params:', subscriptionParams.toString());

    const subscriptionResponse = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: subscriptionParams.toString(),
    });

    const subscriptionText = await subscriptionResponse.text();
    console.log('[Stripe] Subscription response status:', subscriptionResponse.status);
    console.log('[Stripe] Subscription response:', subscriptionText.substring(0, 500));

    if (!subscriptionResponse.ok) {
      console.error('[Stripe] Failed to create subscription:', subscriptionText);
      return c.json({ error: 'Failed to create subscription', details: subscriptionText }, 500);
    }

    let subscription: { id: string; status: string; current_period_end: number };
    try {
      subscription = JSON.parse(subscriptionText);
    } catch (parseErr) {
      console.error('[Stripe] Failed to parse subscription response:', parseErr);
      return c.json({ error: 'Failed to parse subscription response' }, 500);
    }

    console.log('[Stripe] Subscription created successfully:', subscription.id, 'status:', subscription.status);

    // Update user's subscription in database
    const db = c.get('db');

    // First check if user exists
    const existingUser = await db.select().from(users).where(eq(users.uuid, userId)).get();
    console.log('[Stripe] Looking for user:', userId, 'Found:', existingUser ? 'yes' : 'no');

    if (!existingUser) {
      console.error('[Stripe] User not found in database:', userId);
      // Still return success since Stripe subscription was created
      // The webhook should handle the update
      return c.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        warning: 'User not found in database, webhook will update',
      });
    }

    // Calculate period end date safely
    let periodEndDate: string | null = null;
    if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
      try {
        periodEndDate = new Date(subscription.current_period_end * 1000).toISOString();
      } catch (dateErr) {
        console.error('[Stripe] Invalid period end date:', subscription.current_period_end, dateErr);
      }
    }
    console.log('[Stripe] Period end:', subscription.current_period_end, '→', periodEndDate);

    // Determine billing cycle from price ID
    const billingCycle = getBillingPeriodFromPriceId(priceId);
    console.log('[Stripe] Billing cycle determined from price:', priceId, '→', billingCycle);

    // Update the user
    const updateResult = await db.update(users)
      .set({
        subscription_status: subscription.status === 'active' ? 'active' : 'pending',
        subscription_plan: plan || 'individual',
        stripe_subscription_id: subscription.id,
        subscription_period_end: periodEndDate,
        billing_cycle: billingCycle,
      })
      .where(eq(users.uuid, userId));

    console.log('[Stripe] Database update result for user:', userId, 'Plan:', plan, 'Status:', subscription.status, 'Billing:', billingCycle);

    return c.json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    console.error('[Stripe] Error confirming subscription:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: 'Internal server error', details: errorMessage }, 500);
  }
});

/**
 * POST /stripe/confirm-pix-payment
 * Confirms a PIX/Card payment for Brazil annual plans (one-time payment)
 * Activates user subscription for 1 year without creating a recurring Stripe subscription
 */
stripeRoutes.post('/confirm-pix-payment', async (c) => {
  try {
    const body = await c.req.json();
    const { paymentIntentId, userId, plan } = body;

    console.log('[Stripe] confirm-pix-payment called with:', { paymentIntentId, userId, plan });

    if (!paymentIntentId || !userId) {
      return c.json({ error: 'Missing required fields: paymentIntentId, userId' }, 400);
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    // Verify the PaymentIntent status
    const piResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!piResponse.ok) {
      const error = await piResponse.text();
      console.error('[Stripe] Failed to get payment intent:', error);
      return c.json({ error: 'Failed to verify payment' }, 500);
    }

    const paymentIntent = await piResponse.json() as {
      id: string;
      status: string;
      metadata: {
        userId?: string;
        plan?: string;
      };
    };

    console.log('[Stripe] PaymentIntent status:', paymentIntent.status);

    // Check if payment was successful
    if (paymentIntent.status !== 'succeeded') {
      console.log('[Stripe] Payment not yet succeeded:', paymentIntent.status);
      return c.json({
        success: false,
        status: paymentIntent.status,
        message: paymentIntent.status === 'processing' ? 'Pagamento em processamento' : 'Pagamento não confirmado',
      });
    }

    // Payment succeeded! Activate user's subscription for 1 year
    const db = c.get('db');
    const existingUser = await db.select().from(users).where(eq(users.uuid, userId)).get();

    if (!existingUser) {
      console.error('[Stripe] User not found:', userId);
      return c.json({ error: 'User not found' }, 404);
    }

    // Calculate 1 year from now
    const periodEndDate = new Date();
    periodEndDate.setFullYear(periodEndDate.getFullYear() + 1);

    const finalPlan = plan || paymentIntent.metadata.plan || 'individual';

    // Update user with 1-year subscription
    await db.update(users)
      .set({
        subscription_status: 'active',
        subscription_plan: finalPlan,
        subscription_period_end: periodEndDate.toISOString(),
        billing_cycle: 'annual',
        // Note: No stripe_subscription_id because this is a one-time payment, not a recurring subscription
      })
      .where(eq(users.uuid, userId));

    console.log(`[Stripe] PIX/Card annual payment confirmed for user ${userId}, plan: ${finalPlan}, expires: ${periodEndDate.toISOString()}`);

    return c.json({
      success: true,
      status: 'active',
      plan: finalPlan,
      periodEnd: periodEndDate.toISOString(),
    });
  } catch (error) {
    console.error('[Stripe] Error confirming PIX payment:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: 'Internal server error', details: errorMessage }, 500);
  }
});

/**
 * POST /stripe/update-subscription
 * Update an existing subscription to a new plan (upgrade/downgrade)
 * Handles proration automatically through Stripe
 *
 * For PIX users (no stripe_subscription_id): Not allowed - must wait for renewal
 * For Stripe subscription users: Use Stripe proration
 */
stripeRoutes.post('/update-subscription', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, newPlan, country } = body;

    console.log('[Stripe] update-subscription called with:', { userId, newPlan, country });

    if (!userId || !newPlan) {
      return c.json({ error: 'Missing required fields: userId, newPlan' }, 400);
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    // Get user from database to find their subscription
    const db = c.get('db');
    const existingUser = await db.select().from(users).where(eq(users.uuid, userId)).get();

    if (!existingUser) {
      console.error('[Stripe] User not found:', userId);
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if user paid "à vista" (one-time payment without recurring subscription)
    if (!existingUser.stripe_subscription_id) {
      // Check if user has an active subscription and a customer ID
      if (existingUser.subscription_status === 'active' && existingUser.stripe_customer_id) {
        // User paid à vista - check if they have a saved card
        const { hasCard, paymentMethodId } = await getCustomerPaymentMethods(
          existingUser.stripe_customer_id,
          STRIPE_SECRET_KEY
        );

        if (hasCard && paymentMethodId && existingUser.subscription_period_end && existingUser.subscription_plan) {
          // User has a saved card - process upgrade with PaymentIntent
          console.log('[Stripe] À vista user with card - processing upgrade:', userId, 'from', existingUser.subscription_plan, 'to', newPlan);

          const currency = country === 'BR' ? 'brl' : 'usd';
          const proration = calculateManualProration(
            existingUser.subscription_plan,
            newPlan,
            currency,
            existingUser.subscription_period_end
          );

          // Only allow upgrades (not downgrades) for à vista users
          if (proration.amountDue <= 0) {
            return c.json({
              error: 'Downgrade não disponível para pagamentos à vista. Seu plano será alterado na renovação.',
              code: 'UPFRONT_NO_DOWNGRADE',
              periodEnd: existingUser.subscription_period_end,
            }, 400);
          }

          // Create PaymentIntent and charge the saved card
          const paymentIntentParams = new URLSearchParams();
          paymentIntentParams.append('amount', proration.amountDue.toString());
          paymentIntentParams.append('currency', currency);
          paymentIntentParams.append('customer', existingUser.stripe_customer_id);
          paymentIntentParams.append('payment_method', paymentMethodId);
          paymentIntentParams.append('confirm', 'true');
          paymentIntentParams.append('off_session', 'true');
          paymentIntentParams.append('metadata[userId]', userId);
          paymentIntentParams.append('metadata[oldPlan]', existingUser.subscription_plan);
          paymentIntentParams.append('metadata[newPlan]', newPlan);
          paymentIntentParams.append('metadata[upgradeType]', 'upfront_card');
          paymentIntentParams.append('description', `Upgrade de ${existingUser.subscription_plan} para ${newPlan} - MyEasyAI`);

          const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: paymentIntentParams.toString(),
          });

          const piText = await paymentIntentResponse.text();
          console.log('[Stripe] PaymentIntent response:', paymentIntentResponse.status);

          if (!paymentIntentResponse.ok) {
            console.error('[Stripe] Failed to create/charge PaymentIntent:', piText);
            const errorData = JSON.parse(piText) as { error?: { message?: string } };
            return c.json({
              error: errorData.error?.message || 'Falha ao processar pagamento do upgrade',
              code: 'PAYMENT_FAILED',
            }, 400);
          }

          const paymentIntent = JSON.parse(piText) as { id: string; status: string };
          console.log('[Stripe] PaymentIntent succeeded:', paymentIntent.id, 'status:', paymentIntent.status);

          if (paymentIntent.status !== 'succeeded') {
            return c.json({
              error: 'Pagamento não confirmado. Tente novamente.',
              code: 'PAYMENT_NOT_CONFIRMED',
              status: paymentIntent.status,
            }, 400);
          }

          // Payment succeeded! Update user's plan in database
          await db.update(users)
            .set({
              subscription_plan: newPlan,
            })
            .where(eq(users.uuid, userId));

          console.log('[Stripe] À vista upgrade successful:', userId, 'new plan:', newPlan, 'charged:', proration.amountDue);

          return c.json({
            success: true,
            newPlan,
            amountCharged: proration.amountDue,
            currency,
            paymentIntentId: paymentIntent.id,
          });
        }

        // User paid with PIX (no card saved) - cannot upgrade
        console.log('[Stripe] PIX user trying to change plan:', userId, '(no saved card)');
        return c.json({
          error: 'Você pagou via PIX. Mudança de plano estará disponível na renovação.',
          code: 'PIX_NO_MIDTERM_CHANGE',
          periodEnd: existingUser.subscription_period_end,
        }, 400);
      }
      console.error('[Stripe] User has no subscription:', userId);
      return c.json({ error: 'User has no active subscription' }, 400);
    }

    console.log('[Stripe] Found user subscription:', existingUser.stripe_subscription_id);

    // Get the current subscription from Stripe
    const subResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${existingUser.stripe_subscription_id}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!subResponse.ok) {
      const error = await subResponse.text();
      console.error('[Stripe] Failed to get subscription:', error);
      return c.json({ error: 'Failed to get subscription from Stripe' }, 500);
    }

    const subscription = await subResponse.json() as {
      id: string;
      status: string;
      items: {
        data: Array<{
          id: string;
          price: { id: string };
        }>;
      };
      current_period_end: number;
    };

    console.log('[Stripe] Current subscription status:', subscription.status, 'items:', subscription.items.data.length);

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return c.json({ error: 'Subscription is not active' }, 400);
    }

    // Get the subscription item ID (first item)
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return c.json({ error: 'No subscription items found' }, 400);
    }

    // Determine the new price ID based on plan and country
    const currency = country === 'BR' ? 'brl' : 'usd';
    // Use the same billing period as the current subscription
    const currentPriceId = subscription.items.data[0]?.price?.id || '';
    const billingPeriod = getBillingPeriodFromPriceId(currentPriceId);
    const newPriceId = getPriceId(newPlan, currency, billingPeriod);

    console.log('[Stripe] Updating subscription item:', subscriptionItemId, 'to price:', newPriceId, 'billing:', billingPeriod);

    // Update the subscription with proration
    // proration_behavior: 'always_invoice' creates an invoice immediately
    const updateParams = new URLSearchParams();
    updateParams.append('items[0][id]', subscriptionItemId);
    updateParams.append('items[0][price]', newPriceId);
    updateParams.append('proration_behavior', 'always_invoice');
    updateParams.append('payment_behavior', 'error_if_incomplete');
    updateParams.append('metadata[plan]', newPlan);
    updateParams.append('metadata[userId]', userId);
    updateParams.append('expand[0]', 'latest_invoice');

    const updateResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${subscription.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: updateParams.toString(),
    });

    const updateText = await updateResponse.text();
    console.log('[Stripe] Update response status:', updateResponse.status);

    if (!updateResponse.ok) {
      console.error('[Stripe] Failed to update subscription:', updateText);
      return c.json({ error: 'Failed to update subscription', details: updateText }, 500);
    }

    const updatedSubscription = JSON.parse(updateText) as {
      id: string;
      status: string;
      current_period_end: number;
      latest_invoice?: {
        id: string;
        status: string;
        amount_due: number;
      } | string;
    };

    console.log('[Stripe] Subscription updated successfully:', updatedSubscription.id);

    // Pay the proration invoice if it's open
    const latestInvoice = updatedSubscription.latest_invoice;
    if (latestInvoice && typeof latestInvoice === 'object' && latestInvoice.status === 'open' && latestInvoice.amount_due > 0) {
      console.log('[Stripe] Paying proration invoice:', latestInvoice.id, 'amount:', latestInvoice.amount_due);

      const payResponse = await fetch(`https://api.stripe.com/v1/invoices/${latestInvoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!payResponse.ok) {
        const payError = await payResponse.text();
        console.error('[Stripe] Failed to pay invoice:', payError);
        // Don't fail the whole request, just log the error
        // The subscription was updated, payment can be retried
      } else {
        console.log('[Stripe] Invoice paid successfully');
      }
    }

    // Calculate period end date safely
    let periodEndDate: string | null = null;
    if (updatedSubscription.current_period_end && typeof updatedSubscription.current_period_end === 'number') {
      try {
        periodEndDate = new Date(updatedSubscription.current_period_end * 1000).toISOString();
      } catch (dateErr) {
        console.error('[Stripe] Invalid period end date:', updatedSubscription.current_period_end, dateErr);
      }
    }

    // Update user's subscription plan in database
    await db.update(users)
      .set({
        subscription_plan: newPlan,
        subscription_status: updatedSubscription.status === 'active' ? 'active' : 'pending',
        subscription_period_end: periodEndDate,
      })
      .where(eq(users.uuid, userId));

    console.log('[Stripe] Database updated for user:', userId, 'New plan:', newPlan);

    return c.json({
      success: true,
      subscriptionId: updatedSubscription.id,
      newPlan,
      status: updatedSubscription.status,
    });
  } catch (error) {
    console.error('[Stripe] Error updating subscription:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: 'Internal server error', details: errorMessage }, 500);
  }
});

/**
 * GET /stripe/check-price/:priceId
 * Check if a price is recurring or one-time
 */
stripeRoutes.get('/check-price/:priceId', async (c) => {
  const priceId = c.req.param('priceId');
  const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 500);
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return c.json({ error: 'Failed to fetch price', details: error }, 500);
    }

    const price = await response.json() as {
      id: string;
      type: string;
      recurring: { interval: string; interval_count: number } | null;
      unit_amount: number;
      currency: string;
      product: string;
    };

    return c.json({
      id: price.id,
      type: price.type,
      isRecurring: price.type === 'recurring',
      recurring: price.recurring,
      amount: price.unit_amount,
      currency: price.currency,
      product: price.product,
    });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

/**
 * POST /stripe/preview-proration
 * Preview the proration amount for a plan change
 * Returns the exact amount the user will be charged (or credited)
 *
 * For PIX users: Returns error with code PIX_NO_MIDTERM_CHANGE
 * For Stripe subscription users: Returns Stripe proration preview
 */
stripeRoutes.post('/preview-proration', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, newPlan, country } = body;

    console.log('[Stripe] preview-proration called with:', { userId, newPlan, country });

    if (!userId || !newPlan) {
      return c.json({ error: 'Missing required fields: userId, newPlan' }, 400);
    }

    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe not configured' }, 500);
    }

    // Get user from database
    const db = c.get('db');
    const existingUser = await db.select().from(users).where(eq(users.uuid, userId)).get();

    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if user paid "à vista" (one-time payment without recurring subscription)
    if (!existingUser.stripe_subscription_id) {
      // Check if user has an active subscription and a customer ID
      if (existingUser.subscription_status === 'active' && existingUser.stripe_customer_id) {
        // User paid à vista - check if they have a saved card
        const { hasCard, paymentMethodId } = await getCustomerPaymentMethods(
          existingUser.stripe_customer_id,
          STRIPE_SECRET_KEY
        );

        if (hasCard && existingUser.subscription_period_end && existingUser.subscription_plan) {
          // User has a saved card - calculate manual proration for upgrade
          console.log('[Stripe] À vista user with card - calculating manual proration:', userId);

          const currency = country === 'BR' ? 'brl' : 'usd';
          const proration = calculateManualProration(
            existingUser.subscription_plan,
            newPlan,
            currency,
            existingUser.subscription_period_end
          );

          // Only allow upgrades (not downgrades) for à vista users
          if (proration.amountDue <= 0) {
            return c.json({
              error: 'Downgrade não disponível para pagamentos à vista. Seu plano será alterado na renovação.',
              code: 'UPFRONT_NO_DOWNGRADE',
              periodEnd: existingUser.subscription_period_end,
            }, 400);
          }

          return c.json({
            amountDue: proration.amountDue,
            prorationAmount: proration.amountDue,
            creditAmount: 0,
            chargeAmount: proration.amountDue,
            netAmount: proration.amountDue,
            currency,
            billingPeriod: 'annual',
            currentPeriodEnd: Math.floor(new Date(existingUser.subscription_period_end).getTime() / 1000),
            daysRemaining: proration.daysRemaining,
            isUpfrontPayment: true, // Flag to indicate this is a manual proration
            paymentMethodId,
          });
        }

        // User paid with PIX (no card saved) - cannot upgrade
        console.log('[Stripe] PIX user trying to preview proration:', userId, '(no saved card)');
        return c.json({
          error: 'Você pagou via PIX. Mudança de plano estará disponível na renovação.',
          code: 'PIX_NO_MIDTERM_CHANGE',
          periodEnd: existingUser.subscription_period_end,
        }, 400);
      }
      return c.json({ error: 'User has no active subscription' }, 400);
    }

    if (!existingUser.stripe_customer_id) {
      return c.json({ error: 'User has no Stripe customer' }, 400);
    }

    // Get the current subscription from Stripe
    const subResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${existingUser.stripe_subscription_id}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!subResponse.ok) {
      return c.json({ error: 'Failed to get subscription from Stripe' }, 500);
    }

    const subscription = await subResponse.json() as {
      id: string;
      items: { data: Array<{ id: string; price: { id: string; unit_amount: number } }> };
      current_period_end: number;
      current_period_start: number;
    };

    // Determine the new price ID based on current subscription's billing period
    const currency = country === 'BR' ? 'brl' : 'usd';
    const currentPriceId = subscription.items.data[0]?.price?.id || '';
    // Use the lookup function to correctly determine billing period from price ID
    const billingPeriod = getBillingPeriodFromPriceId(currentPriceId);
    const newPriceId = getPriceId(newPlan, currency, billingPeriod);
    console.log('[Stripe] Preview - Current price:', currentPriceId, 'Billing period:', billingPeriod);

    // Use Stripe's invoice preview to get exact proration amount
    const previewParams = new URLSearchParams();
    previewParams.append('customer', existingUser.stripe_customer_id);
    previewParams.append('subscription', existingUser.stripe_subscription_id);
    previewParams.append('subscription_items[0][id]', subscription.items.data[0].id);
    previewParams.append('subscription_items[0][price]', newPriceId);
    previewParams.append('subscription_proration_behavior', 'always_invoice');

    const previewResponse = await fetch(`https://api.stripe.com/v1/invoices/upcoming?${previewParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    if (!previewResponse.ok) {
      const errorText = await previewResponse.text();
      console.error('[Stripe] Failed to preview invoice:', errorText);
      return c.json({ error: 'Failed to preview proration' }, 500);
    }

    const invoicePreview = await previewResponse.json() as {
      amount_due: number;
      subtotal: number;
      total: number;
      currency: string;
      lines: {
        data: Array<{
          amount: number;
          description: string;
          proration: boolean;
        }>;
      };
    };

    // Calculate proration from line items
    let prorationAmount = 0;
    let creditAmount = 0;
    let chargeAmount = 0;

    for (const line of invoicePreview.lines.data) {
      if (line.proration) {
        if (line.amount < 0) {
          creditAmount += Math.abs(line.amount);
        } else {
          chargeAmount += line.amount;
        }
        prorationAmount += line.amount;
      }
    }

    return c.json({
      amountDue: invoicePreview.amount_due,
      prorationAmount,
      creditAmount,
      chargeAmount,
      netAmount: invoicePreview.amount_due,
      currency: invoicePreview.currency,
      billingPeriod,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('[Stripe] Error previewing proration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify Stripe webhook signature
 * Implementation based on Stripe's signature verification algorithm
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      return false;
    }

    const timestamp = timestampPart.split('=')[1];
    const expectedSignature = signaturePart.split('=')[1];

    // Check timestamp is within tolerance (5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    const eventTime = parseInt(timestamp, 10);
    if (Math.abs(currentTime - eventTime) > 300) {
      console.error('[Stripe Webhook] Timestamp outside tolerance');
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedSignature === expectedSignature;
  } catch (error) {
    console.error('[Stripe Webhook] Signature verification error:', error);
    return false;
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

interface StripeEvent {
  type: string;
  data: {
    object: unknown;
  };
}

interface CheckoutSession {
  id: string;
  customer: string;
  subscription: string | null;
  metadata?: {
    userId?: string;
    plan?: string;
  };
}

interface Subscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  current_period_end: number;
  cancel_at_period_end: boolean;
  metadata?: {
    userId?: string;
    plan?: string;
  };
  items?: {
    data?: Array<{
      price?: {
        id: string;
      };
    }>;
  };
}

interface Invoice {
  id: string;
  customer: string;
  subscription?: string;
}
