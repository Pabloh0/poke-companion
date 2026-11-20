# 07 · Normas de código

> Última actualización: 2026-11-20

Las herramientas comprueban automáticamente casi todo lo de aquí. Antes de
subir cambios: `npm run check` (lint + tipos + formato). CI hace lo mismo y
además el build.

## Idioma

- **Código, nombres y comentarios en inglés** (convención del sector y lo que
  se espera en un portfolio).
- **Documentación y textos de la interfaz en español** (y su traducción en
  `en.json`).

## TypeScript

- Modo estricto, más `noUncheckedIndexedAccess`: `array[0]` es `T | undefined`
  y hay que comprobarlo.
- Prohibido `any`. Si un dato llega sin tipo (JSON, API), se valida y se tipa
  en el borde (más adelante con Zod).
- `type` para formas de datos y props; `interface` solo para ampliar tipos
  existentes (como `AppConfig` de next-intl).
- Constantes como listas cerradas con `as const` y tipos derivados de ellas
  (ver `POKEMON_TYPES` → `PokemonType`).
- Los helpers globales de Next (`PageProps<"/ruta">`, `LayoutProps<…>`) para
  tipar páginas y layouts.

## Nombres y archivos

| Qué                   | Convención         | Ejemplo          |
| --------------------- | ------------------ | ---------------- |
| Archivos y carpetas   | `kebab-case`       | `type-badge.tsx` |
| Componentes           | `PascalCase`       | `TypeBadge`      |
| Funciones y variables | `camelCase`        | `typeTextTone`   |
| Constantes globales   | `UPPER_SNAKE_CASE` | `POKEMON_TYPES`  |
| Tipos                 | `PascalCase`       | `PokemonType`    |

- Un componente principal por archivo; exportaciones con nombre (no `default`),
  salvo los archivos especiales de Next (`page`, `layout`, `not-found`…).
- Imports absolutos con `@/` para todo lo que no esté en la misma carpeta.

## React y Next.js

- **Server Component por defecto.** `"use client"` solo si hace falta estado,
  efectos, eventos o APIs del navegador, y lo más abajo posible del árbol.
- Leer datos en el servidor; nunca exponer claves secretas al cliente (solo
  variables `NEXT_PUBLIC_*` llegan al navegador).
- Con Cache Components: envolver en `<Suspense>` lo que lea datos por petición;
  marcar con `"use cache"` lo que pueda cachearse.
- Enlaces internos con `Link` de `@/i18n/navigation`, nunca de `next/link`
  (si no, se pierde el idioma).
- Archivos `proxy.ts` (no `middleware.ts`, obsoleto en Next 16).
- Un Server Component solo importa **componentes** de un archivo
  `"use client"`. Las constantes o funciones que necesite el servidor van en
  `lib/` o `data/`: importadas desde un archivo de cliente llegarían como
  referencia de cliente, no como el valor.

## Textos e idiomas

- **Ningún texto visible escrito en el JSX.** Todo va a `src/messages/es.json`
  y `en.json`, con la misma estructura de claves.
- Espacios de nombres por zona o funcionalidad (`Header`, `Home`, `Pokedex`…).
- Plurales y variables con sintaxis ICU: `"{count, plural, one {# Pokémon} other {# Pokémon}}"`.
- Si un Client Component nuevo usa traducciones, añadir su espacio de nombres
  al `NextIntlClientProvider` del layout.

## Estilos

- Tailwind para todo. Combinar clases condicionales con `cn()`.
- **Solo tokens**, nunca colores fijos en componentes: `bg-card`,
  `text-muted-foreground`, `bg-type-fire`… Si falta un token, se añade en
  `globals.css` y se documenta en `05-DesignSystem.md`.
- Clases completas en el código (Tailwind no detecta clases construidas con
  plantillas como `` `bg-type-${type}` ``).
- Prettier ordena las clases automáticamente.
- Una caja con scroll (`overflow-x-auto`) que contenga textos `sr-only` (u
  otros elementos con `position: absolute`) necesita `relative`; si no, esos
  elementos escapan de la caja y ensanchan toda la página.
- En rejillas, `minmax(0, 1fr)` (o `grid-cols-1`) cuando una columna contenga
  algo que se desliza: un `1fr` suelto crece hasta el ancho del contenido.
- Si un componente aparece a varios tamaños, que se adapte a **su** ancho con
  consultas de contenedor (`@container`), no al de la pantalla.

## Git

- Rama principal: `main`, siempre desplegable. Trabajo en ramas
  `feat/…`, `fix/…`, `docs/…`, `chore/…`, fusionadas con Pull Request y CI en verde.
- Mensajes con **Conventional Commits**:
  `feat(pokedex): add type filter`, `fix(i18n): keep path when switching language`,
  `docs: update roadmap`.
- Nunca subir `.env*` (salvo `.env.example`) ni claves.

## Comentarios

- Explican el **porqué**, no el qué. Si una decisión no es obvia (como el
  script del tema o el `global-not-found`), se comenta en el código y se
  enlaza a la documentación.
