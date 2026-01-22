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

// Stripe Price IDs (TEST MODE)
// Annual subscription prices from Stripe Dashboard
const PRICE_IDS = {
  // BRL prices (Brazil - Annual with 12x installments)
  individual_brl: 'price_1Ss6lv2FRnSpHchtPDqBXsD6',
  plus_brl: 'price_1Ss6nm2FRnSpHchtKlOb5nky',
  premium_brl: 'price_1Ss6qd2FRnSpHchtbZtN9tvy',
  // USD prices (International - Annual upfront)
  individual_usd: 'price_1SsSOZ2FRnSpHchtzJw5nArR',
  plus_usd: 'price_1SsSO42FRnSpHchtPdfnFPGo',
  premium_usd: 'price_1SsSNY2FRnSpHchtnSVB2lam',
};

// Map plan + currency to price ID
function getPriceId(plan: string, currency: string): string {
  const key = `${plan}_${currency.toLowerCase()}` as keyof typeof PRICE_IDS;
  return PRICE_IDS[key] || PRICE_IDS.individual_usd;
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

export const stripeRoutes = new Hono<{ Bindings: StripeEnv; Variables: Variables }>();

/**
 * POST /stripe/create-checkout-session
 * Creates a Stripe Checkout session for subscription
 */
stripeRoutes.post('/create-checkout-session', async (c) => {
  try {
    const { email, userId, plan, country, successUrl, cancelUrl } = await c.req.json();

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
    const priceId = getPriceId(plan, currency);

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
        return c.json({ error: 'Failed to create customer' }, 500);
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

    // For Brazil, enable installments if available (Stripe handles this automatically for eligible cards)
    if (currency === 'brl') {
      sessionParams['payment_method_options[card][installments][enabled]'] = 'true';
    }

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
      return c.json({ error: 'Failed to create checkout session' }, 500);
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
