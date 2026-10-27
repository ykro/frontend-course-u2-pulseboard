import createClient, { type Middleware } from "openapi-fetch";
import type { AuthRepository } from "../auth/AuthRepository";
import type { paths } from "./schema";

export type SandboxClient = ReturnType<typeof createClient<paths>>;

/**
 * Taller, parte 1. Adjunta el ID token vigente como
 * Authorization: Bearer <token> en cada petición al Sandbox.
 * Pide el token en cada petición: Firebase lo renueva solo y
 * guardarlo en una variable o en localStorage lo deja vencido.
 */
export function bearerTokenMiddleware(_auth: AuthRepository): Middleware {
  return {
    onRequest({ request }) {
      // Pendiente (taller, paso 3): pide el token a auth y agrega el
      // encabezado Authorization solo si hay sesión.
      return request;
    },
  };
}

/** Cliente tipado con los paths generados desde openapi.json. */
export function createSandboxClient(
  baseUrl: string,
  auth: AuthRepository,
): SandboxClient {
  const client = createClient<paths>({ baseUrl });
  client.use(bearerTokenMiddleware(auth));
  return client;
}
