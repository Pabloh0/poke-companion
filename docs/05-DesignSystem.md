# 05 · Sistema de diseño

> Última actualización: 2026-11-20 · Fuente de verdad del código: `src/app/globals.css`

## Concepto: «La carpeta del coleccionista»

PokéCompanion es una **carpeta de cartas coleccionables**. Cada Pokémon es una
carta física (con marco, ventana de ilustración, número de colección y rareza)
y la web es la carpeta donde se guardan: páginas gris frío con la cuadrícula
de las fundas, pestañas de separador para filtrar y una lista de comprobación
de la colección.

Principios:

1. **La carta es el objeto.** Todo lo demás (cabecera, filtros, textos) es
   sobrio para que las cartas y los colores de tipo destaquen.
2. **Los tipos son el color.** Los 18 colores de tipo son datos: marcos de
   carta, pegatinas de separador y etiquetas. La interfaz en sí solo usa tinta
   y cobalto.
3. **Un único momento memorable:** el efecto holográfico de las cartas. El
   resto del movimiento es mínimo.
4. **Vocabulario del coleccionismo, no del dashboard:** pestañas de carpeta,
   pegatinas de separador, número de carta "025/1025", lista de colección.
5. **Diseño de carta propio.** No se imita la carta oficial del juego de cartas
   Pokémon (borde amarillo, PS arriba a la derecha, símbolos de energía,
   franja de debilidad y resistencia): son elementos con derechos.

## Color

### Tema claro: «Catálogo» (por defecto)

| Token              | Hex       | Nombre       | Uso                                        |
| ------------------ | --------- | ------------ | ------------------------------------------ |
| `background`       | `#E7E9EE` | Gris carpeta | Página (con la cuadrícula de fundas)       |
| `foreground`       | `#1A1C23` | Tinta        | Texto principal (14:1)                     |
| `card`             | `#F5F6F9` | Panel        | Superficies de interfaz, página de carpeta |
| `muted-foreground` | `#545969` |              | Texto secundario (5,7:1)                   |
| `primary`          | `#2747C8` | Cobalto      | Acciones y enlaces (blanco encima: 7,4:1)  |
| `highlight`        | `#2747C8` |              | Texto destacado (6,1:1)                    |
| `border`           | `#C9CDD6` |              | Divisores decorativos                      |
| `input`            | `#767C8C` |              | Bordes de campos de formulario (≥ 3:1)     |
| `ring`             | `#2747C8` |              | Foco de teclado                            |

### Tema oscuro: «Carpeta de noche»

| Token              | Hex       | Uso                                      |
| ------------------ | --------- | ---------------------------------------- |
| `background`       | `#1C2030` | Página                                   |
| `foreground`       | `#E9EBF2` | Texto principal (13,6:1)                 |
| `card`             | `#262B3D` | Superficies, página de carpeta           |
| `muted-foreground` | `#A5ABBE` | Texto secundario (7:1)                   |
| `primary`          | `#9DAEFF` | Acciones (texto `#10131C` encima: 8,8:1) |
| `input`            | `#6B7290` | Bordes de campos (3,4:1)                 |

### Cartulina (igual en ambos temas)

Las cartas son objetos impresos: se ven igual con tema claro u oscuro, como
cartas reales sobre una mesa. Tokens fijos (`@theme static`):

| Token             | Hex       | Uso                                  |
| ----------------- | --------- | ------------------------------------ |
| `stock`           | `#FCFBF7` | Fondo de la carta                    |
| `stock-shade`     | `#EFEDE6` | Franja inferior de la carta          |
| `stock-ink`       | `#1A1C23` | Texto de la carta (16:1)             |
| `stock-ink-muted` | `#5B5F6B` | Texto secundario de la carta (6,2:1) |

**Regla:** dentro de una carta se usan los tokens `stock-*`, nunca los de
página.

### Colores de tipo

Clases `bg-type-<tipo>`; también como variables (`var(--color-type-fire)`)
para los marcos. El color del texto encima se elige por tipo para cumplir
WCAG AA (`src/features/types/data/pokemon-types.ts`).

| Tipo     | Hex       | Texto  | Contraste |
| -------- | --------- | ------ | --------- |
| normal   | `#A8A77A` | oscuro | 6,8:1     |
| fire     | `#EE8130` | oscuro | 6,3:1     |
| water    | `#6390F0` | oscuro | 5,5:1     |
| electric | `#F7D02C` | oscuro | 11,3:1    |
| grass    | `#7AC74C` | oscuro | 8,1:1     |
| ice      | `#96D9D6` | oscuro | 10,6:1    |
| fighting | `#C22E28` | blanco | 5,7:1     |
| poison   | `#A33EA1` | blanco | 5,6:1     |
| ground   | `#E2BF65` | oscuro | 9,6:1     |
| flying   | `#A98FF3` | oscuro | 6,4:1     |
| psychic  | `#F95587` | oscuro | 5,4:1     |
| bug      | `#A6B91A` | oscuro | 7,7:1     |
| rock     | `#B6A136` | oscuro | 6,6:1     |
| ghost    | `#735797` | blanco | 5,9:1     |
| dragon   | `#6F35FC` | blanco | 5,9:1     |
| dark     | `#705746` | blanco | 6,7:1     |
| steel    | `#B7B7CE` | oscuro | 8,6:1     |
| fairy    | `#D685AD` | oscuro | 6,3:1     |

