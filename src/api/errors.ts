import type { ValidationIssue } from "./types";

/** Error de la API con el código HTTP y el error_code del contrato. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: ValidationIssue[];

  constructor(
    status: number,
    code: string,
    message: string,
    detail: ValidationIssue[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

function isErrorBody(
  body: unknown,
): body is { error_code: string; message: string; detail?: ValidationIssue[] } {
  return (
    typeof body === "object" &&
    body !== null &&
    "error_code" in body &&
    "message" in body &&
    typeof body.message === "string"
  );
}

/** Convierte la respuesta de error de openapi-fetch en un ApiError. */
export function toApiError(status: number, body: unknown): ApiError {
  if (isErrorBody(body)) {
    return new ApiError(status, body.error_code, body.message, body.detail);
  }
  return new ApiError(
    status,
    "UNKNOWN",
    `El servidor respondió ${status} sin un error del contrato.`,
  );
}
