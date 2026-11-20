# 08 · Estrategia de pruebas

> Última actualización: 2026-11-20

## Qué se comprueba hoy

| Comprobación     | Herramienta             | Dónde      |
| ---------------- | ----------------------- | ---------- |
| Estilo y errores | ESLint (config de Next) | Local y CI |
| Tipos            | `next typegen` + `tsc`  | Local y CI |
| Formato          | Prettier                | Local y CI |
| Que compila      | `next build`            | CI         |

Verificación manual realizada al cerrar la fase 1 (build de producción con
`next start`):

- `/` responde 200 en español y `/en` en inglés, con `<html lang>` correcto.
- Navegador en inglés visitando `/` → redirige a `/en`; con la cookie
  `NEXT_LOCALE=es` se respeta la elección.
- `/es` redirige a `/` (el prefijo del idioma por defecto sobra).
- Direcciones inexistentes (`/no-existe`, `/en/nope`) → **404** con la página
  completa.
- Los 18 chips de tipo se renderizan; el selector de idioma marca el actual.
- Captura visual en tema oscuro y claro, escritorio y móvil.

Verificación de la fase 2 (base de datos), contra un PostgreSQL 17 real local
con los roles `anon` y `authenticated` de Supabase simulados:

- La migración se aplica con un rol **no superusuario** (como en Supabase).
- La importación completa tarda ~2 s y, ejecutada **dos veces**, deja
  exactamente los mismos datos (idempotente).
- Si la importación falla en el último paso, **no queda ningún cambio**
  (transacción revertida).
- `anon` puede leer; `insert`, `update` y `delete` dan _permission denied_.
- Todas las tablas de `public` tienen RLS activado.

Tests unitarios actuales (`npm run test`): transformación de datos de PokeAPI
(12) y configuración segura de la conexión (4).

## Qué se añadirá y cuándo

| Nivel             | Herramienta                  | Para qué                                                        | Desde  |
| ----------------- | ---------------------------- | --------------------------------------------------------------- | ------ |
| Unitarias         | **Vitest**                   | Lógica pura: multiplicadores de tipos, filtros, parseo Showdown | Fase 2 |
| Componentes       | Vitest + **Testing Library** | Componentes interactivos (filtros, editor de equipo)            | Fase 2 |
| Base de datos     | **pgTAP** (Supabase CLI)     | Que las políticas RLS bloquean lo que deben                     | Fase 6 |
| Extremo a extremo | **Playwright**               | Flujos críticos: buscar Pokémon, crear y guardar un equipo      | Fase 3 |
| Accesibilidad     | `@axe-core/playwright`       | Detectar problemas de accesibilidad en cada página              | Fase 3 |

## Criterios

- Una funcionalidad **no está terminada** hasta que CI está en verde y se ha
  comprobado en el navegador.
- La lógica de negocio va en funciones puras dentro de `features/*/lib/` para
  poder testearla sin navegador ni base de datos.
- Cada bug corregido añade un test que lo reproduce cuando sea viable.
- Se prioriza testear lo que más duele si se rompe: cálculos de tipos,
  permisos de datos de usuario y guardado de equipos.
