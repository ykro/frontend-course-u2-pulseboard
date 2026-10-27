import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { ServicesContext, type Services } from "./services";

export function AppProviders({
  services,
  queryClient,
  children,
}: {
  services: Services;
  queryClient: QueryClient;
  children: ReactNode;
}) {
  return (
    <ServicesContext value={services}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ServicesContext>
  );
}
