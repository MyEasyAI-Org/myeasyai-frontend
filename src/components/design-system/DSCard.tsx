/**
 * Design System Card Component
 */

import type { HTMLAttributes } from 'react';

interface DSCardProps extends HTMLAttributes<HTMLDivElement> {
  withHover?: boolean;
}

export function DSCard({
  withHover = false,
  className = '',
  children,
  ...props
}: DSCardProps) {
  const classes = ['card'];
  if (withHover) classes.push('card-hover');
  if (className) classes.push(className);
  
  return (
    <div className={classes.join(' ')} {...props}>
      {children}
    </div>
  );
}
