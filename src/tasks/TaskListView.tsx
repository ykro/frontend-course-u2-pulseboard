import type { UseQueryResult } from "@tanstack/react-query";
import type { TaskPage } from "../api/types";

/**
 * Taller, parte 3. Pinta los estados de la consulta:
 * - isPending: todavía no hay datos (primera carga de esta llave);
 * - isError: la consulta falló y no hay datos que mostrar;
 * - isFetching con datos: actualización en segundo plano.
 * Usa TaskRow (./TaskRow) para cada tarea.
 */
export function TaskListView(_props: {
  query: UseQueryResult<TaskPage>;
  selectedTaskId: string | null;
  onOpenComments: (taskId: string) => void;
}) {
  return (
    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">
      Pendiente (taller, paso 6): estados de la lista de tareas.
    </p>
  );
}
