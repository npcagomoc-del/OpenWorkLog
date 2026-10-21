import { describe, expect, it } from 'vitest';
import { clockInput, scheduleSchema } from './settingsLogic';

const workingDay = {
  workStart: '08:00',
  workEnd: '17:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  timezone: 'Asia/Manila',
};
describe('working day input boundary', () => {
  it('converts an accepted schedule to the shared minute model', () => {
    expect(scheduleSchema.parse(workingDay)).toEqual({
      workStart: 480,
      workEnd: 1020,
      lunchStart: 720,
      lunchEnd: 780,
      timezone: 'Asia/Manila',
    });
    expect(clockInput(810)).toBe('13:30');
  });
  it.each([
    { workEnd: '07:00' },
    { lunchEnd: '11:00' },
    { lunchStart: '07:30' },
    { lunchEnd: '18:00' },
    { workStart: '25:00' },
    { timezone: 'Not/A_Zone' },
  ])('rejects an invalid schedule without a mutation payload: %j', (patch) => {
    expect(scheduleSchema.safeParse({ ...workingDay, ...patch }).success).toBe(false);
  });
});
