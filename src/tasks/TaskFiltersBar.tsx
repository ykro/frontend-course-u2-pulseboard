import { STATUS_OPTIONS, type TaskFilters } from "./filters";

export function TaskFiltersBar({
  status,
  mine,
  onStatusChange,
  onMineChange,
}: {
  status: TaskFilters["status"];
  mine: boolean;
  onStatusChange: (status: TaskFilters["status"]) => void;
  onMineChange: (mine: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        Estado
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as TaskFilters["status"])
          }
          className="rounded-md border border-slate-300 bg-white px-2 py-1"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={mine}
          onChange={(event) => onMineChange(event.target.checked)}
        />
        Solo mis tareas
      </label>
    </div>
  );
}
