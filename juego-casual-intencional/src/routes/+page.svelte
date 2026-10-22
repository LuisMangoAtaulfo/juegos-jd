<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { CARDS, FILTER_LABELS, type Verdict, type CardId } from '#lib/cards.ts';
	import Nubes from '#lib/art/Nubes.svelte';
	import Semaforo from '#lib/art/Semaforo.svelte';
	import Soporte from '#lib/art/Soporte.svelte';
	import Cartel from '#lib/art/Cartel.svelte';
	import Ramas from '#lib/art/Ramas.svelte';

	const ART = {
		nubes: Nubes,
		semaforo: Semaforo,
		soporte: Soporte,
		cartel: Cartel,
		ramas: Ramas
	} as const;

	const THRESHOLD = 110;

	const reduced =
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	let i = $state(0);
	let dx = $state(0);
	let dragging = $state(false);
	let settling = $state(false);
	let revealed = $state(false);
	let answers = $state<{ id: CardId; given: Verdict; ok: boolean }[]>([]);
	let startX = 0;

	const finished = $derived(i >= CARDS.length);
	const card = $derived(finished ? null : CARDS[i]);
	const nextCard = $derived(finished || i + 1 >= CARDS.length ? null : CARDS[i + 1]);
	const score = $derived(answers.filter((a) => a.ok).length);

	function onDown(e: PointerEvent) {
		if (revealed || e.button !== 0) return;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		dragging = true;
		settling = false;
		startX = e.clientX;
	}

	function onMove(e: PointerEvent) {
		if (!dragging) return;
		dx = e.clientX - startX;
	}

	function onUp() {
		if (!dragging) return;
		dragging = false;
		if (dx <= -THRESHOLD) answer('casual');
		else if (dx >= THRESHOLD) answer('intencional');
		else {
			settling = true;
			dx = 0;
		}
	}

	function answer(given: Verdict) {
		if (revealed || !card) return;
		const ok = given === card.answer;
		answers = [...answers, { id: card.id, given, ok }];
		settling = true;
		dx = given === 'intencional' ? 560 : -560;
		revealed = true;
	}

	function next() {
		settling = false;
		dx = 0;
		revealed = false;
		i += 1;
		// devuelve el foco a los botones de respuesta para el teclado
		requestAnimationFrame(() => actionBtn?.focus());
	}

	function reset() {
		i = 0;
		dx = 0;
		dragging = false;
		settling = false;
		revealed = false;
		answers = [];
	}

	function isOk(id: CardId): boolean | null {
		const a = answers.find((x) => x.id === id);
		return a ? a.ok : null;
	}

	// --- accesibilidad -------------------------------------------------
	let behindEl = $state<HTMLElement | null>(null);
	let fbEl = $state<HTMLElement | null>(null);
	let actionBtn = $state<HTMLButtonElement | null>(null);

	// con el diálogo abierto, el fondo no debe ser navegable
	$effect(() => {
		if (behindEl) behindEl.inert = revealed;
	});

	// el foco pasa al diálogo de retroalimentación al abrirse
	$effect(() => {
		if (revealed) requestAnimationFrame(() => fbEl?.focus());
	});

	// atajos de teclado: ← casual, → intencional
	$effect(() => {
		if (finished || revealed) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
			if (e.key === 'ArrowLeft') answer('casual');
			else if (e.key === 'ArrowRight') answer('intencional');
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="head-row">
	<div class="how">
		<span class="chip chip-casual">← Casual</span>
		<span class="how-text">desliza o usa ← →</span>
		<span class="chip chip-intencional">Intencional →</span>
	</div>
	<div class="progress" aria-label="Progreso">
		{#each CARDS as c, idx (c.id)}
			<span
				class="dot"
				class:done={idx < i}
				class:current={idx === i}
				class:miss={idx < i && isOk(c.id) === false}
			></span>
		{/each}
		<span class="hint">{Math.min(i + (finished ? 0 : 1), CARDS.length)}/{CARDS.length}</span>
	</div>
</div>

{#if finished}
	<section class="card summary" in:fly={{ y: 14, duration: 320 }}>
		<span class="pill" class:success={score >= 4} class:danger={score <= 2}>
			Resultado final
		</span>
		<h1>
			{score} de {CARDS.length} correctos
		</h1>
		<p class="muted">
			{#if score === CARDS.length}
				Detectaste el propósito comunicativo en los {CARDS.length} estímulos: ya no miras una imagen sin
				preguntarte quién la hizo y para qué.
			{:else}
				Revisa los fallos: un mensaje intencional siempre tiene emisor, propósito y filtros de
				percepción que lo atraviesan.
			{/if}
		</p>

		<ul class="recap">
			{#each CARDS as c (c.id)}
				{@const a = answers.find((x) => x.id === c.id)}
				<li class:ok={a?.ok} class:bad={a && !a.ok}>
					<span class="mark">{a?.ok ? '✔' : '✘'}</span>
					<div class="recap-text">
						<strong>{c.title}</strong>
						<span class="hint">
							Era {c.answer === 'casual' ? 'casual' : 'intencional'} · tú dijiste
							{a?.given === 'intencional' ? 'intencional' : 'casual'}
						</span>
					</div>
					<span class="pill neutral">{c.answer === 'casual' ? 'Casual' : 'Intencional'}</span>
				</li>
			{/each}
		</ul>

		<button class="btn btn-primary" onclick={reset}>Jugar otra vez</button>
	</section>
{:else if card}
	{@const Art = ART[card.id]}
	<div class="behind" bind:this={behindEl}>
		<div class="deck">
			{#if nextCard && !reduced}
				{@const NextArt = ART[nextCard.id]}
				<div class="peek" aria-hidden="true">
					<div class="peek-art"><NextArt /></div>
				</div>
			{/if}

			{#key i}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<article
					class="swipe"
					class:dragging
					class:settling
					style="transform: translateX({dx}px) rotate({(dx / 40).toFixed(2)}deg)"
					onpointerdown={onDown}
					onpointermove={onMove}
					onpointerup={onUp}
					onpointercancel={onUp}
				>
					<div class="swipe-art">
						<Art />
					</div>
					<div class="swipe-body">
						<span class="hint">Estímulo {i + 1} de {CARDS.length}</span>
						<h2>{card.title}</h2>
						<span class="drag-hint">Desliza o usa los botones de abajo</span>
					</div>

					<span class="stamp stamp-left" style="opacity: {dx < -40 ? Math.min(1, -dx / 110) : 0}">
						CASUAL
					</span>
					<span
						class="stamp stamp-right"
						style="opacity: {dx > 40 ? Math.min(1, dx / 110) : 0}"
					>
						INTENCIONAL
					</span>
				</article>
			{/key}
		</div>

		<div class="actions">
			<button
				bind:this={actionBtn}
				class="btn btn-casual"
				disabled={revealed}
				onclick={() => answer('casual')}
			>
				← Casual
			</button>
			<button
				class="btn btn-intencional"
				disabled={revealed}
				onclick={() => answer('intencional')}
			>
				Intencional →
			</button>
		</div>
	</div>

	{#if revealed && card}
		{@const ok = answers[answers.length - 1]?.ok}
		<div class="overlay" transition:fade={{ duration: reduced ? 0 : 180 }}>
			<div
				class="card feedback"
				role="dialog"
				aria-modal="true"
				aria-label="Retroalimentación"
				tabindex="-1"
				bind:this={fbEl}
				onkeydown={(e) => e.key === 'Escape' && next()}
				transition:fly={{ y: 24, duration: reduced ? 0 : 260 }}
			>
				<div class="fb-head">
					<span class="pill" class:success={ok} class:danger={!ok}>
						{ok ? `✔ ${card.answer === 'casual' ? 'Casual' : 'Intencional'} — correcto` : `✘ Era ${card.answer === 'casual' ? 'casual' : 'intencional'}`}
					</span>
					<span class="pill neutral">{card.title}</span>
				</div>

				<p class="fb-resumen">{card.resumen}</p>

				<div class="filters">
					{#each FILTER_LABELS as f (f.key)}
						<div class="filter-row">
							<span class="filter-label">{f.label}</span>
							<div class="filter-body">
								<span class="hint">{f.desc}</span>
								<p>{card[f.key]}</p>
							</div>
						</div>
					{/each}
				</div>

				<button class="btn btn-primary fb-next" onclick={next}>
					{i + 1 >= CARDS.length ? 'Ver resultados →' : 'Siguiente tarjeta →'}
				</button>
			</div>
		</div>
	{/if}
{/if}

<style>
	.head-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.1rem;
	}

	.how {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.how-text {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.chip {
		font-size: 0.8rem;
		font-weight: 700;
		padding: 0.3rem 0.75rem;
		border-radius: 999px;
		border: 1px solid var(--border-strong);
		background: var(--surface);
	}

	.chip-casual {
		color: var(--warning);
		border-color: color-mix(in srgb, var(--warning) 40%, var(--border));
		background: var(--warning-soft);
	}

	.chip-intencional {
		color: var(--accent);
		border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
		background: var(--accent-soft);
	}

	.progress {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--border-strong);
		transition: all 0.25s ease;
	}

	.dot.done {
		background: var(--success);
	}

	.dot.done.miss {
		background: var(--danger);
	}

	.dot.current {
		background: var(--accent);
		transform: scale(1.35);
	}

	.deck {
		position: relative;
		max-width: 540px;
		margin: 0 auto;
	}

	.peek {
		position: absolute;
		inset: 0;
		transform: translateY(14px) scale(0.96);
		opacity: 0.5;
		pointer-events: none;
	}

	.peek-art {
		border-radius: var(--radius);
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.swipe {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow-card);
		overflow: hidden;
		touch-action: none;
		user-select: none;
		cursor: grab;
		will-change: transform;
	}

	.swipe.dragging {
		cursor: grabbing;
		transition: none;
	}

	.swipe.settling {
		transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.swipe-art {
		aspect-ratio: 8 / 5;
		background: var(--surface-2);
	}

	.swipe-art :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.swipe-body {
		padding: 1rem 1.2rem 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.swipe-body h2 {
		font-size: 1.25rem;
		letter-spacing: -0.01em;
	}

	.drag-hint {
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.stamp {
		position: absolute;
		top: 18px;
		font-weight: 800;
		font-size: 1.05rem;
		letter-spacing: 0.06em;
		padding: 0.4rem 0.8rem;
		border: 3px solid;
		border-radius: 8px;
		background: rgb(255 255 255 / 0.92);
		pointer-events: none;
		transition: opacity 0.12s ease;
	}

	.stamp-left {
		left: 16px;
		color: var(--warning);
		border-color: var(--warning);
		transform: rotate(-10deg);
	}

	.stamp-right {
		right: 16px;
		color: var(--accent);
		border-color: var(--accent);
		transform: rotate(10deg);
	}

	.actions {
		display: flex;
		justify-content: center;
		gap: 0.8rem;
		margin-top: 1.2rem;
		flex-wrap: wrap;
	}

	.btn-casual {
		border-color: color-mix(in srgb, var(--warning) 45%, var(--border));
		color: var(--warning);
	}

	.btn-casual:hover {
		background: var(--warning-soft);
	}

	.btn-intencional {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
		color: var(--accent);
	}

	.btn-intencional:hover {
		background: var(--accent-soft);
	}

	/* retroalimentación */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: rgb(15 23 42 / 0.55);
		display: grid;
		place-items: center;
		padding: 1rem;
		overflow-y: auto;
	}

	.feedback {
		width: min(560px, 100%);
		max-height: calc(100dvh - 2rem);
		overflow-y: auto;
		padding: 1.35rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	/* foco programático: no dibuja anillo (ya está centrado en pantalla) */
	.feedback:focus {
		outline: none;
	}

	.fb-head {
		display: flex;
		justify-content: space-between;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	.fb-resumen {
		font-size: 0.95rem;
		color: var(--text);
		background: var(--surface-2);
		border-left: 3px solid var(--accent);
		border-radius: var(--radius-sm);
		padding: 0.7rem 0.85rem;
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.filter-row {
		display: grid;
		grid-template-columns: 132px 1fr;
		gap: 0.75rem;
		align-items: start;
	}

	.filter-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--accent);
		background: var(--accent-soft);
		border-radius: 7px;
		padding: 0.3rem 0.5rem;
		text-align: center;
	}

	.filter-body {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.filter-body p {
		font-size: 0.88rem;
		color: var(--text);
	}

	.fb-next {
		align-self: flex-end;
	}

	/* resumen */
	.summary {
		padding: 1.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		align-items: flex-start;
		max-width: 640px;
		margin: 0 auto;
	}

	.summary h1 {
		font-size: clamp(1.5rem, 3.5vw, 2.1rem);
		letter-spacing: -0.02em;
	}

	.recap {
		list-style: none;
		margin: 0;
		padding: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.recap li {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.6rem 0.75rem;
		background: var(--surface-2);
	}

	.recap li.ok {
		border-color: color-mix(in srgb, var(--success) 35%, var(--border));
	}

	.recap li.bad {
		border-color: color-mix(in srgb, var(--danger) 35%, var(--border));
	}

	.recap .mark {
		font-weight: 800;
		color: var(--success);
	}

	.recap li.bad .mark {
		color: var(--danger);
	}

	.recap-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.recap-text strong {
		font-size: 0.9rem;
	}

	@media (max-width: 560px) {
		.filter-row {
			grid-template-columns: 1fr;
			gap: 0.3rem;
		}

		.filter-label {
			justify-self: start;
		}
	}
</style>
