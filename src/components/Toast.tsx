import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

type Tone = 'success' | 'error' | 'info';
type ToastItem = { readonly id: string; readonly message: string; readonly tone: Tone };
const ToastContext = createContext<{ readonly toast: (message: string, tone?: Tone) => void }>({
  toast: () => undefined,
});
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [items, setItems] = useState<readonly ToastItem[]>([]);
  const toast = useCallback((message: string, tone: Tone = 'success') => {
    setItems((current) => [...current.slice(-2), { id: crypto.randomUUID(), message, tone }]);
  }, []);
  const dismiss = useCallback(
    (id: string) => setItems((current) => current.filter((item) => item.id !== id)),
    [],
  );
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <aside className="toast-stack" aria-label="Notifications">
        {items.map((item) => (
          <Toast key={item.id} item={item} dismiss={dismiss} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}
function Toast({
  item,
  dismiss,
}: {
  readonly item: ToastItem;
  readonly dismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(item.id), 5500);
    return () => window.clearTimeout(timer);
  }, [item.id, dismiss]);
  return (
    <div className={`toast toast--${item.tone}`} role={item.tone === 'error' ? 'alert' : 'status'}>
      {item.tone === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
      <span>{item.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}>
        <X size={18} />
      </button>
    </div>
  );
}
export function useToast() {
  return useContext(ToastContext);
}
