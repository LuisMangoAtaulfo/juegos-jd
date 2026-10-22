# Casual vs. Intencional

Módulo interactivo del módulo **Diseño y emisión de reportes**. Cinco tarjetas
con ilustraciones SVG (nubes, semáforo, gráfico de soporte, cartel, ramas) que
se deslizan a **casual** (←) o **intencional** (→). Después de cada respuesta
viene la retroalimentación con el resumen y los cuatro filtros de percepción.

**Qué enseña:** un mensaje intencional tiene emisor y propósito, y siempre
atraviesa filtros sensorial, operativo y cultural. Lo que "solo pasa" no tiene
quién lo haya compuesto.

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run check    # svelte-check (TypeScript + a11y)
npm run build    # build estático → build/
npm run preview  # sirve build/
```

## Cómo funciona

- `src/lib/cards.ts` — contenido de las tarjetas y etiquetas de los filtros.
- `src/lib/art/*.svelte` — ilustraciones (SVG con `role="img"` + etiqueta).
- **Entradas**: arrastre con puntero, botones, y teclado (`←` casual,
  `→` intencional).
- **Diálogo de retroalimentación**: gestiona foco, `Esc` avanza y el fondo
  queda `inert` mientras está abierto.
- Resultado: ✔ con 4–5 aciertos, ✘ con 0–2, estado intermedio neutro.

## Despliegue (Cloudflare Pages)

**Publicado:** https://jd-casual-intencional.pages.dev — proyecto `jd-casual-intencional`.

```sh
npm run build
wrangler pages deploy build --project-name=jd-casual-intencional --branch=main
```

El `static/_redirects` resuelve el SPA.
Dominio propio activo: `casual.mango-ataulfo.com` (respaldo: `jd-casual-intencional.pages.dev`).
