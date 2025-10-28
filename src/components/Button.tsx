import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'log' | 'nav' | 'ghostNav';

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  target?: '_blank' | '_self';
};

export function Button({
  children,
  href,
  variant = 'primary',
  onClick,
  target = '_self',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all duration-300';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700',
    secondary:
      'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800',
    log: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 mt-4 w-full',
    nav: 'inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 h-8',
    ghostNav:
      'inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors h-8 animate-pulse-subtle border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.7),0_0_15px_rgba(147,51,234,0.4)] hover:border-blue-400/80',
  };

  const className = `${base} ${variants[variant]}`;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
