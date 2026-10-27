import { useState, type FormEvent } from "react";
import type { TaskPriority } from "../api/types";

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

/** Reto. Formulario que crea tareas con useCreateTask. */
export function NewTaskForm(_props: { boardId: string }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignToMe, setAssignToMe] = useState(true);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Pendiente (reto): crea la tarea con useCreateTask según el contrato.
  }

  return (
    <form
      aria-label="Nueva tarea"
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <label className="flex min-w-60 flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
        Título
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={140}
          className="rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Prioridad
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TaskPriority)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
        >
          {PRIORITIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 py-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={assignToMe}
          onChange={(event) => setAssignToMe(event.target.checked)}
        />
        Asignarme a mí
      </label>
      <button
        type="submit"
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Crear tarea
      </button>
    </form>
  );
}
