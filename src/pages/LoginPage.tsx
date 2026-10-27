import { useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router";
import { AuthError } from "../auth/AuthRepository";
import { useAuth } from "../auth/authContext";
import { safeNextPath } from "../auth/safeNextPath";
import { useServices } from "../services";

export function LoginPage() {
  const auth = useAuth();
  const { auth: repository, mode } = useServices();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (auth.status === "loading") {
    return (
      <p role="status" className="p-8 text-slate-600">
        Verificando sesión...
      </p>
    );
  }
  if (auth.status === "signedIn") {
    // La navegación ocurre cuando onAuthStateChanged confirma la sesión.
    return <Navigate to={safeNextPath(searchParams.get("next"))} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await repository.signIn(email.trim(), password);
    } catch (cause) {
      setError(
        cause instanceof AuthError
          ? cause.message
          : "No se pudo iniciar sesión. Intenta de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Inicia sesión en PulseBoard
      </h1>
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Correo
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          Entrar
        </button>
        {error !== null && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </form>
      {mode === "demo" && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Modo demo: Firebase y el Sandbox están simulados en tu navegador.
          Entra con ana@pulseboard.dev o luis@pulseboard.dev y la contraseña
          pulseboard-demo.
        </p>
      )}
      {mode === "mixed" && (
        <p className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Modo mixto: entras con tu proyecto de Firebase y la API de tareas está
          simulada en tu navegador.
        </p>
      )}
    </main>
  );
}
