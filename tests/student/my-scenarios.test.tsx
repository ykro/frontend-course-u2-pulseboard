// Tus tests propios (15 puntos de la rúbrica).
//
// Tus tests propios suman si pasan contra la solución de referencia y detectan
// mutantes que la suite pública no detecta (errores sembrados en el
// reto). Reescribir un test público no suma.
//
// Escribe al menos 2 tests: detectar 2 o más grupos de esos errores da el
// puntaje completo, 1 da la mitad. Usa las utilidades de tests/helpers.tsx
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
