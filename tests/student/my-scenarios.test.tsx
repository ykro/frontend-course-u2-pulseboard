// Tus tests propios (al menos 2).
//
// Un buen test pasa con el código correcto y falla si alguien mete un error
// plausible del reto que los tests públicos no atrapan. Copiar un test
// público no aporta.
//
// Escribe al menos 2 tests, cada uno para un error distinto. Usa las utilidades de tests/helpers.tsx
// (renderApp, recordRequests, currentLocation) y el servidor de tests/setup.ts;
// no uses la red ni archivos.
import { describe, expect, it } from "vitest";

describe("mis escenarios", () => {
  it("describe aquí qué error del reto atrapa este test y renómbralo", () => {
    expect.fail("Escribe tu primer test propio");
  });

  it("describe aquí qué error del reto atrapa tu segundo test", () => {
    expect.fail("Escribe tu segundo test propio");
  });
});
