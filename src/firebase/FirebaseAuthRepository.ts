import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  AuthError,
  type AuthRepository,
  type AuthUser,
  type Unsubscribe,
} from "../auth/AuthRepository";

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? user.email ?? "Sin nombre",
  };
}

/** Implementación real con el SDK modular de Firebase Auth. */
export class FirebaseAuthRepository implements AuthRepository {
  private readonly auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe {
    return onAuthStateChanged(this.auth, (user) =>
      listener(user === null ? null : toAuthUser(user)),
    );
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch {
      // No se distingue "usuario no existe" de "contraseña incorrecta":
      // hacerlo permite enumerar cuentas.
      throw new AuthError(
        "auth/invalid-credential",
        "Correo o contraseña incorrectos.",
      );
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  async getIdToken(): Promise<string | null> {
    // El SDK guarda el token en memoria y lo renueva antes de que venza.
    const user = this.auth.currentUser;
    return user === null ? null : user.getIdToken();
  }
}
