# PokéCompanion

Plataforma web para jugadores de Pokémon: Pokédex, constructor de equipos,
calculadora de tipos, registro de colección y más. Proyecto de fans
independiente, en desarrollo.

> PokéCompanion no está afiliado, respaldado ni patrocinado por Nintendo,
> Game Freak, Creatures Inc. ni The Pokémon Company. Pokémon y los nombres de
> los Pokémon son marcas de sus respectivos propietarios.

## Requisitos

- Node.js 22.12 o superior (ver `.nvmrc`)
- npm 10 o superior
- Git

## Primeros pasos

```bash
npm install
npm run dev
```

Abre <http://localhost:3000> (español) o <http://localhost:3000/en> (inglés).

## Scripts

| Comando                | Qué hace                                         |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Servidor de desarrollo con recarga en caliente   |
| `npm run build`        | Build de producción                              |
| `npm run start`        | Sirve el build de producción                     |
| `npm run lint`         | ESLint                                           |
| `npm run typecheck`    | Genera los tipos de rutas y comprueba TypeScript |
| `npm run format`       | Formatea todo el código con Prettier             |
| `npm run format:check` | Comprueba el formato sin modificar nada          |
| `npm run test`         | Tests unitarios (Vitest)                         |
| `npm run check`        | Lint + tipos + formato + tests (lo mismo que CI) |
| `npm run db:seed`      | Importa los datos de la Pokédex desde PokeAPI    |

## Base de datos (Supabase)

Primera vez:

1. Copia `.env.example` como `.env.local` y rellena `SUPABASE_DB_URL`
   (Supabase → **Connect** → **Session pooler**).
2. Descarga el certificado de Supabase y guárdalo como
   `supabase/certs/prod-ca-2021.crt` (ver `supabase/certs/README.md`).
3. Aplica las migraciones e importa los datos:

```bash
npx supabase login
npx supabase link --project-ref <id-del-proyecto>
npx supabase db push --remote
npm run db:seed
```

`npm run db:seed` se puede repetir cuando quieras: siempre deja los mismos datos.

## Estructura

```text
docs/              Documentación del proyecto (empieza por 01-ProjectOverview.md)
src/
  app/             Rutas (App Router). Todo cuelga de [locale]/
  components/      Componentes compartidos (ui/ = primitivas shadcn, layout/ = cabecera, pie…)
  features/        Código agrupado por funcionalidad (types/, pokedex/, teams/…)
  fonts/           Tipografías autoalojadas (licencia OFL)
  i18n/            Configuración de idiomas (next-intl)
  messages/        Textos traducidos: es.json (referencia) y en.json
  lib/             Utilidades genéricas
  proxy.ts         Se ejecuta antes de cada petición (detección de idioma)
```

## Documentación

1. [Visión general](docs/01-ProjectOverview.md)
2. [Requisitos](docs/02-Requirements.md)
3. [Arquitectura](docs/03-Architecture.md)
4. [Diseño de base de datos](docs/04-DatabaseDesign.md)
5. [Sistema de diseño](docs/05-DesignSystem.md)
6. [Hoja de ruta](docs/06-DevelopmentRoadmap.md)
7. [Normas de código](docs/07-CodingStandards.md)
8. [Estrategia de pruebas](docs/08-TestingStrategy.md)
