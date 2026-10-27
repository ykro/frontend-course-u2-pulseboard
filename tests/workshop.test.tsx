// Tests oficiales del taller guiado. No los modifiques.
import {
  act,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ANA, DEMO_PASSWORD, LUIS } from "../mocks/users";
import { ApiError } from "../src/api/errors";
import type { TaskFilters } from "../src/tasks/filters";
import { taskKeys } from "../src/tasks/taskKeys";
import { fetchTasks, useTasks } from "../src/tasks/useTasks";
import { createQueryClient } from "../src/queryClient";
import {
  createTestContext,
  providersFor,
  recordRequests,
  renderApp,
} from "./helpers";
import { server } from "./setup";

const ALL: TaskFilters = { status: "all", assignee: null };

function taskTitles(): string[] {
  const list = screen.getByRole("list", { name: "Tareas" });
  return within(list)
    .getAllByRole("listitem")
    .map(
      (item) =>
        within(item).getByText(/./, { selector: "p.font-medium" })
          .textContent ?? "",
    );
}

describe("paso 3: cliente tipado con el ID token", () => {
  it("adjunta Authorization: Bearer con el token de la sesión", async () => {
    const requests = recordRequests();
    const { services } = createTestContext();

    const { data, response } = await services.api.GET("/api/v1/boards");

    expect(response.status).toBe(200);
    expect(data?.map((board) => board.name)).toEqual([
      "Plataforma",
      "Producto",
    ]);
    expect(requests[0]?.authorization).toBe("Bearer demo.u-ana.1");
  });

  it("sin sesión no envía Authorization (401) y tras iniciar sesión sí", async () => {
    const requests = recordRequests();
    const { services, auth } = createTestContext({ user: null });

    const before = await services.api.GET("/api/v1/boards");
    await auth.signIn(LUIS.email, DEMO_PASSWORD);
    const after = await services.api.GET("/api/v1/boards");

    expect(before.response.status).toBe(401);
    expect(before.error?.error_code).toBe("UNAUTHORIZED");
    expect(after.response.status).toBe(200);
    expect(requests.map((request) => request.authorization)).toEqual([
      null,
      "Bearer demo.u-luis.1",
    ]);
  });

  it("pide el token en cada petición porque Firebase lo renueva", async () => {
    const requests = recordRequests();
    const { services, auth } = createTestContext();

    await services.api.GET("/api/v1/boards");
    auth.rotateToken();
    await services.api.GET("/api/v1/boards");

    expect(requests.map((request) => request.authorization)).toEqual([
      "Bearer demo.u-ana.1",
      "Bearer demo.u-ana.2",
    ]);
  });
});

describe("paso 4: queryKey y fetchTasks", () => {
  it("taskKeys arma llaves jerárquicas que empiezan igual", () => {
    const filters = { status: "done", assignee: ANA.email } as const;

    expect(taskKeys.all).toEqual(["tasks"]);
    expect(taskKeys.lists("producto")).toEqual(["tasks", "list", "producto"]);
    expect(taskKeys.list("producto", filters)).toEqual([
      "tasks",
      "list",
      "producto",
      filters,
    ]);
  });

  it("fetchTasks traduce los filtros a la query string", async () => {
    const requests = recordRequests();
    const { services } = createTestContext();

    const done = await fetchTasks(services.api, "producto", {
      status: "done",
      assignee: ANA.email,
    });
    const all = await fetchTasks(services.api, "producto", ALL);

    expect(done.items.map((task) => task.id)).toEqual(["t-103"]);
    expect(all.total).toBe(4);
    expect(requests.map((request) => request.search)).toEqual([
      "?status=done&assignee=ana%40pulseboard.dev",
      "",
    ]);
  });

  it("fetchTasks lanza ApiError con el código y el mensaje del servidor", async () => {
    const { services } = createTestContext();

    const failure = fetchTasks(services.api, "no-existe", ALL);

    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({
      status: 404,
      code: "BOARD_NOT_FOUND",
      message: "El tablero no existe.",
    });
  });
});

