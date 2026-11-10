# PulseBoard — Proyecto base del alumno (Curso 2, Unidad 2)

PulseBoard es el tablero de tareas de un equipo. Las tareas viven en el API "Sandbox" del curso (FastAPI, descrito en `openapi.json`) y los comentarios de cada tarea viven en Firestore, en vivo. La sesión la maneja Firebase Auth. El acceso, el encabezado y la navegación entre tableros ya funcionan. Tu trabajo tiene dos partes: el **taller guiado** y el **reto autónomo**.

## Primeros pasos

```bash
npm ci              # instala las versiones exactas de package-lock.json (Node 24, ver .nvmrc)
npm test            # al inicio: 5 tests en verde (demo y modos de arranque), el resto en rojo
npm run dev         # app en http://localhost:5173 en modo demo
```

Sin variables de entorno la app arranca en **modo demo** (ver la tabla de modos más abajo). Abre `/login` y entra con `ana@pulseboard.dev` o `luis@pulseboard.dev` y la contraseña `pulseboard-demo` (solo existe en el modo demo; hasta que hagas el reto R2, la app no te redirige sola al login). Cuando termines el paso 7 del taller, con dos pestañas del mismo navegador verás los comentarios llegar en vivo. Para usar tu propio proyecto de Firebase, copia `.env.example` a `.env.local` y completa las variables `VITE_*`.

### Modos de arranque

`src/config.ts` elige el modo según las variables de `.env.local` (todas públicas: terminan en el JavaScript del navegador, así que nunca pongas un secreto ahí).

| Modo | Variables | Auth y comentarios | API REST de tareas | Para qué sirve |
| :--- | :--- | :--- | :--- | :--- |
| Demo | Ninguna (o falta alguna `VITE_FIREBASE_*`) | Fakes en memoria; cuentas `ana@pulseboard.dev` y `luis@pulseboard.dev` con `pulseboard-demo` | Simulada con MSW en tu navegador | Clase, taller y reto, sin cuentas ni credenciales |
| Mixto | Las cuatro `VITE_FIREBASE_*` de tu proyecto y `VITE_SANDBOX_URL` vacía | Tu Firebase real (Auth con correo y contraseña, Firestore con `firestore.rules`) | Simulada con MSW en tu navegador (`public/mockServiceWorker.js`), que acepta el ID token de tu Firebase | Probar Firebase de verdad sin tener un Sandbox desplegado |
| Completo | Las cuatro `VITE_FIREBASE_*` y `VITE_SANDBOX_URL` | Tu Firebase real | El Sandbox real en `VITE_SANDBOX_URL` | Producción o un Sandbox propio |

En el modo mixto el Sandbox simulado identifica a la persona leyendo el ID token sin verificar su firma (corre en tu propio navegador y solo sirve para practicar); un Sandbox real siempre verifica la firma. Las tareas simuladas viven en la memoria de la pestaña y se pierden al recargar; los comentarios sí quedan en tu Firestore.

Antes de entregar corre siempre `npm run verify` (tipos, lint, formato, tests y build).

## Estructura

| Ruta | Qué contiene |
| :--- | :--- |
| `openapi.json` | Contrato del Sandbox. `npm run gen:api` regenera `src/api/schema.ts` (no lo edites a mano) |
| `src/api/` | Cliente tipado (`openapi-fetch`), errores (`ApiError`) y tipos generados |
| `src/auth/` | `AuthRepository` (interfaz), `AuthProvider`, `useAuth`, guardia de ruta y validación de `?next=` |
| `src/comments/` | `CommentsRepository` (interfaz), vista del hilo de comentarios (ya hecha) y su hook (taller) |
| `src/firebase/` | Implementaciones reales con el SDK de Firebase (solo con configuración `VITE_*`) |
| `src/tasks/` | Llaves de consulta, consultas, mutación y componentes de la lista de tareas |
| `src/pages/` | Login, layout y página del tablero |
| `mocks/` | Sandbox simulado (MSW), Firebase falso y personas de demo. Oficial: no se modifica |
| `tests/` | Setup, utilidades y tests oficiales. Oficiales: no se modifican |
| `tests/student/` | Tus tests propios |
| `firestore.rules` | Reglas de seguridad de los comentarios |

## Estructura de tests

| Archivo | Qué contiene | Estado inicial |
| :--- | :--- | :--- |
| `tests/setup.ts` | Setup oficial: Testing Library, servidor MSW (una petición sin handler hace fallar el test) y reinicio del Sandbox | No lo modifiques |
| `tests/helpers.tsx` | `renderApp`, `createTestContext`, `providersFor`, `recordRequests`, `currentLocation` | No lo modifiques |
| `tests/demo.test.tsx` | 2 tests de la demo (login y estado inicial de la sesión) | Verde |
| `tests/config.test.ts` | 3 tests de infraestructura: qué modo de arranque elige `src/config.ts` y que el Sandbox simulado acepte el ID token en el modo mixto | Verde |
| `tests/workshop.test.tsx` | 20 tests del taller guiado | Rojo |
| `tests/challenge.test.tsx` | 5 tests **públicos** del reto (una muestra) | Rojo |
| `tests/student/my-scenarios.test.tsx` | Tus tests propios (2 plantillas que fallan) | Rojo |

