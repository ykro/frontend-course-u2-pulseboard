import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../auth/authContext";
import { useServices } from "../services";
import { useBoards } from "../tasks/useBoards";

export function AppLayout() {
  const { user } = useAuth();
  const { auth, mode } = useServices();
  const queryClient = useQueryClient();
  const boards = useBoards();

  async function handleSignOut() {
    await auth.signOut();
    // Los datos en caché son de la sesión que termina: no deben quedar
    // a la vista de la siguiente persona que use el navegador.
    queryClient.clear();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <span className="text-lg font-bold text-blue-800">PulseBoard</span>
          <nav aria-label="Tableros" className="flex gap-2">
            {boards.isError && (
              <span className="text-sm text-red-700">
                No se pudieron cargar los tableros.
              </span>
            )}
            {boards.data?.map((board) => (
              <NavLink
                key={board.id}
                to={`/boards/${board.id}`}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1 text-sm font-medium ${
                    isActive
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {board.name}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {mode === "demo" && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-900">
                Modo demo
              </span>
            )}
            {mode === "mixed" && (
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-900">
                Modo mixto
              </span>
            )}
            <span className="text-slate-600">{user?.email}</span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="rounded-md border border-slate-300 px-3 py-1"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
