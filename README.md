# Módulos interactivos · Diseño y emisión de reportes

Cuatro juegos SvelteKit estáticos + un portal, uno por concepto del módulo.
Cada juego es independiente (su propio `package.json` y su propio sitio en
Cloudflare Pages) y comparten el mismo sistema de diseño
(`src/lib/styles/global.css`, idéntico en los cuatro).

| Carpeta | Juego | Concepto | Dominio |
|---|---|---|---|
| `juego-pastel-3d/` | Juicio al pastel 3D | Pastel/3D vs. barras con eje en 0 | `pastel.mango-ataulfo.com` |
| `juego-experimento-3/` | Experimento del 3 | Memoria icónica · atributos preatentivos | `tres.mango-ataulfo.com` |
| `juego-dashboard-z/` | Arma tu dashboard en Z | Arquitectura visual · patrón de lectura en Z | `tablero.mango-ataulfo.com` |
| `juego-casual-intencional/` | Casual vs. Intencional | Emisor, propósito y filtros de percepción | `casual.mango-ataulfo.com` |
| `index.html` + `styles.css` | **Portal** | Índice de los cuatro módulos | — |

Las carpetas `p2/`, `presentacion/` y `crucigrama/` son entregas de otras
materias y quedan fuera de este repositorio (están en `.gitignore`).

## Correr un juego

```sh
cd juego-pastel-3d   # o cualquiera de los otros tres
npm install
npm run dev
```

Verificación y build de los cuatro:

```sh
for d in juego-*; do
  (cd "$d" && npm run check && npm run build)
done
```

## Portal

`index.html` en la raíz es estático (sin build): sus enlaces apuntan a los
subdominios definitivos; si aún no existen, usa las URLs `*.pages.dev` de cada
proyecto de Cloudflare Pages.

## Despliegue en Cloudflare Pages

Un repositorio, **cinco proyectos** en Pages (Settings → Build & deploy →
*Connect to Git*), con *root directory* distinto por proyecto:

| Proyecto | Root directory | Build command | Output |
|---|---|---|---|
| `jd-pastel-3d` | `juego-pastel-3d` | `npm ci && npm run build` | `build` |
| `jd-experimento-3` | `juego-experimento-3` | `npm ci && npm run build` | `build` |
| `jd-dashboard-z` | `juego-dashboard-z` | `npm ci && npm run build` | `build` |
| `jd-casual` | `juego-casual-intencional` | `npm ci && npm run build` | `build` |
| `jd-portal` | *(raíz)* | `mkdir -p dist && cp index.html styles.css dist/` | `dist` |

- Variable de entorno `NODE_VERSION=22` en los cuatro juegos.
- Cada sitio trae `static/_redirects` con `/* /index.html 200`: Cloudflare
  Pages lo aplica tal cual y el SPA no da 404 al refrescar.
- `static/robots.txt` permite rastreo completo.
- Para los subdominios: en cada proyecto → **Custom domains** → agregar el
  dominio (el DNS debe estar en la misma cuenta de Cloudflare).

## Accesibilidad

- Teclado completo: pastel (A/D), matriz + campo numérico, tablero (selección →
  colocación → `Esc`), tarjetas (`←`/`→` + botones).
- Estados anunciados con `role="status"` / `aria-live`.
- `prefers-reduced-motion` respetado (CSS global + guards en JS).
- El HTML prerenderizado ya incluye `<title>`, `meta description` y favicon
  (viven en cada `src/app.html`).
