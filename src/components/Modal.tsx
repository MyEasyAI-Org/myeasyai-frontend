import type { ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  dialogClassName?: string;
  contentClassName?: string;
  closeButtonLabel?: string;
  disableClose?: boolean;
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  dialogClassName,
  contentClassName,
  closeButtonLabel = 'Fechar modal',
  disableClose = false,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  const baseDialogClass =
    'relative w-full max-w-lg max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 shadow-xl modal-scrollbar';
  const dialogClasses = dialogClassName
    ? `${baseDialogClass} ${dialogClassName}`
    : baseDialogClass;

  const shouldOffsetContent = Boolean(title || description);
  const contentWrapperClasses = [
    shouldOffsetContent ? 'mt-6' : '',
    contentClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 py-10 sm:items-center sm:py-12 modal-backdrop-enter"
      onClick={disableClose ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`${dialogClasses} modal-content-enter`}
        onClick={(event) => event.stopPropagation()}
      >
        {!disableClose && (
          <button
            type="button"
            className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-100 cursor-pointer"
            onClick={onClose}
            aria-label={closeButtonLabel}
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {title ? (
          <h2 className="text-2xl font-semibold text-slate-100">{title}</h2>
        ) : null}
        {description ? (
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        ) : null}

        {children ? (
          <div className={contentWrapperClasses}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}
