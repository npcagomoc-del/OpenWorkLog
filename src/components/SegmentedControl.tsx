import type { KeyboardEvent, ReactNode } from 'react';

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly label: string;
  readonly options: readonly {
    readonly value: T;
    readonly label: string;
    readonly icon?: ReactNode;
  }[];
}) {
  function handleKey(event: KeyboardEvent<HTMLFieldSetElement>) {
    const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
    const active = document.activeElement;
    if (!(active instanceof HTMLButtonElement)) return;
    const index = buttons.indexOf(active);
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % buttons.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + buttons.length) % buttons.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    buttons[next]?.focus();
    buttons[next]?.click();
  }
  return (
    <fieldset className="segmented-control" aria-label={label} onKeyDown={handleKey}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
