# 05 · Sistema de diseño

> Última actualización: 2026-11-20 · Fuente de verdad del código: `src/app/globals.css`

## Concepto: "ruta de noche"

PokéCompanion se siente como el **instrumento de campo de un investigador**: un
fondo índigo profundo (no negro), un acento amarillo de señal y los colores de
los 18 tipos como la capa de información. Nada de paneles genéricos de
dashboard: la personalidad viene del mundo del juego (tipos, números de
Pokédex, estadísticas), no de la decoración.

Principios:

1. **Los tipos son el color.** Los 18 colores de tipo son datos, no adorno: se
   usan para identificar tipos y nada más.
2. **Un solo acento de marca.** El amarillo Voltio marca lo importante (acción
   principal, estado actual, números destacados). Si todo resalta, nada resalta.
3. **Densidad legible.** Mucha información (estadísticas, tablas) con una
   tipografía de cuerpo diseñada para leerse bien a tamaño pequeño.
4. **Estructura que informa.** Bordes, divisores y numeración solo cuando
   significan algo (la numeración solo para secuencias reales).
5. **Movimiento con intención.** Un único momento orquestado por página como
   mucho; animaciones que respondan a acciones del usuario.

## Color

### Tema oscuro (por defecto)

| Token                | Hex       | Nombre     | Uso                                |
| -------------------- | --------- | ---------- | ---------------------------------- |
| `background`         | `#141833` | Noche      | Fondo de página                    |
| `foreground`         | `#ECEEFB` | Luna       | Texto principal (15:1 sobre Noche) |
| `card`               | `#1C2147` | Superficie | Paneles, menús                     |
| `muted-foreground`   | `#A3A9D1` | Niebla     | Texto secundario (7,6:1)           |
| `border`             | `#2E3566` | Trazo      | Bordes y divisores                 |
| `primary`            | `#FFC93C` | Voltio     | Acción principal, estado actual    |
| `primary-foreground` | `#1A1630` |            | Texto sobre Voltio (11:1)          |
| `highlight`          | `#FFC93C` |            | Texto destacado (números, enlaces) |
| `ring`               | `#FFC93C` |            | Foco de teclado                    |
| `destructive`        | `#FF6B6B` |            | Errores, acciones destructivas     |

### Tema claro

| Token              | Hex       | Uso                                                        |
| ------------------ | --------- | ---------------------------------------------------------- |
| `background`       | `#F2F3F9` | Fondo (gris azulado frío, no crema)                        |
| `foreground`       | `#161A3A` | Texto principal (15:1)                                     |
| `card`             | `#FFFFFF` | Paneles                                                    |
| `muted-foreground` | `#565C85` | Texto secundario (5,8:1)                                   |
| `primary`          | `#FFC21A` | Acción principal (con texto oscuro, 10:1)                  |
| `highlight`        | `#8A5A00` | Texto destacado: el amarillo no se lee sobre claro (5,4:1) |
| `ring`             | `#3A44A0` | Foco de teclado (7,5:1)                                    |

**Regla:** nunca usar `text-primary` para texto; para texto destacado se usa
`text-highlight`, que tiene una versión legible en cada tema.

### Colores de tipo

Iguales en ambos temas. Clases: `bg-type-<tipo>`. El color del texto se elige
por tipo para cumplir WCAG AA (≥ 4,5:1); está en
`src/features/types/data/pokemon-types.ts`.

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

"Oscuro" = `#161A3A` (clase `text-ink`).

## Tipografía

| Rol     | Familia                                   | Por qué                                                                                 |
| ------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| Títulos | **Unbounded** (variable)                  | Geométrica, ancha y redondeada: recuerda a interfaces de videojuego sin imitar ninguna. |
| Cuerpo  | **Atkinson Hyperlegible Next** (variable) | Diseñada para máxima legibilidad (Braille Institute); ideal para datos densos.          |

- Clases: `font-display` (títulos) y `font-sans` (cuerpo, por defecto).
- Los `h1`–`h3` usan `font-display` automáticamente; para títulos de elementos
  pequeños dentro de listas se puede volver a `font-sans` en negrita.
- Números en tablas y estadísticas: `tabular-nums` para que las cifras se alineen.
- Longitud de línea: máximo ~60–72 caracteres en párrafos (`max-w-[60ch]`).
- Sin mayúsculas sostenidas para etiquetas; se usa _sentence case_.

Escala (rem): 0,75 · 0,875 · 1 · 1,125 · 1,25 · 1,5 · 1,875 · 2,25 · 3 · 3,75
(las clases `text-xs` … `text-6xl` de Tailwind siguen esta escala).

## Forma y espacio

- **Radios con jerarquía**, no uno para todo: chips de tipo y estados en
  píldora (`rounded-full`); botones y campos `rounded-md` (0,625 rem); paneles
  `rounded-lg` (0,875 rem); contenedores grandes `rounded-xl` (1,25 rem).
- Separación por **bordes y divisores**, no por sombras. Sin rejillas de
  tarjetas idénticas con sombra gris.
- Ancho máximo de contenido: `max-w-6xl` (72 rem), alineado a la izquierda.
- Espaciado en múltiplos de 4 px (escala de Tailwind).

## Movimiento

- Una sola animación orquestada por página. En el inicio: los 18 chips de tipo
  entran en secuencia al cargar.
- Transiciones cortas (150–300 ms) solo en respuesta a acciones.
- `prefers-reduced-motion` desactiva todas las animaciones (regla global).

## Componentes existentes

| Componente       | Ubicación                                      | Tipo   |
| ---------------- | ---------------------------------------------- | ------ |
| `Button`         | `src/components/ui/button.tsx` (shadcn)        | Server |
| `TypeBadge`      | `src/features/types/components/type-badge.tsx` | Server |
| `BrandMark`      | `src/components/layout/brand-mark.tsx`         | Server |
| `SiteHeader`     | `src/components/layout/site-header.tsx`        | Server |
| `SiteFooter`     | `src/components/layout/site-footer.tsx`        | Server |
| `LocaleSwitcher` | `src/components/layout/locale-switcher.tsx`    | Client |
| `ThemeToggle`    | `src/components/layout/theme-toggle.tsx`       | Client |

Para añadir componentes de shadcn/ui: `npx shadcn@latest add <componente>`.
Después, revisar que usa los tokens del proyecto (no colores fijos).

## Marca

- El símbolo de PokéCompanion es un **dispositivo de campo con su luz de
  señal**, diseño propio. No se usa la Poké Ball ni logotipos oficiales.
- El nombre se escribe siempre **PokéCompanion** (con tilde y C mayúscula).

## Accesibilidad (obligatorio)

- Contraste ≥ 4,5:1 para texto normal y ≥ 3:1 para elementos gráficos.
- Foco de teclado siempre visible (`:focus-visible` global con `ring`).
- Enlace "Saltar al contenido" como primer elemento enfocable.
- Botones de solo icono con `aria-label`.
- El color nunca es la única forma de transmitir información (los chips de
  tipo siempre llevan el nombre).

## Voz y textos

- Desde el punto de vista del jugador y con palabras del juego.
- Voz activa y verbos concretos: "Guardar equipo", no "Enviar".
- Una acción mantiene su nombre en todo el flujo (botón "Publicar" → aviso
  "Publicado").
- Los errores explican qué ha pasado y cómo solucionarlo, sin disculpas.
- Un estado vacío invita a actuar ("Aún no tienes equipos. Crea el primero").
