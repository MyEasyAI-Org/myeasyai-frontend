import type { SubscriptionData } from '../../hooks/useUserData';

/**
 * Calculates the percentage of tokens used
 */
export function calculateTokensPercentage(subscription: SubscriptionData): number {
  return (subscription.tokens_used / subscription.tokens_limit) * 100;
}
