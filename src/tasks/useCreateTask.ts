import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "../api/errors";
import type { Task, TaskPriority } from "../api/types";

export interface NewTaskInput {
  title: string;
  priority: TaskPriority;
  assignee: string | null;
}

/**
 * Reto. Crea una tarea con actualización optimista. El contrato completo
 * está en el README de la raíz de tu repositorio.
 */
export function useCreateTask(_boardId: string) {
  return useMutation<Task, ApiError, NewTaskInput>({
    mutationFn: () => Promise.reject(new Error("Pendiente (reto)")),
  });
}
