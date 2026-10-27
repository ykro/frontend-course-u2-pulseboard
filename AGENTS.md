# AGENTS.md — Reglas para asistentes de IA en PulseBoard (Curso 2, Unidad 2)

Este archivo le da contexto permanente a cualquier asistente de código que trabaje en el repositorio. Es una base: como parte de tu entrega debes ampliarlo con al menos una regla propia (ver `ARCHITECTURE_DECISIONS.md`, pregunta 5).

## 1. Entorno y comandos

- Node 24 (`.nvmrc`) y npm. Instala con `npm ci`; no cambies versiones ni agregues dependencias sin que la persona lo pida.
- Comandos: `npm run dev`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run format`, `npm run verify`.
- `src/api/schema.ts` se genera con `npm run gen:api` desde `openapi.json`. Nunca se edita a mano ni se escriben tipos de la API "a ojo".

## 2. Capas y fronteras

- Los componentes y hooks no importan `firebase/*` ni llaman a `fetch`: todo pasa por `useServices()` (`auth`, `comments`, `api`). El SDK de Firebase solo aparece en `src/firebase/`.
- `src/main.tsx` es la única raíz de composición: según `readConfig` (`src/config.ts`) arranca en modo demo, mixto (Firebase real con la API REST simulada por MSW) o completo.
- `mocks/` y `tests/` (fuera de `tests/student/`) son oficiales: no se modifican.

## 3. Estado de servidor con TanStack Query

- Los datos del Sandbox viven en la caché de TanStack Query, nunca copiados a `useState` con `useEffect`.
- Toda `queryKey` de tareas sale de `taskKeys` (`src/tasks/taskKeys.ts`) e incluye todo lo que cambia el resultado (tablero y filtros).
- Después de una mutación se invalidan las listas afectadas con el prefijo más específico que las cubre (`taskKeys.lists(boardId)`), no toda la caché.
- `isPending` (sin datos todavía) e `isFetching` (petición en curso, quizá con datos en pantalla) son estados distintos y se pintan distinto.

## 4. Firebase

- `onAuthStateChanged` y `subscribe` (equivalente a `onSnapshot`) devuelven una función para dejar de escuchar: todo `useEffect` que se suscribe la retorna como limpieza.
- Mientras la sesión está en `"loading"` no se redirige ni se muestran datos privados.
- El ID token se pide con `getIdToken()` en cada petición. Prohibido guardarlo en `localStorage`, `sessionStorage` o variables de módulo.

## 5. Seguridad web

- Prohibido `dangerouslySetInnerHTML`: los comentarios y títulos se pintan como texto.
- Solo variables `VITE_*` públicas en el cliente; ningún secreto en el código ni en `.env.example`.
- El parámetro `?next=` del login se valida con `safeNextPath` (sin redirecciones a otros sitios).

## 6. Pruebas

- Tests con Vitest y Testing Library; consultas por rol y nombre accesible (`getByRole`), no por clases CSS.
- La red se simula con MSW (`tests/setup.ts`): ningún test hace peticiones reales. Firebase se reemplaza por los fakes de `mocks/`.
- Ningún código de `src/` puede detectar si corre bajo pruebas.

## 7. Reglas propias del alumno

(Agrega aquí tus reglas y explica su efecto en `ARCHITECTURE_DECISIONS.md`.)
