import type { TaskFilters } from "./filters";

/**
 * Taller, parte 2. Fábrica de queryKey jerárquica:
 *   ["tasks"]                                todas las tareas
 *   ["tasks", "list", boardId]               listas de un tablero
 *   ["tasks", "list", boardId, filters]      una lista filtrada
 * Todo lo que cambia el resultado de la consulta va en la llave.
 */
export const taskKeys = {
  all: ["tasks"] as const,
  lists: (_boardId: string): readonly ["tasks", "list", string] => {
    throw new Error("Pendiente (taller, paso 4): taskKeys.lists");
  },
  list: (
    _boardId: string,
    _filters: TaskFilters,
  ): readonly ["tasks", "list", string, TaskFilters] => {
    throw new Error("Pendiente (taller, paso 4): taskKeys.list");
  },
};

export type TaskListKey = ReturnType<typeof taskKeys.list>;