Al empezar, `npm test` muestra **5 tests en verde**: los únicos que prueban código ya entregado (la demo y la infraestructura de arranque). Todo lo que está en rojo es trabajo tuyo.

| Test en verde desde el inicio | Archivo |
| :--- | :--- |
| "muestra 'Verificando sesión' hasta que Firebase responde y luego el formulario" | `tests/demo.test.tsx` |
| "inicia sesión y muestra el correo de la persona en el encabezado" | `tests/demo.test.tsx` |
| "sin las cuatro variables de Firebase arranca en modo demo" | `tests/config.test.ts` |
| "con Firebase y sin VITE_SANDBOX_URL usa el modo mixto; con ella, el completo" | `tests/config.test.ts` |
| "en el modo mixto el Sandbox simulado acepta el ID token de Firebase" | `tests/config.test.ts` |

Los archivos oficiales (`tests/` fuera de `tests/student/`, `mocks/`, la configuración y `.github/workflows/ci.yml`) no se modifican. Cambiarlos cuenta como sospecha de integridad en la rúbrica.

## Parte 1. Taller guiado (60 minutos)

Trabaja en la raíz de tu repositorio y sigue el codelab publicado en el material de la unidad. Implementarás, con el código guiado paso a paso:

1. `bearerTokenMiddleware` en `src/api/client.ts`: adjunta `Authorization: Bearer <ID token>` en cada petición.
2. `taskKeys` en `src/tasks/taskKeys.ts` y `fetchTasks` en `src/tasks/useTasks.ts`.
3. `useTasks` en `src/tasks/useTasks.ts`: la consulta con `useQuery` (la política de reintento de `src/queryClient.ts` ya viene hecha: una vez y solo ante un 5xx o una falla de red).
4. `TaskListView` en `src/tasks/TaskListView.tsx`: estados de carga, error, vacío y actualización en segundo plano.
5. `useTaskComments` en `src/comments/useTaskComments.ts`: comentarios en vivo con `comments.subscribe` (equivale a `onSnapshot`), que se cancela al desmontar y al cambiar de tarea. El hilo `CommentThread` ya está hecho y usa tu hook.

Al terminar, `tests/demo.test.tsx`, `tests/config.test.ts` y `tests/workshop.test.tsx` quedan en verde.

## Parte 2. Reto autónomo: crear tareas y ruta protegida

Calcula entre 2 y 3 horas para el reto, más 45 minutos para tus tests propios y 45 minutos para los documentos. En total, de 3 h 30 min a 4 h 30 min (270 minutos como máximo). Son dos partes (R1 y R2) y no hay código guiado. Los archivos del reto ya existen con un marcador "Pendiente (reto)"; puedes agregar funciones y archivos dentro de `src/`, pero respeta los nombres exportados y los textos de esta sección: los tests buscan los elementos por su rol y su nombre accesible.

### R1. Crear tareas con `useMutation` (`src/tasks/useCreateTask.ts` y `src/tasks/NewTaskForm.tsx`)

`useCreateTask(boardId)` devuelve el resultado de `useMutation` y envía `POST /api/v1/boards/{boardId}/tasks` con el cuerpo `{ title, priority, assignee }` (tipo `NewTaskInput`) usando el cliente tipado de `useServices().api`. Si el servidor no responde 201, la mutación falla con un `ApiError` (usa `toApiError` de `src/api/errors.ts`), cuyo `message` es el mensaje en español del servidor.

**Actualización optimista**

1. Antes de enviar, cancela las consultas en curso de las listas del tablero (`taskKeys.lists(boardId)`): una respuesta vieja no puede borrar el cambio optimista.
2. Agrega una tarea provisional al inicio de cada lista en caché de **ese tablero cuyos filtros la incluirían** y suma 1 a su `total`. La tarea provisional tiene `status: "todo"`, los datos enviados y un `id` que empieza con `OPTIMISTIC_PREFIX` (`src/tasks/optimistic.ts`): `TaskRow` la pinta con el texto "Guardando..." y sin botón de comentarios. Una lista con `status` distinto de `todo`, o con `assignee` distinto del de la tarea, no la recibe.
3. Si el servidor responde error, **todas** las listas que cambiaste (estén o no en pantalla) vuelven exactamente a como estaban.
4. Al terminar, con éxito **o** con error, invalida las listas de ese tablero (`taskKeys.lists(boardId)`), incluidas las que no están en pantalla, y ninguna lista de otro tablero.

**Formulario `NewTaskForm`** (formulario con nombre accesible "Nueva tarea")

