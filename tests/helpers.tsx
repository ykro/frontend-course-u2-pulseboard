// Utilidades oficiales para los tests. No las modifiques.
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { render, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";
import { FakeAuthRepository } from "../mocks/fakeAuth";
import { FakeCommentsRepository } from "../mocks/fakeComments";
import { ANA } from "../mocks/users";
import { createSandboxClient } from "../src/api/client";
import type { AuthUser } from "../src/auth/AuthRepository";
import { AppProviders } from "../src/AppProviders";
import { AppRoutes } from "../src/App";
import { createQueryClient } from "../src/queryClient";
import type { Services } from "../src/services";
import { server } from "./setup";

export const SANDBOX_URL = "http://sandbox.test";

export interface TestContext {
  auth: FakeAuthRepository;
  comments: FakeCommentsRepository;
  queryClient: QueryClient;
  services: Services;
}

export function createTestContext(
  options: { user?: AuthUser | null; deferAuth?: boolean } = {},
): TestContext {
  const auth = new FakeAuthRepository({
    initialUser: options.user === undefined ? ANA : options.user,
    deferInitialState: options.deferAuth ?? false,
  });
  const comments = new FakeCommentsRepository();
  const services: Services = {
    mode: "demo",
    auth,
    comments,
    api: createSandboxClient(SANDBOX_URL, auth),
  };
  return {
    auth,
    comments,
    services,
    queryClient: createQueryClient({ retry: false }),
  };
}

/** Muestra la ruta actual para que los tests verifiquen redirecciones. */
function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location" hidden>
      {location.pathname}
      {location.search}
    </div>
  );
}

export function currentLocation(result: RenderResult): string {
  return result.getByTestId("location").textContent ?? "";
}

/** Renderiza la app completa en una ruta, con fakes y el Sandbox simulado. */
export function renderApp(
  route: string,
  options: { user?: AuthUser | null; deferAuth?: boolean } = {},
) {
  const context = createTestContext(options);
  const user = userEvent.setup();
  const result = render(
    <AppProviders services={context.services} queryClient={context.queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AppRoutes />
        <LocationProbe />
      </MemoryRouter>
    </AppProviders>,
  );
  return { ...context, ...result, user };
}

/** Envoltorio con los proveedores de la app, para renderHook o render. */
export function providersFor(context: TestContext) {
  return function Providers({ children }: { children: ReactNode }) {
    return (
      <AppProviders
        services={context.services}
        queryClient={context.queryClient}
      >
        <MemoryRouter>{children}</MemoryRouter>
      </AppProviders>
    );
  };
}

export interface RecordedRequest {
  method: string;
  path: string;
  search: string;
  authorization: string | null;
}

/** Registra las peticiones que recibe el Sandbox simulado. */
export function recordRequests(): RecordedRequest[] {
  const requests: RecordedRequest[] = [];
  server.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    requests.push({
      method: request.method,
      path: url.pathname,
      search: url.search,
      authorization: request.headers.get("Authorization"),
    });
  });
  return requests;
}
