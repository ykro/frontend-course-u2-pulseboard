// Tests públicos del reto. Son una muestra: el contrato completo de la guía del reto
// tiene otros datos y más casos borde. No los modifiques.
import { screen, waitFor, within } from "@testing-library/react";
import { delay, http } from "msw";
import { describe, expect, it } from "vitest";
import { DEMO_PASSWORD, LUIS } from "../mocks/users";
import { DEFAULT_PATH, safeNextPath } from "../src/auth/safeNextPath";
import { currentLocation, recordRequests, renderApp } from "./helpers";
import { server } from "./setup";

function slowCreate(ms: number) {
  server.use(
    http.post("*/api/v1/boards/:boardId/tasks", async () => {
      await delay(ms);
      return undefined;
    }),
  );
}

describe("reto R1: crear tareas con useMutation", () => {
  it("muestra la tarea nueva al instante como 'Guardando...' y luego la confirma", async () => {
    slowCreate(80);
    const app = renderApp("/boards/producto");
    await screen.findByText("4 tareas");

    await app.user.type(
      screen.getByLabelText("Título"),
      "Preparar demo del viernes",
    );
    await app.user.click(screen.getByRole("button", { name: "Crear tarea" }));

    const list = screen.getByRole("list", { name: "Tareas" });
    expect(
      within(list).getByText("Preparar demo del viernes"),
    ).toBeInTheDocument();
    expect(within(list).getByText("Guardando...")).toBeInTheDocument();
    expect(screen.getByText("5 tareas")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText("Guardando...")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", {
        name: "Comentarios: Preparar demo del viernes",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("");
  });

  it("si el servidor responde 422 revierte la lista y muestra su mensaje", async () => {
    const app = renderApp("/boards/producto");
    await screen.findByText("4 tareas");

    await app.user.type(screen.getByLabelText("Título"), "ab");
    await app.user.click(screen.getByRole("button", { name: "Crear tarea" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "El título debe tener entre 3 y 120 caracteres.",
    );
    expect(screen.getByText("4 tareas")).toBeInTheDocument();
    expect(screen.queryByText("Guardando...")).not.toBeInTheDocument();
  });

  it("después de crear vuelve a pedir la lista del tablero (invalidación)", async () => {
    const requests = recordRequests();
    const app = renderApp("/boards/producto");
    await screen.findByText("4 tareas");

    await app.user.type(
      screen.getByLabelText("Título"),
      "Revisar métricas de abril",
    );
    await app.user.click(screen.getByRole("button", { name: "Crear tarea" }));

    await waitFor(() => {
      const gets = requests.filter(
        (request) =>
          request.method === "GET" &&
          request.path === "/api/v1/boards/producto/tasks",
      );
      expect(gets).toHaveLength(2);
    });
    const post = requests.find((request) => request.method === "POST");
    expect(post?.authorization).toBe("Bearer demo.u-ana.1");
  });
});

describe("reto R2: ruta protegida y redirección segura", () => {
  it("sin sesión redirige al login y después vuelve a la ruta pedida", async () => {
    const app = renderApp("/boards/plataforma", { user: null });

    await app.user.type(await screen.findByLabelText("Correo"), LUIS.email);
    expect(currentLocation(app)).toBe("/login?next=%2Fboards%2Fplataforma");
    await app.user.type(screen.getByLabelText("Contraseña"), DEMO_PASSWORD);
    await app.user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("2 tareas")).toBeInTheDocument();
    expect(currentLocation(app)).toBe("/boards/plataforma");
  });

  it("safeNextPath acepta rutas internas y rechaza otros sitios", () => {
    expect(safeNextPath("/boards/plataforma?status=done")).toBe(
      "/boards/plataforma?status=done",
    );
    expect(safeNextPath("https://evil.example/robar")).toBe(DEFAULT_PATH);
  });
});
