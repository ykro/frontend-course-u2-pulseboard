import { useEffect, useState, type ReactNode } from "react";
import { useServices } from "../services";
import { AuthContext, type AuthState } from "./authContext";

const LOADING: AuthState = { status: "loading", user: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useServices();
  const [state, setState] = useState<AuthState>(LOADING);

  useEffect(() => {
    // onAuthStateChanged devuelve la función para dejar de escuchar:
    // retornarla como limpieza evita listeners huérfanos.
    return auth.onAuthStateChanged((user) => {
      setState(
        user === null
          ? { status: "signedOut", user: null }
          : { status: "signedIn", user },
      );
    });
  }, [auth]);

  return <AuthContext value={state}>{children}</AuthContext>;
}
