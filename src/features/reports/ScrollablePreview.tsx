import type { ReactNode } from 'react';

type Props = { readonly label: string; readonly children: ReactNode };
export function ScrollablePreview({ label, children }: Props) {
  // biome-ignore lint/a11y/noNoninteractiveTabindex: A named overflow region needs keyboard focus for horizontal arrow-key scrolling.
  return <section className="table-scroll" aria-label={label} tabIndex={0}>{children}</section>;
}
