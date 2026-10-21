import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button, IconButton } from './ui';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly size?: 'sm' | 'md' | 'lg';
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <header className="modal-header">
        <h2 id={titleId}>{title}</h2>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-footer">{footer}</footer>}
    </dialog>
  );
}
export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onClose,
  confirmLabel = 'Confirm',
  busy = false,
  destructive = false,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
  readonly confirmLabel?: string;
  readonly busy?: boolean;
  readonly destructive?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm} busy={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="muted">{description}</p>
    </Modal>
  );
}
