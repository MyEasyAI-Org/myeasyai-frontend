// Stripe Constants for MyEasyAI
// Price IDs and plan configurations

export type PlanId = 'individual' | 'plus' | 'premium';
export type Currency = 'brl' | 'usd';
export type BillingPeriod = 'monthly' | 'annual';

// Stripe Price IDs (TEST MODE) - RECURRING SUBSCRIPTIONS
export const STRIPE_PRICE_IDS = {
  // BRL - À Vista (Annual upfront - desconto)
  individual_brl_annual: 'price_1SsVGZ2FRnSpHchtqo4P3FAF',
  plus_brl_annual: 'price_1SsVId2FRnSpHchtZ61C8a7M',
  premium_brl_annual: 'price_1SsVJN2FRnSpHchtYSZ0847B',

  // BRL - Parcelado 12x (Monthly - valor cheio)
  individual_brl_monthly: 'price_1SsVKL2FRnSpHcht37v05CRQ',
  plus_brl_monthly: 'price_1SsVL02FRnSpHcht7a9dZxiB',
  premium_brl_monthly: 'price_1SsVLd2FRnSpHchtxFc7sGrG',

  // USD - Annual
  individual_usd_annual: 'price_1SsVMB2FRnSpHchtNaOzfcuk',
  plus_usd_annual: 'price_1SsVMZ2FRnSpHchtrqq2HEhI',
  premium_usd_annual: 'price_1SsVMx2FRnSpHchteTGyrw7W',
} as const;

// Helper to get price ID for a plan
export function getStripePriceId(
  planId: PlanId,
  countryCode: string,
  period: BillingPeriod = 'annual'
): string {
  const currency = countryCode === 'BR' ? 'brl' : 'usd';
  const key = `${planId}_${currency}_${period}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[key];
}

export interface PlanPricing {
  price: number;
  currency: Currency;
  displayPrice: string;
  installments?: number;
  installmentPrice?: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  features: string[];
  pricing: {
    brl: PlanPricing;
    usd: PlanPricing;
  };
  popular?: boolean;
}

// Plan configurations
export const PLANS: Plan[] = [
  {
    id: 'individual',
    name: 'Individual',
    description: 'Perfeito para começar',
    features: [
      '1 site',
      '5.000 visitantes/mês',
      'Chat básico',
      'Suporte por email',
    ],
    pricing: {
      brl: {
        price: 297,
        currency: 'brl',
        displayPrice: 'R$ 297,00',
        installments: 12,
        installmentPrice: 'R$ 29,70', // 297 * 1.20 / 12 = 29,70
      },
      usd: {
        price: 59,
        currency: 'usd',
        displayPrice: '$59',
      },
    },
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'Para negócios em crescimento',
    features: [
      '5 sites',
      '50.000 visitantes/mês',
      'Chat avançado com IA',
      'Integrações',
      'Suporte prioritário',
    ],
    pricing: {
      brl: {
        price: 497,
        currency: 'brl',
        displayPrice: 'R$ 497,00',
        installments: 12,
        installmentPrice: 'R$ 49,70', // 497 * 1.20 / 12 = 49,70
      },
      usd: {
        price: 99,
        currency: 'usd',
        displayPrice: '$99',
      },
    },
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para empresas e agências',
    features: [
      'Sites ilimitados',
      'Visitantes ilimitados',
      'Todas as funcionalidades',
      'API completa',
      'Suporte dedicado',
      'Onboarding personalizado',
    ],
    pricing: {
      brl: {
        price: 997,
        currency: 'brl',
        displayPrice: 'R$ 997,00',
        installments: 12,
        installmentPrice: 'R$ 99,70', // 997 * 1.20 / 12 = 99,70
      },
      usd: {
        price: 199,
        currency: 'usd',
        displayPrice: '$199',
      },
    },
  },
];

// Get plan by ID
export function getPlanById(planId: PlanId): Plan | undefined {
  return PLANS.find(p => p.id === planId);
}

// Get currency based on country code
export function getCurrencyForCountry(countryCode: string): Currency {
  return countryCode === 'BR' ? 'brl' : 'usd';
}

// Get pricing display for a plan based on country
export function getPlanPriceDisplay(planId: PlanId, countryCode: string): string {
  const plan = getPlanById(planId);
  if (!plan) return '';

  const currency = getCurrencyForCountry(countryCode);
  const pricing = plan.pricing[currency];

  if (currency === 'brl' && pricing.installments && pricing.installmentPrice) {
    return `${pricing.installments}x de ${pricing.installmentPrice}`;
  }

  return `${pricing.displayPrice}/ano`;
}

// Countries that use BRL pricing
export const BRL_COUNTRIES = ['BR'];

// Test card numbers for Stripe
export const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  declined: '4000 0000 0000 9995',
  declinedGeneric: '4000 0000 0000 0002',
};
