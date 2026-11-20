# 03 · Arquitectura

> Última actualización: 2026-11-20

## Stack y versiones

| Pieza          | Versión           | Notas                                                                     |
| -------------- | ----------------- | ------------------------------------------------------------------------- |
| Node.js        | ≥ 22.12           | Lo exige Vitest 5; Node 20 ya no tiene soporte                            |
| Next.js        | 16.4.6            | App Router, Turbopack, Cache Components activado                          |
| React          | 19.3              |                                                                           |
| TypeScript     | 5.x               | `strict` + `noUncheckedIndexedAccess`                                     |
| Tailwind CSS   | 4.3               | Configuración en CSS (`globals.css`), sin `tailwind.config`               |
| shadcn/ui      | estilo `new-york` | Componentes copiados en `src/components/ui`                               |
| next-intl      | 4.15              | Rutas y traducciones                                                      |
| Supabase       | PostgreSQL 17     | Proyecto en West EU (París). Datos de referencia; autenticación en fase 6 |
| supabase-js    | 2.x               | Lectura desde la web con la clave publicable                              |
| Vitest         | 5.x               | Tests unitarios                                                           |
| Vercel         | —                 | Pendiente de conectar (usar región París, `cdg1`)                         |
| GitHub Actions | —                 | CI: lint, tipos, formato, tests y build                                   |

## Estructura de carpetas

Organización **por funcionalidad** (feature-oriented): el código de una
funcionalidad vive junto, y solo lo realmente compartido sale fuera.

```text
src/
├── app/                      Rutas. Solo archivos de routing (page, layout…)
│   ├── [locale]/             Todo cuelga del idioma
│   │   ├── layout.tsx        Layout raíz: <html>, fuentes, tema, cabecera, pie
│   │   ├── page.tsx          Inicio
│   │   ├── pokedex/page.tsx  Pokédex (listado con búsqueda y filtros)
│   │   └── not-found.tsx     404 dentro de la web (notFound() en una página)
│   ├── global-not-found.tsx  404 para direcciones que no existen en absoluto
│   └── globals.css           Tokens de diseño y Tailwind
├── components/
│   ├── ui/                   Primitivas de shadcn/ui (Button…)
│   └── layout/               Cabecera, pie, selector de idioma, tema
├── features/                 Una carpeta por funcionalidad
│   ├── pokedex/              components/, data/, lib/ (lógica pura), server/ (consultas)
│   └── types/                Tipos Pokémon: datos y componentes (TypeBadge)
├── fonts/                    Tipografías autoalojadas
├── i18n/                     routing.ts, navigation.ts, request.ts
├── messages/                 es.json (referencia) y en.json
├── config/                   Configuración del sitio
├── lib/
│   ├── supabase/             Cliente público y tipos generados de la base de datos
│   └── utils.ts              Utilidades genéricas (cn)
└── proxy.ts                  Se ejecuta antes de cada petición

scripts/
└── seed-pokedex/             Importación de datos de PokeAPI (ver 04-DatabaseDesign.md)
supabase/
├── config.toml               Configuración del CLI de Supabase
├── migrations/               Cambios de esquema versionados
└── certs/                    Certificado público de Supabase (para TLS)
```

Dentro de cada funcionalidad se repite el mismo patrón cuando haga falta:
`components/`, `data/` (constantes y tipos), `server/` (consultas y Server
Actions), `lib/` (lógica pura, fácil de testear).

**Regla**: una funcionalidad puede importar de `components/`, `lib/` y de otras
funcionalidades solo a través de lo que estas exponen. Si dos funcionalidades
necesitan lo mismo, se sube a `lib/` o `components/`.

## Modelo de renderizado

- **Server Components por defecto.** Solo se marca `"use client"` cuando hay
  interactividad (clics, estado, APIs del navegador): el selector de idioma, el
  botón de tema, el menú principal, el buscador de la Pokédex y el efecto
  holográfico de las cartas.
- **Cache Components** (`cacheComponents: true`). Es el modelo que Next.js 16
  trae activado por defecto y que será obligatorio en la próxima versión mayor:
  - Los datos son dinámicos por defecto; lo que se quiera cachear se marca con
    la directiva `"use cache"` (a nivel de página, componente o función).
  - Cada página tiene un "esqueleto" estático que se sirve al instante y las
    partes dinámicas llegan después en streaming (Partial Prerendering).
  - Implicación práctica: leer `cookies()`, `headers()`, `params` o hacer
    consultas sin cachear obliga a envolver esa parte en `<Suspense>`. El build
    falla si no se hace, lo cual es bueno: evita páginas lentas sin querer.

