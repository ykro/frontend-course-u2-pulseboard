import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { createSandboxClient } from "../api/client";
import type { AppConfig } from "../config";
import type { Services } from "../services";
import { FirebaseAuthRepository } from "./FirebaseAuthRepository";
import { FirestoreCommentsRepository } from "./FirestoreCommentsRepository";

/**
 * Servicios con Firebase real (Auth y Firestore). Se usa en el modo mixto
 * (la API REST la simula MSW en el mismo origen) y en el modo completo.
 */
export function createFirebaseServices(
  config: Exclude<AppConfig, { mode: "demo" }>,
  sandboxUrl: string,
): Services {
  const app = initializeApp(config.firebase);
  const auth = new FirebaseAuthRepository(getAuth(app));
  return {
    mode: config.mode,
    auth,
    comments: new FirestoreCommentsRepository(getFirestore(app)),
    api: createSandboxClient(sandboxUrl, auth),
  };
}
