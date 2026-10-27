import type { Comment, CommentTarget } from "./CommentsRepository";

export type CommentsState =
  | { status: "loading"; comments: [] }
  | { status: "error"; comments: []; error: Error }
  | { status: "ready"; comments: Comment[] };

/**
 * Taller, parte 5. Comentarios en vivo de una tarea con
 * CommentsRepository.subscribe. Lo escribes con el codelab.
 */
export function useTaskComments(_target: CommentTarget): CommentsState {
  return { status: "loading", comments: [] };
}