## Internacionalización

- Librería: **next-intl**. Motivo: sintaxis ICU (plurales, formatos de número y
  fecha), traducciones tipadas, utilidades de navegación y compatibilidad con
  `next/root-params`, que es el mecanismo que Next 16 recomienda para leer el
  idioma.
- Rutas con `localePrefix: "as-needed"`: español en `/`, inglés en `/en`.
- `src/proxy.ts` decide el idioma: la primera visita usa `Accept-Language` del
  navegador, después una cookie (`NEXT_LOCALE`). Reescribe internamente `/x` a
  `/es/x`.
- Las claves de traducción están tipadas a partir de `es.json` (`src/global.d.ts`):
  una clave mal escrita es un error de compilación.
- Al navegador solo se envían las traducciones que usan los Client Components
  (hoy, `Header`). El resto se resuelve en el servidor.
- Limitación conocida: `next/root-params` no funciona dentro de Server Actions
  ni Route Handlers. Ahí habrá que pasar el idioma explícitamente
  (`getTranslations({ locale })`).

## Tema claro / oscuro

Sin librerías: atributo `data-theme` en `<html>`, preferencia en
`localStorage`, y un script en línea en `<head>` que la aplica **antes del
primer pintado** (patrón de la guía oficial "Preventing flash before
hydration"). El botón no guarda estado de React; el icono visible lo decide el
CSS, así el HTML del servidor y del cliente coinciden siempre.

## Páginas 404

Hay dos casos y cada uno se resuelve distinto:

1. **Dirección que no corresponde a ninguna ruta** (`/no-existe`): la sirve
   `app/global-not-found.tsx` con **código 404 real** y HTML completo. Es
   bilingüe porque se ejecuta fuera del segmento `[locale]`. Usa la opción
   experimental `globalNotFound`.
2. **`notFound()` dentro de una página existente** (p. ej. un Pokémon que no
   existe, a partir de la fase 2): se muestra `app/[locale]/not-found.tsx`,
   traducida. Con Cache Components el esqueleto ya se ha enviado con código
   200, así que Next añade `<meta name="robots" content="noindex">`. Es el
   comportamiento documentado por Next.js; si se necesita un 404 estricto, la
   comprobación se hace antes (en `generateStaticParams` o en el proxy).

## Datos

### Lectura desde la web

- `src/lib/supabase/public-client.ts`: cliente de Supabase **sin sesión** con la
  clave publicable (`sb_publishable_…`), solo en el servidor. Al no depender de
  cookies, sus resultados se pueden cachear con `"use cache"` y compartir entre
  visitantes. Para datos de usuario (fase 6) habrá otro cliente con cookies
  (`@supabase/ssr`).
- La clave publicable solo permite lo que RLS deja hacer al rol `anon`: en los
  datos de referencia, leer.
- Los tipos de TypeScript de la base de datos (`database.types.ts`) se generan
  con el CLI de Supabase:
  `npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts`.
- **Límite de 1000 filas**: la API de Supabase devuelve como máximo 1000 filas
  por petición y hay 1025 especies. `getPokedexEntries` pide el total exacto y
  pagina hasta tenerlo todo; si faltara alguna fila, falla en vez de mostrar
  una lista incompleta.

### Pokédex: búsqueda y filtros en el navegador

La página `/pokedex` se **prerenderiza en el build** con las 1025 entradas
(consulta cacheada un día con `cacheLife("days")` y etiqueta `pokedex`). El
buscador (Client Component) filtra esa lista en el navegador: resultados
instantáneos al escribir, sin peticiones al servidor. Los filtros se reflejan
en la URL (`?q=…&types=water,flying&gen=3`) con `history.replaceState`, así que
una búsqueda se puede compartir. La lógica de filtrado es pura
(`features/pokedex/lib/filters.ts`) y tiene tests.

Coste asumido: la página incluye la lista completa (~220 KB de HTML sin
comprimir, bastante menos con compresión). Se pintan 96 tarjetas y el resto con
"Mostrar más".

Consecuencia para CI y Vercel: **el build necesita las variables
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**, porque
lee Supabase para prerenderizar.

### Importación

- **Fuente**: los datos de PokeAPI (licencia BSD-3) se importan con
  `npm run db:seed` a nuestra base de datos. No se consulta la API de PokeAPI
  en cada visita.
- La importación se ejecuta **desde el ordenador del desarrollador**, con la
  contraseña de la base de datos en `.env.local`. Esa credencial nunca va a
  Vercel ni al navegador.

### Imágenes

- Se enlazan desde el repositorio público de sprites de PokeAPI
  (`raw.githubusercontent.com/PokeAPI/sprites`), las mismas URLs que devuelve
  la propia PokeAPI. No se copian a nuestro almacenamiento.
- En el listado se usan los sprites pixel art de 96 px (0,5–7 KB).
- Supabase Storage queda para contenido de los usuarios (avatares).

Diseño detallado de la base de datos en [04-DatabaseDesign.md](04-DatabaseDesign.md).

## Registro de decisiones

| ID   | Decisión                                                     | Motivo                                                                                                                                                                        |
| ---- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Next.js 16 con Cache Components activado                     | Es el valor por defecto de la versión y el futuro del framework; adoptarlo ahora evita una migración después.                                                                 |
| D-02 | next-intl con español en la raíz                             | El español es el idioma principal; inglés bajo `/en`. Librería madura, compatible con `next/root-params`.                                                                     |
| D-03 | Tema sin librerías (`data-theme` + script en línea)          | Patrón oficial de Next.js, una dependencia menos, sin parpadeo.                                                                                                               |
| D-04 | Tipografías autoalojadas (`next/font/local`)                 | El build no depende de Google Fonts y los visitantes no hacen peticiones a terceros. Ambas tienen licencia OFL.                                                               |
| D-05 | Componentes de shadcn/ui escritos a mano en la fase 1        | El registro de shadcn no era accesible desde el entorno de desarrollo. `components.json` está listo para usar `npx shadcn add` normalmente.                                   |
| D-06 | `global-not-found` (experimental) para 404 reales            | El layout raíz vive dentro de `[locale]`; es el caso exacto para el que Next documenta esta opción. Descartado: lista de rutas en el proxy.                                   |
| D-07 | Datos de PokeAPI importados a Supabase; imágenes enlazadas   | Búsquedas y filtros rápidos, sin depender de un servicio externo en cada visita; no redistribuimos imágenes con derechos.                                                     |
| D-08 | `noUncheckedIndexedAccess` en TypeScript                     | Con muchos arrays e índices (Pokémon, movimientos…), obliga a comprobar que un elemento existe antes de usarlo.                                                               |
| D-09 | Importación con script propio (`pg`) en una transacción      | Atómica e idempotente. Descartado `seed.sql` + `db push --include-seed`: el CLI no vuelve a ejecutar un seed modificado.                                                      |
| D-10 | TLS con verificación completa al conectar a la BD            | Recomendación de Supabase (`verify-full`): evita que alguien en medio suplante a la base de datos.                                                                            |
| D-11 | Node.js 22.12 como mínimo                                    | Requisito de Vitest 5; Node 20 terminó su soporte en abril de 2026.                                                                                                           |
| D-12 | Pokédex prerenderizada + filtrado en el navegador            | 1025 entradas pequeñas: filtrar en el cliente es instantáneo y la página se sirve estática. Descartado: filtrar en el servidor en cada tecla.                                 |
| D-13 | Sprites sin el optimizador de imágenes de Next               | Son PNG pixel art de 0,5–7 KB: optimizarlos no aporta y gastaría la cuota de optimización de Vercel.                                                                          |
| D-14 | Vista `pokedex_entries` con `security_invoker`               | Una consulta simple para la web sin saltarse RLS (por defecto, una vista se ejecuta con los permisos de su dueño).                                                            |
| D-15 | Rediseño «carpeta del coleccionista», tema claro por defecto | Identidad propia ligada al coleccionismo de cartas; las cartas y los colores de tipo destacan más sobre páginas claras. Diseño de carta original (no imita la carta oficial). |
| D-16 | Archivo (con eje de anchura) + Newsreader                    | Una sola familia de palo seco cubre interfaz y titulares condensados; la serif da el tono de texto impreso. Sustituyen a Unbounded y Atkinson.                                |
| D-17 | Efecto holográfico con delegación de eventos y variables CSS | Un solo par de listeners para toda la rejilla y el dibujo en CSS: barato con cientos de cartas y respeta «reducir movimiento».                                                |
