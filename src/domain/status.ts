import { z } from 'zod';

export const STATUS_VALUES = ['Open', 'In Progress', 'On Hold', 'Closed', 'Cancelled'] as const;
export const STATUSES = STATUS_VALUES;
export const statusSchema = z.enum(STATUS_VALUES);
export type Status = z.infer<typeof statusSchema>;
export function isTerminalStatus(status: Status): boolean {
  return status === 'Closed' || status === 'Cancelled';
}
