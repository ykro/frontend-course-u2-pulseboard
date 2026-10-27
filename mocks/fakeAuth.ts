import {
  AuthError,
  type AuthRepository,
  type AuthUser,
  type Unsubscribe,
} from "../src/auth/AuthRepository";
import { DEMO_PASSWORD, DEMO_USERS, demoToken } from "./users";

type Listener = (user: AuthUser | null) => void;

/**
 * Firebase Auth falso, en memoria. Igual que el SDK real, avisa el
 * estado inicial de forma asíncrona: hasta entonces la app está en
 * "loading". Con deferInitialState el test decide cuándo responde.
 */
export class FakeAuthRepository implements AuthRepository {
  private user: AuthUser | null;
  private resolved: boolean;
  private tokenVersion = 1;
  private readonly listeners = new Set<Listener>();

  constructor(
    options: {
      initialUser?: AuthUser | null;
      deferInitialState?: boolean;
    } = {},
  ) {
    this.user = options.initialUser ?? null;
    this.resolved = !(options.deferInitialState ?? false);
  }

  onAuthStateChanged(listener: Listener): Unsubscribe {
    this.listeners.add(listener);
    if (this.resolved) {
      queueMicrotask(() => {
        if (this.listeners.has(listener)) listener(this.user);
      });
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Simula que Firebase termina de restaurar la sesión guardada. */
  resolveInitialState(): void {
    this.resolved = true;
    this.emit();
  }

  async signIn(email: string, password: string): Promise<void> {
    await Promise.resolve();
    const user = DEMO_USERS.find((candidate) => candidate.email === email);
    if (user === undefined || password !== DEMO_PASSWORD) {
      throw new AuthError(
        "auth/invalid-credential",
        "Correo o contraseña incorrectos.",
      );
    }
    this.user = user;
    this.resolved = true;
    this.emit();
  }

  async signOut(): Promise<void> {
    await Promise.resolve();
    this.user = null;
    this.emit();
  }

  getIdToken(): Promise<string | null> {
    return Promise.resolve(
      this.user === null ? null : demoToken(this.user.uid, this.tokenVersion),
    );
  }

  /** Simula que Firebase renovó el ID token (vence cada hora). */
  rotateToken(): void {
    this.tokenVersion += 1;
  }

  get listenerCount(): number {
    return this.listeners.size;
  }

  private emit(): void {
    for (const listener of [...this.listeners]) listener(this.user);
  }
}
