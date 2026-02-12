/**
 * MobilePreviewModal Component
 *
 * Full-screen modal for file preview on mobile devices.
 * Slides in from bottom with smooth animations.
 */

import { useEffect, type ReactNode } from 'react';

interface MobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function MobilePreviewModal({
  isOpen,
  onClose,
  children,
  title,
}: MobilePreviewModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="absolute inset-0 bg-slate-900 flex flex-col animate-in slide-in-from-bottom duration-300"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Preview'}
      >
        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
