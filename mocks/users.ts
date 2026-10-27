import type { AuthUser } from "../src/auth/AuthRepository";

/** Personas del modo demo y de los tests. No son cuentas reales. */
export const ANA: AuthUser = {
  uid: "u-ana",
  email: "ana@pulseboard.dev",
  displayName: "Ana López",
};

export const LUIS: AuthUser = {
  uid: "u-luis",
  email: "luis@pulseboard.dev",
  displayName: "Luis Pérez",
};

export const DEMO_USERS: readonly AuthUser[] = [ANA, LUIS];

/** Contraseña del Firebase falso. Solo existe en memoria. */
export const DEMO_PASSWORD = "pulseboard-demo";

/** Formato del token falso: demo.<uid>.<versión>. */
export function demoToken(uid: string, version: number): string {
  return `demo.${uid}.${version}`;
}

export function userFromDemoToken(token: string): AuthUser | null {
  const match = /^demo\.([a-z0-9-]+)\.(\d+)$/.exec(token);
  if (match === null) return null;
  return DEMO_USERS.find((user) => user.uid === match[1]) ?? null;
}

interface FirebaseTokenClaims {
  user_id?: unknown;
  sub?: unknown;
  email?: unknown;
  name?: unknown;
}

/**
 * Modo mixto: identifica a la persona a partir del ID token de tu Firebase
 * real leyendo su payload (uid, correo y nombre). NO verifica la firma: el
 * Sandbox simulado corre en tu propio navegador y solo sirve para practicar.
 * Un servidor real siempre verifica la firma, el emisor y la audiencia.
 */
export function userFromFirebaseIdToken(token: string): AuthUser | null {
  const payload = token.split(".")[1];
  if (payload === undefined || token.split(".").length !== 3) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded)) as FirebaseTokenClaims;
    const uid =
      typeof claims.user_id === "string" ? claims.user_id : claims.sub;
    if (typeof uid !== "string" || typeof claims.email !== "string") {
      return null;
    }
    const displayName =
      typeof claims.name === "string" ? claims.name : claims.email;
    return { uid, email: claims.email, displayName };
  } catch {
    return null;
  }
}
