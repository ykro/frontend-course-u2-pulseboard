export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

/**
 * Tres modos de arranque:
 * - demo: sin configuración de Firebase. Auth y Firestore son fakes en
 *   memoria y la API REST la simula MSW en el navegador.
 * - mixed: con tu Firebase (Auth y comentarios en Firestore reales) y sin
 *   VITE_SANDBOX_URL. La API REST la sigue simulando MSW en el navegador.
 * - firebase: Firebase real y un Sandbox real en VITE_SANDBOX_URL.
 */
export type AppConfig =
  | { mode: "demo" }
  | { mode: "mixed"; firebase: FirebaseWebConfig }
  | { mode: "firebase"; sandboxUrl: string; firebase: FirebaseWebConfig };

export type AppMode = AppConfig["mode"];

/**
 * Lee la configuración pública de Vite (solo variables VITE_*). Sin las
 * cuatro variables de Firebase la app arranca en modo demo, sin
 * credenciales. Aquí nunca va un secreto: todo lo que lee Vite termina en
 * el bundle.
 */
export function readConfig(env: ImportMetaEnv): AppConfig {
  const sandboxUrl = env.VITE_SANDBOX_URL?.trim() ?? "";
  const firebase: FirebaseWebConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY?.trim() ?? "",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "",
    appId: env.VITE_FIREBASE_APP_ID?.trim() ?? "",
  };
  if (Object.values(firebase).some((value) => value === "")) {
    return { mode: "demo" };
  }
  if (sandboxUrl === "") {
    return { mode: "mixed", firebase };
  }
  return { mode: "firebase", sandboxUrl, firebase };
}

/** La API REST se simula en el navegador salvo en el modo completo. */
export function usesSimulatedSandbox(config: AppConfig): boolean {
  return config.mode !== "firebase";
}

/** Origen al que habla el cliente tipado: el Sandbox real o esta misma app. */
export function sandboxBaseUrl(config: AppConfig, origin: string): string {
  return config.mode === "firebase" ? config.sandboxUrl : origin;
}
