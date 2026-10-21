import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
export { Modal, ConfirmDialog } from './Modal';
export { SegmentedControl } from './SegmentedControl';
export { ToastProvider, useToast } from './Toast';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly size?: 'sm' | 'md';
  readonly busy?: boolean;
};
export function Button({
  variant = 'secondary',
  size = 'md',
  busy = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || busy}
      aria-busy={busy}
      className={`button button--${variant} button--${size} ${className}`}
    >
      {busy && <LoaderCircle className="spinner-icon" size={18} aria-hidden="true" />}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { readonly label: string }) {
  return (
    <button
      type="button"
      {...props}
      aria-label={label}
      title={label}
      className={`icon-button ${className}`}
    />
  );
}
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`card ${className}`} />;
}
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: {
  readonly title: string;
  readonly description?: string;
  readonly eyebrow?: string;
  readonly actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="cluster page-actions">{actions}</div>}
    </header>
  );
}
export function StatusBadge({ status }: { readonly status: 'Open' | 'In Progress' | 'Closed' }) {
  const tone = status === 'Open' ? 'open' : status === 'In Progress' ? 'progress' : 'closed';
  return (
    <span className={`status-badge status-badge--${tone}`}>
      <span aria-hidden="true" />
      {status}
    </span>
  );
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  readonly children: ReactNode;
  readonly tone?: 'neutral' | 'blue' | 'green' | 'yellow' | 'red';
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  readonly title: string;
  readonly description: string;
  readonly icon?: ReactNode;
  readonly action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  readonly label: string;
  readonly htmlFor?: string;
  readonly hint?: string;
  readonly error?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
export function Notice({
  children,
  tone = 'info',
}: {
  readonly children: ReactNode;
  readonly tone?: 'info' | 'success' | 'warning' | 'error';
}) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
export function Spinner({ label = 'Loading your workspace…' }: { readonly label?: string }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spinner-icon" size={24} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
