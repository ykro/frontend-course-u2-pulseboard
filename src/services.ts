import { createContext, useContext } from "react";
import type { SandboxClient } from "./api/client";
import type { AuthRepository } from "./auth/AuthRepository";
import type { CommentsRepository } from "./comments/CommentsRepository";
import type { AppMode } from "./config";

/** Dependencias externas de la app, inyectadas desde main.tsx o los tests. */
export interface Services {
  mode: AppMode;
  auth: AuthRepository;
  comments: CommentsRepository;
  api: SandboxClient;
}

export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (services === null) {
    throw new Error("useServices debe usarse dentro de <AppProviders>.");
  }
  return services;
}
