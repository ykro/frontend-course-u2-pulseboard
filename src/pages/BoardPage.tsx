import { useParams, useSearchParams } from "react-router";
import { useAuth } from "../auth/authContext";
import { DEFAULT_PATH } from "../auth/safeNextPath";
import { CommentThread } from "../comments/CommentThread";
import { readFilters } from "../tasks/filters";
import { NewTaskForm } from "../tasks/NewTaskForm";
import { TaskFiltersBar } from "../tasks/TaskFiltersBar";
import { TaskListView } from "../tasks/TaskListView";
import { useBoards } from "../tasks/useBoards";
import { useTasks } from "../tasks/useTasks";

const DEFAULT_BOARD_ID = DEFAULT_PATH.split("/").at(-1) ?? "producto";

export function BoardPage() {
  const { boardId = DEFAULT_BOARD_ID } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams, user?.email ?? null);
  const selectedTaskId = searchParams.get("task");
  const tasks = useTasks(boardId, filters);
  const boards = useBoards();

  const boardName =
    boards.data?.find((board) => board.id === boardId)?.name ?? boardId;
  const selectedTask = tasks.data?.items.find(
    (task) => task.id === selectedTaskId,
  );

  function updateParam(name: string, value: string | null) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value === null) next.delete(name);
      else next.set(name, value);
      return next;
    });
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_22rem]">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900">{boardName}</h1>
        <NewTaskForm boardId={boardId} />
        <TaskFiltersBar
          status={filters.status}
          mine={searchParams.get("mine") === "1"}
          onStatusChange={(status) =>
            updateParam("status", status === "all" ? null : status)
          }
          onMineChange={(mine) => updateParam("mine", mine ? "1" : null)}
        />
        <TaskListView
          query={tasks}
          selectedTaskId={selectedTaskId}
          onOpenComments={(taskId) => updateParam("task", taskId)}
        />
      </section>
      <aside>
        {selectedTask !== undefined && (
          <CommentThread
            target={{ boardId, taskId: selectedTask.id }}
            taskTitle={selectedTask.title}
            onClose={() => updateParam("task", null)}
          />
        )}
      </aside>
    </main>
  );
}
