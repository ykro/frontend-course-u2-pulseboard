import { useQuery } from "@tanstack/react-query";
import { toApiError } from "../api/errors";
import { useServices } from "../services";

/** Ejemplo resuelto: una consulta sin parámetros con useQuery. */
export function useBoards() {
  const { api } = useServices();
  return useQuery({
    queryKey: ["boards"],
    queryFn: async ({ signal }) => {
      const { data, error, response } = await api.GET("/api/v1/boards", {
        signal,
      });
      if (data === undefined) {
        throw toApiError(response.status, error);
      }
      return data;
    },
  });
}
