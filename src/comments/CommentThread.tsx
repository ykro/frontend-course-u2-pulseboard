import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/authContext";
import { useServices } from "../services";
import type { CommentTarget } from "./CommentsRepository";
import { useTaskComments } from "./useTaskComments";

const timeFormat = new Intl.DateTimeFormat("es-GT", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Hilo de comentarios en vivo de una tarea (ya hecho). Los comentarios llegan
 * de useTaskComments (taller, parte 5) y se pintan como texto, nunca como HTML.
 */
export function CommentThread({
  target,
  taskTitle,
  onClose,
}: {
  target: CommentTarget;
  taskTitle: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { comments: repository } = useServices();
  const state = useTaskComments(target);
  const [draft, setDraft] = useState("");
  const send = useMutation({
    mutationFn: (text: string) => {
      if (user === null) throw new Error("No hay sesión activa.");
      return repository.add(target, { text, author: user });
    },
    onSuccess: () => setDraft(""),
  });

  const text = draft.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (text.length === 0 || send.isPending) return;
    send.mutate(text);
  }

  return (
    <section
      aria-label={`Comentarios de ${taskTitle}`}
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          Comentarios de {taskTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
        >
          Cerrar comentarios
        </button>
      </div>
      {state.status === "loading" && (
        <p role="status" className="text-sm text-slate-500">
          Cargando comentarios...
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-700">
          No se pudieron cargar los comentarios.
        </p>
      )}
      {state.status === "ready" && state.comments.length === 0 && (
        <p className="text-sm text-slate-500">Todavía no hay comentarios.</p>
      )}
      {state.status === "ready" && state.comments.length > 0 && (
        <ul aria-label="Comentarios" className="flex flex-col gap-2">
          {state.comments.map((comment) => (
            <li key={comment.id} className="rounded-md bg-slate-50 p-2 text-sm">
              <p className="font-semibold text-slate-800">
                {comment.authorName}{" "}
                <span className="font-normal text-slate-500">
                  {timeFormat.format(comment.createdAt)}
                </span>
              </p>
              <p className="whitespace-pre-wrap text-slate-700">
                {comment.text}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Nuevo comentario
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={500}
            rows={2}
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          disabled={text.length === 0 || send.isPending}
          className="self-end rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Comentar
        </button>
        {send.isError && (
          <p role="alert" className="text-sm text-red-700">
            No se pudo enviar el comentario.
          </p>
        )}
      </form>
    </section>
  );
}
