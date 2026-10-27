import { delay, http, HttpResponse, type HttpHandler } from "msw";
import type { ErrorResponse, ValidationIssue } from "../src/api/types";
import { boardExists, insertTask, listBoards, listTasks } from "./sandboxDb";
import { userFromDemoToken, userFromFirebaseIdToken } from "./users";

/**
 * Sandbox simulado con MSW: implementa openapi.json sobre sandboxDb.
 * Los patrones empiezan con * para servir a cualquier origen (la URL
 * de los tests o el mismo origen en el modo demo).
 */
function errorResponse(status: number, body: ErrorResponse) {
  return HttpResponse.json(body, { status });
}

function unauthorized() {
  return errorResponse(401, {
    error_code: "UNAUTHORIZED",
    message: "Falta el token o no es válido. Inicia sesión de nuevo.",
  });
}

function boardNotFound() {
  return errorResponse(404, {
    error_code: "BOARD_NOT_FOUND",
    message: "El tablero no existe.",
  });
}

function validationError(message: string, detail: ValidationIssue[]) {
  return errorResponse(422, {
    error_code: "VALIDATION_ERROR",
    message,
    detail,
  });
}

function authenticate(request: Request, acceptFirebaseTokens: boolean) {
  const header = request.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const demoUser = userFromDemoToken(token);
  if (demoUser !== null || !acceptFirebaseTokens) return demoUser;
  return userFromFirebaseIdToken(token);
}

const STATUSES = ["todo", "doing", "done"];
const PRIORITIES = ["low", "medium", "high"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CREATE_FIELDS = new Set(["title", "priority", "assignee"]);

export function createSandboxHandlers(
  options: { latencyMs?: number; acceptFirebaseTokens?: boolean } = {},
): HttpHandler[] {
  const acceptFirebaseTokens = options.acceptFirebaseTokens ?? false;
  const wait = async () => {
    if (options.latencyMs) await delay(options.latencyMs);
  };

  return [
    http.get("*/health", () => HttpResponse.json({ status: "ok" })),

    http.get("*/api/v1/boards", async ({ request }) => {
      await wait();
      if (authenticate(request, acceptFirebaseTokens) === null)
        return unauthorized();
      return HttpResponse.json(listBoards());
    }),

    http.get("*/api/v1/boards/:boardId/tasks", async ({ request, params }) => {
      await wait();
      if (authenticate(request, acceptFirebaseTokens) === null)
        return unauthorized();
      const boardId = String(params.boardId);
      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      if (status !== null && !STATUSES.includes(status)) {
        return validationError("El estado no es válido.", [
          {
            loc: ["query", "status"],
            msg: "Debe ser todo, doing o done.",
            type: "enum",
          },
        ]);
      }
      if (!boardExists(boardId)) return boardNotFound();
      return HttpResponse.json(
        listTasks(boardId, {
          status,
          assignee: url.searchParams.get("assignee"),
        }),
      );
    }),

    http.post("*/api/v1/boards/:boardId/tasks", async ({ request, params }) => {
      await wait();
      const user = authenticate(request, acceptFirebaseTokens);
      if (user === null) return unauthorized();
      const body: unknown = await request.json().catch(() => null);
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return validationError("El cuerpo debe ser un objeto JSON.", [
          { loc: ["body"], msg: "Se esperaba un objeto.", type: "type" },
        ]);
      }
      const record = body as Record<string, unknown>;
      const extra = Object.keys(record).find((key) => !CREATE_FIELDS.has(key));
      if (extra !== undefined) {
        return validationError(`El campo ${extra} no está permitido.`, [
          { loc: ["body", extra], msg: "Campo no permitido.", type: "extra" },
        ]);
      }
      const title = typeof record.title === "string" ? record.title.trim() : "";
      if (title.length < 3 || title.length > 120) {
        return validationError(
          "El título debe tener entre 3 y 120 caracteres.",
          [
            {
              loc: ["body", "title"],
              msg: "Debe tener entre 3 y 120 caracteres.",
              type: "string_length",
            },
          ],
        );
      }
      const priority = record.priority ?? "medium";
      if (typeof priority !== "string" || !PRIORITIES.includes(priority)) {
        return validationError("La prioridad no es válida.", [
          {
            loc: ["body", "priority"],
            msg: "Debe ser low, medium o high.",
            type: "enum",
          },
        ]);
      }
      const assignee = record.assignee ?? null;
      if (
        assignee !== null &&
        (typeof assignee !== "string" || !EMAIL.test(assignee))
      ) {
        return validationError("La persona asignada no es un correo.", [
          {
            loc: ["body", "assignee"],
            msg: "Debe ser un correo o null.",
            type: "email",
          },
        ]);
      }
      const boardId = String(params.boardId);
      if (!boardExists(boardId)) return boardNotFound();
      const task = insertTask(
        boardId,
        {
          title,
          priority: priority as "low" | "medium" | "high",
          assignee,
        },
        user.uid,
      );
      return HttpResponse.json(task, { status: 201 });
    }),
  ];
}
