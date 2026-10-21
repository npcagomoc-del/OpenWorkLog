import { z } from 'zod';

const clockValue = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid time.');
export const scheduleSchema = z
  .object({
    workStart: clockValue,
    workEnd: clockValue,
    lunchStart: clockValue,
    lunchEnd: clockValue,
    timezone: z
      .string()
      .trim()
      .min(1)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat('en', { timeZone: value });
          return true;
        } catch (error) {
          if (error instanceof RangeError) return false;
          throw error;
        }
      }, 'Enter a valid time zone, such as Asia/Manila.'),
  })
  .transform((value) => ({
    workStart: toMinute(value.workStart),
    workEnd: toMinute(value.workEnd),
    lunchStart: toMinute(value.lunchStart),
    lunchEnd: toMinute(value.lunchEnd),
    timezone: value.timezone,
  }))
  .refine((value) => value.workEnd > value.workStart, 'Work end must be after work start.')
  .refine((value) => value.lunchEnd > value.lunchStart, 'Lunch end must be after lunch start.')
  .refine(
    (value) => value.lunchStart >= value.workStart && value.lunchEnd <= value.workEnd,
    'Lunch must fall within your work hours.',
  );

export function toMinute(value: string): number {
  const [hours = '0', minutes = '0'] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}
export function clockInput(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}
