import type { TaskStatus } from "../api/types";

/** Filtros de la lista de tareas. Viven en la URL (?status=&mine=1). */
export interface TaskFilters {
  status: TaskStatus | "all";
  /** Correo de la persona asignada, o null para no filtrar. */
  assignee: string | null;
}

export const STATUS_OPTIONS: { value: TaskFilters["status"]; label: string }[] =
  [
    { value: "all", label: "Todas" },
    { value: "todo", label: "Pendientes" },
    { value: "doing", label: "En curso" },
    { value: "done", label: "Hechas" },
  ];

function isStatus(value: string | null): value is TaskStatus {
  return value === "todo" || value === "doing" || value === "done";
}

/** Lee los filtros de la URL; "mine" se traduce al correo de la sesión. */
export function readFilters(
  params: URLSearchParams,
  email: string | null,
): TaskFilters {
  const status = params.get("status");
  return {
    status: isStatus(status) ? status : "all",
    assignee: params.get("mine") === "1" && email !== null ? email : null,
  };
}
