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

Verificación de la ficha (réplica de Supabase, build de producción, Chrome):

- Build con 2062 páginas prerenderizadas en 74 s.
- Pikachu: categoría, habilidades (Electricidad Estática, Pararrayos oculta),
  `0,4 m` y `6 kg`, región Kanto, anterior Arbok y siguiente Raichu.
- Pecharunt (#1025): entrada en inglés marcada con `lang="en"` y sin
  «siguiente»; Bulbasaur sin «anterior».
- Clic en una carta del listado → ficha; con teclado, el foco ilumina la lámina
  y Enter abre la ficha; el botón Atrás del navegador funciona.
- Sin scroll horizontal a 360 y 390 px con los 12 nombres más largos en ambos
  idiomas (p. ej. Crabominable, Ferropaladín, Brute Bonnet).
- Sin errores en consola ni respuestas fallidas.
- En producción (Vercel): portada, Pokédex (1025 cartas, Pecharunt incluido) y
  versión inglesa responden; la URL pública no pide iniciar sesión.

Verificación de la línea evolutiva (réplica de Supabase, build de producción,
Chrome):

- Las 340 familias que evolucionan, a 320, 360, 390, 640, 768, 1024 y 1280 px:
  sin scroll horizontal, ninguna carta se sale de la sección y siempre hay
  exactamente una carta marcada como actual.
- Las 1025 cartas de la rejilla a esas siete anchuras y las de todas las líneas
  a 320, 360, 640 y 1280 px: ningún tipo tapa el total ni se sale de la carta,
  y el pie ocupa una sola línea. Esta medición destapó que en móvil el segundo
  tipo tapaba el total en 392 cartas (y se cortaba a 320 px); corregido.
- Ivysaur: enlaces a Bulbasaur y Venusaur; Enter en Venusaur abre su ficha y
  el botón Atrás vuelve. Tauros: «no evoluciona». Sin errores en consola.

Verificación de la calculadora de tipos (réplica de Supabase, build de
producción, Chrome):

- `/tipos` y `/en/tipos` se prerenderizan como estáticas.
- Las 324 casillas de la tabla 18 × 18 de la página coinciden con el
  `type_efficacy.csv` original de PokeAPI (comprobación independiente del
  código).
- Fuego + Volador: ×4 Roca, ×2 Agua y Eléctrico, ×¼ Planta y Bicho, ×0 Tierra;
  la URL pasa a `?types=fire,flying`; un tercer tipo sustituye al segundo.
- Modo ataque (también con las flechas del teclado) conserva el primer tipo;
  Tierra: ×2 a Fuego, Eléctrico, Veneno, Roca y Acero, ×0 a Volador. La URL
  abierta directamente restaura el estado.
- «Ver en la Pokédex» con Fuego + Agua → Volcanion. Ficha de Charizard → su
  sección de debilidades → «Abrir en la calculadora» llega con sus tipos.
- Sin scroll horizontal en `/tipos` (vacía, defensa y ataque, ambos idiomas) a
  320, 360, 390, 640, 768, 1024 y 1280 px: en móvil solo se desliza la tabla.
  Esta prueba destapó dos fallos ya corregidos: la columna de la rejilla crecía
  con la tabla y los textos `sr-only` de las casillas escapaban de la caja.
- Cabecera con dos enlaces sin desbordar ni solaparse a esas anchuras; las
  1025 fichas sin scroll horizontal a 320, 390 y 1280 px. Sin errores en
  consola.

Tests unitarios actuales (`npm run test`, 69): transformación de datos de
PokeAPI (12), conexión segura (4), filtros y rareza de la Pokédex (12),
lógica de la ficha (8), árbol evolutivo (10: líneas rectas, ramas, números
desordenados como Pichu → Pikachu, especies sin evolución, cadenas
circulares), efectividades de tipos (13: totales e inmunidades de la tabla,
las 171 combinaciones de tipos, Charizard) y estado de la calculadora en la
URL (10).

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