## Tipografía

| Rol                                   | Familia                                         | Clase                                        |
| ------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| Interfaz y títulos                    | **Archivo** (variable: peso y anchura 62–125 %) | `font-sans`, `font-display`                  |
| Nombres y números de carta, titulares | Archivo condensada                              | `condensed` (72 %), `extra-condensed` (62 %) |
| Textos y descripciones                | **Newsreader** (serif editorial)                | `font-serif`                                 |
| Categoría en las cartas               | Newsreader cursiva                              | `font-serif italic`                          |

- Una sola familia de palo seco (Archivo) cubre interfaz y titulares gracias
  a su eje de anchura; la serif aporta el tono de "texto impreso" de las cartas.
- Titulares: Archivo condensada en peso 900, interlineado muy cerrado
  (`leading-[0.85]`–`[0.9]`).
- Números de carta y estadísticas: `tabular-nums`.
- Párrafos: 44–60 caracteres por línea (`max-w-[46ch]`…`[60ch]`).
- Sin mayúsculas sostenidas en etiquetas.

## Forma, superficies y espacio

- **Proporción de carta 5:7** (`aspect-[5/7]`), la de cualquier carta
  coleccionable.
- Radios con jerarquía: carta 14 px (marco) / 10 px (interior); paneles
  `rounded-xl`; botones y campos `rounded-md`; pegatinas y etiquetas 4–5 px.
  Nada de píldoras.
- **Sombras solo en objetos físicos** (las cartas): sombra corta + sombra
  difusa. La interfaz se separa con bordes y con reglas gruesas
  (`border-t-[3px] border-foreground`), como el lomo de una carpeta.
- Fondo de página: cuadrícula de 32 px muy tenue (`--sleeve-line`), fija.
- Ancho máximo de contenido `max-w-6xl`, alineado a la izquierda.

## Patrones

### Anatomía de la carta (`PokemonCard`)

```text
╔═ marco: degradado tipo 1 → tipo 2 ═╗
║ Nombre (Archivo condensada 800)    ║
║ ┌────────────────────────────────┐ ║
║ │ ventana: tinte del tipo +      │ ║
║ │ trama de puntos + sprite       │ ║
║ └────────────────────────────────┘ ║
║ [Tipo] [Tipo]          Total 320   ║
║ Pokémon Ratón (serif cursiva)      ║
║ 0025/1025     Gen. I          ●    ║  ← franja stock-shade
╚════════════════════════════════════╝
```

- **Formas regionales**: el nombre de la especie («Vulpix») y, a su derecha,
  un **sello de región** en tinta («Alola»), como el símbolo de expansión de
  una carta alternativa. Mismo número de colección que la original, sprite
  propio. En los Tauros de Paldea la variedad sustituye a la categoría.

- Rareza: ● común, ★ legendario, ✦ singular (con texto para lectores de
  pantalla). Legendarios y singulares llevan brillo holográfico permanente.
- Si falta la categoría en el idioma (127 especies recientes en español), la
  línea queda vacía para no descuadrar la carta.
- **La carta se adapta a su propio ancho** (consultas de contenedor
  `@container`), no al de la pantalla, porque aparece a varios tamaños:
  - desde 13rem (208 px) se lee «Total 320»; desde 11,5rem, solo «320» junto a
    los tipos;
  - por debajo de 11,5rem el total baja a la línea de la categoría, que se
    recorta con puntos suspensivos;
  - por debajo de 9rem las etiquetas de tipo usan Archivo condensada, y por
    debajo de 8rem (móviles de 320 px) extracondensada, y el pie oculta
    «Gen. I» para no partirse en dos líneas.
  - Comprobado midiendo las 1025 cartas de 320 a 1280 px: ningún tipo tapa el
    total ni se sale de la carta.

### Efecto holográfico (`HoloSurface` + `.holo-card`)

- Un único componente cliente escucha el ratón para toda la rejilla (delegación
  de eventos) y escribe variables CSS (`--mx`, `--my`, `--rx`, `--ry`). El
  dibujo es CSS: inclinación 3D de hasta 10°/14° y una lámina iridiscente con
  `mix-blend-mode: color-dodge` que sigue al cursor.
