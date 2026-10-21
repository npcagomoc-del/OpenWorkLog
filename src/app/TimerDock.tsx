import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock3, Pause, Play, Square } from 'lucide-react';
import { useWorkspace } from '../data/useWorkspace';
import { pauseTimer, resumeTimer, stopTimer } from '../data/timers';
import { timerElapsedSeconds } from '../domain/time';
import { IconButton, useToast } from '../components/ui';
export function TimerDock() {
  const { timers } = useWorkspace();
  const timer = timers.find((item) => item.entryId === null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (timer?.state !== 'running') return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [timer?.state]);
  async function act(action: 'pause' | 'resume' | 'stop') {
    if (!timer) return;
    try {
      if (action === 'pause') await pauseTimer(timer.id);
      else if (action === 'resume') await resumeTimer(timer.id);
      else {
        await stopTimer(timer.id);
        navigate('/daily');
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update the timer.', 'error');
    }
  }
  if (!timer)
    return (
      <Link className="timer-idle" to="/daily">
        <Clock3 size={18} />
        <span>Start a timer</span>
      </Link>
    );
  const seconds = Math.floor(timerElapsedSeconds(timer, now));
  const elapsed = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
  return (
    <div className={`timer-dock timer-dock--${timer.state}`}>
      <Link to="/daily" aria-label={`Timer: ${timer.title}, ${elapsed}`}>
        <Clock3 size={18} />
        <span className="timer-dock-name">{timer.title}</span>
        <strong>{elapsed}</strong>
      </Link>
      {timer.state === 'review' ? (
        <Link className="timer-review" to="/daily">
          Review
        </Link>
      ) : (
        <>
          {timer.state === 'running' ? (
            <IconButton label="Pause timer" onClick={() => void act('pause')}>
              <Pause size={16} />
            </IconButton>
          ) : (
            <IconButton label="Resume timer" onClick={() => void act('resume')}>
              <Play size={16} />
            </IconButton>
          )}
          <IconButton label="Stop timer and review" onClick={() => void act('stop')}>
            <Square size={15} />
          </IconButton>
        </>
      )}
    </div>
  );
}