describe("paso 5: useTasks con useQuery", () => {
  it("guarda cada combinación de filtros en su propia entrada de caché", async () => {
    const context = createTestContext();
    const doing: TaskFilters = { status: "doing", assignee: null };
    const { result, rerender } = renderHook(
      ({ filters }: { filters: TaskFilters }) => useTasks("producto", filters),
      {
        wrapper: providersFor(context),
        initialProps: { filters: ALL },
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ filters: doing });
    await waitFor(() => expect(result.current.data?.total).toBe(1));

    const cache = context.queryClient;
    expect(cache.getQueryData(taskKeys.list("producto", ALL))).toMatchObject({
      total: 4,
    });
    expect(cache.getQueryData(taskKeys.list("producto", doing))).toMatchObject({
      total: 1,
    });
  });

  it("el último filtro gana aunque una respuesta anterior llegue después", async () => {
    server.use(
      http.get("*/api/v1/boards/:boardId/tasks", async ({ request }) => {
        if (new URL(request.url).searchParams.get("status") === "todo") {
          await delay(150);
        }
        return undefined;
      }),
    );
    const context = createTestContext();
    const todo: TaskFilters = { status: "todo", assignee: null };
    const done: TaskFilters = { status: "done", assignee: null };
    const { result, rerender } = renderHook(
      ({ filters }: { filters: TaskFilters }) => useTasks("producto", filters),
      {
        wrapper: providersFor(context),
        initialProps: { filters: todo },
      },
    );

    rerender({ filters: done });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(() => delay(200));

    expect(result.current.data?.items.map((task) => task.status)).toEqual([
      "done",
    ]);
  });

  it("con el QueryClient de la app reintenta una vez un 5xx y nunca un 4xx", async () => {
    const requests = recordRequests();
    const context = {
      ...createTestContext(),
      queryClient: createQueryClient(),
    };
    const defaults = context.queryClient.getDefaultOptions();
    context.queryClient.setDefaultOptions({
      ...defaults,
      queries: { ...defaults.queries, retryDelay: 1 },
    });
    server.use(
      http.get("*/api/v1/boards/plataforma/tasks", () =>
        HttpResponse.json(
          { error_code: "INTERNAL_ERROR", message: "El Sandbox no responde." },
          { status: 503 },
        ),
      ),
    );
    const wrapper = providersFor(context);

    const missing = renderHook(() => useTasks("no-existe", ALL), { wrapper });
    await waitFor(() => expect(missing.result.current.isError).toBe(true));
    const down = renderHook(() => useTasks("plataforma", ALL), { wrapper });
    await waitFor(() => expect(down.result.current.isError).toBe(true));

    expect(missing.result.current.error).toMatchObject({ status: 404 });
    expect(down.result.current.error).toMatchObject({ status: 503 });
    const paths = requests.map((request) => request.path);
    expect(paths.filter((path) => path.includes("/no-existe/"))).toHaveLength(
      1,
    );
    expect(paths.filter((path) => path.includes("/plataforma/"))).toHaveLength(
      2,
    );
  });
});

