import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  user: unknown | null;
  needsOnboarding?: boolean;
  onOpenOnboarding?: () => void;
}

/**
 * ProtectedRoute - Guards routes that require authentication
 *
 * @description
 * Wraps routes that should only be accessible to authenticated users.
 * If the user is not authenticated, they are redirected to the home page.
 * If the user needs onboarding, it triggers the onboarding modal.
 */
export function ProtectedRoute({
  children,
  user,
  needsOnboarding,
  onOpenOnboarding,
}: ProtectedRouteProps) {
  const location = useLocation();

  // If not authenticated, redirect to home
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user needs onboarding, trigger modal and stay on home
  if (needsOnboarding && onOpenOnboarding) {
    onOpenOnboarding();
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
