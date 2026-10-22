<script lang="ts">
	interface Serie {
		id: string;
		name: string;
		key?: boolean;
		rainbow: string;
		gray: string;
		values: number[];
	}

	const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

	const SERIES: Serie[] = [
		{
			id: 'ingresos',
			name: 'Ingresos',
			key: true,
			rainbow: '#dc2626',
			gray: '#2563eb',
			values: [55, 58, 57, 62, 65, 63, 68, 72, 75, 80, 86, 92]
		},
		{
			id: 'costos',
			name: 'Costos',
			rainbow: '#f59e0b',
			gray: '#64748b',
			values: [70, 72, 68, 71, 66, 69, 64, 66, 62, 60, 58, 55]
		},
		{
			id: 'tickets',
			name: 'Tickets',
			rainbow: '#7c3aed',
			gray: '#94a3b8',
			values: [45, 48, 52, 50, 55, 58, 60, 57, 62, 65, 66, 68]
		},
		{
			id: 'devoluciones',
			name: 'Devoluciones',
			rainbow: '#16a34a',
			gray: '#cbd5e1',
			values: [25, 28, 24, 30, 27, 32, 29, 33, 31, 35, 32, 30]
		}
	];

	// geometría del lienzo
	const W = 760;
	const H = 420;
	const X0 = 56;
	const X1 = 548;
	const Y0 = 24;
	const Y1 = 330;
	const TICKS = [0, 25, 50, 75, 100];

	const x = (i: number) => X0 + (i * (X1 - X0)) / (MONTHS.length - 1);
	const y = (v: number) => Y1 - (v / 100) * (Y1 - Y0);

	const path = (values: number[]) =>
		values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

	// interruptores: apagan un vicio cada uno
	let cierre = $state(false);
	let cuadricula = $state(false);
	let proximidad = $state(false);
	let cromatica = $state(false);

	const ruido = $derived(
		100 - (cierre ? 15 : 0) - (cuadricula ? 25 : 0) - (proximidad ? 20 : 0) - (cromatica ? 25 : 0)
	);
	const activos = $derived([cierre, cuadricula, proximidad, cromatica].filter(Boolean).length);

	// 100 % = rojo (caos) · 15 % = verde (depurado)
	const meterColor = $derived(
		`color-mix(in srgb, var(--success) ${(((100 - ruido) / 85) * 100).toFixed(1)}%, var(--danger))`
	);

	const colorOf = (s: Serie) => (cromatica ? s.gray : s.rainbow);
	const widthOf = (s: Serie) => (s.key ? 3 : 2.2);

	function reset() {
		cierre = false;
		cuadricula = false;
		proximidad = false;
		cromatica = false;
	}
</script>

