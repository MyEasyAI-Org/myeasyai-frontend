import * as flags from 'country-flag-icons/react/3x2';

export type FlagIconProps = {
  countryCode: string;
  className?: string;
};

/**
 * Renderiza bandeira SVG do país
 */
export function FlagIcon({ countryCode, className = 'w-6 h-4' }: FlagIconProps) {
  const Flag = flags[countryCode as keyof typeof flags];
  if (!Flag) return null;
  return <Flag className={className} />;
}
