# Experimento del 3

Módulo interactivo del módulo **Diseño y emisión de reportes**. El jugador
cuenta los números **3** de una matriz de 4×12 con cronómetro, primero en gris
plano y después con los 3 en color y negrita. Al final compara sus dos tiempos
y guarda el intento en `localStorage`.

**Qué enseña:** los **atributos preatentivos** (color, forma, peso) se procesan
en milisegundos y de forma automática; sin ellos, la atención es serial y hay
que visitar celda por celda. Ese es el motivo legítimo de colorear un dato en
un reporte.

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run check    # svelte-check (TypeScript + a11y)
npm run build    # build estático → build/
npm run preview  # sirve build/
```

## Cómo funciona

- `src/lib/matrix.ts` — genera matrices con exactamente `TARGET` (8) números 3
  y persiste los intentos (`exp3.attempts`, últimos 8).
- `src/lib/MatrixGrid.svelte` — la matriz accesible (`role="img"` con etiqueta).
- Fases: `intro → plain → bridge → highlight → results`. El botón
  **Abandonar** detiene el cronómetro y vuelve al inicio sin guardar.
- El historial solo se muestra a partir del segundo intento.

## Despliegue (Cloudflare Pages)

| Campo | Valor |
|---|---|
| Root directory | `juego-experimento-3` |
| Build command | `npm ci && npm run build` |
| Output directory | `build` |
| Variable | `NODE_VERSION=22` |

Dominio: `tres.mango-ataulfo.com`. El `static/_redirects` resuelve el SPA.