| Elemento | Contrato |
| :--- | :--- |
| Campo "Título" | Se envía sin espacios al inicio ni al final |
| Selector "Prioridad" | Opciones "Baja", "Media" (inicial) y "Alta": `low`, `medium`, `high` |
| Casilla "Asignarme a mí" | Marcada al inicio. Marcada: `assignee` es el correo de la sesión; sin marcar: `null` |
| Botón "Crear tarea" | Deshabilitado si el título queda vacío al recortarlo **o** mientras la mutación está en curso (un doble clic crea una sola tarea) |
| Éxito | El campo "Título" queda vacío |
| Error | Un elemento con rol `alert` dentro del formulario muestra "No se pudo crear la tarea." seguido del mensaje del servidor. El título escrito se conserva para corregirlo |

### R2. Ruta protegida y redirección segura (`src/auth/RequireAuth.tsx` y `src/auth/safeNextPath.ts`)

`RequireAuth` envuelve las rutas privadas:

- Mientras `useAuth().status` es `"loading"` (Firebase todavía no responde), muestra "Verificando sesión..." con rol `status` y **no** redirige.
- Sin sesión, redirige con `replace` a `/login?next=<ruta pedida>`, donde la ruta pedida es el `pathname` más la query string (`?status=done&task=t-1`), codificada con `encodeURIComponent`.
- Con sesión, muestra el contenido.

`safeNextPath(next)` decide a dónde vuelve el login (ya lo usa `LoginPage`): devuelve `next` solo si es una ruta interna de esta app (empieza con una sola `/`, no cambia de origen y, ya normalizada, tampoco empieza con `//`, como pasa con `/.//dominio` o `/a/..//dominio`), conservando su query string y su fragmento. Para `null`, otro dominio (`https://...`, `//dominio`, `/\dominio`), esquemas como `javascript:` o rutas relativas sin `/` inicial, devuelve `DEFAULT_PATH`.

**Restricciones de arquitectura** (ver `AGENTS.md`): los componentes no importan `firebase/*` ni hacen `fetch` directo; todo pasa por `useServices()`. El ID token no se guarda en `localStorage`, `sessionStorage` ni en variables de módulo. Ninguna `queryKey` de tareas se escribe a mano: todas salen de `taskKeys`.

### Tus tests propios

Tus tests propios suman si pasan contra la solución de referencia y detectan mutantes que la suite pública no detecta (errores sembrados en el reto). Reescribir un test público no suma. Los errores sembrados se agrupan por concepto: varios errores del mismo concepto cuentan como uno, así que dos tests que atrapan el mismo concepto valen la mitad. Para el puntaje completo, detecta errores de 2 conceptos distintos del reto. Reemplaza las 2 plantillas de `tests/student/my-scenarios.test.tsx` por al menos 2 tests con nombres que digan qué verifican. Usa las utilidades de `tests/helpers.tsx` y no uses la red.

### Decisiones y checklist

Responde `ARCHITECTURE_DECISIONS.md` (incluye ampliar `AGENTS.md` con una regla propia y la declaración de uso de IA) y marca con criterio `SECURITY_AND_QUALITY.md`.

## Rúbrica (100 puntos)

| Componente | Puntos | Cómo se mide |
| :--- | ---: | :--- |
| Taller guiado | 20 | `tests/workshop.test.tsx`, proporcional |
| Reto, tests públicos | 10 | `tests/challenge.test.tsx`, proporcional |
| Reto, contrato completo | 30 | los casos del contrato que los tests públicos no cubren, con más bordes y datos distintos, proporcional |
| Tests propios | 15 | pasan contra la referencia y detectan mutantes que la suite pública no detecta; los errores sembrados se agrupan por concepto: 2 conceptos distintos detectados = completo, 1 = mitad |
| ADR y checklist | 15 | revisión manual con rúbrica: ADR 10, checklist `SECURITY_AND_QUALITY.md` 2, sección propia de `AGENTS.md` 2 y declaración de uso de IA 1 |
| Calidad e integridad | 10 | `typecheck`, `lint` y `format:check` limpios (5) + sin sospechas de integridad (5) |
| **Total** | **100** | |

**La CI no es todo el reto.** El workflow de GitHub Actions corre los tests oficiales y te da retroalimentación, pero los tests públicos del reto son una muestra: el contrato completo tiene más casos borde y otros datos. Memorizar las respuestas de `tests/challenge.test.tsx` o detectar si el código corre bajo Vitest no sirve. Implementa el contrato completo y pruébalo con tus propios casos.

Se marca como sospecha de integridad: modificar tests oficiales, `mocks/`, la configuración o el workflow, y que `src/` o tus tests usen `eval`, `Function`, `import()` dinámico, módulos de Node como `fs` o `child_process`, o mencionen el runner de pruebas.

## Uso de asistentes de IA

Puedes usar asistentes de IA. Eres responsable de todo lo que entregas: revisa que el código cumpla el contrato y `AGENTS.md`, y declara cómo los usaste en `ARCHITECTURE_DECISIONS.md`.
