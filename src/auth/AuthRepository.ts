/** Persona autenticada, sin detalles del SDK de Firebase. */
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

export type Unsubscribe = () => void;

/**
 * Frontera con Firebase Auth. La app solo conoce esta interfaz:
 * en ejecución la implementa FirebaseAuthRepository y en los tests
 * (y en el modo demo) FakeAuthRepository, en memoria.
 */
export interface AuthRepository {
  /** Avisa el estado inicial (de forma asíncrona) y cada cambio. */
  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  /** ID token vigente, o null si no hay sesión. */
  getIdToken(): Promise<string | null>;
}

/** Error de acceso con un mensaje en español para mostrar. */
export class AuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}
