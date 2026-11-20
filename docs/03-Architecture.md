# 03 · Arquitectura

> Última actualización: 2026-11-20

## Stack y versiones

| Pieza          | Versión           | Notas                                                                             |
| -------------- | ----------------- | --------------------------------------------------------------------------------- |
| Node.js        | ≥ 22.12           | Lo exige Vitest 5; Node 20 ya no tiene soporte                                    |
| Next.js        | 16.4.6            | App Router, Turbopack, Cache Components activado                                  |
| React          | 19.3              |                                                                                   |
| TypeScript     | 5.x               | `strict` + `noUncheckedIndexedAccess`                                             |
| Tailwind CSS   | 4.3               | Configuración en CSS (`globals.css`), sin `tailwind.config`                       |
| shadcn/ui      | estilo `new-york` | Componentes copiados en `src/components/ui`                                       |
| next-intl      | 4.15              | Rutas y traducciones                                                              |
| Supabase       | PostgreSQL 17     | Proyecto en West EU (París). Datos de referencia; autenticación en fase 6         |
| supabase-js    | 2.x               | Lectura desde la web con la clave publicable                                      |
| Vitest         | 5.x               | Tests unitarios                                                                   |
| Vercel         | Hobby             | En producción: https://pokecompanion-app.vercel.app · funciones en París (`cdg1`) |
| GitHub Actions | —                 | CI: lint, tipos, formato, tests y build                                           |

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
│   │   ├── pokedex/[slug]/   Ficha de cada Pokémon (/pokedex/pikachu)
│   │   ├── tipos/page.tsx    Calculadora de tipos (/tipos, /en/tipos)
│   │   └── not-found.tsx     404 dentro de la web (notFound() en una página)
│   ├── global-not-found.tsx  404 para direcciones que no existen en absoluto
│   └── globals.css           Tokens de diseño y Tailwind
├── components/
│   ├── ui/                   Primitivas: Button (shadcn/ui), SegmentedControl
│   └── layout/               Cabecera, pie, selector de idioma, tema
├── features/                 Una carpeta por funcionalidad
│   ├── pokedex/              components/, data/, lib/ (lógica pura), server/ (consultas)
│   ├── moves/                Movimientos que aprende cada Pokémon (lib/, server/, components/)
│   └── types/                Tipos Pokémon: tabla de efectividades, cálculo y calculadora
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

El listado incluye las **57 formas regionales**, cada una justo detrás de su
especie (Vulpix, Vulpix de Alola…), y el filtro `form=alola|galar|hisui|paldea`
deja solo las de una región. La generación se refiere a la de la especie: Vulpix
de Alola sale en Kanto (I).

Coste asumido: la página incluye la lista completa (~220 KB de HTML sin
comprimir, bastante menos con compresión). Se pintan 60 cartas y el resto con
"Mostrar más".

Consecuencia para CI y Vercel: **el build necesita las variables
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**, porque
lee Supabase para prerenderizar.

### Formas regionales

- Los datos de cada forma (tipos, estadísticas, habilidades, altura y peso) ya
  estaban en la base de datos: la importación trae todas las filas de
  `pokemon`, también las que no son la forma por defecto. Lo que faltaba es
  saber cuáles son regionales.
- Esa lista vive en el código (`features/pokedex/data/regional-forms.ts`),
  generada del `pokemon_forms.csv` de PokeAPI en el commit fijado: formas cuyo
  identificador es una región, más Darmanitan de Galar y las tres variedades de
  Tauros de Paldea. Quedan fuera las formas de combate (Darmanitan Daruma), los
  Pokémon dominantes y los Pikachu con gorra. Ver D-24.
- `getRegionalForms(locale)` trae las 57 en una petición cacheada.
- PokeAPI no tiene nombres en español para las formas, así que se componen con
  plantillas de los archivos de traducción: «{name} de {region}» → «Vulpix de
  Alola»; en inglés «{region} {name}» → «Alolan Vulpix». La variedad de Tauros
  va aparte («Variedad ardiente»).
