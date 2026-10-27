import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "../auth/AuthRepository";
import type {
  Comment,
  CommentsRepository,
  CommentTarget,
} from "../comments/CommentsRepository";

interface CommentDoc {
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Timestamp | null;
}

/** Implementación real: comentarios en vivo con onSnapshot. */
export class FirestoreCommentsRepository implements CommentsRepository {
  private readonly db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  private commentsOf({ boardId, taskId }: CommentTarget) {
    return collection(this.db, "boards", boardId, "tasks", taskId, "comments");
  }

  subscribe(
    target: CommentTarget,
    onChange: (comments: Comment[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    const latest = query(
      this.commentsOf(target),
      orderBy("createdAt", "asc"),
      limit(200),
    );
    return onSnapshot(
      latest,
      (snapshot) =>
        onChange(
          snapshot.docs.map((doc) => {
            // "estimate" da una hora local mientras el servidor confirma.
            const data = doc.data({
              serverTimestamps: "estimate",
            }) as CommentDoc;
            return {
              id: doc.id,
              authorId: data.authorId,
              authorName: data.authorName,
              text: data.text,
              createdAt: data.createdAt?.toMillis() ?? Date.now(),
            };
          }),
        ),
      onError,
    );
  }

  async add(
    target: CommentTarget,
    input: { text: string; author: { uid: string; displayName: string } },
  ): Promise<void> {
    await addDoc(this.commentsOf(target), {
      authorId: input.author.uid,
      authorName: input.author.displayName,
      text: input.text,
      createdAt: serverTimestamp(),
    });
  }
}
