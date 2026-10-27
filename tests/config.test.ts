// Tests oficiales de infraestructura: cómo arranca la app según las
// variables VITE_*. En verde desde el starter. No los modifiques.
import { describe, expect, it } from "vitest";
import { createSandboxHandlers } from "../mocks/handlers";
import {
  readConfig,
  sandboxBaseUrl,
  usesSimulatedSandbox,
} from "../src/config";
import { SANDBOX_URL } from "./helpers";
import { server } from "./setup";

const FIREBASE = {
  VITE_FIREBASE_API_KEY: "clave-publica-de-prueba",
  VITE_FIREBASE_AUTH_DOMAIN: "pulseboard-prueba.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "pulseboard-prueba",
  VITE_FIREBASE_APP_ID: "1:123:web:abc",
};

function env(values: Record<string, string>): ImportMetaEnv {
  return values as unknown as ImportMetaEnv;
}

/** JWT sin firmar con la forma de un ID token de Firebase. */
function fakeIdToken(claims: Record<string, string>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  return [encode({ alg: "RS256" }), encode(claims), "firma"].join(".");
}

describe("modos de arranque", () => {
  it("sin las cuatro variables de Firebase arranca en modo demo", () => {
    const demo = readConfig(env({}));
    const partial = readConfig(
      env({
        VITE_SANDBOX_URL: "https://sandbox.example",
        VITE_FIREBASE_API_KEY: "x",
      }),
    );

    expect(demo).toEqual({ mode: "demo" });
    expect(partial).toEqual({ mode: "demo" });
    expect(usesSimulatedSandbox(demo)).toBe(true);
    expect(sandboxBaseUrl(demo, "http://localhost:5173")).toBe(
      "http://localhost:5173",
    );
  });

  it("con Firebase y sin VITE_SANDBOX_URL usa el modo mixto; con ella, el completo", () => {
    const mixed = readConfig(env({ ...FIREBASE, VITE_SANDBOX_URL: "  " }));
    const full = readConfig(
      env({ ...FIREBASE, VITE_SANDBOX_URL: "https://sandbox.example" }),
    );

    expect(mixed.mode).toBe("mixed");
    expect(usesSimulatedSandbox(mixed)).toBe(true);
    expect(sandboxBaseUrl(mixed, "http://localhost:5173")).toBe(
      "http://localhost:5173",
    );
    expect(full).toMatchObject({
      mode: "firebase",
      sandboxUrl: "https://sandbox.example",
      firebase: { projectId: "pulseboard-prueba" },
    });
    expect(usesSimulatedSandbox(full)).toBe(false);
    expect(sandboxBaseUrl(full, "http://localhost:5173")).toBe(
      "https://sandbox.example",
    );
  });

  it("en el modo mixto el Sandbox simulado acepta el ID token de Firebase", async () => {
    const token = fakeIdToken({
      user_id: "uid-real",
      email: "maria@ejemplo.gt",
      name: "María",
    });
    const request = () =>
      fetch(`${SANDBOX_URL}/api/v1/boards`, {
        headers: { Authorization: `Bearer ${token}` },
      });

    const demoSandbox = await request();
    server.use(...createSandboxHandlers({ acceptFirebaseTokens: true }));
    const mixedSandbox = await request();

    expect(demoSandbox.status).toBe(401);
    expect(mixedSandbox.status).toBe(200);
  });
});
