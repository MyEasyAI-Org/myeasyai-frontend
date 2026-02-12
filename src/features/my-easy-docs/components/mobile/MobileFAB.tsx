/**
 * MobileFAB Component
 *
 * Floating Action Button for mobile-only quick actions.
 * Displays a circular button with icon at bottom of screen.
 */

import { type ReactNode } from 'react';

interface MobileFABProps {
  icon: ReactNode;
  onClick: () => void;
  position?: 'bottom-left' | 'bottom-right';
  label?: string;
}

export function MobileFAB({
  icon,
  onClick,
  position = 'bottom-left',
  label,
}: MobileFABProps) {
  const positionClasses = {
    'bottom-left': 'bottom-6 left-4',
    'bottom-right': 'bottom-6 right-4',
  };

  return (
    <button
      onClick={onClick}
      className={`sm:hidden fixed ${positionClasses[position]} z-30 w-14 h-14 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
