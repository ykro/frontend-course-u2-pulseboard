// Setup oficial de Vitest. No lo modifiques: el calificador usa su copia.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { createSandboxHandlers } from "../mocks/handlers";
import { resetSandbox } from "../mocks/sandboxDb";

/** Sandbox simulado para todos los tests; ninguna petición sale a la red. */
export const server = setupServer(...createSandboxHandlers());

const inFlight = new Set<string>();

function trackInFlight() {
  server.events.on("request:start", ({ requestId, request }) => {
    inFlight.add(requestId);
    request.signal.addEventListener("abort", () => inFlight.delete(requestId));
  });
  server.events.on("request:end", ({ requestId }) => {
    inFlight.delete(requestId);
  });
}

beforeAll(() => {
  // Una petición sin handler hace fallar el test: la red está aislada.
  server.listen({ onUnhandledFrame: "error" });
  trackInFlight();
});

beforeEach(() => {
  resetSandbox();
});

afterEach(async () => {
  cleanup();
  // Una petición lenta de un test no debe escribir en el Sandbox del siguiente.
  await vi.waitFor(
    () => {
      if (inFlight.size > 0) throw new Error("Hay peticiones en curso.");
    },
    { timeout: 3_000, interval: 10 },
  );
  server.resetHandlers();
  server.events.removeAllListeners();
  inFlight.clear();
  trackInFlight();
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  server.close();
});
