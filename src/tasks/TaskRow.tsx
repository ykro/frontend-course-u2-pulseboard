import type { Task } from "../api/types";
import { isOptimisticTask } from "./optimistic";

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "Pendiente",
  doing: "En curso",
  done: "Hecha",
};

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function TaskRow({
  task,
  selected,
  onOpenComments,
}: {
  task: Task;
  selected: boolean;
  onOpenComments: (taskId: string) => void;
}) {
  const pending = isOptimisticTask(task);
  return (
    <li
      className={`flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3 ${
        selected ? "border-blue-400" : "border-slate-200"
      } ${pending ? "opacity-70" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{task.title}</p>
        <p className="text-xs text-slate-500">
          {STATUS_LABEL[task.status]} · Prioridad{" "}
          {PRIORITY_LABEL[task.priority]} · {task.assignee ?? "Sin asignar"}
        </p>
      </div>
      {pending ? (
        <span className="text-xs font-medium text-slate-500">Guardando...</span>
      ) : (
        <button
          type="button"
          aria-label={`Comentarios: ${task.title}`}
          onClick={() => onOpenComments(task.id)}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          Comentarios
        </button>
      )}
    </li>
  );
}
