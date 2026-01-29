/**
 * WatermarkIcon Component
 *
 * Decorative watermark icon for fitness module tabs.
 * Displays SVG icons as subtle background decoration.
 */

import { memo } from 'react';

type WatermarkIconProps = {
  /** Path to the SVG icon */
  src: string;
  /** Additional CSS classes */
  className?: string;
  /** Position preset: 'bottom-right' (default) cuts off at corner */
  position?: 'bottom-right' | 'center';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_CLASSES = {
  sm: 'w-24 h-24 -right-4 -bottom-4',
  md: 'w-48 h-48 -right-8 -bottom-8',
  lg: 'w-64 h-64 -right-12 -bottom-12',
};

const POSITION_CLASSES = {
  'bottom-right': 'absolute',
  center: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

export const WatermarkIcon = memo(function WatermarkIcon({
  src,
  className = '',
  position = 'bottom-right',
  size = 'md',
}: WatermarkIconProps) {
  const sizeClass = position === 'bottom-right' ? SIZE_CLASSES[size] : `w-${size === 'sm' ? '24' : size === 'md' ? '48' : '64'} h-${size === 'sm' ? '24' : size === 'md' ? '48' : '64'}`;

  return (
    <div
      className={`
        ${POSITION_CLASSES[position]}
        ${position === 'bottom-right' ? sizeClass : ''}
        opacity-[0.25] pointer-events-none select-none z-0
        ${className}
      `}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-contain invert"
        draggable={false}
      />
    </div>
  );
});
