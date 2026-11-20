# 04 · Diseño de base de datos

> Última actualización: 2026-11-20
> Estado: **datos de referencia implementados** (fase 2) · datos de usuario: propuesta

## Principios

- **PostgreSQL 17 en Supabase.** Los cambios de esquema se hacen siempre con
  **migraciones** versionadas en `supabase/migrations/` y se aplican con
  `npx supabase db push --remote` (sin `--remote`, el CLI v3 apunta a una
  base de datos local con Docker).
- **Row Level Security (RLS) activado en todas las tablas**, sin excepción.
  - Datos de referencia: la web (`anon`, `authenticated`) **solo puede leer**.
    Además de RLS, se les retiran los permisos de escritura (defensa en
    profundidad).
  - Datos de usuario (fase 6): cada usuario solo lee y modifica lo suyo.
- Los ids de los datos de referencia son los de PokeAPI, así que reimportar es
  idempotente.
- Textos traducibles en tablas `*_translations` con columna `locale`
  (`es` | `en`, dominio `app_locale`).

## Datos de referencia (implementado)

Migración: `supabase/migrations/20261120120000_reference_data.sql`.

```text
generations (id, slug)

types (id, slug)                         ← solo los 18 tipos de combate
└── type_translations (type_id, locale, name)

pokemon_species (id = nº Pokédex, slug, generation_id, evolves_from_species_id,
│                evolution_chain_id, is_baby, is_legendary, is_mythical)
├── pokemon_species_translations (species_id, locale, name, genus, flavor_text)
└── pokemon (id, slug, species_id, is_default, height_dm, weight_hg, base_experience)
    ├── pokemon_types     (pokemon_id, slot 1–2, type_id)
    ├── pokemon_stats     (pokemon_id, stat, base_value 1–255, effort 0–3)
    └── pokemon_abilities (pokemon_id, slot 1–3, ability_id, is_hidden)

abilities (id, slug, generation_id)
└── ability_translations (ability_id, locale, name)

pokedex_entries (vista)  ← una fila por (especie, idioma): dex_number, slug,
                           locale, name, generation_id, types[]
```

La vista `pokedex_entries` (migración `20261120130000_pokedex_entries_view.sql`)
da a la web todo lo que necesita el listado en una sola consulta. Tiene
`security_invoker = true`: se ejecuta con los permisos de quien consulta
(`anon`), así que las políticas RLS de las tablas siguen aplicándose. Sin esa
opción, una vista se ejecuta con los permisos de su dueño y se saltaría RLS.

Detalles que conviene saber:

- **Especie vs. Pokémon.** La especie es lo que numera la Pokédex (Pikachu es
  la #25). Cada especie tiene una forma por defecto (`is_default`, una sola
  por especie, garantizado por un índice único parcial) y puede tener formas
  alternativas (Alola, Mega, Gigamax…).
- **Unidades originales**: altura en decímetros y peso en hectogramos (como en
  los juegos). La conversión a m/kg se hace al mostrarlos.
- **Textos que faltan**: PokeAPI no tiene categoría ni descripción en español
  para 127 especies recientes. Se guardan como `null` y la interfaz muestra el
  texto en inglés marcado con `lang="en"`.
- **Evoluciones "hacia atrás"**: Pikachu (#25) evoluciona de Pichu (#172). La
  clave foránea `evolves_from_species_id` es _deferrable_ para poder
  comprobarla al final de la transacción de importación.
- **Búsqueda por nombre**: índice sobre `(locale, lower(name))` para búsquedas
  por prefijo ("pika" → Pikachu).
- Las etiquetas de las estadísticas ("PS", "Ataque"…) son textos de la
  interfaz y viven en `src/messages/`, no en la base de datos.

### Volumen actual

| Tabla                          | Filas |
| ------------------------------ | ----- |
| `pokemon_species`              | 1025  |
| `pokemon_species_translations` | 2050  |
| `pokemon`                      | 1351  |
| `pokemon_types`                | 2116  |
| `pokemon_stats`                | 8106  |
| `abilities`                    | 314   |
| `pokemon_abilities`            | 2943  |

## Importación de datos

Script: `scripts/seed-pokedex/` · comando: `npm run db:seed`.

1. Descarga los CSV de PokeAPI desde **un commit fijo** de su repositorio
   (`POKEAPI_COMMIT` en `sources.ts`): la importación siempre da el mismo
   resultado. Para actualizar datos se cambia ese commit a propósito.
2. Los transforma con funciones puras (`transform.ts`, con tests). Si algo no
   cuadra (un tipo desconocido, una especie sin nombre en español…), **falla
   en lugar de importar datos rotos**.
3. Escribe todo en **una sola transacción**: o se aplica entero o no se aplica
   nada. Las entidades (especies, Pokémon, habilidades) se actualizan por id;
   traducciones y relaciones se reemplazan para que lo que desaparezca en
   origen desaparezca también aquí.
4. Se conecta directamente a PostgreSQL con TLS y **verificación completa del
   certificado** (`verify-full`) usando el certificado de Supabase.

`npm run db:seed -- --dry-run` descarga y transforma sin escribir nada.

Por qué no se usa `supabase/seed.sql` con `db push --include-seed`: el CLI de
Supabase solo ejecuta cada archivo de seed una vez; si el archivo cambia, se
limita a actualizar su huella sin ejecutar los datos nuevos (comprobado en el
código fuente del CLI v3). La base de datos quedaría desactualizada sin avisar.

## Datos de usuario (fase 6, propuesta)

```text
auth.users (Supabase Auth)
   └── profiles (id = auth.users.id, username único, display_name, avatar_path, created_at)
          ├── teams (id, owner_id, name, format, is_public, created_at, updated_at)
          │     └── team_members (team_id, slot 1–6, pokemon_id, ability_id, item_id,
          │                       nature, moves[4], evs, ivs, nickname)
          └── collection_entries (owner_id, pokemon_id, is_shiny, caught_at)
```

Políticas RLS previstas:

| Tabla                | Leer                               | Crear / editar / borrar  |
| -------------------- | ---------------------------------- | ------------------------ |
| `profiles`           | Todos                              | Solo el propio usuario   |
| `teams`              | Dueño, o todos si `is_public`      | Solo el dueño            |
| `team_members`       | Igual que su equipo                | Solo el dueño del equipo |
| `collection_entries` | Dueño (pública opcional más tarde) | Solo el dueño            |

## Comunidad (fase 9)

Se diseñará al llegar a esa fase: valoraciones, comentarios y denuncias, con
moderación desde el principio.
