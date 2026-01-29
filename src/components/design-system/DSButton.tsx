/**
 * Design System Button Component
 * 
 * Example component using the design system tokens from theme.css
 */

import type { ButtonHTMLAttributes } from 'react';

interface DSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function DSButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: DSButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
