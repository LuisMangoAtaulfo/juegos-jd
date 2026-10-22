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

**Publicado:** https://jd-experimento-3.pages.dev — proyecto `jd-experimento-3`.

```sh
npm run build
wrangler pages deploy build --project-name=jd-experimento-3 --branch=main
```

El `static/_redirects` resuelve el SPA.
Dominio propio pendiente de DNS: `tres.mango-ataulfo.com` (ver `scripts/dns-pages.sh`).