- Solo con ratón (en pantallas táctiles, inclinar al hacer scroll molesta).
- Con «reducir movimiento», la carta no se inclina.

### Ficha (`/pokedex/[slug]`)

- **Carta grande** (`PokemonHeroCard`): el mismo diseño que la del listado,
  impresa en grande con el artwork oficial, y con efecto holográfico.
- **Cabecera**: número `#0025` en cobalto, nombre gigante en Archivo condensada
  (tamaño fluido con `clamp` para que los nombres de 12 letras quepan a 360 px)
  y categoría en serif cursiva.
- **Entrada de la Pokédex**: cita en serif cursiva grande, con una regla
  vertical del color del tipo principal.
- **Datos**: altura y peso formateados según el idioma (`0,4 m` / `0.4 m`),
  región y habilidades (la oculta, marcada en cursiva).
- **Estadísticas base** (`StatBars`): barras del color del tipo principal sobre
  255, siempre con el número escrito al lado.
- **Línea evolutiva** (`EvolutionLine`): las cartas de la familia dispuestas
  como sobre una mesa, con flechas entre fases. En móvil las fases van de
  arriba abajo; desde `sm`, de izquierda a derecha. Las ramas se muestran una
  junto a otra (Wurmple → Silcoon/Cascoon, cada una con su siguiente fase) y,
  si son más de tres, en una cuadrícula (las 8 de Eevee: 2 columnas, 3 en `md`
  y `xl`). La carta de la ficha actual no es enlace: lleva un contorno de 3 px
  y `aria-current="page"`. Si no evoluciona, una frase lo dice.
- **Formas regionales**: si la especie tiene formas, una fila con la original y
  todas sus formas (la de la ficha actual, recuadrada). En la ficha de una
  forma, la región que se muestra es la de la forma.
- **Pasar hoja** (`PokemonPager`): anterior y siguiente con su sprite, como las
  páginas de una carpeta.

### Panel de filtros (`PokedexFilterBar`)

Un único panel con una fila por filtro (Buscar, Generación, Tipos, Formas
regionales), como la hoja índice al principio de una carpeta: el nombre del
filtro a la izquierda (debajo de `md`, encima) y los controles a la derecha,
separados por líneas finas.

- **Todo en el mismo plano y alineado.** Cada opción es una casilla con borde
  del mismo alto (36 px); la elegida se rellena. Nada queda «detrás» de otra
  cosa: se sustituyeron las pestañas de carpeta por esto a petición del
  usuario (D-25).
- Generación y región usan `SegmentedControl` (radios nativos, flechas del
  teclado): 10 casillas en una fila (5 × 2 en móvil) y 5 casillas.
- Los tipos, en una rejilla fija de 6 × 3 (3 × 6 en móvil), siempre con la
  misma forma.
- Todos los controles ocupan el mismo ancho, así que sus bordes coinciden.
- En móvil, generación, tipos y región se pliegan tras un botón «Filtros» que
  muestra cuántos hay activos; la búsqueda queda siempre visible.
- Encima de las cartas, los filtros activos aparecen como fichas («Fuego ✕»)
  que se quitan una a una.

### Pegatinas de separador (filtro de tipos y enlaces de tipo)

Rectángulos con una banda del color del tipo a la izquierda. Seleccionadas
(`aria-pressed`), se rellenan con el color. Al llegar a dos tipos, el resto se
deshabilita.

Es un componente compartido (`TypeToggle`): la calculadora usa el mismo. Allí,
al defender, un tercer tipo sustituye al segundo en vez de bloquearse, y al
atacar solo hay uno.

### Calculadora de tipos (`/tipos`)

- Misma cabecera de «lomo de carpeta» que la Pokédex.
- **Defensa / Ataque** con el mismo `SegmentedControl` que los filtros de la
  Pokédex, y los tipos en la misma rejilla de casillas (3 columnas).
- Pegatinas de tipo a la izquierda y el resultado a la derecha (debajo en
  móvil). El resultado es una **ficha de referencia impresa** (`MatchupList`):
  el multiplicador en cifras grandes condensadas (×4, ×2, ×1, ×½, ×¼, ×0), su
  nombre debajo («Muy débil», «Inmune»…) y los tipos al lado. La fila ×1 va
  atenuada porque es la menos útil. Las filas vacías no se muestran.
- **Tabla 18 × 18** (`TypeChart`): `<table>` real con encabezados de tipo de
  color (columnas en vertical). Casillas: «2» en cobalto, «½» en gris, «0» en
  tinta y vacías para ×1. Cada casilla lleva su número, así que el color nunca
  es la única pista. En móvil la tabla se desliza dentro de su caja, con la
  columna de tipos de ataque fija.

### Debilidades en la ficha

