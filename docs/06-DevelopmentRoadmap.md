# 06 · Hoja de ruta

> Última actualización: 2026-11-20

Cada fase termina con algo **desplegable y verificado** (CI en verde y
comprobación manual). Las fases sin cuenta de usuario van primero: dan valor
pronto y no tienen riesgos de seguridad.

## Fase 0 · Documentación y decisiones ✅

- [x] Visión, requisitos, arquitectura, base de datos (propuesta), sistema de
      diseño, hoja de ruta, normas de código y estrategia de pruebas.

## Fase 1 · Base técnica ✅

- [x] Next.js 16 + TypeScript estricto + Tailwind 4 + ESLint + Prettier.
- [x] shadcn/ui configurado (`components.json`, `cn`, `Button`).
- [x] Español e inglés con next-intl (rutas, detección, selector, tipos).
- [x] Tema oscuro/claro sin parpadeo.
- [x] Tokens de diseño, tipografías autoalojadas, colores de tipo.
- [x] Cabecera, pie con aviso legal, inicio, 404.
- [x] CI en GitHub Actions.
- [x] Repositorio en GitHub y primer push.
- [ ] Proyecto conectado en Vercel y primer despliegue.

## Fase 2 · Pokédex 🚧

- [x] CLI de Supabase en el proyecto (`supabase/config.toml`).
- [x] Migración de los datos de referencia (tipos, especies, formas,
      estadísticas, habilidades, traducciones) con RLS.
- [x] Script de importación desde PokeAPI (idempotente, transaccional, TLS
      verificado), con tests (Vitest) y verificado contra PostgreSQL 17.
- [x] Proyecto de Supabase creado (París), migración aplicada y datos importados.
- [x] Cliente de Supabase en la web (clave publicable) y tipos generados.
- [x] Listado con búsqueda (nombre o número, sin acentos), filtros por hasta
      dos tipos y por generación, URL compartible.
- [ ] Ficha de Pokémon (estadísticas, habilidades, descripción, formas).
- [ ] Despliegue en Vercel (región París, `cdg1`).

## Fase 3 · Calculadora de tipos

- [ ] Tabla de efectividades en base de datos.
- [ ] Lógica pura de multiplicadores (con tests exhaustivos).
- [ ] Interfaz: uno o dos tipos, ataque y defensa, tabla 18 × 18.

## Fase 4 · Evoluciones

- [ ] Cadenas evolutivas y métodos importados.
- [ ] Componente de cadena (con ramificaciones) integrado en la ficha.

## Fase 5 · Movimientos, habilidades y objetos

- [ ] Listados, fichas y relación con los Pokémon que los usan.
- [ ] Búsqueda global.

## Fase 6 · Cuentas

- [ ] Supabase Auth (email + OAuth), perfiles, panel personal.
- [ ] Tests de políticas RLS.
- [ ] Borrado de cuenta.

## Fase 7 · Constructor de equipos

- [ ] Editor de equipo, análisis de debilidades y coberturas.
- [ ] Guardar en la cuenta; importar/exportar formato Showdown.
- [ ] Tests E2E (Playwright) del flujo completo.

## Fase 8 · Colección

- [ ] Marcar capturados (variocolores y formas), progreso por generación.

## Fase 9 · Comunidad

- [ ] Equipos y colecciones públicos, valoraciones, comentarios, moderación.
