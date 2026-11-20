# 03 · Arquitectura

> Última actualización: 2026-11-20

## Stack y versiones

| Pieza          | Versión           | Notas                                                       |
| -------------- | ----------------- | ----------------------------------------------------------- |
| Next.js        | 16.4.6            | App Router, Turbopack, Cache Components activado            |
| React          | 19.3              |                                                             |
| TypeScript     | 5.x               | `strict` + `noUncheckedIndexedAccess`                       |
| Tailwind CSS   | 4.3               | Configuración en CSS (`globals.css`), sin `tailwind.config` |
| shadcn/ui      | estilo `new-york` | Componentes copiados en `src/components/ui`                 |
| next-intl      | 4.15              | Rutas y traducciones                                        |
| Supabase       | —                 | Pendiente (fase 2: datos; fase 6: autenticación)            |
| Vercel         | —                 | Pendiente de conectar el repositorio                        |
| GitHub Actions | —                 | CI: lint, tipos, formato y build                            |

## Estructura de carpetas

Organización **por funcionalidad** (feature-oriented): el código de una
funcionalidad vive junto, y solo lo realmente compartido sale fuera.

```text
src/
├── app/                      Rutas. Solo archivos de routing (page, layout…)
│   ├── [locale]/             Todo cuelga del idioma
│   │   ├── layout.tsx        Layout raíz: <html>, fuentes, tema, cabecera, pie
│   │   ├── page.tsx          Inicio
│   │   └── not-found.tsx     404 dentro de la web (notFound() en una página)
│   ├── global-not-found.tsx  404 para direcciones que no existen en absoluto
│   └── globals.css           Tokens de diseño y Tailwind
├── components/
│   ├── ui/                   Primitivas de shadcn/ui (Button…)
│   └── layout/               Cabecera, pie, selector de idioma, tema
├── features/                 Una carpeta por funcionalidad
│   └── types/                Tipos Pokémon: datos y componentes (TypeBadge)
├── fonts/                    Tipografías autoalojadas
├── i18n/                     routing.ts, navigation.ts, request.ts
├── messages/                 es.json (referencia) y en.json
├── config/                   Configuración del sitio
├── lib/                      Utilidades genéricas (cn)
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
  interactividad (clics, estado, APIs del navegador). Hoy solo hay dos: el
  selector de idioma y el botón de tema.
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

## Datos (planificado)

- **Fuente**: los datos de PokeAPI (licencia BSD-3) se importarán con un script
  de _seed_ a nuestra base de datos PostgreSQL en Supabase. No se consultará la
  API de PokeAPI en cada visita.
- **Imágenes**: se enlazan desde el repositorio público de sprites de PokeAPI.
  No se copian a Supabase Storage. Supabase Storage queda para contenido de los
  usuarios (avatares).
- Diseño detallado en [04-DatabaseDesign.md](04-DatabaseDesign.md).

## Registro de decisiones

| ID   | Decisión                                                   | Motivo                                                                                                                                                  |
| ---- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Next.js 16 con Cache Components activado                   | Es el valor por defecto de la versión y el futuro del framework; adoptarlo ahora evita una migración después.                                           |
| D-02 | next-intl con español en la raíz                           | El español es el idioma principal; inglés bajo `/en`. Librería madura, compatible con `next/root-params`.                                               |
| D-03 | Tema sin librerías (`data-theme` + script en línea)        | Patrón oficial de Next.js, una dependencia menos, sin parpadeo.                                                                                         |
| D-04 | Tipografías autoalojadas (`next/font/local`)               | El build no depende de Google Fonts y los visitantes no hacen peticiones a terceros. Ambas tienen licencia OFL.                                         |
| D-05 | Componentes de shadcn/ui escritos a mano en la fase 1      | El registro de shadcn no era accesible desde el entorno de desarrollo. `components.json` está listo para usar `npx shadcn add` normalmente.             |
| D-06 | `global-not-found` (experimental) para 404 reales          | El layout raíz vive dentro de `[locale]`; es el caso exacto para el que Next documenta esta opción. Alternativa descartada: lista de rutas en el proxy. |
| D-07 | Datos de PokeAPI importados a Supabase; imágenes enlazadas | Búsquedas y filtros rápidos, sin depender de un servicio externo en cada visita; no redistribuimos imágenes con derechos.                               |
| D-08 | `noUncheckedIndexedAccess` en TypeScript                   | Con muchos arrays e índices (Pokémon, movimientos…), obliga a comprobar que un elemento existe antes de usarlo.                                         |
