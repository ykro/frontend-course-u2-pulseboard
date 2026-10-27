import type { AuthUser, Unsubscribe } from "../src/auth/AuthRepository";
import type {
  Comment,
  CommentsRepository,
  CommentTarget,
} from "../src/comments/CommentsRepository";

interface Subscription {
  key: string;
  onChange: (comments: Comment[]) => void;
  onError: (error: Error) => void;
  active: boolean;
}

function keyOf({ boardId, taskId }: CommentTarget): string {
  return `${boardId}/${taskId}`;
}

/**
 * Firestore falso para comentarios. Como onSnapshot, entrega la lista
 * completa de forma asíncrona al suscribirse y en cada cambio. Lleva la
 * cuenta de suscripciones activas: un componente que no llama a
 * unsubscribe al desmontar deja una suscripción viva (fuga).
 */
export class FakeCommentsRepository implements CommentsRepository {
  private readonly data = new Map<string, Comment[]>();
  private readonly subscriptions = new Set<Subscription>();
  private readonly failures = new Map<string, Error>();
  private nextId = 1;
  private clock = Date.parse("2027-02-01T16:00:00Z");

  subscribe(
    target: CommentTarget,
    onChange: (comments: Comment[]) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    const subscription: Subscription = {
      key: keyOf(target),
      onChange,
      onError,
      active: true,
    };
    this.subscriptions.add(subscription);
    queueMicrotask(() => this.deliver(subscription));
    return () => {
      subscription.active = false;
      this.subscriptions.delete(subscription);
    };
  }

  async add(
    target: CommentTarget,
    input: { text: string; author: AuthUser },
  ): Promise<void> {
    await Promise.resolve();
    this.append(target, input.text, input.author);
  }

  /** Precarga comentarios sin notificar (antes de montar la vista). */
  seed(target: CommentTarget, items: { text: string; author: AuthUser }[]) {
    for (const item of items) this.store(target, item.text, item.author);
  }

  /** Simula que otra persona comenta desde otro navegador. */
  pushFromTeammate(target: CommentTarget, text: string, author: AuthUser) {
    this.append(target, text, author);
  }

  /** Simula un error de las reglas de seguridad al suscribirse. */
  failSubscriptions(target: CommentTarget, error: Error) {
    this.failures.set(keyOf(target), error);
  }

  /** Suscripciones vivas, en total o para una tarea. */
  activeSubscriptions(target?: CommentTarget): number {
    const key = target === undefined ? null : keyOf(target);
    return [...this.subscriptions].filter(
      (subscription) => key === null || subscription.key === key,
    ).length;
  }

  commentsOf(target: CommentTarget): Comment[] {
    return [...(this.data.get(keyOf(target)) ?? [])];
  }

  private store(target: CommentTarget, text: string, author: AuthUser) {
    const key = keyOf(target);
    this.clock += 60_000;
    const comment: Comment = {
      id: `c-${this.nextId++}`,
      authorId: author.uid,
      authorName: author.displayName,
      text,
      createdAt: this.clock,
    };
    this.data.set(key, [...(this.data.get(key) ?? []), comment]);
  }

  private append(target: CommentTarget, text: string, author: AuthUser) {
    this.store(target, text, author);
    const key = keyOf(target);
    for (const subscription of [...this.subscriptions]) {
      if (subscription.key === key) {
        queueMicrotask(() => this.deliver(subscription));
      }
    }
  }

  private deliver(subscription: Subscription) {
    if (!subscription.active) return;
    const failure = this.failures.get(subscription.key);
    if (failure !== undefined) {
      subscription.active = false;
      this.subscriptions.delete(subscription);
      subscription.onError(failure);
      return;
    }
    subscription.onChange([...(this.data.get(subscription.key) ?? [])]);
  }
}
