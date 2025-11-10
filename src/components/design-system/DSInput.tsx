/**
 * Design System Input Component
 */

import type { InputHTMLAttributes } from 'react';

interface DSInputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
}

export function DSInput({
  inputSize = 'md',
  hasError = false,
  className = '',
  ...props
}: DSInputProps) {
  const classes = ['input', 'input-' + inputSize];
  if (hasError) classes.push('input-error');
  if (className) classes.push(className);
  
  return <input className={classes.join(' ')} {...props} />;
}
