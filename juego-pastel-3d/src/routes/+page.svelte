<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	type SliceId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

	const VALUES: Record<SliceId, number> = {
		A: 10,
		B: 12.5,
		C: 11,
		D: 14,
		E: 13,
		F: 9.5,
		G: 12.5,
		H: 17.5
	};

	// sentido horario desde el centro superior: D queda atrás (arriba),
	// A queda al frente (abajo) donde la perspectiva la hace parecer más grande
	const ORDER: SliceId[] = ['D', 'C', 'F', 'H', 'A', 'E', 'G', 'B'];

	const COLOR: Record<SliceId, string> = {
		A: '#f59e0b',
		B: '#9aa7b8',
		C: '#8593a8',
		D: '#2563eb',
		E: '#7c8ba1',
		F: '#a8b4c4',
		G: '#6b7a91',
		H: '#b6c2d2'
	};

	const BAR_COLOR: Record<SliceId, string> = {
		...Object.fromEntries(
			(Object.keys(VALUES) as SliceId[]).map((k) => [k, '#9aa7b8'])
		) as Record<SliceId, string>,
		A: '#f59e0b',
		D: '#2563eb'
	};

	const CX = 160;
	const CY = 160;
	const R = 140;

	const reduced =
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	let view = $state<'pie' | 'bars'>('pie');
	let choice = $state<SliceId | null>(null);

	const slices = $derived.by(() => {
		let acc = 0;
		const base: { id: SliceId; start: number; end: number; value: number }[] = [];
		for (const id of ORDER) {
			const span = (VALUES[id] / 100) * 360;
			base.push({ id, start: acc, end: acc + span, value: VALUES[id] });
			acc += span;
		}
		const first = base[0];
		const offset = -(first.start + (first.end - first.start) / 2);
		return base.map((s) => ({ ...s, start: s.start + offset, end: s.end + offset }));
	});

	const sorted = $derived(
		(Object.keys(VALUES) as SliceId[]).sort((a, b) => VALUES[b] - VALUES[a] || a.localeCompare(b))
	);

	function point(deg: number, r: number): [number, number] {
		const a = ((deg - 90) * Math.PI) / 180;
		return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
	}

	function arc(a0: number, a1: number, r = R): string {
		const [x0, y0] = point(a0, r);
		const [x1, y1] = point(a1, r);
		const large = a1 - a0 > 180 ? 1 : 0;
		return `M ${CX} ${CY} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
	}

	function mid(s: { start: number; end: number }): number {
		return (s.start + s.end) / 2;
	}

	// animación de las barras
	const prog = tweened(0, { duration: reduced ? 0 : 1000, easing: cubicOut });

	$effect(() => {
		if (view === 'bars') prog.set(1);
		else prog.set(0, { duration: reduced ? 0 : 250 });
	});

	function barFactor(i: number, p: number): number {
		const f = p * 1.35 - i * 0.05;
		return Math.max(0, Math.min(1, f));
	}

	const TRACK_X0 = 64;
	const TRACK_X1 = 700;
	const MAX = 20;

	function barWidth(value: number, i: number): number {
		const full = ((value / MAX) * (TRACK_X1 - TRACK_X0));
		return full * barFactor(i, $prog);
	}

	function choose(id: SliceId) {
		if (choice === null && (id === 'A' || id === 'D')) choice = id;
	}

	function convert() {
		view = 'bars';
	}

	function backToPie() {
		view = 'pie';
	}

	/** Limpia la respuesta y vuelve al reto inicial. */
	function reset() {
		choice = null;
		view = 'pie';
	}
</script>

<div class="toolbar">
	<div class="steps" aria-hidden="true">
		<span class="step" class:active={view === 'pie'} class:done={choice !== null}>1 · El reto</span>
		<span class="step" class:active={view === 'bars'}>2 · La conversión</span>
	</div>
	{#if view === 'pie'}
		<button class="btn btn-primary" onclick={convert}>Convertir a barras 2D →</button>
	{:else}
		<button class="btn" onclick={backToPie}>◀ Volver al pastel</button>
	{/if}
</div>

<div class="split">
	{#if view === 'pie'}
		<section class="card viz" in:fly={{ x: -18, duration: 350 }} out:fade={{ duration: 140 }}>
			<div class="viz-head">
				<span class="pill">Vista A · pastel 3D inclinado</span>
				<span class="hint">8 rebanadas · tamaños parecidos</span>
			</div>

			<div class="pie-stage">
				<div class="pie-shadow" aria-hidden="true"></div>
				<div class="pie-3d">
					<svg viewBox="0 0 320 320" role="img" aria-label="Gráfico de pastel en 3D con 8 rebanadas">
						{#snippet sliceShape(s: (typeof slices)[number])}
							{#if choice !== null}
								{@const [lx, ly] = point(mid(s), R * 0.66)}
								<path d={arc(s.start, s.end)} fill={COLOR[s.id]} stroke="#fff" stroke-width="2" />
								<text
									x={lx}
									y={ly}
									text-anchor="middle"
									class="slice-label"
									fill={s.id === 'A' || s.id === 'D' ? '#fff' : '#0f172a'}
								>
									<tspan x={lx} dy="-2">{s.id}</tspan>
									<tspan x={lx} dy="13" class="slice-pct">{s.value}%</tspan>
								</text>
							{:else}
								{@const [lx, ly] = point(mid(s), R * 0.68)}
								<path d={arc(s.start, s.end)} fill={COLOR[s.id]} stroke="#fff" stroke-width="2" />
								<text
									x={lx}
									y={ly}
									text-anchor="middle"
									class="slice-label"
									fill={s.id === 'A' || s.id === 'D' ? '#fff' : '#0f172a'}
								>
									{s.id}
								</text>
							{/if}
						{/snippet}

						{#each slices as s (s.id)}
							{#if s.id === 'A' || s.id === 'D'}
								<g
									class="slice pickable"
									class:picked={choice === s.id}
									role="button"
									tabindex="0"
									aria-label="Elegir rebanada {s.id}"
									onclick={() => choose(s.id)}
									onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && choose(s.id)}
								>
									{@render sliceShape(s)}
								</g>
							{:else}
								<g class="slice">
									{@render sliceShape(s)}
								</g>
							{/if}
						{/each}
					</svg>
				</div>
			</div>

			<p class="hint viz-note">
				La inclinación comprime la parte trasera e infla la frontal. Pasa el cursor por las
				rebanadas y haz clic en la <strong>A</strong> o la <strong>D</strong> para responder.
			</p>
		</section>

		<aside class="card side" out:fade={{ duration: 140 }}>
			{#if choice === null}
				<span class="pill">Reto de percepción</span>
				<h1>¿Cuál rebanada es más grande, la <strong>A</strong> o la <strong>D</strong>?</h1>
				<p class="muted">
					Tócalas. Tu intuición probablemente te diga <strong>A</strong>: está al frente y se
					ve enorme. Piénsalo dos veces: ambas miden lo mismo en el papel… pero aquí no.
				</p>
				<div class="choice-row">
					<button class="btn" onclick={() => choose('A')}>Es la A</button>
					<button class="btn" onclick={() => choose('D')}>Es la D</button>
				</div>
			{:else}
				<span
					class="pill"
					role="status"
					class:success={choice === 'D'}
					class:danger={choice === 'A'}
				>
					{choice === 'D' ? '✔ Respuesta correcta' : '✘ Truco de perspectiva'}
				</span>
				<h1>
					{choice === 'D'
						? 'D = 14% · A = 10%'
						: 'Parecía la A… pero la D manda'}
				</h1>
				<p class="muted">
					{#if choice === 'A'}
						La <strong>A</strong> está al frente: la perspectiva la estira y tu cerebro la
						interpreta como la más grande. En realidad la <strong>D</strong> tiene
						<strong>14%</strong> y la A solo <strong>10%</strong>.{' '}
					{:else}
						Exacto: la <strong>D</strong> ocupa <strong>14%</strong> y la <strong>A</strong>{' '}
						solo <strong>10%</strong>, aunque al estar al frente parezca mayor.
					{/if}
					Ese es precisamente el juicio que no deberías pedirle a tu audiencia.
				</p>
				<div class="choice-row">
					<button class="btn btn-primary" onclick={convert}>
						Verlo en barras 2D →
					</button>
					<button class="btn" onclick={reset}>↺ Reintentar</button>
				</div>
			{/if}
		</aside>
	{:else}
		<section class="card viz" in:fly={{ x: 18, duration: 350 }} out:fade={{ duration: 140 }}>
			<div class="viz-head">
				<span class="pill success">Vista B · barras horizontales</span>
				<span class="hint">eje base en 0 · orden descendente</span>
			</div>

			<svg
				class="barsvg"
				viewBox="0 0 720 400"
				role="img"
				aria-label="Barras horizontales ordenadas de mayor a menor con eje que arranca en cero"
			>
				<!-- rejilla vertical -->
				{#each [0, 5, 10, 15, 20] as tick (tick)}
					<line
						x1={TRACK_X0 + (tick / MAX) * (TRACK_X1 - TRACK_X0)}
						y1="10"
						x2={TRACK_X0 + (tick / MAX) * (TRACK_X1 - TRACK_X0)}
						y2="356"
						stroke="#e2e8f0"
						stroke-width="1"
					/>
				{/each}

				{#each sorted as id, i (id)}
					{@const y = 18 + i * 42}
					<text x={TRACK_X0 - 12} y={y + 17} text-anchor="end" class="bar-letter">{id}</text>
					<rect
						x={TRACK_X0}
						y={y}
						width={barWidth(VALUES[id], i)}
						height="24"
						rx="4"
						fill={BAR_COLOR[id]}
					/>
					{#if barFactor(i, $prog) > 0.98}
						<text
							x={TRACK_X0 + ((VALUES[id] / MAX) * (TRACK_X1 - TRACK_X0)) + 8}
							y={y + 17}
							class="bar-value"
						>
							{id === 'D' || id === 'A' ? `${id} · ` : ''}{VALUES[id]}%
						</text>
					{/if}
				{/each}

				<!-- eje base -->
				<line x1={TRACK_X0} y1="356" x2={TRACK_X1} y2="356" stroke="#94a3b8" stroke-width="1.5" />
				{#each [0, 5, 10, 15, 20] as tick (tick)}
					<text
						x={TRACK_X0 + (tick / MAX) * (TRACK_X1 - TRACK_X0)}
						y="376"
						text-anchor="middle"
						class="tick">{tick}%</text>
				{/each}
				<text x={TRACK_X0} y="394" class="tick origin">0 — todos comparten el mismo origen</text>
			</svg>

			{#if choice !== null}
				<p class="hint viz-note" class:ok-note={choice === 'D'}>
					{choice === 'D'
						? 'Tu respuesta: D. Confirmado con eje en 0 — la barra azul es la más larga.'
						: 'Tu respuesta: A. Con eje en 0 la A es de las más cortas: la perspectiva te engañó.'}
				</p>
			{/if}
		</section>

		<aside class="card side" out:fade={{ duration: 140 }}>
			<span class="pill">Callout · por qué las barras</span>
			<h1>La línea base gana</h1>
			<ul class="reasons">
				<li>
					<strong>Alineación en cero.</strong> El cerebro compara longitudes que empiezan en el
					mismo punto con mucha más precisión que ángulos, áreas o volúmenes en perspectiva.
				</li>
				<li>
					<strong>Sin distorsión 3D.</strong> El tilt comprime lo de atrás e infla lo de
				 adelante: el dato cambia según dónde esté colocado, no según su valor.
				</li>
				<li>
					<strong>Eje honesto.</strong> Arrancar en 0 hace que las proporciones visuales sean
					propias: si el eje se truncara en 9%, la D parecería varias veces la A.
				</li>
			</ul>
			<div class="mini-table">
				{#each sorted as id (id)}
					<span class="mini" class:hi={id === 'D'} class:warn={id === 'A'}>
						{id} · {VALUES[id]}%
					</span>
				{/each}
			</div>
			<p class="hint">
				Regla práctica: si la comparación es el mensaje, usa barras sobre una línea base en 0.
				Reserva el pastel para composiciones simples (dos o tres partes de un todo).
			</p>
		</aside>
	{/if}
</div>

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.1rem;
	}

	.steps {
		display: flex;
		gap: 0.5rem;
	}

	.step {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.3rem 0.8rem;
	}

	.step.active {
		color: #fff;
		background: var(--accent);
		border-color: var(--accent);
	}

	.step.done:not(.active) {
		color: var(--success);
		background: var(--success-soft);
		border-color: transparent;
	}

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

	.pie-stage {
		position: relative;
		display: grid;
		place-items: center;
		/* espacio para la elipse de sombra */
		padding: 1.5rem 0 2.25rem;
	}

	.pie-3d {
		width: min(100%, 340px);
		transform: perspective(1000px) rotateX(56deg);
		transform-origin: center 62%;
		transition: transform 0.4s ease;
	}

	.pie-3d svg {
		width: 100%;
		height: auto;
		display: block;
		overflow: visible;
	}

	.pie-shadow {
		position: absolute;
		bottom: 6%;
		width: 62%;
		height: 16%;
		background: radial-gradient(ellipse at center, rgb(15 23 42 / 0.28), transparent 70%);
		pointer-events: none;
	}

	.slice {
		cursor: default;
		transition: transform 0.18s ease;
		transform-origin: 160px 160px;
	}

	.slice.pickable {
		cursor: pointer;
	}

	.slice.pickable:hover {
		transform: scale(1.025);
	}

	.slice.picked {
		filter: drop-shadow(0 0 6px rgb(15 23 42 / 0.45));
	}

	.slice-label {
		font-family: var(--font);
		font-size: 14px;
		font-weight: 700;
		pointer-events: none;
	}

	.slice-pct {
		font-size: 11px;
		font-weight: 600;
	}

	.viz-note {
		border-top: 1px solid var(--border);
		padding-top: 0.8rem;
	}

	.viz-note.ok-note {
		color: var(--success);
	}

	.side {
		padding: 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		align-items: flex-start;
		position: sticky;
		top: 1rem;
	}

	.side h1 {
		font-size: clamp(1.25rem, 2.6vw, 1.6rem);
		letter-spacing: -0.02em;
		line-height: 1.25;
	}

	.choice-row {
		display: flex;
		gap: 0.7rem;
		flex-wrap: wrap;
	}

	.reasons {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		color: var(--text-muted);
		font-size: 0.92rem;
	}

	.reasons strong {
		color: var(--text);
	}

	.barsvg {
		width: 100%;
		height: auto;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.bar-letter {
		font-family: var(--font);
		font-size: 15px;
		font-weight: 700;
		fill: var(--text);
	}

	.bar-value {
		font-family: var(--font);
		font-size: 13px;
		font-weight: 600;
		fill: var(--text-muted);
	}

	.tick {
		font-family: var(--font);
		font-size: 12px;
		fill: var(--text-muted);
	}

	.tick.origin {
		text-anchor: start;
		font-size: 11.5px;
	}

	.mini-table {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		width: 100%;
	}

	.mini {
		font-family: var(--mono);
		font-size: 0.75rem;
		padding: 0.22rem 0.55rem;
		border-radius: 999px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-muted);
	}

	.mini.hi {
		background: var(--accent-soft);
		color: var(--accent);
		border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
		font-weight: 700;
	}

	.mini.warn {
		background: var(--warning-soft);
		color: var(--warning);
		border-color: transparent;
		font-weight: 700;
	}

	@media (max-width: 900px) {
		.split {
			grid-template-columns: 1fr;
		}

		.side {
			position: static;
		}

		.pie-3d {
			transform: perspective(900px) rotateX(50deg);
		}
	}
</style>
