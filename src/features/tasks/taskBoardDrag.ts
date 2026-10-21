import {
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import type { Status, Task } from '../../domain/models';
import { statuses } from './taskLogic';

export const statusDropId = (status: Status) => `task-status:${status}`;
export const dropStatus = (id: string | number | undefined) =>
  statuses.find((status) => statusDropId(status) === id);

export const boardCollision: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);

export function boardKeyboardCoordinates(tasks: readonly Task[]): KeyboardCoordinateGetter {
  return (event, { active, currentCoordinates, context }) => {
    const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.code];
    if (!direction) return;
    event.preventDefault();
    const current =
      dropStatus(context.over?.id) ?? tasks.find((task) => task.id === active)?.status;
    const rect = context.collisionRect;
    if (!current || !rect) return;
    const next = statuses[statuses.indexOf(current) + direction];
    if (!next) return;
    const target = context.droppableRects.get(statusDropId(next));
    if (!target) return;
    return {
      x: currentCoordinates.x + target.left + target.width / 2 - rect.left - rect.width / 2,
      y:
        currentCoordinates.y +
        target.top +
        Math.min(target.height / 2, 96) -
        rect.top -
        rect.height / 2,
    };
  };
}
