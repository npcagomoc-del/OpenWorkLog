import { useState } from 'react';
import { ArrowRight, Check, HardDrive, Sparkles } from 'lucide-react';
import { actions } from '../data/actions';
import { loadDemoData } from '../data/workspace';
import { Brand } from '../components/Brand';
import { Button, Notice } from '../components/ui';
export function Welcome() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function begin(demo: boolean) {
    setBusy(true);
    setError('');
    try {
      if (demo) await loadDemoData();
      await actions.updateSettings({ onboardingComplete: true });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not prepare your workspace. Please try again.',
      );
      setBusy(false);
    }
  }
  return (
    <main className="welcome">
      <div className="welcome-card">
        <Brand />
        <div className="welcome-intro">
          <span className="eyebrow">Work planner & daily reports</span>
          <h1>Start your workspace</h1>
          <p>Plan tasks, track time, and keep daily reports together.</p>
        </div>
        <div className="welcome-features">
          <span>
            <Check size={18} />
            Tasks, projects & your own calendar
          </span>
          <span>
            <Check size={18} />A daily log with an accurate work timer
          </span>
          <span>
            <Check size={18} />
            Study notes and review checklists
          </span>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="stack">
          <Button variant="primary" busy={busy} onClick={() => void begin(false)}>
            Start with a blank workspace
            <ArrowRight size={18} />
          </Button>
          <Button busy={busy} onClick={() => void begin(true)}>
            <Sparkles size={18} />
            Explore demo workspace
          </Button>
        </div>
        <p className="welcome-local">
          <HardDrive size={16} />
          Saved on this device. No account needed.
        </p>
        <p className="welcome-credit">Developed by NPC</p>
      </div>
    </main>
  );
}
