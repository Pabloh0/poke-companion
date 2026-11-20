# 08 · Estrategia de pruebas

> Última actualización: 2026-11-20

## Qué se comprueba hoy

| Comprobación     | Herramienta             | Dónde      |
| ---------------- | ----------------------- | ---------- |
| Estilo y errores | ESLint (config de Next) | Local y CI |
| Tipos            | `next typegen` + `tsc`  | Local y CI |
| Formato          | Prettier                | Local y CI |
| Tests unitarios  | Vitest                  | Local y CI |
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

Verificación de la Pokédex de extremo a extremo, con una réplica local de
Supabase (PostgreSQL 17 + PostgREST 13 + un proxy que imita su pasarela:
clave publicable → rol `anon`, `max_rows = 1000`), build de producción y Chrome:

- Sin clave la API responde 401; `anon` no puede escribir.
- Pedir 2000 filas devuelve solo 1000 de 1025: la paginación es necesaria, y
  la página recibe las 1025 (aparece Pecharunt, #1025).
- `/es/pokedex` y `/en/pokedex` se prerenderizan como estáticas.
- Búsqueda por nombre ("chu"), por número ("#25") y sin acentos ("flabebe");
  Agua + Volador + Hoenn → Wingull y Pelipper; un tercer tipo queda bloqueado.
- La URL con filtros, abierta en otra pestaña, restaura los mismos filtros.
- Estado vacío y "Quitar filtros"; los sprites cargan; sin errores en consola.
- Cabecera completa visible a 360 y 390 px.

Verificación del rediseño (misma réplica de Supabase, build de producción,
Chrome):

- Tema claro por defecto; capturas en claro, oscuro, escritorio y móvil.
- Efecto holográfico: al pasar el ratón la carta se inclina y la lámina se
  activa; con «reducir movimiento» la carta queda plana (`transform: none`).
- Pestañas de generación con el teclado (flechas): cambian el filtro y la URL.
- Sin scroll horizontal a 360 y 390 px (medido contra el ancho fijo, no contra
  la ventana, que el modo móvil puede ensanchar); el abanico del inicio no
  tapa el texto.
- Sin errores en consola ni respuestas fallidas al cargar inicio y Pokédex.

Tests unitarios actuales (`npm run test`, 28): transformación de datos de
PokeAPI (12), conexión segura (4) y filtros y rareza de la Pokédex (12).

## Qué se añadirá y cuándo

| Nivel             | Herramienta                  | Para qué                                                   | Desde  |
| ----------------- | ---------------------------- | ---------------------------------------------------------- | ------ |
| Unitarias         | **Vitest** ✅                | Lógica pura: importación, filtros, tipos, parseo Showdown  | Fase 2 |
| Componentes       | Vitest + **Testing Library** | Componentes interactivos (filtros, editor de equipo)       | Fase 2 |
| Base de datos     | **pgTAP** (Supabase CLI)     | Que las políticas RLS bloquean lo que deben                | Fase 6 |
| Extremo a extremo | **Playwright**               | Flujos críticos: buscar Pokémon, crear y guardar un equipo | Fase 3 |
| Accesibilidad     | `@axe-core/playwright`       | Detectar problemas de accesibilidad en cada página         | Fase 3 |

## Criterios

- Una funcionalidad **no está terminada** hasta que CI está en verde y se ha
  comprobado en el navegador.
- La lógica de negocio va en funciones puras dentro de `features/*/lib/` para
  poder testearla sin navegador ni base de datos.
- Cada bug corregido añade un test que lo reproduce cuando sea viable.
- Se prioriza testear lo que más duele si se rompe: cálculos de tipos,
  permisos de datos de usuario y guardado de equipos.
