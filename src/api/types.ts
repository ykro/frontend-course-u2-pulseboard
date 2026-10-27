import type { components } from "./schema";

// Alias legibles de los tipos generados desde openapi.json (npm run gen:api).
export type Board = components["schemas"]["Board"];
export type Task = components["schemas"]["Task"];
export type TaskPage = components["schemas"]["TaskPage"];
export type TaskCreate = components["schemas"]["TaskCreate"];
export type TaskStatus = components["schemas"]["TaskStatus"];
export type TaskPriority = components["schemas"]["TaskPriority"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type ValidationIssue = components["schemas"]["ValidationIssue"];
