import { setupWorker } from "msw/browser";
import { createSandboxClient } from "../src/api/client";
import type { AuthUser } from "../src/auth/AuthRepository";
import type { CommentTarget } from "../src/comments/CommentsRepository";
import type { Services } from "../src/services";
import { FakeAuthRepository } from "./fakeAuth";
import { FakeCommentsRepository } from "./fakeComments";
import { createSandboxHandlers } from "./handlers";
import { ANA, LUIS } from "./users";

/**
 * Arranca el Sandbox simulado en el navegador (Service Worker de MSW,
 * public/mockServiceWorker.js). En el modo mixto acepta además el ID token
 * de tu Firebase real; las peticiones a Firebase pasan sin tocarse.
 */
export async function startDemoSandbox(
  options: { acceptFirebaseTokens?: boolean } = {},
): Promise<void> {
  const worker = setupWorker(
    ...createSandboxHandlers({ latencyMs: 400, ...options }),
  );
  await worker.start({ onUnhandledFrame: "bypass", quiet: true });
}

interface BroadcastComment {
  target: CommentTarget;
  text: string;
  author: AuthUser;
}

/**
 * En el modo demo, dos pestañas del mismo navegador comparten los
 * comentarios por BroadcastChannel: así se ve el "en vivo" en la demo
 * (por ejemplo, Ana en una ventana y Luis en otra).
 */
class BroadcastComments extends FakeCommentsRepository {
  private readonly channel = new BroadcastChannel("pulseboard-demo");

  constructor() {
    super();
    this.channel.onmessage = (event: MessageEvent<BroadcastComment>) => {
      const { target, text, author } = event.data;
      this.pushFromTeammate(target, text, author);
    };
  }

  override async add(
    target: CommentTarget,
    input: { text: string; author: AuthUser },
  ): Promise<void> {
    await super.add(target, input);
    const message: BroadcastComment = { target, ...input };
    this.channel.postMessage(message);
  }
}

/** Servicios del modo demo: Firebase falso y el Sandbox simulado. */
export function createDemoServices(): Services {
  const auth = new FakeAuthRepository();
  const comments = new BroadcastComments();
  comments.seed({ boardId: "producto", taskId: "t-102" }, [
    { text: "Ya tengo los datos de la última semana.", author: LUIS },
    { text: "Perfecto, los reviso en la tarde.", author: ANA },
  ]);
  return {
    mode: "demo",
    auth,
    comments,
    api: createSandboxClient(window.location.origin, auth),
  };
}
