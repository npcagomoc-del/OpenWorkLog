import type { Plan, Settings } from '../../domain/models';
import { todayKey } from '../../domain/time';
import { parseDate, planLanes, plansForDate, timeInput } from './calendarLogic';

type GridProps = {
  readonly dates: readonly string[];
  readonly plans: readonly Plan[];
  readonly settings: Settings;
  readonly selected: string;
  readonly workHours: boolean;
  readonly month: boolean;
  readonly onSelect: (date: string) => void;
  readonly onPlan: (plan: Plan) => void;
  readonly onCreate: (date: string, minute: number) => void;
};
export function CalendarGrid(props: GridProps) {
  const { dates, plans, settings, selected, workHours, month, onSelect, onPlan, onCreate } = props;
  const today = todayKey(new Date(), settings.timezone);
  if (month)
    return (
      <section className="calendar-month" aria-label="Month calendar">
        {dates.slice(0, 7).map((date) => (
          <div className="calendar-weekday" key={date}>
            {parseDate(date).toLocaleDateString(undefined, { weekday: 'short' })}
          </div>
        ))}
        {dates.map((date) => {
          const daily = plansForDate(plans, date);
          return (
            <div
              key={date}
              className={`calendar-month-day ${date.slice(0, 7) !== selected.slice(0, 7) ? 'calendar-outside' : ''} ${date === selected ? 'calendar-selected' : ''}`}
            >
              <button
                type="button"
                className={`calendar-day-number ${date === today ? 'calendar-today' : ''}`}
                onClick={() => onSelect(date)}
                aria-label={`Select ${parseDate(date).toLocaleDateString(undefined, { dateStyle: 'full' })}`}
                aria-pressed={date === selected}
              >
                {parseDate(date).getDate()}
              </button>
              {daily.slice(0, 3).map((plan) => (
                <button
                  type="button"
                  key={plan.id}
                  className="calendar-month-plan"
                  onClick={() => onPlan(plan)}
                  title={`${timeInput(plan.startMinute)} ${plan.title}`}
                >
                  <span>{timeInput(plan.startMinute)}</span> {plan.title}
                </button>
              ))}
              {daily.length > 3 && (
                <button type="button" className="calendar-more" onClick={() => onSelect(date)}>
                  +{daily.length - 3} more
                </button>
              )}
              {daily.length > 0 && (
                <span className="calendar-mobile-count">
                  {daily.length} {daily.length === 1 ? 'plan' : 'plans'}
                </span>
              )}
            </div>
          );
        })}
      </section>
    );
  const start = workHours ? Math.floor(settings.workStart / 30) * 30 : 0;
  const end = workHours ? Math.ceil(settings.workEnd / 30) * 30 : 1440;
  const slots = Array.from({ length: (end - start) / 30 }, (_, index) => start + index * 30);
  return (
    <section className="calendar-time-scroll" aria-label="Calendar time grid">
      <div
        className={`calendar-time-grid ${dates.length > 1 ? 'calendar-time-grid--week' : ''}`}
        style={{ gridTemplateColumns: `4rem repeat(${dates.length}, minmax(0, 1fr))` }}
      >
        <div className="calendar-time-corner">24h</div>
        {dates.map((date) => (
          <button
            type="button"
            className={`calendar-date-header ${date === today ? 'calendar-date-header--today' : ''}`}
            key={date}
            onClick={() => onSelect(date)}
          >
            <span>{parseDate(date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
            <strong>{parseDate(date).getDate()}</strong>
          </button>
        ))}
        <div className="calendar-times">
          {slots.map((minute) => (
            <div key={minute}>{timeInput(minute)}</div>
          ))}
        </div>
        {dates.map((date) => {
          const positioned = planLanes(
            plansForDate(plans, date).filter(
              (plan) => plan.endMinute > start && plan.startMinute < end,
            ),
          );
          const laneCount = Math.max(1, ...positioned.map((item) => item.lane + 1));
          return (
            <div
              className="calendar-day-track"
              key={date}
              style={{ height: `${slots.length * 3.5}rem` }}
            >
              {slots.map((minute) => {
                const lunch = minute < settings.lunchEnd && minute + 30 > settings.lunchStart;
                return (
                  <button
                    type="button"
                    key={minute}
                    className={`calendar-slot ${lunch ? 'calendar-slot--lunch' : ''}`}
                    onClick={() => onCreate(date, minute)}
                    aria-label={`Plan ${date} at ${timeInput(minute)}${lunch ? ', lunch break' : ''}`}
                  >
                    {lunch && <span>Lunch</span>}
                  </button>
                );
              })}
              {positioned.map(({ plan, lane }) => (
                <button
                  type="button"
                  key={plan.id}
                  className="calendar-block"
                  title={`${plan.title} · ${timeInput(plan.startMinute)}–${timeInput(plan.endMinute)}`}
                  onClick={() => onPlan(plan)}
                  style={{
                    top: `${((Math.max(plan.startMinute, start) - start) / 30) * 3.5}rem`,
                    height: `${((Math.min(plan.endMinute, end) - Math.max(plan.startMinute, start)) / 30) * 3.5}rem`,
                    left: `calc(${(lane / laneCount) * 100}% + 3px)`,
                    width: `calc(${100 / laneCount}% - 6px)`,
                  }}
                >
                  <strong>{plan.title}</strong>
                  <span>
                    {timeInput(plan.startMinute)}–{timeInput(plan.endMinute)}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
