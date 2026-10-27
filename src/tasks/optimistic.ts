import type { Task } from "../api/types";

/** Prefijo del id de una tarea que todavía no confirma el servidor. */
export const OPTIMISTIC_PREFIX = "optimistic-";

export function isOptimisticTask(task: Task): boolean {
  return task.id.startsWith(OPTIMISTIC_PREFIX);
}
