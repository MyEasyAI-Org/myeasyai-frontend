export type SubscriptionPlan = 'personal' | 'basic' | 'pro' | 'enterprise';

export type Plan = {
  name: string;
  value: SubscriptionPlan;
  price: string;
  tokens: string;
  features: string[];
  popular?: boolean;
};

export const PLANS: Plan[] = [
  {
    name: 'Personal',
    value: 'personal',
    price: 'R$ 29',
    tokens: '1.000',
    features: [
      'Acesso básico à plataforma',
      '1.000 tokens por mês',
      'Suporte por email',
      'Documentação completa',
    ],
  },
  {
    name: 'Basic',
    value: 'basic',
    price: 'R$ 49',
    tokens: '10.000',
    features: [
      'Tudo do plano Free',
      '10.000 tokens por mês',
      'Suporte prioritário',
      'API Access',
      'Analytics básico',
    ],
    popular: true,
  },
  {
    name: 'Pro',
    value: 'pro',
    price: 'R$ 149',
    tokens: '50.000',
    features: [
      'Tudo do plano Basic',
      '50.000 tokens por mês',
      'Suporte 24/7',
      'Analytics avançado',
      'Integrações customizadas',
      'Acesso a modelos premium',
    ],
  },
  {
    name: 'Enterprise',
    value: 'enterprise',
    price: 'Customizado',
    tokens: 'Ilimitado',
    features: [
      'Tudo do plano Pro',
      'Tokens ilimitados',
      'Suporte dedicado',
      'SLA garantido',
      'Treinamento personalizado',
      'Deploy on-premise',
    ],
  },
];
