<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import MatrixGrid from '#lib/MatrixGrid.svelte';
	import {
		makeMatrix,
		loadAttempts,
		saveAttempt,
		TARGET,
		ROWS,
		COLS,
		type Attempt
	} from '#lib/matrix.ts';

	type Phase = 'intro' | 'plain' | 'bridge' | 'highlight' | 'results';

	let phase = $state<Phase>('intro');
	let m1 = $state<number[]>(makeMatrix());
	let m2 = $state<number[]>(makeMatrix());

	// cronómetro
	let running = $state(false);
	let elapsed = $state(0); // ms
	let startedAt = 0;
	let rafId = 0;

	// respuestas
	let answer = $state<number | null>(null);
	let count1 = $state<number | null>(null);
	let count2 = $state<number | null>(null);
	let t1 = $state(0); // segundos
	let t2 = $state(0);

	let attempts = $state<Attempt[]>([]);
	let invalid = $state(false);

	$effect(() => {
		attempts = loadAttempts();
	});

	function tick() {
		elapsed = performance.now() - startedAt;
		rafId = requestAnimationFrame(tick);
	}

	function startTimer() {
		elapsed = 0;
		startedAt = performance.now();
		running = true;
		rafId = requestAnimationFrame(tick);
	}

	function stopTimer(): number {
		cancelAnimationFrame(rafId);
		running = false;
		elapsed = performance.now() - startedAt;
		return elapsed;
	}

	function fmt(ms: number): string {
		return (ms / 1000).toFixed(2);
	}

	function submit() {
		if (!running) return;
		if (answer === null || !Number.isInteger(answer)) {
			invalid = true;
			return;
		}
		const ms = stopTimer();

		if (phase === 'plain') {
			count1 = answer;
			t1 = ms / 1000;
			phase = 'bridge';
		} else if (phase === 'highlight') {
			count2 = answer;
			t2 = ms / 1000;
			const attempt: Attempt = {
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				date: new Date().toLocaleDateString('es-MX'),
				t1,
				t2,
				ok1: count1 === TARGET,
				ok2: count2 === TARGET
			};
			attempts = saveAttempt(attempt);
			phase = 'results';
		}
		invalid = false;
	}

	/** Detiene el cronómetro y vuelve al inicio sin guardar el intento. */
	function abandon() {
		if (running) stopTimer();
		restart();
	}

	function beginPlain() {
		m1 = makeMatrix();
		elapsed = 0;
		answer = null;
		invalid = false;
		phase = 'plain';
	}

	function beginHighlight() {
		m2 = makeMatrix();
		elapsed = 0;
		answer = null;
		invalid = false;
		phase = 'highlight';
	}

	function restart() {
		phase = 'intro';
		t1 = 0;
		t2 = 0;
		answer = null;
		count1 = null;
		count2 = null;
	}

	const speedup = $derived(t2 > 0 ? t1 / t2 : 0);
	const maxTime = $derived(Math.max(t1, t2, 0.001));
</script>

