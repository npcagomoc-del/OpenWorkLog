import { ChevronLeft, ChevronRight, Clock3, Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  PageHeader,
  SegmentedControl,
} from '../../components/ui';
import { useWorkspace } from '../../data/useWorkspace';
import type { Plan } from '../../domain/models';
import { todayKey } from '../../domain/time';
import { CalendarGrid } from './CalendarGrid';
import type { CalendarView } from './calendarLogic';
import { calendarDates, navigateDate, parseDate, plansForDate, timeInput } from './calendarLogic';
import { PlanDetails } from './PlanDetails';
import { PlanEditor } from './PlanEditor';
import './calendar.css';

const views = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
] as const;
export default function CalendarPage() {
  const { plans, settings } = useWorkspace();
  const [date, setDate] = useState(() => todayKey(new Date(), settings.timezone));
  const [view, setView] = useState<CalendarView>('week');
  const [workHours, setWorkHours] = useState(true);
  const [editor, setEditor] = useState<{
    readonly plan: Plan | null;
    readonly date: string;
    readonly minute: number;
  } | null>(null);
  const [detail, setDetail] = useState<Plan | null>(null);
  const dates = calendarDates(date, view, settings.weekStartsOn);
  const daily = plansForDate(plans, date);
  const title = parseDate(date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const hiddenPlans =
    view === 'month' || !workHours
      ? 0
      : plans.filter(
          (plan) =>
            dates.includes(plan.date) &&
            (plan.endMinute <= settings.workStart || plan.startMinute >= settings.workEnd),
        ).length;
  function create(day: string, minute: number) {
    setEditor({ plan: null, date: day, minute });
  }
  return (
    <div className="page-stack calendar-page">
      <PageHeader
        eyebrow="MAKE ROOM FOR YOUR WORK"
        title="Calendar"
        description="Plan your time. Keep the actual work connected."
        actions={
          <Button variant="primary" onClick={() => create(date, settings.workStart)}>
            <Plus size={18} />
            New plan
          </Button>
        }
      />
      <Card className="card-pad stack">
        <div className="split">
          <div className="cluster">
            <h2 className="calendar-month-title">{title}</h2>
            <div className="cluster">
              <IconButton
                label={`Previous ${view}`}
                onClick={() => setDate(navigateDate(date, view, -1))}
              >
                <ChevronLeft size={20} />
              </IconButton>
              <Button onClick={() => setDate(todayKey(new Date(), settings.timezone))}>
                Today
              </Button>
              <IconButton
                label={`Next ${view}`}
                onClick={() => setDate(navigateDate(date, view, 1))}
              >
                <ChevronRight size={20} />
              </IconButton>
            </div>
          </div>
          <SegmentedControl value={view} onChange={setView} options={views} label="Calendar view" />
        </div>
        <div className="split">
          <Field label="Go to date" htmlFor="calendar-date">
            <input
              id="calendar-date"
              type="date"
              required
              value={date}
              onChange={(event) => {
                if (event.target.value) setDate(event.target.value);
              }}
            />
          </Field>
          <div className="cluster">
            <label className="calendar-work-toggle">
              <input
                type="checkbox"
                checked={workHours}
                onChange={(event) => setWorkHours(event.target.checked)}
              />
              Work hours {timeInput(settings.workStart)}–{timeInput(settings.workEnd)}
            </label>
            <Badge>{settings.timezone}</Badge>
          </div>
        </div>
      </Card>
      <div className="split small muted">
        <span className="cluster">
          <Clock3 size={15} />
          Half-hour planning · lunch {timeInput(settings.lunchStart)}–{timeInput(settings.lunchEnd)}
        </span>
        {hiddenPlans > 0 && (
          <button
            type="button"
            className="text-link calendar-text-button"
            onClick={() => setWorkHours(false)}
          >
            {hiddenPlans} outside work hours · Show full day
          </button>
        )}
      </div>
      <Card className="calendar-canvas">
        <CalendarGrid
          dates={dates}
          plans={plans}
          settings={settings}
          selected={date}
          workHours={workHours}
          month={view === 'month'}
          onSelect={setDate}
          onPlan={setDetail}
          onCreate={create}
        />
      </Card>
      <section aria-labelledby="calendar-agenda-title" className="stack">
        <div className="split">
          <h2 id="calendar-agenda-title" className="calendar-agenda-title">
            {parseDate(date).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h2>
          <span className="small muted">
            {daily.length} {daily.length === 1 ? 'plan' : 'plans'}
          </span>
        </div>
        <Card>
          {daily.length ? (
            <div className="calendar-agenda">
              {daily.map((plan) => (
                <button
                  type="button"
                  className="calendar-agenda-item"
                  key={plan.id}
                  onClick={() => setDetail(plan)}
                >
                  <span className="calendar-agenda-time">
                    {timeInput(plan.startMinute)}
                    <br />
                    <span className="muted">{timeInput(plan.endMinute)}</span>
                  </span>
                  <span>
                    <strong>{plan.title}</strong>
                    {plan.notes && (
                      <span className="small muted calendar-agenda-note">{plan.notes}</span>
                    )}
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Room for what matters"
              description="Choose a time on the calendar or add a plan for this day."
              action={<Button onClick={() => create(date, settings.workStart)}>Add a plan</Button>}
            />
          )}
        </Card>
      </section>
      {editor && <PlanEditor plan={editor.plan} initial={editor} onClose={() => setEditor(null)} />}
      {detail && (
        <PlanDetails
          plan={detail}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setEditor({ plan: detail, date: detail.date, minute: detail.startMinute });
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}
