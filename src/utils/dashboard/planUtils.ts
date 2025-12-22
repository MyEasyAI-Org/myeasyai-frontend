import type { SubscriptionPlan } from '../../constants/plans';

/**
 * Returns the Tailwind gradient color classes for a subscription plan
 */
export function getPlanColor(plan: SubscriptionPlan): string {
  const colors: Record<SubscriptionPlan, string> = {
    individual: 'from-gray-500 to-gray-600',
    plus: 'from-blue-500 to-blue-600',
    premium: 'from-purple-500 to-purple-600',
  };
  return colors[plan];
}