- Ficha propia en `/pokedex/vulpix-alola`, prerenderizada como las demás (2179
  páginas en total). PokeAPI solo tiene entradas de la Pokédex por especie y
  describen la forma original, así que las formas muestran un aviso en su lugar.
- Línea evolutiva vista desde una forma: cada fase se cambia por su forma de la
  misma región si existe (`regionalizeTree`). Limitación: como el árbol sale de
  datos de especie, Meowth de Galar muestra Persian además de Perrserker; las
  evoluciones exactas llegarán con los métodos de evolución (fase 4).
- Otras formas (Mega, Gigamax…) siguen sin página: su slug da la página 404.

### Ficha de cada Pokémon (`/pokedex/[slug]`)

- `getPokemonDetail(slug, locale)` trae en **una sola petición** la forma por
  defecto con su especie, traducciones, tipos, estadísticas y habilidades: la
  API de Supabase (PostgREST) sigue las claves foráneas e incrusta las filas
  relacionadas. Los tipos de TypeScript del resultado se infieren del esquema.
- Textos con respaldo: si falta la categoría o la descripción en español, se
  muestra la inglesa marcada con `lang="en"` y el aviso «Solo disponible en
  inglés».
- `generateStaticParams` devuelve los 1025 slugs: se prerenderizan **2050
  páginas** (dos idiomas). En el build de prueba tardó 74 s; es asumible y a
  cambio cada ficha se sirve estática al instante.
- **Línea evolutiva**: `getEvolutionLinks()` lee de `pokemon_species` las
  1025 parejas «quién evoluciona de quién» (`evolves_from_species_id`,
  `evolution_chain_id`) en **una consulta compartida** por todas las fichas y
  ambos idiomas (caché de un día), en vez de una por ficha. La función pura
  `buildEvolutionTree` (`lib/evolution.ts`, con tests) sube hasta la primera
  fase y construye el árbol con sus ramas; los nombres y tipos salen de
  `getPokedexEntries`, que la ficha ya cargaba.
- Limitación conocida: un slug inexistente (`/pokedex/inventado`) muestra la
  página 404 de la web, pero con código 200 + `noindex` (comportamiento
  documentado de Next con Cache Components; `dynamicParams = false` no está
  disponible en ese modo). Para un 404 estricto habría que validar el slug en
  el proxy contra la lista de slugs. Pendiente si llega a importar.

### Calculadora de tipos (`/tipos`)

- La tabla de efectividades vive en el código
  (`features/types/data/type-chart.ts`), generada del `type_efficacy.csv` de
  PokeAPI en el mismo commit fijado que la importación. Solo se escriben las
  120 combinaciones que no son ×1. Ver D-22.
- `lib/effectiveness.ts` (puro, con tests): multiplicador de un ataque contra
  uno o dos tipos (se multiplican: Roca contra Fuego/Volador = 2 × 2 = ×4) y
  perfiles agrupados por multiplicador para defensa y ataque.
- `lib/calculator.ts`: estado de la calculadora y su forma en la URL
  (`/tipos?types=fire,flying`, `/tipos?mode=attack&types=ground`). Usa el mismo
  parámetro `types` que la Pokédex, así que los enlaces entre ambas funcionan
  sin traducir nada.
- La página no consulta la base de datos: es estática en los dos idiomas. La
  calculadora es un Client Component que calcula en el navegador y refleja el
  estado en la URL con `history.replaceState`, como los filtros de la Pokédex.
  La tabla 18 × 18 es una `<table>` renderizada en el servidor.
- La ficha de cada Pokémon reutiliza la misma lógica para su sección
  «Debilidades y resistencias» y enlaza a la calculadora con sus tipos.
