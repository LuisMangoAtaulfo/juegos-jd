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

**Ya publicado** (proyectos creados y builds subidos con wrangler). URLs en
producción:

| Proyecto | URL |
|---|---|
| `jd-pastel-3d` | https://jd-pastel-3d.pages.dev |
| `jd-experimento-3` | https://jd-experimento-3.pages.dev |
| `jd-dashboard-z` | https://jd-dashboard-z.pages.dev |
| `jd-casual-intencional` | https://jd-casual-intencional.pages.dev |
| `jd-portal` | https://jd-portal.pages.dev |

### Volver a publicar

```sh
for d in juego-pastel-3d juego-experimento-3 juego-dashboard-z juego-casual-intencional; do
  proj="jd-${d#juego-}"            # jd-pastel-3d, jd-experimento-3, …
  (cd "$d" && npm run build && wrangler pages deploy build --project-name="$proj" --branch=main)
done

# portal
mkdir -p dist && cp index.html styles.css dist/
wrangler pages deploy dist --project-name=jd-portal --branch=main
```

### Dominios propios (pendiente: solo DNS)

Los cuatro dominios ya están **adjuntados** a sus proyectos por la API
(`pastel/tres/tablero/casual.mango-ataulfo.com`, estado `pending`), pero faltan
los registros DNS: el token OAuth de wrangler solo tiene `zone:read`.

Un solo paso para activarlos (token con `Zone.DNS:Edit`):

```sh
export CF_API_TOKEN=xxxx
./scripts/dns-pages.sh
```

O a mano en **Cloudflare → DNS → mango-ataulfo.com → Add record**:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | `pastel` | `jd-pastel-3d.pages.dev` | Proxied |
| CNAME | `tres` | `jd-experimento-3.pages.dev` | Proxied |
| CNAME | `tablero` | `jd-dashboard-z.pages.dev` | Proxied |
| CNAME | `casual` | `jd-casual-intencional.pages.dev` | Proxied |

Cuando estén activos, cambiar los enlaces del portal (`index.html`) de
`*.pages.dev` a los subdominios propios.

## Accesibilidad

- Teclado completo: pastel (A/D), matriz + campo numérico, tablero (selección →
  colocación → `Esc`), tarjetas (`←`/`→` + botones).
- Estados anunciados con `role="status"` / `aria-live`.
- `prefers-reduced-motion` respetado (CSS global + guards en JS).
- El HTML prerenderizado ya incluye `<title>`, `meta description` y favicon
  (viven en cada `src/app.html`).
