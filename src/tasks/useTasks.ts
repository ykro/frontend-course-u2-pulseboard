import { useQuery } from "@tanstack/react-query";
import type { SandboxClient } from "../api/client";
import type { TaskPage } from "../api/types";
import type { TaskFilters } from "./filters";

/** Taller, parte 2. GET /api/v1/boards/{boardId}/tasks con filtros. */
export function fetchTasks(
  _api: SandboxClient,
  _boardId: string,
  _filters: TaskFilters,
  _signal?: AbortSignal,
): Promise<TaskPage> {
  return Promise.reject(new Error("Pendiente (taller, paso 4): fetchTasks"));
}

/** Taller, parte 2. Lista de tareas en caché, una entrada por filtro. */
export function useTasks(_boardId: string, _filters: TaskFilters) {
  // Pendiente (taller, paso 5): reemplaza esta consulta deshabilitada por
  // useQuery con taskKeys.list(boardId, filters) y fetchTasks.
  return useQuery<TaskPage>({
    queryKey: ["tasks", "pendiente"],
    queryFn: () => Promise.reject(new Error("Pendiente (taller, paso 5)")),
    enabled: false,
  });
}
