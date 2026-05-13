# Valkyria Festival — Guía de Estilos

> Referencia de diseño y componentes para el proyecto **valkyria-frontend**.
> Stack: Angular 21 · Tailwind CSS v4 · PostCSS

---

## Índice

1. [Identidad de marca](#1-identidad-de-marca)
2. [Paleta de colores](#2-paleta-de-colores)
3. [Tipografía](#3-tipografía)
4. [Espaciado y layout](#4-espaciado-y-layout)
5. [Componentes base](#5-componentes-base)
6. [Animaciones y transiciones](#6-animaciones-y-transiciones)
7. [Modo oscuro (Admin)](#7-modo-oscuro-admin)
8. [Efectos visuales](#8-efectos-visuales)
9. [Responsive design](#9-responsive-design)
10. [Convenciones y reglas](#10-convenciones-y-reglas)

---

## 1. Identidad de marca

**Valkyria** es un festival de música. La estética es **teatral, oscura y enérgica**: fondo negro con imagen fija, tipografía serif mayúscula, y el rojo como único color de acento. Todo el diseño refuerza la sensación de espectáculo y poder.

### Principios visuales

| Principio                 | Descripción                                                                  |
|---------------------------|------------------------------------------------------------------------------|
| **Contraste extremo**     | Texto blanco / rojo sobre negro. Sin grises intermedios en la parte pública. |
| **Tipografía dominante**  | Las fuentes son parte del diseño, no solo portadoras de texto.               |
| **Mayúsculas + tracking** | El espaciado entre letras amplio (hasta `0.5em`) es marca de la casa.        |
| **Sobriedad cromática**   | Un único color de acento: `red-600`.                                         |
| **Movimiento elegante**   | Transiciones lentas (`600ms–800ms`), sin efectos bruscos.                    |

---

## 2. Paleta de colores

### Colores primarios

| Token          | Clase Tailwind                  | Hex       | Uso                                   |
|----------------|---------------------------------|-----------|---------------------------------------|
| Brand Red      | `bg-red-600` / `text-red-600`   | `#dc2626` | CTAs, hover, acentos, foco            |
| Brand Red Dark | `bg-red-700` / `border-red-700` | `#b91c1c` | Bordes activos, variantes oscuras     |
| White          | `text-white` / `bg-white`       | `#ffffff` | Texto principal, fondos alternativos  |
| Black          | `bg-black`                      | `#000000` | Fondo base del body                   |
| Neutral 950    | `bg-neutral-950`                | `#0a0a0a` | Sidebar del admin, fondos secundarios |

### Transparencias sobre negro (glass / dividers)

```
white/5  → rgba(255,255,255, 0.05)  — Bordes sutiles, cards
white/10 → rgba(255,255,255, 0.10)  — Inputs, dividers
white/20 → rgba(255,255,255, 0.20)  — Iconos secundarios
white/40 → rgba(255,255,255, 0.40)  — Texto de apoyo
white/60 → rgba(255,255,255, 0.60)  — Texto secundario, nav links
white/70 → rgba(255,255,255, 0.70)  — Texto medio
white/90 → rgba(255,255,255, 0.90)  — Texto casi principal
black/20 → rgba(0,0,0, 0.20)        — Overlay ligero
black/40 → rgba(0,0,0, 0.40)        — Overlay medio (imágenes)
black/50 → rgba(0,0,0, 0.50)        — Overlay estándar
black/90 → rgba(0,0,0, 0.90)        — Overlay oscuro (modales)
```

### Paleta admin (dark mode)

Solo se usa en las vistas de `/admin`. Añade clases con prefijo `dark:`.

| Tono        | Clase                | Uso                             |
|-------------|----------------------|---------------------------------|
| Slate 900   | `bg-slate-900`       | Fondo de cards, sidebar         |
| Slate 800   | `bg-slate-800`       | Filas alternas de tablas        |
| Slate 700   | `hover:bg-slate-700` | Hover de items de nav           |
| Slate 600   | `text-slate-600`     | Texto muted                     |
| Slate 400   | `text-slate-400`     | Texto secundario dark           |
| Purple 600  | `text-purple-600`    | Acciones especiales             |
| Indigo 600  | `bg-indigo-600`      | Botones de acción admin         |
| Gray 100/50 | `bg-gray-50`         | Cabeceras de tabla (light mode) |

---

## 3. Tipografía

### Fuentes

Las fuentes se definen en `src/styles.css` dentro del bloque `@theme`:

```css
--font-cinzel: 'Cinzel', serif;
--font-cinzel-decorative: 'Cinzel Decorative', serif;
--font-bebas: 'Oswald', sans-serif;
```

> Las fuentes deben estar importadas desde Google Fonts en el `<head>` del HTML.

### Jerarquía tipográfica

| Elemento         | Fuente               | Clase Tailwind                            | Uso                                     |
|------------------|----------------------|-------------------------------------------|-----------------------------------------|
| Logo / Hero      | Cinzel Decorative    | `font-cinzel-decorative`                  | Nombre "VALKYRIA", cartel principal     |
| H1, H3–H6        | Cinzel               | `font-cinzel` (aplicado en `@layer base`) | Títulos de sección, nombres de artistas |
| H2               | Oswald               | `font-bebas` (aplicado en `@layer base`)  | Subtítulos, encabezados de módulo       |
| Botones / Labels | Oswald               | `font-bebas` (aplicado en `@layer base`)  | Todos los botones y etiquetas form      |
| Body / Párrafos  | Sistema (sans-serif) | —                                         | Descripciones, textos largos            |

### Tamaños habituales

```
text-xs   → 12px  — Metadatos, badges, table headers
text-sm   → 14px  — Labels, botones, links de nav
text-base → 16px  — Cuerpo de texto estándar
text-xl   → 20px  — Subtítulos de sección
text-2xl  → 24px  — Títulos de card, nombres de artistas (móvil)
text-4xl  → 36px  — Títulos de sección grandes
text-9xl  → 128px — Hero principal / VALKYRIA wordmark
```

### Letter spacing (tracking)

El espaciado entre letras en mayúsculas es un elemento clave de la identidad:

```
tracking-[0.5em]  — Eyebrow / etiquetas de sección (máximo)
tracking-[0.4em]  — CTAs principales
tracking-[0.3em]  — Elementos de nav
tracking-[0.25em] — Subtítulos
tracking-[0.2em]  — Botones secundarios
tracking-widest   — Tailwind default (≈ 0.1em)
tracking-wider    — Tailwind default (≈ 0.05em)
tracking-tight    — Títulos grandes en Cinzel
```

### Pesos

```
font-medium   (500) — Texto de apoyo
font-semibold (600) — Énfasis moderado
font-bold     (700) — Labels, valores
font-black    (900) — Títulos hero, VALKYRIA
```

---

## 4. Espaciado y layout

### Contenedor máximo

```html
<div class="max-w-7xl mx-auto px-4 md:px-8">
  <!-- contenido -->
</div>
```

La anchura máxima estándar es `max-w-7xl` (1280px). El padding lateral cambia entre `px-4` (móvil) y `px-8` (desktop).

### Escala de gap / padding

```
2  → 8px   — Separación mínima entre elementos inline
4  → 16px  — Separación estándar entre items
6  → 24px  — Separación entre grupos de elementos
8  → 32px  — Separación entre secciones pequeñas
10 → 40px  — Padding interno de cards
12 → 48px  — Separación entre componentes
24 → 96px  — Separación entre secciones grandes de página
```

### Z-index layers

```
z-0   — Elementos de fondo (imagen, vídeo)
z-1   — Overlay sobre el fondo
z-10  — Elementos de contenido normal
z-40  — Menús desplegables, tooltips
z-50  — Header fijo, overlays
z-60  — Modales / dialogs
z-9999 — Splash screen (clase .splash-screen)
```

---

## 5. Componentes base

### Botón primario (CTA)

Color de fondo rojo → hover blanco con texto negro.

```html
<button class="bg-red-600 hover:bg-white
               text-white hover:text-black
               px-8 py-4
               text-sm tracking-[0.4em] uppercase
               transition-all duration-300
               transform hover:scale-105 active:scale-95
               shadow-2xl cursor-pointer">
  COMPRAR ENTRADAS
</button>
```

### Botón secundario (ghost / outline)

Fondo blanco → hover rojo.

```html
<button class="bg-white hover:bg-red-600
               text-black hover:text-white
               px-5 py-2.5
               text-sm uppercase tracking-[0.2em]
               transition-all duration-300
               shadow-xl shadow-white/5 cursor-pointer">
  Ver más
</button>
```

### Botón de acción admin

```html
<button class="bg-indigo-600 hover:bg-indigo-700
               text-white
               px-4 py-2 rounded-lg
               text-sm font-medium
               transition-colors duration-200 cursor-pointer">
  Guardar cambios
</button>
```

### Input de formulario (estilo festival)

Borde inferior, fondo transparente, foco en rojo.

```html
<input class="w-full bg-transparent
              border-b border-white/10
              focus:border-red-600
              py-2 text-white
              placeholder:text-gray-600
              focus:outline-none
              transition-all font-bold uppercase" />
```

### Input de formulario admin (con borde completo)

```html
<input class="w-full bg-white dark:bg-slate-800
              border border-gray-200 dark:border-slate-700
              text-gray-900 dark:text-white
              rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              text-sm transition-colors" />
```

### Card de contenido (dark / glass)

```html
<div class="bg-white/5 backdrop-blur-md
            border border-white/5
            p-4 flex justify-between items-center">
  <!-- contenido -->
</div>
```

### Card admin (light + dark mode)

```html
<div class="bg-white dark:bg-slate-900
            rounded-xl shadow-sm
            border border-gray-100 dark:border-slate-800
            p-6">
  <!-- contenido -->
</div>
```

### Divider / separador

```html
<!-- Horizontal -->
<div class="h-px bg-white/10 w-full"></div>

<!-- Vertical inline -->
<span class="w-px h-4 bg-white/20"></span>
```

### Badge / etiqueta de sección (eyebrow)

```html
<p class="font-bebas text-sm uppercase tracking-[0.5em] text-gray-500 mb-4">
  LINEUP 2025
</p>
```

### Link de navegación

```html
<a class="font-bebas text-sm tracking-widest
          text-white/60 hover:text-white
          transition-colors uppercase cursor-pointer">
  ARTISTAS
</a>
```

### Spinner de carga

```html
<div class="w-8 h-8 border-2 border-white/20 border-t-red-600
            rounded-full animate-spin"></div>
```

### Overlay de modal

```html
<div class="fixed inset-0 z-60 bg-black/90
            flex items-center justify-center
            backdrop-blur-sm">
  <!-- dialog content -->
</div>
```

### Tabla admin

```html
<table class="w-full text-sm">
  <thead>
    <tr class="bg-gray-50 dark:bg-slate-800
               text-gray-600 dark:text-slate-400
               uppercase text-xs font-semibold tracking-wider">
      <th class="px-4 py-3 text-left">Columna</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-t border-gray-100 dark:border-slate-800
               hover:bg-gray-50 dark:hover:bg-slate-800/50
               transition-colors">
      <td class="px-4 py-3 text-gray-900 dark:text-white">Valor</td>
    </tr>
  </tbody>
</table>
```

---

## 6. Animaciones y transiciones

### Clases de animación disponibles

Definidas en `src/styles.css`.

| Clase | Keyframe | Duración | Uso |
|-------|----------|----------|-----|
| `.animate-in` | `fadeInUp` | 600ms ease-out | Entrada de elementos al hacer scroll / mount |
| `.animate-video` | `videoFade` | 2.5s ease-in-out | Vídeo de fondo del hero |
| `.animate-reveal` | `revealBlur` | 800ms cubic-bezier | Reveal con blur (artistas, secciones) |
| `.animate-marquee` | `marquee` | 60s linear infinite | Texto en loop del footer |
| `animate-spin` | Tailwind built-in | — | Spinner de carga |
| `animate-pulse` | Tailwind built-in | — | Badge del carrito |

### Definiciones de keyframes

```css
/* Entrada suave desde abajo */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Entrada del header al cargar */
@keyframes slideDown {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}

/* Fade del vídeo de fondo */
@keyframes videoFade {
  from { opacity: 0; }
  to   { opacity: 0.6; }
}

/* Reveal con blur lateral */
@keyframes revealBlur {
  0%   { opacity: 0; transform: translateX(-20px) scale(0.98); filter: blur(10px); }
  100% { opacity: 1; transform: translateX(0) scale(1);        filter: blur(0); }
}

/* Marquee de scroll continuo */
@keyframes marquee {
  0%   { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}
```

### Transiciones estándar

```html
<!-- Transición completa (color + transform) -->
class="transition-all duration-300"

<!-- Solo color -->
class="transition-colors"

<!-- Solo transform -->
class="transition-transform"

<!-- Hover con escala (botones) -->
class="transform hover:scale-105 active:scale-95"
```

### Splash screen

La pantalla de carga usa clases CSS propias:

```html
<div class="splash-screen">        <!-- visible por defecto -->
<div class="splash-screen fade-out"> <!-- al terminar la carga → opacity: 0 -->
```

```html
<div class="main-content">          <!-- invisible por defecto -->
<div class="main-content main-content-fade"> <!-- cuando el splash desaparece → opacity: 1 -->
```

---

## 7. Modo oscuro (Admin)

El modo oscuro se activa añadiendo la clase `.dark` al elemento raíz (html/body). Solo se utiliza en el área `/admin`.

### Configuración

```css
/* styles.css */
@custom-variant dark (&:where(.dark, .dark *));
```

### Transiciones automáticas en dark mode

```css
.dark body, .dark div, .dark header, .dark aside, .dark section, .dark main {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
```

### Patrones de uso

Siempre usar en pares `light:value dark:value`:

```html
class="bg-white dark:bg-slate-900"
class="text-gray-900 dark:text-white"
class="text-gray-600 dark:text-slate-400"
class="border-gray-100 dark:border-slate-800"
class="bg-gray-50 dark:bg-slate-800"
class="hover:bg-gray-100 dark:hover:bg-slate-700"
```

---

## 8. Efectos visuales

### Fondo del body

El fondo del body es global y se define en `src/styles.css`. No debe replicarse en componentes.

```css
body {
  background-image: linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)),
                    url('../public/bg.jpg');
  background-attachment: fixed;   /* parallax fijo */
  background-position: center;
  background-size: cover;
  background-color: #000;
}
```

### Glassmorphism

Usado en el header, checkout y overlays semitransparentes:

```html
class="bg-zinc-900/80 backdrop-blur-xl border border-white/10"
class="bg-white/5 backdrop-blur-md border border-white/5"
class="backdrop-blur-sm"
```

### Glow / sombras

```html
<!-- Sombra estándar para CTAs -->
class="shadow-2xl"

<!-- Glow rojo (efectos especiales) -->
class="shadow-[0_0_40px_rgba(220,38,38,0.4)]"

<!-- Sombra blanca suave -->
class="shadow-xl shadow-white/5"

<!-- Sombra roja en dialogs -->
class="shadow-lg shadow-red-200"
```

### Filtros de imagen

```html
<!-- Logos de artistas en gris → color al hover -->
class="grayscale group-hover:grayscale-0 transition-all duration-300"
```

### Scroll sin scrollbar (Lineup móvil)

```html
<div class="overflow-x-auto no-scrollbar">
```

```css
/* styles.css */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## 9. Responsive design

### Enfoque mobile-first

Las clases base son para móvil. Los breakpoints amplían el diseño:

| Breakpoint | Tailwind | Píxeles |
|------------|----------|---------|
| Base       | —        | 0px+    |
| Small      | `sm:`    | 640px+  |
| Medium     | `md:`    | 768px+  |
| Large      | `lg:`    | 1024px+ |

### Patrones habituales

```html
<!-- Visibilidad por dispositivo -->
class="hidden lg:flex"          <!-- Solo desktop -->
class="lg:hidden"               <!-- Solo móvil/tablet -->

<!-- Tipografía responsive -->
class="text-sm md:text-base lg:text-xl"

<!-- Padding lateral -->
class="px-4 md:px-8"

<!-- Grid responsive -->
class="grid grid-cols-3 lg:grid-cols-6"
class="grid grid-cols-2 lg:grid-cols-4"
```

### Ajuste móvil especial (styles.css)

```css
@media (max-width: 768px) {
  /* Evita stroke muy grueso en móvil */
  h1 { -webkit-text-stroke-width: 0.5px !important; }

  /* Bloquea scroll del body cuando el menú está abierto */
  body.menu-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
  }
}
```

---

## 10. Convenciones y reglas

### Estructura de componentes

- Todos los componentes son **standalone** (`standalone: true`).
- Los estilos van **inline en el template** con clases Tailwind.
- No se crean archivos `.css` por componente salvo necesidad excepcional.
- El archivo `src/app/app.css` existe pero está vacío por diseño.

### Nomenclatura

| Elemento               | Convención                          |
|------------------------|-------------------------------------|
| Archivos de componente | `kebab-case.ts` / `kebab-case.html` |
| Clases Angular         | `PascalCase`                        |
| CSS custom properties  | `--kebab-case`                      |
| Clases CSS propias     | `.kebab-case`                       |

### Reglas de uso de color

1. El **rojo** (`red-600`) es el único color de acento en la parte pública. No introducir otros acentos.
2. Las transparencias (`white/X`, `black/X`) son la herramienta principal para dividers y overlays.
3. Los colores de paleta admin (purple, indigo, slate) **no deben usarse** en páginas públicas.

### Reglas de tipografía

1. Todo texto de UI (botones, labels, nav) va en **mayúsculas** con `tracking-[0.2em]` o más.
2. Los `h1`, `h3`–`h6` usan Cinzel automáticamente (definido en `@layer base`).
3. Los `h2`, `button` y `label` usan Oswald automáticamente.
4. No usar `font-cinzel-decorative` fuera de la marca/logo principal.

### Reglas de animación

1. Usar `.animate-in` para entradas de elementos en viewport — no inventar animaciones ad-hoc.
2. Las transiciones de hover son siempre `transition-all duration-300` o `transition-colors`.
3. Los botones siempre tienen `hover:scale-105 active:scale-95` para dar feedback táctil.

### Accesibilidad mínima

- Todos los inputs deben tener `focus:outline-none focus:border-red-600` visible.
- Los botones interactivos deben tener `cursor-pointer`.
- Las imágenes decorativas deben tener `alt=""` o `aria-hidden="true"`.