describe("paso 6: estados de la lista en BoardPage", () => {
  it("muestra 'Cargando tareas...' y luego las tareas del tablero", async () => {
    renderApp("/boards/producto");

    expect(await screen.findByText("Cargando tareas...")).toBeInTheDocument();
    expect(await screen.findByText("4 tareas")).toBeInTheDocument();
    expect(taskTitles()).toEqual([
      "Revisar textos del onboarding",
      "Medir abandono en el registro",
      "Publicar notas de la versión 2.3",
      "Entrevistar a tres clientes nuevos",
    ]);
  });

  it("el filtro de estado pide ?status= y muestra solo ese estado", async () => {
    const requests = recordRequests();
    const app = renderApp("/boards/producto");
    await screen.findByText("4 tareas");

    await app.user.selectOptions(screen.getByLabelText("Estado"), "Hechas");

    expect(await screen.findByText("1 tarea")).toBeInTheDocument();
    expect(taskTitles()).toEqual(["Publicar notas de la versión 2.3"]);
    expect(
      requests.some(
        (request) =>
          request.path.endsWith("/tasks") && request.search === "?status=done",
      ),
    ).toBe(true);
  });

  it("volver a un filtro visitado usa la caché sin 'Cargando tareas...'", async () => {
    const requests = recordRequests();
    const app = renderApp("/boards/producto");
    await screen.findByText("4 tareas");
    await app.user.selectOptions(screen.getByLabelText("Estado"), "Hechas");
    await screen.findByText("1 tarea");

    await app.user.selectOptions(screen.getByLabelText("Estado"), "Todas");

    expect(screen.getByText("4 tareas")).toBeInTheDocument();
    expect(screen.queryByText("Cargando tareas...")).not.toBeInTheDocument();
    const taskRequests = requests.filter((request) =>
      request.path.endsWith("/tasks"),
    );
    expect(taskRequests.map((request) => request.search)).toEqual([
      "",
      "?status=done",
    ]);
  });

  it("'Solo mis tareas' filtra por el correo de la sesión", async () => {
    const app = renderApp("/boards/producto");
    await screen.findByText("4 tareas");

    await app.user.click(screen.getByLabelText("Solo mis tareas"));

    expect(await screen.findByText("2 tareas")).toBeInTheDocument();
    expect(taskTitles()).toEqual([
      "Revisar textos del onboarding",
      "Publicar notas de la versión 2.3",
    ]);
  });

  it("sin resultados muestra 'No hay tareas con estos filtros.'", async () => {
    renderApp("/boards/producto?status=doing&mine=1");

    expect(
      await screen.findByText("No hay tareas con estos filtros."),
    ).toBeInTheDocument();
    expect(screen.getByText("0 tareas")).toBeInTheDocument();
  });

  it("si la consulta falla muestra el error y 'Reintentar' vuelve a pedir", async () => {
    server.use(
      http.get(
        "*/api/v1/boards/:boardId/tasks",
        () =>
          HttpResponse.json(
            {
              error_code: "INTERNAL_ERROR",
              message: "El Sandbox no responde.",
            },
            { status: 503 },
          ),
        { once: true },
      ),
    );
    const app = renderApp("/boards/producto");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("No se pudieron cargar las tareas.");
    expect(alert).toHaveTextContent("El Sandbox no responde.");

    await app.user.click(
      within(alert).getByRole("button", { name: "Reintentar" }),
    );

    expect(await screen.findByText("4 tareas")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("una recarga en segundo plano muestra 'Actualizando...' sin ocultar la lista", async () => {
    const app = renderApp("/boards/producto");
    await screen.findByText("4 tareas");
    server.use(
      http.get("*/api/v1/boards/:boardId/tasks", async () => {
        await delay(100);
        return undefined;
      }),
    );

    act(() => {
      void app.queryClient.invalidateQueries({ queryKey: taskKeys.all });
    });

    expect(await screen.findByText("Actualizando...")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Tareas" })).toBeInTheDocument();
    expect(screen.queryByText("Cargando tareas...")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Actualizando...")).not.toBeInTheDocument(),
    );
  });
});

describe("paso 7: comentarios en vivo con limpieza", () => {
  const onboarding = { boardId: "producto", taskId: "t-101" };
  const metrics = { boardId: "producto", taskId: "t-102" };

  it("muestra los comentarios y los que llegan de otra persona sin recargar", async () => {
    const app = renderApp("/boards/producto?task=t-101");
    app.comments.seed(onboarding, [
      { text: "Empiezo por la pantalla 1.", author: LUIS },
    ]);

    const thread = await screen.findByRole("region", {
      name: "Comentarios de Revisar textos del onboarding",
    });
    expect(
      await within(thread).findByText("Empiezo por la pantalla 1."),
    ).toBeInTheDocument();

    act(() =>
      app.comments.pushFromTeammate(onboarding, "La 2 ya quedó.", LUIS),
    );

    expect(
      await within(thread).findByText("La 2 ya quedó."),
    ).toBeInTheDocument();
  });

  it("cancela la suscripción al cerrar el hilo (sin fugas)", async () => {
    const app = renderApp("/boards/producto?task=t-101");
    await screen.findByText("Todavía no hay comentarios.");
    expect(app.comments.activeSubscriptions(onboarding)).toBe(1);

    await app.user.click(
      screen.getByRole("button", { name: "Cerrar comentarios" }),
    );

    expect(app.comments.activeSubscriptions()).toBe(0);
  });

  it("al cambiar de tarea suelta la suscripción anterior y nunca mezcla hilos", async () => {
    const app = renderApp("/boards/producto?task=t-101");
    app.comments.seed(onboarding, [
      { text: "Comentario del onboarding", author: LUIS },
    ]);
    app.comments.seed(metrics, [
      { text: "Comentario de métricas", author: ANA },
    ]);
    await screen.findByText("Comentario del onboarding");

    await app.user.click(
      screen.getByRole("button", {
        name: "Comentarios: Medir abandono en el registro",
      }),
    );

    expect(
      await screen.findByText("Comentario de métricas"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Comentario del onboarding"),
    ).not.toBeInTheDocument();
    expect(app.comments.activeSubscriptions(onboarding)).toBe(0);
    expect(app.comments.activeSubscriptions(metrics)).toBe(1);
  });

  it("muestra un error si Firestore rechaza la suscripción", async () => {
    const app = renderApp("/boards/plataforma?task=t-201", { user: LUIS });
    app.comments.failSubscriptions(
      { boardId: "plataforma", taskId: "t-201" },
      new Error("permission-denied"),
    );

    const thread = await screen.findByRole("region", {
      name: "Comentarios de Rotar certificados del balanceador",
    });
    expect(await within(thread).findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los comentarios.",
    );
    expect(
      within(thread).queryByText("Cargando comentarios..."),
    ).not.toBeInTheDocument();
  });
});
