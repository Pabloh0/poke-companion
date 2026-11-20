# 02 · Requisitos

> Última actualización: 2026-11-20

Cada requisito tiene un identificador para poder referenciarlo desde issues y
commits. Estado: ✅ hecho · 🔜 siguiente · ⏳ pendiente.

## Requisitos funcionales

### Generales (RF-G)

| ID     | Requisito                                                                | Estado |
| ------ | ------------------------------------------------------------------------ | ------ |
| RF-G01 | La web está disponible en español (principal) e inglés.                  | ✅     |
| RF-G02 | El idioma se detecta del navegador la primera vez y se recuerda después. | ✅     |
| RF-G03 | El usuario puede cambiar de idioma sin perder la página en la que está.  | ✅     |
| RF-G04 | Tema oscuro por defecto y tema claro; la elección se recuerda.           | ✅     |
| RF-G05 | Las direcciones inexistentes muestran una página 404 útil.               | ✅     |
| RF-G06 | Búsqueda global de Pokémon, movimientos, habilidades y objetos.          | ⏳     |

### Pokédex (RF-P)

| ID     | Requisito                                                             | Estado |
| ------ | --------------------------------------------------------------------- | ------ |
| RF-P01 | Listado de todos los Pokémon con número, nombre, sprite y tipos.      | 🔜     |
| RF-P02 | Filtros por tipo y generación; búsqueda por nombre o número.          | 🔜     |
| RF-P03 | Ficha con estadísticas base, habilidades, altura, peso y descripción. | 🔜     |
| RF-P04 | Formas alternativas (regionales, Mega, Gigamax…) dentro de la ficha.  | ⏳     |
| RF-P05 | Movimientos que aprende, por método (nivel, MT, huevo, tutor).        | ⏳     |
| RF-P06 | Nombres y descripciones en el idioma del usuario.                     | 🔜     |

### Calculadora de tipos (RF-T)

| ID     | Requisito                                                          | Estado |
| ------ | ------------------------------------------------------------------ | ------ |
| RF-T01 | Elegir uno o dos tipos defensivos y ver multiplicadores recibidos. | ⏳     |
| RF-T02 | Elegir un tipo de ataque y ver su efectividad contra cada tipo.    | ⏳     |
| RF-T03 | Tabla completa de efectividades 18 × 18.                           | ⏳     |

### Evoluciones (RF-E)

| ID     | Requisito                                                               | Estado |
| ------ | ----------------------------------------------------------------------- | ------ |
| RF-E01 | Cadena evolutiva completa, incluidas ramificaciones (p. ej. Eevee).     | ⏳     |
| RF-E02 | Método exacto de cada evolución (nivel, objeto, amistad, intercambio…). | ⏳     |

### Base de datos de movimientos, habilidades y objetos (RF-D)

| ID     | Requisito                                                        | Estado |
| ------ | ---------------------------------------------------------------- | ------ |
| RF-D01 | Listado y ficha de movimientos (tipo, categoría, potencia, PP…). | ⏳     |
| RF-D02 | Listado y ficha de habilidades con los Pokémon que las tienen.   | ⏳     |
| RF-D03 | Listado y ficha de objetos.                                      | ⏳     |

### Cuentas y perfil (RF-A)

| ID     | Requisito                                              | Estado |
| ------ | ------------------------------------------------------ | ------ |
| RF-A01 | Registro e inicio de sesión (email y proveedor OAuth). | ⏳     |
| RF-A02 | Perfil público con nombre de entrenador y avatar.      | ⏳     |
| RF-A03 | Panel personal con resumen de equipos y colección.     | ⏳     |
| RF-A04 | Borrado de cuenta y de todos los datos asociados.      | ⏳     |

### Constructor de equipos (RF-B)

| ID     | Requisito                                                             | Estado |
| ------ | --------------------------------------------------------------------- | ------ |
| RF-B01 | Crear equipos de hasta 6 Pokémon con movimientos, habilidad y objeto. | ⏳     |
| RF-B02 | Ver debilidades y coberturas del equipo en conjunto.                  | ⏳     |
| RF-B03 | Guardar, editar y borrar equipos (requiere cuenta).                   | ⏳     |
| RF-B04 | Exportar e importar en el formato de texto de Showdown.               | ⏳     |

### Colección (RF-C)

| ID     | Requisito                                                        | Estado |
| ------ | ---------------------------------------------------------------- | ------ |
| RF-C01 | Marcar Pokémon como capturados, incluidos variocolores y formas. | ⏳     |
| RF-C02 | Ver progreso total y por generación.                             | ⏳     |

### Comunidad (RF-S)

| ID     | Requisito                                           | Estado |
| ------ | --------------------------------------------------- | ------ |
| RF-S01 | Publicar equipos y colecciones de forma pública.    | ⏳     |
| RF-S02 | Valorar y comentar equipos publicados.              | ⏳     |
| RF-S03 | Herramientas de moderación y denuncia de contenido. | ⏳     |

## Requisitos no funcionales

| ID     | Categoría      | Requisito                                                                                        |
| ------ | -------------- | ------------------------------------------------------------------------------------------------ |
| RNF-01 | Rendimiento    | Páginas públicas prerenderizadas siempre que sea posible. Objetivo: LCP < 2,5 s en móvil (4G).   |
| RNF-02 | Accesibilidad  | WCAG 2.2 nivel AA: contraste ≥ 4,5:1, navegación por teclado, foco visible, movimiento reducido. |
| RNF-03 | Responsive     | Usable desde 360 px de ancho.                                                                    |
| RNF-04 | Seguridad      | Row Level Security en todas las tablas de usuario; ningún secreto en el cliente ni en Git.       |
| RNF-05 | Privacidad     | Sin peticiones a terceros innecesarias (tipografías autoalojadas); sin rastreo publicitario.     |
| RNF-06 | i18n           | Ningún texto visible escrito directamente en el código: todo pasa por `src/messages/`.           |
| RNF-07 | SEO            | Metadatos por página, `hreflang` entre idiomas, 404 reales para direcciones inexistentes.        |
| RNF-08 | Mantenibilidad | TypeScript estricto, CI verde obligatorio para fusionar en `main`.                               |
| RNF-09 | Legal          | Aviso de no afiliación visible en todas las páginas.                                             |
