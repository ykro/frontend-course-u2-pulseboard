# PulseBoard

Tablero de tareas de un equipo: tareas desde el API Sandbox del curso y comentarios en vivo en Firestore (React, TanStack Query, Firebase).

## Unidad 2

Plantilla de la Unidad 2 del curso.

## Requisitos

- Node.js 24 (versión en `.nvmrc`).

## Instalar y correr

```bash
npm ci
npm run dev
```

La app queda en http://localhost:5173. En modo demo entra en `/login` con `ana@pulseboard.dev` y la contraseña `pulseboard-demo`.
Sin variables de entorno arranca en modo demo, con cuentas y datos de prueba. Para usar tu propio Firebase, copia `.env.example` a `.env.local` y completa las variables `VITE_*`.

## Tests

```bash
npm test             # solo los tests
npm run verify       # chequeo completo
```

El archivo `AGENTS.md` trae las reglas para el asistente de IA.

El enunciado del reto, la rúbrica y la guía paso a paso están en el curso.
