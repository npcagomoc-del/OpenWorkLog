import { createContext, useContext } from 'react';
export const ShellContext = createContext<{
  readonly focusMode: boolean;
  readonly setFocusMode: (value: boolean) => void;
}>({ focusMode: false, setFocusMode: () => undefined });
export function useShell() {
  return useContext(ShellContext);
}
