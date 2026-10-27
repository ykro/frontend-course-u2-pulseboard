import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api/errors";

export interface QueryClientOptions {
  /** Reintentos de consultas fallidas; los tests usan false. */
  retry?: number | false;
}

/**
 * Política de reintento de las consultas: una sola vez y solo si el error
 * puede ser transitorio (5xx o falla de red). Un 4xx (401, 404, 422...) no
 * cambia por repetir la misma petición, así que se muestra de inmediato.
 */
export function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

export function createQueryClient(
  options: QueryClientOptions = {},
): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Durante 30 s los datos en caché se consideran frescos: volver
        // a un filtro ya visitado no dispara otra petición.
        staleTime: 30_000,
        retry: options.retry ?? shouldRetryQuery,
      },
      mutations: { retry: false },
    },
  });
}
