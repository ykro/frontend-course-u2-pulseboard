import type { AuthUser, Unsubscribe } from "../auth/AuthRepository";

/** Tarea cuyos comentarios se leen: boards/{boardId}/tasks/{taskId}/comments. */
export interface CommentTarget {
  boardId: string;
  taskId: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  /** Milisegundos desde 1970 (Timestamp de Firestore convertido). */
  createdAt: number;
}

/**
 * Frontera con Firestore. subscribe() equivale a onSnapshot: llama a
 * onChange con la lista completa (ordenada del más antiguo al más
 * reciente) cada vez que cambia, y devuelve la función para dejar de
 * escuchar. Quien se suscribe DEBE llamarla al desmontar.
 */
export interface CommentsRepository {
  subscribe(
    target: CommentTarget,
    onChange: (comments: Comment[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe;
  add(
    target: CommentTarget,
    input: { text: string; author: AuthUser },
  ): Promise<void>;
}
