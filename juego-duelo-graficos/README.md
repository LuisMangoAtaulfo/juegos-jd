# Duelo de Gráficos — Del caos al decluttering

Editor de carga cognitiva del módulo **Diseño y emisión de reportes**. Un
gráfico de líneas con todos los vicios (marcos pesados, cuadrícula oscura,
leyenda distante, etiquetas diagonales y paleta arcoíris) que el jugador va
limpiando con cuatro interruptores; una barra de **ruido visual** cae del
100 % al 15 % en tiempo real.

**Qué enseña:** cada interruptor es un principio de diseño — cierre (marcos),
cuadrícula, proximidad (leyenda → etiquetas directas) y estrategia cromática
(arcoíris → gris con una sola serie clave).

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run check    # svelte-check (TypeScript + a11y)
npm run build    # build estático → build/
npm run preview  # sirve build/
```

## Cómo funciona

- `src/routes/+page.svelte` — el SVG del gráfico (4 series × 12 meses) y los
  cuatro estados que controlan marcos, cuadrícula, leyenda/etiquetas y color.
- **Ruido visual:** `100 − (15 cierre + 25 cuadrícula + 20 proximidad +
  25 cromática)` → termina exactamente en 15 %, sin importar el orden.
- Interruptores reales (`input role="switch"`): funcionan con teclado y
  leen como on/off; el resultado se anuncia con `aria-live`.

## Despliegue (Cloudflare Pages)

**Publicado:** https://casual.mango-ataulfo.com — proyecto `jd-casual-intencional`
(este juego reemplazó al anterior *Casual vs. Intencional*, que sigue en
`juego-casual-intencional/`).

```sh
npm run build
wrangler pages deploy build --project-name=jd-casual-intencional --branch=main
```

El `static/_redirects` (`/* /index.html 200`) resuelve el SPA.
