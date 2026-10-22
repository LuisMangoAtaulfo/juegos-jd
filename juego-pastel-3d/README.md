# Juicio al pastel 3D

Módulo interactivo del módulo **Diseño y emisión de reportes**. Un reto de
percepción: ocho rebanadas de un pastel inclinado en 3D, dos de ellas
candidatas (A y D). El jugador elige, descubre que la perspectiva lo engañó y
convierte el pastel en **barras horizontales con eje en cero**.

**Qué enseña:** por qué ángulos, áreas y volúmenes en perspectiva son peores
que longitudes alineadas para comparar; y por qué la línea base honesta (0)
es la regla cuando la comparación es el mensaje.

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run check    # svelte-check (TypeScript + a11y)
npm run build    # build estático → build/
npm run preview  # sirve build/
```

## Cómo funciona

- `src/routes/+page.svelte` — el pastel SVG con `perspective() / rotateX(56deg)`,
  la elección A/D y la conversión animada a barras (`tweened` de Svelte 5).
- Las rebanadas A y D son focoseables (`tabindex` + `Enter`/`Espacio`); el
  resultado se anuncia con `role="status"`.
- `prefers-reduced-motion` apaga las animaciones (global y en el tween).

## Despliegue (Cloudflare Pages)

**Publicado:** https://jd-pastel-3d.pages.dev — proyecto `jd-pastel-3d`.

```sh
npm run build
wrangler pages deploy build --project-name=jd-pastel-3d --branch=main
```

El `static/_redirects` (`/* /index.html 200`) resuelve el SPA sin nada más.
Dominio propio activo: `pastel.mango-ataulfo.com` (respaldo: `jd-pastel-3d.pages.dev`).
