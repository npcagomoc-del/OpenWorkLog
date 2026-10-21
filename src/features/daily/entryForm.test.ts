import { describe, expect, it } from 'vitest';
import { clockValue, parseClock, withEntryTimes, blankEntry } from './entryForm';

describe('daily entry time boundary', () => {
  it('keeps exact manual minutes rather than rounding to half hours', () => {
    // Given a manually entered interval crossing the half-hour boundary.
    const from = '13:10'; const to = '13:42';
    // When the user clock input is parsed.
    const duration = Number(parseClock(to)) - Number(parseClock(from));
    // Then only the 32 entered minutes are represented.
    expect(duration).toBe(32);
  });
  it('allows midnight as an ending boundary and rejects impossible clocks', () => {
    // Given midnight and malformed clock inputs.
    const valid = '24:00';
    // When those values cross the form boundary.
    const midnight = parseClock(valid);
    // Then midnight is preserved while invalid values are rejected.
    expect(midnight).toBe(1440);
    expect(clockValue(midnight)).toBe('24:00');
    expect(() => parseClock('24:01')).toThrow();
    expect(() => parseClock('13:60')).toThrow();
    expect(() => parseClock('-1:00')).toThrow();
  });
  it('explicitly clears timer segments when manual actual time changes', () => {
    // Given an existing paused-timer entry.
    const initial = { ...blankEntry('2026-10-21'), actualStart: 790, actualEnd: 822, actualSegments: [{ startMinute: 790, endMinute: 800 }, { startMinute: 810, endMinute: 822 }] };
    // When the user replaces its interval manually.
    const update = withEntryTimes(initial, { plannedStart: '', plannedEnd: '', actualStart: '13:10', actualEnd: '14:00' }, initial);
    // Then the update explicitly removes old segments at the persistence merge boundary.
    expect(Object.hasOwn(update, 'actualSegments')).toBe(true);
    expect(update.actualSegments).toBeUndefined();
    expect(update.actualEnd).toBe(840);
  });
  it('preserves paused segments when only descriptive fields change', () => {
    // Given an existing timer entry with a pause.
    const initial = { ...blankEntry('2026-10-21'), actualStart: 790, actualEnd: 822, actualSegments: [{ startMinute: 790, endMinute: 800 }, { startMinute: 810, endMinute: 822 }] };
    // When time inputs are saved unchanged alongside an edited description.
    const update = withEntryTimes({ ...initial, workDone: 'Verified recovery' }, { plannedStart: '', plannedEnd: '', actualStart: '13:10', actualEnd: '13:42' }, initial);
    // Then the active segments stay intact.
    expect(update.actualSegments).toEqual(initial.actualSegments);
  });
});
