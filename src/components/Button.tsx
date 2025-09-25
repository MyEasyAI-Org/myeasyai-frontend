import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string; // se for link externo ou âncora
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  target?: "_blank" | "_self";
};

export function Button({
  children,
  href,
  variant = "primary",
  onClick,
  target = "_self",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all duration-300";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
    secondary:
      "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
    outline: "border border-slate-700 text-slate-300 hover:bg-slate-800",
    nav: "inline-flex items-center justify-center px-4 py-2 text-sm rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
    ghostNav:
      "inline-flex items-center justify-center px-4 py-2 text-sm rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors",
  };

  const className = `${base} ${variants[variant]}`;

  // se tiver href => vira link
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={className}
      >
        {children}
      </a>
    );
  }

  // senão, é botão
  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
