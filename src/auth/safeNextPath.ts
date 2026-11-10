/** Ruta a la que se vuelve después de iniciar sesión si no hay otra. */
export const DEFAULT_PATH = "/boards/producto";

/**
 * Reto. Valida el parámetro ?next= del login: solo acepta rutas internas
 * de esta app y en cualquier otro caso devuelve DEFAULT_PATH. El contrato
 * completo está en la guía del reto del curso.
 */
export function safeNextPath(_next: string | null): string {
  // Pendiente (reto): hoy siempre vuelve al tablero por defecto.
  return DEFAULT_PATH;
}
