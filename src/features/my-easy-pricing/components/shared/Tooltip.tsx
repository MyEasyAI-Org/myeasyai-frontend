// =============================================================================
// Tooltip - Componente reutilizavel para tooltips com icone de ajuda
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface TooltipProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md';
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function Tooltip({
  content,
  position = 'top',
  size = 'sm',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ajusta a posicao do tooltip se estiver saindo da tela
  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPosition = position;

      // Verifica se o tooltip está saindo da tela
      if (position === 'top' && tooltip.top < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && tooltip.bottom > viewportHeight) {
        newPosition = 'top';
      } else if (position === 'left' && tooltip.left < 0) {
        newPosition = 'right';
      } else if (position === 'right' && tooltip.right > viewportWidth) {
        newPosition = 'left';
      }

      // Verifica overflow horizontal para top/bottom
      if ((newPosition === 'top' || newPosition === 'bottom') && tooltip.right > viewportWidth) {
        // Tooltip muito largo, manter posição mas será tratado pelo CSS
      }

      setAdjustedPosition(newPosition);
    }
  }, [isVisible, position]);

  // Classes de posicionamento
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Classes da seta
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-700 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-700 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-700 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-700 border-y-transparent border-l-transparent',
  };

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <HelpCircle
        className="text-slate-500 hover:text-slate-400 cursor-help transition-colors"
        size={iconSize}
      />

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[adjustedPosition]}`}
          role="tooltip"
        >
          <div className="relative bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg shadow-lg w-48 sm:w-56 whitespace-normal">
            {content}
            {/* Seta */}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[adjustedPosition]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Export
// =============================================================================

export default Tooltip;
