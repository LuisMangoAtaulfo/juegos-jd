# Arma tu dashboard en Z

Módulo interactivo del módulo **Diseño y emisión de reportes**. Un lienzo
3×3 donde se colocan cinco componentes de un tablero ejecutivo (KPI, tendencia,
filtros, tabla de detalle y fuente/notas) y un validador que evalúa la
**arquitectura visual** contra el patrón de lectura en Z.

**Qué enseña:** dónde mira primero la audiencia y qué reglas de posición hacen
que un tablero se lea de izquierda a derecha y de arriba hacia abajo.

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run check    # svelte-check (TypeScript + a11y)
npm run build    # build estático → build/
npm run preview  # sirve build/
```

## Reglas de validación

1. KPI en la esquina superior izquierda (inicio de la Z).
2. Filtros y tendencia en la banda superior.
3. Tabla de detalle en la mitad inferior (la Z desciende).
4. Fuente y notas en la fila inferior.
5. Todas las piezas colocadas.

## Cómo funciona

- `src/lib/pieces.ts` — piezas, iconos SVG y `validateBoard()`.
- **Arrastre con puntero** (mouse/touch) y **alternativa por teclado**:
  `Enter`/`Espacio` sobre una pieza la selecciona, `Enter` en una celda la
  coloca (o intercambia), `Esc` cancela y el botón *Devolver al banco* la
  regresa. Hay un `aria-live` con la selección y con el resultado de validar.
- *Ver patrón Z* dibuja el recorrido de la mirada; *Ver ejemplo* llena el
  tablero con la distribución recomendada.

## Despliegue (Cloudflare Pages)

| Campo | Valor |
|---|---|
| Root directory | `juego-dashboard-z` |
| Build command | `npm ci && npm run build` |
| Output directory | `build` |
| Variable | `NODE_VERSION=22` |

Dominio: `tablero.mango-ataulfo.com`. El `static/_redirects` resuelve el SPA.
