import type { Category, Plan, Settings, Task } from '../../domain/models';
import { todayKey } from '../../domain/time';
import { CalendarTimeGrid } from './CalendarTimeGrid';
import { categoryForPlan, categoryStyle } from './calendarCategory';
import { parseDate, plansForDate, timeInput } from './calendarLogic';

type GridProps = {
  readonly dates: readonly string[];
  readonly plans: readonly Plan[];
  readonly tasks: readonly Task[];
  readonly categories: readonly Category[];
  readonly settings: Settings;
  readonly selected: string;
  readonly focusMode: boolean;
  readonly workHours: boolean;
  readonly month: boolean;
  readonly onSelect: (date: string) => void;
  readonly onPlan: (plan: Plan) => void;
  readonly onCreate: (date: string, minute: number) => void;
};
export function CalendarGrid(props: GridProps) {
  const { dates, plans, tasks, categories, settings, selected, focusMode, workHours, month, onSelect, onPlan, onCreate } = props;
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
              {daily.slice(0, 3).map((plan) => {
                const category = categoryForPlan(plan, tasks, categories);
                return <button
                  type="button"
                  key={plan.id}
                  className={`calendar-month-plan ${category ? 'calendar-category-event' : ''}`}
                  style={categoryStyle(category)}
                  onClick={() => onPlan(plan)}
                  title={`${timeInput(plan.startMinute)} ${plan.title}${category ? ` · ${category.name}` : ''}`}
                >
                  <span>{timeInput(plan.startMinute)}</span> {plan.title}
                </button>;
              })}
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
  return (
    <CalendarTimeGrid
      dates={dates}
      plans={plans}
      tasks={tasks}
      categories={categories}
      settings={settings}
      focusMode={focusMode}
      workHours={workHours}
      onSelect={onSelect}
      onPlan={onPlan}
      onCreate={onCreate}
    />
  );
}
