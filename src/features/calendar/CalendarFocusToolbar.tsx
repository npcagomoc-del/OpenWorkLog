import { CalendarDays, ChevronLeft, ChevronRight, Minimize2, Plus } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '../../components/ui';
import { calendarDates, parseDate } from './calendarLogic';
import type { CalendarView } from './calendarLogic';

export function CalendarFocusToolbar({
  date, view, weekStartsOn, onDate, onView, onCreate, onExit, onNavigate, onToday,
}: {
  readonly date: string;
  readonly view: CalendarView;
  readonly weekStartsOn: 0 | 1;
  readonly onDate: (date: string) => void;
  readonly onView: (view: CalendarView) => void;
  readonly onCreate: () => void;
  readonly onExit: () => void;
  readonly onNavigate: (direction: -1 | 1) => void;
  readonly onToday: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const strip = calendarDates(date, 'week', weekStartsOn);
  const month = parseDate(date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  return (
    <div className="calendar-focus-frame" onKeyDownCapture={(event) => {
      if (event.key === 'Escape' && menuOpen) {
        event.preventDefault();
        event.stopPropagation();
        setMenuOpen(false);
        event.currentTarget.querySelector<HTMLButtonElement>('.calendar-focus-menu-anchor > button')?.focus();
      }
    }}>
      <div className="calendar-focus-toolbar" role="toolbar" aria-label="Calendar focus controls">
        <strong className="calendar-focus-month">{month}</strong>
        <IconButton label="Previous date" onClick={() => onNavigate(-1)}><ChevronLeft size={19} /></IconButton>
        <IconButton label="Next date" onClick={() => onNavigate(1)}><ChevronRight size={19} /></IconButton>
        <div className="calendar-focus-menu-anchor">
          <IconButton label="Calendar view options" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><CalendarDays size={19} /></IconButton>
          {menuOpen && (
            <fieldset className="calendar-focus-menu" aria-label="Calendar view options">
              <button type="button" onClick={() => { onToday(); setMenuOpen(false); }}>Today</button>
              {(['day', 'week', 'month'] as const).map((option) => (
                <button type="button" key={option} aria-pressed={view === option} onClick={() => { onView(option); setMenuOpen(false); }}>
                  {option[0]?.toUpperCase()}{option.slice(1)}
                </button>
              ))}
            </fieldset>
          )}
        </div>
        <IconButton label="Add plan" onClick={onCreate}><Plus size={19} /></IconButton>
        <IconButton label="Exit calendar focus" onClick={onExit}><Minimize2 size={19} /></IconButton>
      </div>
      <fieldset className="calendar-focus-strip" aria-label="Choose calendar date">
        {strip.map((day) => {
          const parsed = parseDate(day);
          return (
            <button
              type="button" key={day} className={day === date ? 'is-selected' : ''}
              aria-label={`Select ${parsed.toLocaleDateString(undefined, { dateStyle: 'full' })}`}
              aria-pressed={day === date} onClick={() => onDate(day)}
            >
              <span>{parsed.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
              <strong>{parsed.getDate()}</strong>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
