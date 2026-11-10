import type { ReactNode } from "react";
import { useAuth } from "./authContext";

/**
 * Reto. Guardia de ruta protegida. El contrato completo está en la guía del reto
 * de la raíz de tu repositorio.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <p role="status" className="p-8 text-slate-600">
        Verificando sesión...
      </p>
    );
  }
  // Pendiente (reto): sin sesión, redirige a /login?next=<ruta pedida>.
  return children;
}