La misma `MatchupList`, en tamaño pequeño y sin la fila ×1, debajo de los datos.
Una nota aclara que no cuenta habilidades (Levitación anula Tierra) y enlaza a
la calculadora con los tipos del Pokémon.

### Mano de cartas (`CardFan`)

Cinco cartas reales en abanico en el inicio. Al cargar se "reparten" (la única
animación orquestada de la web, `animate-deal`). La sección recorta lo que
sobresale para no generar nunca scroll horizontal (comprobado a 360 px).

### Lista de la colección

La hoja de ruta se presenta como la lista de comprobación de una colección:
número `001/008`, casilla y nombre. La numeración es una secuencia real (orden
de publicación).

### Cabecera

Con dos enlaces en el menú, por debajo de `sm` los huecos y el selector de
idioma se estrechan un poco para que todo quepa a 320 px.

Fija arriba con fondo translúcido. Debajo de `sm` solo se ve el símbolo de la
marca para que menú, idioma y tema quepan (comprobado a 360 px). Página actual
del menú: subrayado grueso.

## Movimiento

- Una animación orquestada por página como máximo (el reparto de cartas del
  inicio).
- El resto, solo en respuesta a acciones: holo e inclinación al pasar el ratón,
  transiciones cortas de color.
- `prefers-reduced-motion` desactiva animaciones, transiciones e inclinación.

## Componentes

| Componente         | Ubicación                                                | Tipo   |
| ------------------ | -------------------------------------------------------- | ------ |
| `Button`           | `src/components/ui/button.tsx` (shadcn)                  | Server |
| `TypeBadge`        | `src/features/types/components/type-badge.tsx`           | Server |
| `PokemonCard`      | `src/features/pokedex/components/pokemon-card.tsx`       | Server |
| `PokemonCardLink`  | `src/features/pokedex/components/pokemon-card.tsx`       | Server |
| `PokemonHeroCard`  | `src/features/pokedex/components/pokemon-hero-card.tsx`  | Server |
| `StatBars`         | `src/features/pokedex/components/stat-bars.tsx`          | Server |
| `PokemonPager`     | `src/features/pokedex/components/pokemon-pager.tsx`      | Server |
| `HoloSurface`      | `src/features/pokedex/components/holo-surface.tsx`       | Client |
| `CardFan`          | `src/features/pokedex/components/card-fan.tsx`           | Server |
| `PokedexFilterBar` | `src/features/pokedex/components/pokedex-filter-bar.tsx` | Client |
| `SegmentedControl` | `src/components/ui/segmented-control.tsx`                | Server |
| `EvolutionLine`    | `src/features/pokedex/components/evolution-line.tsx`     | Server |
| `BrandMark`        | `src/components/layout/brand-mark.tsx`                   | Server |
| `SiteHeader`       | `src/components/layout/site-header.tsx`                  | Server |
| `MainNav`          | `src/components/layout/main-nav.tsx`                     | Client |
| `SiteFooter`       | `src/components/layout/site-footer.tsx`                  | Server |
| `LocaleSwitcher`   | `src/components/layout/locale-switcher.tsx`              | Client |
| `ThemeToggle`      | `src/components/layout/theme-toggle.tsx`                 | Client |

Para añadir componentes de shadcn/ui: `npx shadcn@latest add <componente>`, y
después adaptarlos a estos tokens (radios, colores).

## Marca

- Símbolo: **dos cartas apiladas**, la delantera en cobalto con una franja de
  lámina. Diseño propio; no se usa la Poké Ball ni logotipos oficiales.
- Logotipo: «PokéCompanion» en Archivo condensada 900. Siempre con tilde y C
  mayúscula.

## Accesibilidad (obligatorio)

- Contraste ≥ 4,5:1 en texto y ≥ 3:1 en bordes de campos y elementos gráficos
  informativos.
- Foco de teclado siempre visible (`:focus-visible` global con `ring`).
- Enlace «Saltar al contenido» como primer elemento enfocable.
- Botones de solo icono con `aria-label`; los símbolos de rareza llevan texto
  oculto para lectores de pantalla.
- El color nunca es la única forma de transmitir información: los tipos
  siempre llevan su nombre.

## Voz y textos

- Desde el punto de vista del jugador. El vocabulario de colección ("cartas",
  "colección") se usa con moderación y sin sacrificar claridad.
- Voz activa y verbos concretos: «Abrir la Pokédex», «Quitar filtros».
- Los errores explican qué ha pasado y cómo solucionarlo, sin disculpas.

## Qué evitamos (y por qué)

Para que la web no parezca hecha con plantilla: fondos casi negros con un único
acento chillón, rejillas de tarjetas idénticas con la misma sombra gris,
píldoras en todos los elementos, etiquetas en mayúsculas sobre cada título,
degradados decorativos y animaciones de aparición en cada sección.
