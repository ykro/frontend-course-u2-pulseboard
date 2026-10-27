import { createContext, useContext } from "react";
import type { AuthUser } from "./AuthRepository";

/**
 * "loading" dura desde que la app arranca hasta que Firebase responde
 * por primera vez en onAuthStateChanged. Durante ese tiempo NO se sabe
 * si hay sesión: no se debe redirigir ni mostrar datos privados.
 */
export type AuthState =
  | { status: "loading"; user: null }
  | { status: "signedOut"; user: null }
  | { status: "signedIn"; user: AuthUser };

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (state === null) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return state;
}