<div class="split">
	<section class="card viz">
		<div class="viz-head">
			<span class="section-title">Indicadores mensuales · 2026</span>
			<span class="pill" class:danger={ruido === 100} class:success={ruido === 15}>
				{ruido === 100 ? 'Vista caótica' : ruido === 15 ? 'Vista depurada' : 'Depurando…'}
			</span>
		</div>

		<svg
			class="chart"
			viewBox="0 0 {W} {H}"
			role="img"
			aria-label="Gráfico de líneas de cuatro series mensuales con marcos pesados, cuadrícula oscura, leyenda lateral y paleta de colores saturados"
		>
			<!-- marcos pesados -->
			<rect class="frame" class:off={cierre} x="6" y="6" width="748" height="408" />
			<rect class="frame thin" class:off={cierre} x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} />

			<!-- cuadrícula -->
			<g class="grid" class:off={cuadricula}>
				{#each TICKS as t (t)}
					<line x1={X0} y1={y(t)} x2={X1} y2={y(t)} />
				{/each}
			</g>

			<!-- ejes -->
			<line class="axis" x1={X0} y1={Y1} x2={X1} y2={Y1} />
			<line class="axis" x1={X0} y1={Y0} x2={X0} y2={Y1} />

			{#each TICKS as t (t)}
				<text class="tick" x={X0 - 10} y={y(t) + 4}>{t}</text>
			{/each}
			{#each MONTHS as m, i (m)}
				<text
					class="tick month"
					x={x(i)}
					y={Y1 + 18}
					transform="rotate(-45 {x(i)} {Y1 + 18})">{m}</text
				>
			{/each}

			<!-- series -->
			{#each SERIES as s (s.id)}
				<path class="line" d={path(s.values)} stroke={colorOf(s)} stroke-width={widthOf(s)} />
			{/each}

			<!-- leyenda lateral -->
			<g class="legend" class:off={proximidad}>
				<rect class="legend-box" x="566" y="40" width="182" height="132" />
				{#each SERIES as s, i (s.id)}
					<rect x="580" y={58 + i * 28} width="14" height="14" fill={colorOf(s)} />
					<text class="legend-text" x="604" y={70 + i * 28}>{s.name}</text>
				{/each}
			</g>

			<!-- etiquetas directas al final de cada serie -->
			<g class="ends" class:visible={proximidad}>
				{#each SERIES as s (s.id)}
					<text
						class="end-label"
						x={X1 + 12}
						y={y(s.values[s.values.length - 1]) + 4}
						fill={colorOf(s)}>{s.name}</text
					>
				{/each}
			</g>
		</svg>
	</section>

	<aside class="card panel">
		<div class="panel-head">
			<span class="section-title">Panel de control</span>
			<button class="btn btn-ghost" onclick={reset} disabled={activos === 0}>Reiniciar</button>
		</div>

		<label class="toggle" class:active={cierre}>
			<span class="toggle-text">
				<strong>Principio de cierre</strong>
				<span class="hint">Borde exterior del gráfico</span>
			</span>
			<input type="checkbox" role="switch" bind:checked={cierre} />
		</label>

		<label class="toggle" class:active={cuadricula}>
			<span class="toggle-text">
				<strong>Líneas de cuadrícula</strong>
				<span class="hint">Opacidad del 100 % al 0 %</span>
			</span>
			<input type="checkbox" role="switch" bind:checked={cuadricula} />
		</label>

		<label class="toggle" class:active={proximidad}>
			<span class="toggle-text">
				<strong>Principio de proximidad</strong>
				<span class="hint">Leyenda → etiquetas en cada serie</span>
			</span>
			<input type="checkbox" role="switch" bind:checked={proximidad} />
		</label>

		<label class="toggle" class:active={cromatica}>
			<span class="toggle-text">
				<strong>Estrategia cromática</strong>
				<span class="hint">Arcoíris → gris con serie clave</span>
			</span>
			<input type="checkbox" role="switch" bind:checked={cromatica} />
		</label>

		<div class="metric" aria-live="polite">
			<div class="metric-head">
				<span class="metric-label">Ruido visual</span>
				<span class="metric-value">{ruido}%</span>
			</div>
			<div class="meter">
				<div class="meter-fill" style="width: {ruido}%; background-color: {meterColor}"></div>
			</div>
		</div>
	</aside>
</div>

<style>
	.split {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 1.1rem;
		align-items: start;
	}

	.viz {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.viz-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.chart {
		width: 100%;
		height: auto;
		display: block;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	/* vicio 1: marcos pesados */
	.frame {
		fill: none;
		stroke: #0f172a;
		stroke-width: 5;
		transition: opacity 0.4s ease;
	}

	.frame.thin {
		stroke-width: 3;
	}

	.frame.off {
		opacity: 0;
	}

	/* vicio 2: cuadrícula oscura */
	.grid {
		transition: opacity 0.4s ease;
	}

	.grid line {
		stroke: #334155;
		stroke-width: 1;
	}

	.grid.off {
		opacity: 0;
	}

	.axis {
		stroke: #94a3b8;
		stroke-width: 1;
	}

	.tick {
		font-family: var(--font);
		font-size: 12px;
		fill: var(--text-muted);
		text-anchor: end;
	}

	.month {
		text-anchor: end;
	}

	.line {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: stroke 0.45s ease;
	}

	/* vicio 3: leyenda distante */
	.legend {
		transition: opacity 0.35s ease;
	}

	.legend.off {
		opacity: 0;
	}

	.legend-box {
		fill: var(--surface);
		stroke: #0f172a;
		stroke-width: 2.5;
	}

	.legend-text {
		font-family: var(--font);
		font-size: 13px;
		fill: var(--text);
	}

	.ends {
		opacity: 0;
		transition: opacity 0.35s ease;
	}

	.ends.visible {
		opacity: 1;
	}

	.end-label {
		font-family: var(--font);
		font-size: 13px;
		font-weight: 600;
	}

	/* panel de control */
	.panel {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		position: sticky;
		top: 1rem;
	}

	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.15rem;
	}

	.btn-ghost {
		border-color: transparent;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.85rem;
		padding: 0.4rem 0.6rem;
	}

	.btn-ghost:hover:not(:disabled) {
		background: var(--accent-soft);
		border-color: transparent;
		color: var(--accent);
	}

	.toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.9rem;
		padding: 0.7rem 0.85rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.toggle:hover {
		border-color: var(--border-strong);
	}

	.toggle.active {
		border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
		background: var(--accent-soft);
	}

	.toggle-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		line-height: 1.25;
	}

	.toggle-text strong {
		font-size: 0.9rem;
	}

	.toggle-text .hint {
		font-size: 0.78rem;
	}

	.toggle input[type='checkbox'] {
		appearance: none;
		margin: 0;
		width: 44px;
		height: 24px;
		flex-shrink: 0;
		position: relative;
		border: 1px solid var(--border-strong);
		border-radius: 999px;
		background: var(--surface-2);
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.toggle input[type='checkbox']::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--surface);
		border: 1px solid var(--border-strong);
		transition:
			transform 0.2s ease,
			background 0.2s ease;
	}

	.toggle input[type='checkbox']:checked {
		background: var(--accent);
		border-color: var(--accent);
	}

	.toggle input[type='checkbox']:checked::after {
		transform: translateX(20px);
		background: #fff;
		border-color: transparent;
	}

	.toggle input[type='checkbox']:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
		outline-offset: 2px;
	}

	.metric {
		margin-top: 0.35rem;
		border-top: 1px solid var(--border);
		padding-top: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.metric-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.75rem;
	}

	.metric-label {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}

	.metric-value {
		font-family: var(--mono);
		font-size: 1.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.meter {
		height: 22px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 999px;
		overflow: hidden;
	}

	.meter-fill {
		height: 100%;
		border-radius: 999px;
		transition:
			width 0.6s cubic-bezier(0.22, 1, 0.36, 1),
			background-color 0.6s ease;
	}

	@media (max-width: 900px) {
		.split {
			grid-template-columns: 1fr;
		}

		.panel {
			position: static;
		}
	}
</style>
