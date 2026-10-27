import type { QueryClient } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppProviders } from "./AppProviders";
import { RequireAuth } from "./auth/RequireAuth";
import { DEFAULT_PATH } from "./auth/safeNextPath";
import { AppLayout } from "./pages/AppLayout";
import { BoardPage } from "./pages/BoardPage";
import { LoginPage } from "./pages/LoginPage";
import type { Services } from "./services";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Route>
      <Route path="*" element={<Navigate to={DEFAULT_PATH} replace />} />
    </Routes>
  );
}

export function App({
  services,
  queryClient,
}: {
  services: Services;
  queryClient: QueryClient;
}) {
  return (
    <AppProviders services={services} queryClient={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
