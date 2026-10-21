import { STATUSES, statusSchema, type Status } from '../domain/models';
import { statusTone } from './statusPalette';

export function StatusBadge({ status }: { readonly status: Status }) {
  return (
    <span className={`status-badge status-badge--${statusTone(status)}`}>
      <span aria-hidden="true" />
      {status}
    </span>
  );
}
export function StatusControl({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: {
  readonly value: Status;
  readonly onChange: (status: Status) => void;
  readonly label: string;
  readonly disabled?: boolean;
  readonly className?: string;
}) {
  return (
    <select
      aria-label={label}
      title={label}
      value={value}
      disabled={disabled}
      className={`status-control status-control--${statusTone(value)} ${className}`}
      onChange={(event) => {
        const parsed = statusSchema.safeParse(event.target.value);
        if (parsed.success) onChange(parsed.data);
      }}
    >
      {STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
