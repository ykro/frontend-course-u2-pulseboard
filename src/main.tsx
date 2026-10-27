import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createDemoServices, startDemoSandbox } from "../mocks/demo";
import { App } from "./App";
import { readConfig, sandboxBaseUrl, usesSimulatedSandbox } from "./config";
import { createFirebaseServices } from "./firebase/createFirebaseServices";
import "./index.css";
import { createQueryClient } from "./queryClient";

// Raíz de composición: el único lugar que decide qué implementación de
// cada interfaz usa la app (demo, mixto o completo; ver src/config.ts).
async function bootstrap() {
  const config = readConfig(import.meta.env);
  if (usesSimulatedSandbox(config)) {
    // Demo y mixto: la API REST la simula MSW en este mismo origen.
    await startDemoSandbox({ acceptFirebaseTokens: config.mode === "mixed" });
  }
  const services =
    config.mode === "demo"
      ? createDemoServices()
      : createFirebaseServices(
          config,
          sandboxBaseUrl(config, window.location.origin),
        );
  const container = document.getElementById("root");
  if (container === null) {
    throw new Error("Falta el elemento #root en index.html.");
  }
  createRoot(container).render(
    <StrictMode>
      <App services={services} queryClient={createQueryClient()} />
    </StrictMode>,
  );
}

void bootstrap();
