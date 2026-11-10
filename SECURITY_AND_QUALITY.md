# Checklist de seguridad y calidad — PulseBoard (Unidad 2)

Marca cada casilla solo si la verificaste en tu código y escribe la evidencia (archivo y función, comando o test). Una casilla marcada sin evidencia no cuenta. Vale 2 de los 15 puntos de la rúbrica manual.

- [ ] **Token fuera del almacenamiento.** El ID token se pide con `getIdToken()` en cada petición y no aparece en `localStorage`, `sessionStorage` ni en variables de módulo. Evidencia:
- [ ] **Sin XSS.** Ningún `dangerouslySetInnerHTML`; un comentario con HTML se ve como texto. Evidencia:
- [ ] **Redirección segura.** `?next=` solo acepta rutas internas (`//dominio`, `https://...` y `javascript:` vuelven a la ruta por defecto). Evidencia:
- [ ] **Sesión inicial.** La guardia no redirige mientras la sesión está en `"loading"`. Evidencia:
- [ ] **Sin fugas de suscripción.** Cada `subscribe` se cancela al desmontar y al cambiar de tarea. Evidencia:
- [ ] **Caché coherente.** Las `queryKey` salen de `taskKeys`; el rollback restaura todas las listas cambiadas y la invalidación cubre solo el tablero afectado. Evidencia:
- [ ] **Sin secretos en el bundle.** Solo variables `VITE_*` públicas; `.env.local` no se versiona; ningún componente importa `firebase/*`. Evidencia:
- [ ] **Datos de la sesión anterior.** Al cerrar sesión se limpia la caché de consultas. Evidencia:
- [ ] **Calidad.** `npm run verify` en verde y ningún archivo oficial modificado. Evidencia:
