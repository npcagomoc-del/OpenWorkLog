import {
  type CollisionDetection,
  type KeyboardCoordinateGetter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import type { RefObject } from 'react';
import type { Task } from '../../domain/models';
import { belongsToGroup } from './taskGroups';
import type { TaskGroup } from './taskViewTypes';
export const groupDropId = (group: TaskGroup) => `task-group:${group.id}`;
export const dropGroup = (groups: readonly TaskGroup[], id: string | number | undefined) =>
  groups.find((group) => groupDropId(group) === id);
export const boardCollision: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);
export function boardKeyboardCoordinates(
  tasks: readonly Task[],
  groups: readonly TaskGroup[],
  selected: RefObject<TaskGroup | null>,
): KeyboardCoordinateGetter {
  return (event, { active, currentCoordinates, context }) => {
    const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.code];
    if (!direction) return;
    event.preventDefault();
    const task = tasks.find((item) => item.id === active);
    const current =
      selected.current ??
      dropGroup(groups, context.over?.id) ??
      (task ? groups.find((group) => belongsToGroup(task, group)) : undefined);
    const rect = context.collisionRect;
    if (!current || !rect) return;
    const next = groups[groups.indexOf(current) + direction];
    if (!next) return;
    const target = context.droppableRects.get(groupDropId(next));
    if (!target) return;
    selected.current = next;
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
