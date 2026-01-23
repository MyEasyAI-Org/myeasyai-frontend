export type SubscriptionPlan = 'individual' | 'plus' | 'premium';

export type PlanLimits = {
  maxSites: number;
  maxConsultations: number;
  maxApiCalls: number;
};

export type Plan = {
  name: string;
  value: SubscriptionPlan;
  price: string;
  priceNumeric: number; // Preço numérico para comparação (em centavos)
  installmentPrice: string; // Preço da parcela (12x)
  fullPrice: string; // Preço à vista anual
  tokens: string;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
  recommended?: boolean; // Para destacar como recomendado
};

export const PLANS: Plan[] = [
  {
    name: 'Individual',
    value: 'individual',
    price: 'R$ 29',
    priceNumeric: 2900,
    installmentPrice: 'R$ 29,70',
    fullPrice: 'R$ 297,00',
    tokens: '1.000',
    features: [
      'Acesso básico à plataforma',
      'Suporte por email',
      'Documentação completa',
      '1 site MyEasyWebsite',
    ],
    limits: {
      maxSites: 1,
      maxConsultations: 10,
      maxApiCalls: 100,
    },
  },
  {
    name: 'Plus',
    value: 'plus',
    price: 'R$ 49',
    priceNumeric: 4900,
    installmentPrice: 'R$ 49,70',
    fullPrice: 'R$ 497,00',
    tokens: '10.000',
    features: [
      'Tudo do plano Individual',
      'Suporte prioritário',
      'API Access',
      'Analytics básico',
      '3 sites MyEasyWebsite',
    ],
    limits: {
      maxSites: 3,
      maxConsultations: 50,
      maxApiCalls: 1000,
    },
    popular: true,
    recommended: true,
  },
  {
    name: 'Premium',
    value: 'premium',
    price: 'R$ 149',
    priceNumeric: 14900,
    installmentPrice: 'R$ 99,70',
    fullPrice: 'R$ 997,00',
    tokens: '50.000',
    features: [
      'Tudo do plano Plus',
      'Suporte 24/7',
      'Analytics avançado',
      'Integrações customizadas',
      'Acesso a modelos premium',
      '5 sites MyEasyWebsite',
    ],
    limits: {
      maxSites: 5,
      maxConsultations: 200,
      maxApiCalls: 5000,
    },
  },
];

// Helper para obter limite de sites por plano
export function getSiteLimitForPlan(plan: SubscriptionPlan): number {
  const planConfig = PLANS.find(p => p.value === plan);
  return planConfig?.limits.maxSites ?? 1;
}

// Helper para obter o plano por valor
export function getPlanByValue(value: SubscriptionPlan): Plan | undefined {
  return PLANS.find(p => p.value === value);
}

// Helper para verificar se é upgrade ou downgrade
export function getPlanChangeType(currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): 'upgrade' | 'downgrade' | 'same' {
  const current = PLANS.find(p => p.value === currentPlan);
  const target = PLANS.find(p => p.value === newPlan);

  if (!current || !target) return 'same';
  if (current.priceNumeric === target.priceNumeric) return 'same';

  return target.priceNumeric > current.priceNumeric ? 'upgrade' : 'downgrade';
}
