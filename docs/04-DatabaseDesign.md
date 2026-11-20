# 04 · Diseño de base de datos

> Última actualización: 2026-11-20 · Estado: **propuesta, sin implementar**

Este documento recoge el modelo previsto. Se validará y ajustará al empezar la
fase 2 (datos de referencia) y la fase 6 (datos de usuario). Hasta entonces no
existe ninguna tabla ni migración.

## Principios

- **PostgreSQL en Supabase**, con cambios de esquema siempre mediante
  **migraciones** versionadas en el repositorio (`supabase/migrations/`).
- **Row Level Security (RLS) activado en todas las tablas**, sin excepción.
  - Datos de referencia (Pokémon, tipos…): lectura pública, escritura solo
    desde el script de importación (clave de servicio, nunca en el cliente).
  - Datos de usuario: cada usuario solo lee y modifica lo suyo, salvo lo que
    marque explícitamente como público.
- Identificadores de PokeAPI como claves primarias en los datos de referencia,
  para que reimportar sea idempotente.
- Textos traducibles en tablas `*_translations` (`language` = `es` | `en`).

## Datos de referencia (fase 2 en adelante)

```text
types ─────────────┐
  id, slug          │
                    ├── type_efficacy (attacking_type_id, defending_type_id, multiplier)
                    │
pokemon_species ────┼── pokemon (formas: id, species_id, is_default, height, weight, sprite_url…)
  id, slug,         │     ├── pokemon_types (pokemon_id, type_id, slot)
  generation,       │     ├── pokemon_stats (pokemon_id, stat, base_value)
  evolution_chain_id│     ├── pokemon_abilities (pokemon_id, ability_id, is_hidden, slot)
                    │     └── pokemon_moves (pokemon_id, move_id, method, level, version_group)
                    │
evolution_chains ───┘── evolutions (from_species_id, to_species_id, trigger, min_level, item_id…)

abilities (id, slug)      moves (id, slug, type_id, category, power, accuracy, pp, priority)
items (id, slug, category, sprite_url)

*_translations: species_translations, ability_translations, move_translations,
                item_translations, type_translations (id, language, name, description)
```

## Datos de usuario (fase 6 en adelante)

```text
auth.users (Supabase Auth)
   └── profiles (id = auth.users.id, username único, display_name, avatar_path, created_at)
          ├── teams (id, owner_id, name, format, is_public, created_at, updated_at)
          │     └── team_members (team_id, slot 1–6, pokemon_id, ability_id, item_id,
          │                       nature, moves[4], evs, ivs, nickname)
          └── collection_entries (owner_id, pokemon_id, is_shiny, caught_at)
```

Políticas RLS previstas (resumen):

| Tabla                | Leer                               | Crear / editar / borrar  |
| -------------------- | ---------------------------------- | ------------------------ |
| `profiles`           | Todos                              | Solo el propio usuario   |
| `teams`              | Dueño, o todos si `is_public`      | Solo el dueño            |
| `team_members`       | Igual que su equipo                | Solo el dueño del equipo |
| `collection_entries` | Dueño (pública opcional más tarde) | Solo el dueño            |

## Comunidad (fase 9)

Se diseñará al llegar a esa fase: valoraciones, comentarios y denuncias, con
moderación desde el principio.
