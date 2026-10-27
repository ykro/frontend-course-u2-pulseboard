# Decisiones de arquitectura — PulseBoard (Curso 2, Unidad 2)

Responde con tus palabras y con ejemplos de tu propio código. Respuestas genéricas que podrían aplicar a cualquier proyecto reciben poco puntaje. Extensión sugerida: de 3 a 8 líneas por pregunta.

Puntaje (rúbrica manual de 15 puntos): preguntas 1 a 4, 10 puntos en total; pregunta 5 (tu sección de `AGENTS.md`), 2 puntos; pregunta 6 (declaración de uso de IA), 1 punto. El checklist `SECURITY_AND_QUALITY.md` vale los 2 puntos restantes.

## 1. Dividir los datos entre REST y Firestore

PulseBoard lee las tareas del Sandbox (REST con TanStack Query) y los comentarios de Firestore (suscripción en vivo). ¿Qué criterio usarías para decidir dónde vive un dato nuevo? Aplícalo a un caso concreto que no esté en la app (por ejemplo, el estado "en línea" de cada persona o el historial de cambios de una tarea) y explica qué perderías con la otra opción.

**Tu respuesta:**

> 

## 2. Llaves e invalidación

Muestra la `queryKey` de una lista filtrada de tu código. ¿Qué listas invalida tu `useCreateTask` al terminar y por qué ese prefijo y no `["tasks"]` ni la llave exacta de la lista en pantalla?

**Tu respuesta:**

> 

## 3. Actualización optimista y rollback

¿Qué guardas en `onMutate` para poder revertir? Describe qué pasa en tu implementación, paso a paso, si el servidor responde 500 mientras la persona tiene en caché las listas "Todas" y "Pendientes" del tablero.

**Tu respuesta:**

> 

## 4. Tus tests propios

Para cada test de `tests/student/my-scenarios.test.tsx`: ¿qué error plausible del reto atrapa? Describe un cambio concreto en `src/` que lo haría fallar.

**Tu respuesta:**

> 

## 5. Tu regla en AGENTS.md

Copia la regla que agregaste a `AGENTS.md`. Describe qué generó el asistente de IA antes de tener esa regla y qué cambió después (si no usaste asistente, explica qué error evitaría la regla).

**Tu respuesta:**

> 

## 6. Declaración de uso de IA

Completa con honestidad; declarar el uso no resta puntos, ocultarlo sí.

- Herramientas usadas (o "ninguna"):
- Partes del trabajo en las que las usaste:
- Algo que el asistente propuso y aceptaste después de verificarlo:
- Algo que el asistente propuso y corregiste o rechazaste, y por qué:
