import { Minimize2 } from 'lucide-react';

export function FocusExit({ onExit }: { readonly onExit: () => void }) {
  return (
    <div className="shell-focus-exit">
      <button type="button" onClick={onExit}>
        <Minimize2 size={18} />
        Exit focus
      </button>
    </div>
  );
}
