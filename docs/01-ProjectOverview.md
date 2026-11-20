# 01 · Visión general del proyecto

> Última actualización: 2026-11-20 · Estado: **Fase 2 (Pokédex) en curso**

## Qué es PokéCompanion

PokéCompanion es una plataforma web para jugadores de Pokémon que reúne en un
solo sitio las herramientas que se consultan mientras se juega: una Pokédex
completa, una calculadora de tipos, un explorador de evoluciones, una base de
datos de movimientos, habilidades y objetos, un constructor de equipos, un
registro de colección y, más adelante, una comunidad para compartir.

Tiene dos objetivos a la vez:

1. **Producto real**: debe ser cómodo y útil para jugadores de verdad
   (rápido, claro, usable en el móvil mientras se juega).
2. **Portfolio profesional**: el código, la arquitectura y la documentación
   deben demostrar buenas prácticas de desarrollo full stack.

## Para quién

- **Jugador casual**: quiere consultar rápido un Pokémon o qué tipo le gana.
- **Jugador competitivo**: prepara equipos, revisa coberturas y estadísticas.
- **Coleccionista**: lleva la cuenta de lo que ha capturado (incluidos
  variocolores y formas regionales).

## Idiomas

- **Español**: idioma principal (rutas sin prefijo: `/`, `/pokedex`…).
- **Inglés**: segundo idioma (rutas con prefijo: `/en`, `/en/pokedex`…).

## Alcance

| Módulo                             | Requiere cuenta | Fase |
| ---------------------------------- | --------------- | ---- |
| Pokédex                            | No              | 2    |
| Calculadora de tipos               | No              | 3    |
| Explorador de evoluciones          | No              | 4    |
| Movimientos, habilidades y objetos | No              | 5    |
| Cuentas, perfil y panel            | Sí              | 6    |
| Constructor de equipos             | Sí (guardar)    | 7    |
| Colección                          | Sí              | 8    |
| Comunidad                          | Sí              | 9    |

Detalle en [06-DevelopmentRoadmap.md](06-DevelopmentRoadmap.md).

### Fuera de alcance (por ahora)

- Simulador de combates.
- Aplicación móvil nativa (la web será responsive y suficiente en móvil).
- Monetización de cualquier tipo.

## Aviso legal y propiedad intelectual

PokéCompanion es un **proyecto de fans independiente** y no debe dar a entender
ninguna relación oficial con los titulares de los derechos de Pokémon.

- El aviso de no afiliación aparece en el pie de todas las páginas.
- La identidad visual (logotipo, iconos, ilustraciones) es **propia**. No se
  usan logotipos oficiales ni la Poké Ball como marca.
- Las imágenes oficiales de Pokémon (sprites, artworks) pertenecen a sus
  titulares. Se enlazarán desde PokeAPI sin almacenarlas en nuestro
  almacenamiento. Ver la decisión D-07 en [03-Architecture.md](03-Architecture.md).
- **Riesgo conocido**: el nombre "PokéCompanion" incluye "Poké". Es habitual en
  proyectos de fans sin ánimo de lucro, pero si el proyecto se monetizara o
  recibiera una reclamación habría que cambiarlo.

## Estado actual

Lo que existe hoy y funciona (verificado con build de producción):

- Proyecto Next.js 16 con TypeScript estricto, Tailwind CSS 4 y shadcn/ui.
- Español e inglés con rutas, detección de idioma del navegador y selector.
- Tema oscuro por defecto y tema claro, sin parpadeo al cargar.
- Página de inicio con los 18 tipos y la hoja de ruta.
- Página 404 real (código 404) para direcciones inexistentes.
- CI en GitHub Actions: lint, tipos, formato y build.

- Base de datos en Supabase con los datos de la Pokédex (1025 especies, 1351
  formas) importados desde PokeAPI.
- Pokédex: listado con búsqueda por nombre o número y filtros por tipo y
  generación, presentado como una carpeta de cartas coleccionables.
- Identidad visual propia («La carpeta del coleccionista»), ver
  [05-DesignSystem.md](05-DesignSystem.md).

- Ficha de cada Pokémon con estadísticas, habilidades y descripción.
- Publicada en **https://pokecompanion-app.vercel.app** (Vercel, París).

Todavía **no** hay autenticación ni formas alternativas.
