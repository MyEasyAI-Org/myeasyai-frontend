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
  SUPPORT: '/support',
  SUPPORT_TICKET: '/support/ticket',
  SUPPORT_TICKETS: '/support/tickets',
  MY_EASY_WEBSITE: '/myeasywebsite',
  BUSINESS_GURU: '/businessguru',
  MY_EASY_CRM: '/crm',
  MY_EASY_PRICING: '/pricing',
  MY_EASY_CONTENT: '/myeasycontent',
  MY_EASY_AVATAR: '/myeasyavatar',
  MY_EASY_CODE: '/myeasycode',
  MY_EASY_RESUME: '/myeasyresume',
  MY_EASY_LEARNING: '/myeasylearning',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