- La ruta es `/tipos` en los dos idiomas (`/en/tipos`): traducir rutas con
  `pathnames` de next-intl obligaría a cambiar todos los enlaces dinámicos.
  Ver D-23.

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
- En el listado se usan los sprites pixel art de 96 px (0,5–7 KB); en la ficha,
  el artwork oficial de 475 px (100–200 KB), sin optimizador (D-13).
- Supabase Storage queda para contenido de los usuarios (avatares).

Diseño detallado de la base de datos en [04-DatabaseDesign.md](04-DatabaseDesign.md).

## Registro de decisiones

| ID   | Decisión                                                                | Motivo                                                                                                                                                                                                                                                                                                                                                                |
| ---- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Next.js 16 con Cache Components activado                                | Es el valor por defecto de la versión y el futuro del framework; adoptarlo ahora evita una migración después.                                                                                                                                                                                                                                                         |
| D-02 | next-intl con español en la raíz                                        | El español es el idioma principal; inglés bajo `/en`. Librería madura, compatible con `next/root-params`.                                                                                                                                                                                                                                                             |
| D-03 | Tema sin librerías (`data-theme` + script en línea)                     | Patrón oficial de Next.js, una dependencia menos, sin parpadeo.                                                                                                                                                                                                                                                                                                       |
| D-04 | Tipografías autoalojadas (`next/font/local`)                            | El build no depende de Google Fonts y los visitantes no hacen peticiones a terceros. Ambas tienen licencia OFL.                                                                                                                                                                                                                                                       |
| D-05 | Componentes de shadcn/ui escritos a mano en la fase 1                   | El registro de shadcn no era accesible desde el entorno de desarrollo. `components.json` está listo para usar `npx shadcn add` normalmente.                                                                                                                                                                                                                           |
| D-06 | `global-not-found` (experimental) para 404 reales                       | El layout raíz vive dentro de `[locale]`; es el caso exacto para el que Next documenta esta opción. Descartado: lista de rutas en el proxy.                                                                                                                                                                                                                           |
| D-07 | Datos de PokeAPI importados a Supabase; imágenes enlazadas              | Búsquedas y filtros rápidos, sin depender de un servicio externo en cada visita; no redistribuimos imágenes con derechos.                                                                                                                                                                                                                                             |
| D-08 | `noUncheckedIndexedAccess` en TypeScript                                | Con muchos arrays e índices (Pokémon, movimientos…), obliga a comprobar que un elemento existe antes de usarlo.                                                                                                                                                                                                                                                       |
| D-09 | Importación con script propio (`pg`) en una transacción                 | Atómica e idempotente. Descartado `seed.sql` + `db push --include-seed`: el CLI no vuelve a ejecutar un seed modificado.                                                                                                                                                                                                                                              |
| D-10 | TLS con verificación completa al conectar a la BD                       | Recomendación de Supabase (`verify-full`): evita que alguien en medio suplante a la base de datos.                                                                                                                                                                                                                                                                    |
| D-11 | Node.js 22.12 como mínimo                                               | Requisito de Vitest 5; Node 20 terminó su soporte en abril de 2026.                                                                                                                                                                                                                                                                                                   |
| D-12 | Pokédex prerenderizada + filtrado en el navegador                       | 1025 entradas pequeñas: filtrar en el cliente es instantáneo y la página se sirve estática. Descartado: filtrar en el servidor en cada tecla.                                                                                                                                                                                                                         |
| D-13 | Sprites sin el optimizador de imágenes de Next                          | Son PNG pixel art de 0,5–7 KB: optimizarlos no aporta y gastaría la cuota de optimización de Vercel.                                                                                                                                                                                                                                                                  |
| D-14 | Vista `pokedex_entries` con `security_invoker`                          | Una consulta simple para la web sin saltarse RLS (por defecto, una vista se ejecuta con los permisos de su dueño).                                                                                                                                                                                                                                                    |
| D-15 | Rediseño «carpeta del coleccionista», tema claro por defecto            | Identidad propia ligada al coleccionismo de cartas; las cartas y los colores de tipo destacan más sobre páginas claras. Diseño de carta original (no imita la carta oficial).                                                                                                                                                                                         |
| D-16 | Archivo (con eje de anchura) + Newsreader                               | Una sola familia de palo seco cubre interfaz y titulares condensados; la serif da el tono de texto impreso. Sustituyen a Unbounded y Atkinson.                                                                                                                                                                                                                        |
| D-17 | Efecto holográfico con delegación de eventos y variables CSS            | Un solo par de listeners para toda la rejilla y el dibujo en CSS: barato con cientos de cartas y respeta «reducir movimiento».                                                                                                                                                                                                                                        |
| D-18 | Prerenderizar las 1025 fichas en el build                               | 2050 páginas en ~74 s de build; a cambio, cada ficha se sirve estática. Alternativa: prerenderizar un subconjunto y generar el resto en la primera visita.                                                                                                                                                                                                            |
| D-19 | Ficha con una sola consulta con relaciones incrustadas                  | Menos idas y vueltas a la base de datos y tipos inferidos del esquema; sin vistas extra.                                                                                                                                                                                                                                                                              |
| D-20 | Línea evolutiva con los datos ya importados, en una consulta compartida | Sin migración ni nueva importación; dos peticiones en todo el build en vez de 2050. Los métodos de evolución (nivel, objeto…) sí necesitarán tabla nueva.                                                                                                                                                                                                             |
| D-21 | La carta se adapta a su propio ancho (consultas de contenedor)          | La misma carta aparece a varios tamaños (rejilla, línea evolutiva, abanico); decidir por el ancho de pantalla dejaba tipos tapando el total en móviles.                                                                                                                                                                                                               |
| D-22 | Tabla de efectividades en el código, no en la base de datos             | 324 números que solo cambian cuando una generación añade un tipo (la última vez, Hada en 2013); la calculadora los necesita en el navegador para responder al instante y sin red. Generada del CSV de PokeAPI y comprobada con tests.                                                                                                                                 |
| D-23 | Ruta `/tipos` igual en ambos idiomas                                    | El español es el idioma principal; traducir rutas (`/en/types`) con `pathnames` exigiría reescribir todos los enlaces dinámicos. Revisable si importa para el SEO en inglés.                                                                                                                                                                                          |
| D-24 | Lista de formas regionales en el código, datos de la base de datos      | La base de datos ya tenía tipos y estadísticas de todas las formas; solo faltaba marcar cuáles son regionales. Una lista generada de PokeAPI evita una migración y una nueva importación, y cambia solo cuando sale una región nueva.                                                                                                                                 |
| D-25 | Filtros en un único panel, sin pestañas                                 | Una fila por filtro con todas las opciones en el mismo plano y alineadas. Las pestañas de carpeta dejaban unas opciones «detrás» de otras y el usuario las encontró desordenadas.                                                                                                                                                                                     |
| D-26 | Un solo juego por Pokémon en los movimientos                            | Cada juego tiene su propia lista y mostrar todas a la vez confunde. Se guarda la del juego más reciente en que aparece (Escarlata/Púrpura, si no Espada/Escudo, Diamante Brillante/Perla Reluciente, Ultrasol/Ultraluna…) y la ficha dice cuál es. Let's Go y Leyendas se saltan: sus sistemas de movimientos son distintos. 77 578 filas en vez de cientos de miles. |
| D-27 | Pestañas de movimientos con radios y CSS, sin JavaScript                | La sección es un componente de servidor con todas las tablas en el HTML; los radios guardan la elección y `group-has-[input[value=…]:checked]` muestra la tabla elegida. Funciona sin JavaScript y no envía los datos dos veces (HTML + carga para React), lo que pesaría en Mew (229 MT).                                                                            |
