import type { Board, Task } from "../src/api/types";
import { ANA, LUIS } from "./users";

/**
 * Base de datos en memoria del Sandbox simulado. Los tests la
 * reinician antes de cada caso con resetSandbox().
 */
interface SandboxState {
  boards: Board[];
  tasks: Task[];
  nextId: number;
  clock: number;
}

const BASE_TIME = Date.parse("2027-02-01T15:00:00Z");

function seedTasks(): Task[] {
  const at = (minutes: number) =>
    new Date(BASE_TIME + minutes * 60_000).toISOString();
  return [
    {
      id: "t-101",
      boardId: "producto",
      title: "Revisar textos del onboarding",
      status: "todo",
      priority: "medium",
      assignee: ANA.email,
      createdBy: ANA.uid,
      createdAt: at(4),
    },
    {
      id: "t-102",
      boardId: "producto",
      title: "Medir abandono en el registro",
      status: "doing",
      priority: "high",
      assignee: LUIS.email,
      createdBy: ANA.uid,
      createdAt: at(3),
    },
    {
      id: "t-103",
      boardId: "producto",
      title: "Publicar notas de la versión 2.3",
      status: "done",
      priority: "low",
      assignee: ANA.email,
      createdBy: LUIS.uid,
      createdAt: at(2),
    },
    {
      id: "t-104",
      boardId: "producto",
      title: "Entrevistar a tres clientes nuevos",
      status: "todo",
      priority: "high",
      assignee: null,
      createdBy: LUIS.uid,
      createdAt: at(1),
    },
    {
      id: "t-201",
      boardId: "plataforma",
      title: "Rotar certificados del balanceador",
      status: "doing",
      priority: "high",
      assignee: LUIS.email,
      createdBy: LUIS.uid,
      createdAt: at(5),
    },
    {
      id: "t-202",
      boardId: "plataforma",
      title: "Actualizar Node a la versión 24",
      status: "todo",
      priority: "medium",
      assignee: null,
      createdBy: ANA.uid,
      createdAt: at(0),
    },
  ];
}

function initialState(): SandboxState {
  return {
    boards: [
      { id: "plataforma", name: "Plataforma" },
      { id: "producto", name: "Producto" },
    ],
    tasks: seedTasks(),
    nextId: 300,
    clock: BASE_TIME + 60 * 60_000,
  };
}

let state = initialState();

export function resetSandbox(): void {
  state = initialState();
}

export function listBoards(): Board[] {
  return [...state.boards].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function boardExists(boardId: string): boolean {
  return state.boards.some((board) => board.id === boardId);
}

export function listTasks(
  boardId: string,
  filters: { status: string | null; assignee: string | null },
): { items: Task[]; total: number } {
  const items = state.tasks
    .filter((task) => task.boardId === boardId)
    .filter((task) => filters.status === null || task.status === filters.status)
    .filter(
      (task) => filters.assignee === null || task.assignee === filters.assignee,
    )
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
    );
  return { items, total: items.length };
}

export function insertTask(
  boardId: string,
  input: Pick<Task, "title" | "priority" | "assignee">,
  createdBy: string,
): Task {
  state.nextId += 1;
  state.clock += 60_000;
  const task: Task = {
    id: `t-${state.nextId}`,
    boardId,
    title: input.title,
    status: "todo",
    priority: input.priority,
    assignee: input.assignee,
    createdBy,
    createdAt: new Date(state.clock).toISOString(),
  };
  state.tasks.push(task);
  return task;
}