{#if phase === 'intro'}
	<section class="card panel" in:fly={{ y: 14, duration: 350 }} out:fade={{ duration: 150 }}>
		<span class="pill">Fase 0 · Instrucciones</span>
		<h1>¿Cuánto tardas en encontrar los <em>3</em>?</h1>
		<p class="muted">
			Vas a contar cuántos números <strong>3</strong> hay en dos matrices. Primero sin
			formato, después con un color de acento. El cronómetro mide tu tiempo de reacción:
			compara las dos fases y descubre cómo trabaja tu memoria icónica.
		</p>
		<ol class="steps">
			<li>Pulsa <strong>Iniciar conteo</strong> y cuenta los 3 sin prisa, con calma.</li>
			<li>Escribe cuántos <strong>3</strong> viste y pulsa <strong>Listo</strong>.</li>
			<li>Repite con la matriz resaltada y mira el resultado.</li>
		</ol>
		<div class="actions">
			<button class="btn btn-primary" onclick={beginPlain}>Comenzar fase 1</button>
			<span class="hint">La matriz tiene exactamente {TARGET} números 3.</span>
		</div>
	</section>
{:else if phase === 'plain' || phase === 'highlight'}
	<section class="card panel" in:fly={{ y: 14, duration: 350 }} out:fade={{ duration: 150 }}>
		<div class="panel-head">
			{#if phase === 'plain'}
				<span class="pill">Fase 1 · Sin formato</span>
			{:else}
				<span class="pill">Fase 2 · Atributos preatentivos</span>
			{/if}
			<div class="head-tools">
				<div class="clock" aria-live="off">{fmt(elapsed)}<small>s</small></div>
				<button class="btn btn-ghost" onclick={abandon}>Abandonar</button>
			</div>
		</div>

		<p class="instr">
			{#if phase === 'plain'}
				Cuenta los números <strong>3</strong>. Todo está en gris: tendrás que revisar cada
				celda una por una.
			{:else}
				Los <strong>3</strong> ahora están en negrita y color de acento. Pulsa
				<strong>Iniciar conteo</strong> otra vez.
			{/if}
		</p>

		<div class="grid-area">
			<MatrixGrid cells={phase === 'plain' ? m1 : m2} highlight={phase === 'highlight'} />
			{#if !running}
				<button class="btn btn-primary big" onclick={startTimer}>▶ Iniciar conteo</button>
			{:else}
				<div class="answer-row">
					<label class="count-label" for="count">
						¿Cuántos <strong>3</strong> hay?
					</label>
					<input
						id="count"
						type="number"
						min="0"
						max={ROWS * COLS}
						step="1"
						bind:value={answer}
						oninput={() => (invalid = false)}
						onkeydown={(e) => e.key === 'Enter' && submit()}
						placeholder="0"
					/>
					<button class="btn btn-primary" onclick={submit} disabled={!Number.isInteger(answer)}>
						Listo
					</button>
				</div>
				{#if invalid}
					<p class="error">Escribe un número entero antes de continuar.</p>
				{/if}
			{/if}
		</div>

		<p class="hint note">
			El cronómetro corre desde que pulsas Iniciar. No hay premio por rapidez: la idea es
			comparar tus dos tiempos.
		</p>
	</section>
{:else if phase === 'bridge'}
	<section class="card panel center" in:fly={{ y: 14, duration: 350 }} out:fade={{ duration: 150 }}>
		<span class="pill">Fase 1 completada</span>
		<h1>Tu tiempo: <strong class="accent">{t1.toFixed(2)} s</strong></h1>
		<p class="muted">
			Contaste <strong>{count1}</strong> de {TARGET} correctos (hay {TARGET} números 3). Ahora
			viene la misma tarea, pero con un atributo preatentivo: el color. Tus ojos lo detectarán
			sin que tengas que pensar.
		</p>
		<div class="actions">
			<button class="btn btn-primary" onclick={beginHighlight}>Continuar a fase 2</button>
		</div>
	</section>
{:else}
	<section class="panel-stack" in:fly={{ y: 14, duration: 350 }}>
		<div class="card panel">
			<div class="panel-head">
				<span class="pill success">Resultados</span>
				<span class="hint">intentos guardados: {attempts.length}</span>
			</div>

			<div class="hero-stats">
				<div class="stat">
					<span class="stat-label">Fase 1 · sin formato</span>
					<span class="stat-value">{t1.toFixed(2)}<small>s</small></span>
					<span class="stat-sub" class:ok={count1 === TARGET} class:bad={count1 !== TARGET}>
						{count1 === TARGET ? `✔ acertaste (${count1}/${TARGET})` : `✘ fallaste (${count1}/${TARGET})`}
					</span>
				</div>
				<div class="stat">
					<span class="stat-label">Fase 2 · con color</span>
					<span class="stat-value accent">{t2.toFixed(2)}<small>s</small></span>
					<span class="stat-sub" class:ok={count2 === TARGET} class:bad={count2 !== TARGET}>
						{count2 === TARGET ? `✔ acertaste (${count2}/${TARGET})` : `✘ fallaste (${count2}/${TARGET})`}
					</span>
				</div>
				<div class="stat highlight-stat">
					<span class="stat-label">Aceleración</span>
					<span class="stat-value">{speedup.toFixed(1)}×</span>
					<span class="stat-sub">más rápido con color</span>
				</div>
			</div>

			<div class="bars" role="img" aria-label="Comparación de tiempos de respuesta">
				<div class="bar-row">
					<span class="bar-label">Sin formato</span>
					<div class="bar-track">
						<div class="bar-fill" style="width: {(t1 / maxTime) * 100}%"></div>
					</div>
					<span class="bar-value">{t1.toFixed(2)} s</span>
				</div>
				<div class="bar-row">
					<span class="bar-label">Con color</span>
					<div class="bar-track">
						<div
							class="bar-fill accent"
							style="width: {(t2 / maxTime) * 100}%"
						></div>
					</div>
					<span class="bar-value">{t2.toFixed(2)} s</span>
				</div>
			</div>

			<div class="explain">
				<h2 class="section-title">¿Por qué ocurre?</h2>
				<p class="muted">
					El color y la negrita son <strong>atributos preatentivos</strong>: la memoria
					icónica los procesa en milisegundos, de forma automática y sin esfuerzo
					consciente. En la fase 1 no había atajos: tu atención tuvo que visitar cada celda
					una por una (atención serial). En la fase 2, el destacado convirtió la tarea en
					una simple <em>búsqueda guiada</em>: el color hizo el trabajo por ti. Ese es el
					auténtico propósito de colorear un dato en un reporte.
				</p>
			</div>

			{#if attempts.length > 1}
				<table class="history">
					<thead>
						<tr><th>Fecha</th><th>Sin formato</th><th>Con color</th><th>Aceleración</th></tr>
					</thead>
					<tbody>
						{#each attempts.slice().reverse() as a, i (a.id ?? `${a.date}-${a.t1}-${i}`)}
							<tr>
								<td>{a.date}</td>
								<td>{a.t1.toFixed(2)} s</td>
								<td>{a.t2.toFixed(2)} s</td>
								<td class="accent">{(a.t1 / a.t2).toFixed(1)}×</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}

			<div class="actions">
				<button class="btn btn-primary" onclick={restart}>Repetir experimento</button>
			</div>
		</div>
	</section>
{/if}

<style>
	.panel {
		padding: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	.panel.center {
		align-items: center;
		text-align: center;
	}

	.panel-head {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	h1 {
		font-size: clamp(1.5rem, 3.4vw, 2.1rem);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	h1 em {
		color: var(--accent);
		font-style: normal;
	}

	.accent {
		color: var(--accent);
	}

	.steps {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--text-muted);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.clock {
		font-family: var(--mono);
		font-size: 2rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--text);
	}

	.head-tools {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		flex-wrap: wrap;
	}

	.head-tools .btn-ghost {
		border-color: transparent;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.82rem;
		padding: 0.42rem 0.65rem;
	}

	.head-tools .btn-ghost:hover {
		background: var(--danger-soft);
		border-color: transparent;
		color: var(--danger);
	}

	.clock small {
		font-size: 1rem;
		color: var(--text-muted);
		margin-left: 2px;
	}

	.instr {
		color: var(--text-muted);
	}

	.grid-area {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.1rem;
	}

	.big {
		padding: 0.75rem 1.75rem;
		font-size: 1.05rem;
	}

	.answer-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.count-label {
		font-size: 0.95rem;
		color: var(--text-muted);
	}

	.answer-row input {
		width: 88px;
		padding: 0.55rem 0.7rem;
		border: 1px solid var(--border-strong);
		border-radius: 10px;
		font-family: var(--mono);
		font-size: 1.1rem;
		text-align: center;
		background: var(--surface);
		color: var(--text);
	}

	.answer-row input:focus {
		outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
		outline-offset: 1px;
	}

	.error {
		color: var(--danger);
		font-size: 0.85rem;
	}

	.note {
		border-top: 1px solid var(--border);
		padding-top: 0.85rem;
		width: 100%;
	}

	.panel-stack {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.hero-stats {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 0.85rem;
	}

	.stat {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.9rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.stat.highlight-stat {
		background: var(--accent-soft);
		border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
	}

	.stat-label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		font-variant-numeric: tabular-nums;
	}

	.stat-value small {
		font-size: 1rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.stat-sub {
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.stat-sub.ok {
		color: var(--success);
		font-weight: 600;
	}

	.stat-sub.bad {
		color: var(--danger);
		font-weight: 600;
	}

	.bars {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.bar-row {
		display: grid;
		grid-template-columns: 110px 1fr 74px;
		align-items: center;
		gap: 0.75rem;
	}

	.bar-label {
		font-size: 0.85rem;
		color: var(--text-muted);
		text-align: right;
	}

	.bar-track {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 999px;
		height: 22px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: var(--text-muted);
		border-radius: 999px;
		transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.bar-fill.accent {
		background: var(--accent);
	}

	.bar-value {
		font-family: var(--mono);
		font-size: 0.85rem;
		font-variant-numeric: tabular-nums;
	}

	.explain {
		width: 100%;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-left: 3px solid var(--accent);
		border-radius: var(--radius-sm);
		padding: 1rem 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.history {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}

	.history th,
	.history td {
		text-align: left;
		padding: 0.5rem 0.6rem;
		border-bottom: 1px solid var(--border);
	}

	.history th {
		color: var(--text-muted);
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.history td {
		font-family: var(--mono);
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 640px) {
		.panel {
			padding: 1.15rem;
		}

		.bar-row {
			grid-template-columns: 84px 1fr 64px;
			gap: 0.5rem;
		}
	}
</style>
