/**
 * Application Routes Configuration
 *
 * @description
 * Centralized route definitions for the MyEasyAI application.
 * This file serves as the single source of truth for all route paths.
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  AUTH_CALLBACK: '/auth/callback',

  // Protected routes (require authentication)
  DASHBOARD: '/dashboard',
  MY_EASY_WEBSITE: '/myeasywebsite',
  BUSINESS_GURU: '/businessguru',
  MY_EASY_CRM: '/crm',
  MY_EASY_PRICING: '/pricing',
  MY_EASY_CONTENT: '/myeasycontent',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
