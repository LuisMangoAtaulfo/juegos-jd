<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import {
		PIECES,
		PIECE_MAP,
		ALL_PIECES,
		validateBoard,
		type PieceId,
		type Check
	} from '#lib/pieces.ts';

	let cells = $state<(PieceId | null)[]>(Array(9).fill(null));
	let result = $state<Check[] | null>(null);
	let showZ = $state(false);

	interface Drag {
		id: PieceId;
		from: number; // -1 = banco
		w: number;
		h: number;
		ox: number;
		oy: number;
		sx: number;
		sy: number;
		x: number;
		y: number;
		hover: number | null;
	}

	let drag = $state<Drag | null>(null);
	let dragMoved = false;

	// selección por clic/teclado (alternativa accesible al arrastre)
	let sel = $state<{ id: PieceId; from: number } | null>(null);

	const bank = $derived(ALL_PIECES.filter((id) => !cells.includes(id)));
	const allOk = $derived(result !== null && result.every((c) => c.ok));
	const okCount = $derived(result ? result.filter((c) => c.ok).length : 0);
	const selName = $derived(sel ? PIECE_MAP[sel.id].name : null);

	function cellContent(i: number): PieceId | null {
		if (drag && drag.from === i) return null;
		return cells[i];
	}

	function startDrag(e: PointerEvent, id: PieceId, from: number) {
		if (e.button !== 0) return;
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		dragMoved = false;
		drag = {
			id,
			from,
			w: Math.min(rect.width, 250),
			h: rect.height,
			ox: e.clientX - rect.left,
			oy: e.clientY - rect.top,
			sx: e.clientX,
			sy: e.clientY,
			x: e.clientX,
			y: e.clientY,
			hover: null
		};
	}

	function onMove(e: PointerEvent) {
		if (!drag) return;
		if (Math.abs(e.clientX - drag.sx) > 4 || Math.abs(e.clientY - drag.sy) > 4) dragMoved = true;
		drag.x = e.clientX;
		drag.y = e.clientY;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const cellEl = el?.closest('[data-cell]');
		drag.hover = cellEl ? Number(cellEl.getAttribute('data-cell')) : null;
	}

	function movePiece(id: PieceId, from: number, to: number): boolean {
		if (from === to) return false;
		const occupant = cells[to];
		if (from >= 0) cells[from] = occupant ?? null;
		cells[to] = id;
		return true;
	}

	function placeSelected(idx: number) {
		if (!sel) return;
		if (movePiece(sel.id, sel.from, idx)) {
			sel = null;
			result = null;
		}
	}

	function returnToBank() {
		if (!sel || sel.from < 0) return;
		cells[sel.from] = null;
		sel = null;
		result = null;
	}

	function toggleSel(id: PieceId, from: number) {
		if (sel && sel.id === id && sel.from === from) sel = null;
		else sel = { id, from };
	}

	/** Activación por teclado (Enter/Espacio) sobre una pieza. */
	function activatePiece(id: PieceId, from: number) {
		if (sel && from >= 0 && sel.from !== from) placeSelected(from);
		else toggleSel(id, from);
	}

	function onUp(e: PointerEvent) {
		if (!drag) return;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const cellEl = el?.closest('[data-cell]');
		const d = drag;
		drag = null;

		// sin arrastre real: es un clic → selección o colocación
		if (!dragMoved) {
			const idx = cellEl ? Number(cellEl.getAttribute('data-cell')) : null;
			if (sel && idx !== null && idx !== sel.from) placeSelected(idx);
			else toggleSel(d.id, d.from);
			return;
		}

		result = null;
		sel = null;
		if (cellEl) {
			const idx = Number(cellEl.getAttribute('data-cell'));
			if (idx !== d.from) movePiece(d.id, d.from, idx);
		} else if (el?.closest('[data-bank]') && d.from >= 0) {
			cells[d.from] = null;
		}
	}

	// Escape cancela la selección activa
	$effect(() => {
		if (!sel) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') sel = null;
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function validate() {
		result = validateBoard(cells);
	}

	function reset() {
		cells = Array(9).fill(null);
		result = null;
		showZ = false;
		sel = null;
	}

	function suggest() {
		// coloca las piezas en la distribución recomendada (patrón Z)
		cells = ['kpi', 'trend', 'filters', 'table', null, null, 'notes', null, null];
		result = null;
		sel = null;
	}
</script>

<div class="toolbar">
	<div class="toolbar-info">
		<span class="pill">Lienzo 3 × 3 · arrastra las piezas</span>
		<span class="hint">Arquitectura visual de un tablero ejecutivo</span>
	</div>
	<div class="toolbar-actions">
		<button class="btn" class:btn-on={showZ} onclick={() => (showZ = !showZ)}>
			{showZ ? 'Ocultar patrón Z' : 'Ver patrón Z'}
		</button>
		<button class="btn" onclick={suggest}>Ver ejemplo</button>
		<button class="btn" onclick={reset}>Reiniciar</button>
		<button class="btn btn-primary" onclick={validate}>Validar diseño</button>
	</div>
</div>

{#if result}
	<section
		class="verdict"
		class:verdict-ok={allOk}
		role="status"
		in:fly={{ y: -12, duration: 300 }}
		out:fade={{ duration: 150 }}
	>
		{#if allOk}
			<div class="verdict-head">
				<span class="verdict-icon">✔</span>
				<div>
					<h2>Diseño optimizado</h2>
					<p class="hint">
						Sigue el patrón en Z: la mirada entra por el KPI, cruza la tendencia, baja a la
						detalle y cierra en la fuente. {okCount}/{result.length} reglas cumplidas.
					</p>
				</div>
			</div>
		{:else}
			<div class="verdict-head">
				<span class="verdict-icon warn">!</span>
				<div>
					<h2>Casi: {okCount}/{result.length} reglas cumplidas</h2>
					<p class="hint">Revisa los puntos marcados y vuelve a validar.</p>
				</div>
			</div>
			<ul class="checklist">
				{#each result as c (c.title)}
					<li class:ok={c.ok}>
						<span class="mark">{c.ok ? '✔' : '✘'}</span>
						<div>
							<strong>{c.title}</strong>
							{#if !c.ok}
								<span class="hint">{c.hint}</span>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}

<div class="split">
	<section class="card board-card">
		<div class="board-head">
			<span class="section-title">Tablero ejecutivo</span>
			<span class="hint">zona de trabajo 3×3</span>
		</div>

		<div class="board-wrap">
			<div class="board" class:selecting={sel !== null}>
				{#each cells as _, i (i)}
					<div
						class="cell"
						class:empty={!cellContent(i)}
						class:hover={drag?.hover === i}
						class:from={drag?.from === i}
						data-cell={i}
					>
						{#if cellContent(i)}
							{@const p = PIECE_MAP[cellContent(i)!]}
							<button
								type="button"
								class="placed draggable"
								class:selected={sel?.id === p.id && sel.from === i}
								aria-pressed={sel?.id === p.id && sel.from === i}
								aria-label="Mover {p.name} de la celda {i + 1}"
								onpointerdown={(e) => startDrag(e, p.id, i)}
								onclick={(e) => e.detail === 0 && activatePiece(p.id, i)}
							>
								<span class="piece-icon" class:vista={p.kind === 'vista'}>{@html p.icon}</span>
								<span class="piece-text">
									<strong>{p.name}</strong>
									<span>{p.desc}</span>
								</span>
							</button>
						{:else if sel}
							<button
								type="button"
								class="cell-place"
								aria-label="Colocar {selName} en la celda {i + 1}"
								onclick={() => placeSelected(i)}
							>
								＋ Colocar
							</button>
						{:else}
							<span class="cell-hint">{i + 1}</span>
						{/if}
					</div>
				{/each}

				{#if showZ}
					<svg class="z-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
						<polyline
							class="z-line"
							points="6,6 94,6 6,94 94,94"
							fill="none"
							stroke="var(--accent)"
							stroke-width="2.5"
							stroke-linejoin="round"
							stroke-dasharray="1"
							pathLength="1"
							vector-effect="non-scaling-stroke"
						/>
					</svg>
					<div class="z-legend">
						<span class="znum n1">1</span>
						<span class="znum n2">2</span>
						<span class="znum n3">3</span>
						<span class="znum n4">4</span>
					</div>
				{/if}
			</div>
		</div>

		{#if sel}
			<div class="sel-row" role="status">
				<span class="pill">{selName} seleccionada</span>
				<span class="hint">Elige una celda destino · Esc para cancelar</span>
				{#if sel.from >= 0}
					<button class="btn" onclick={returnToBank}>↩ Devolver al banco</button>
				{/if}
			</div>
		{/if}

		<p class="hint board-note">
			El patrón en Z: la mirada entra en <strong>1</strong> (arriba-izquierda), cruza a
			<strong>2</strong> (arriba-derecha), desciende a <strong>3</strong> (abajo-izquierda) y
			cierra en <strong>4</strong>. Ubica el dato más importante donde la mirada empieza.
		</p>
	</section>

	<aside class="card bank-card" data-bank>
		<div class="board-head">
			<span class="section-title">Banco de piezas</span>
			<span class="pill neutral">{bank.length} sin colocar</span>
		</div>

		<div class="bank-list">
			{#each PIECES as p (p.id)}
				{#if bank.includes(p.id) && !(drag?.id === p.id && drag.from === -1)}
					<button
						type="button"
						class="piece draggable"
						class:selected={sel?.id === p.id && sel.from === -1}
						aria-pressed={sel?.id === p.id && sel.from === -1}
						aria-label="Arrastrar {p.name} al tablero"
						onpointerdown={(e) => startDrag(e, p.id, -1)}
						onclick={(e) => e.detail === 0 && activatePiece(p.id, -1)}
					>
						<span class="piece-icon" class:vista={p.kind === 'vista'}>{@html p.icon}</span>
						<span class="piece-text">
							<strong>{p.name}</strong>
							<span>{p.desc}</span>
						</span>
						<span class="grip" aria-hidden="true">⋮⋮</span>
					</button>
				{/if}
			{/each}

			{#if bank.length === 0 && !(drag && drag.from === -1)}
				<p class="bank-empty hint">✔ Todas las piezas están en el tablero.</p>
			{/if}
		</div>

		<div class="rules">
			<span class="section-title">Reglas de validación</span>
			<ul class="hint">
				<li>KPI en la esquina superior izquierda (inicio de la Z)</li>
				<li>Filtros y tendencia en la banda superior</li>
				<li>Tabla de detalle en la mitad inferior (la Z desciende)</li>
				<li>Fuente y notas en la fila inferior</li>
			</ul>
		</div>
	</aside>
</div>

{#if drag}
	{@const p = PIECE_MAP[drag.id]}
	<div
		class="ghost"
		class:vista={p.kind === 'vista'}
		style="width: {drag.w}px; left: {drag.x - drag.ox}px; top: {drag.y - drag.oy}px;"
	>
		<span class="piece-icon" class:vista={p.kind === 'vista'}>{@html p.icon}</span>
		<span class="piece-text">
			<strong>{p.name}</strong>
			<span>{p.desc}</span>
		</span>
	</div>
{/if}

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.toolbar-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.toolbar-actions {
		display: flex;
		gap: 0.55rem;
		flex-wrap: wrap;
	}

	.btn-on {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}

	.verdict {
		background: var(--danger-soft);
		border: 1px solid color-mix(in srgb, var(--danger) 25%, transparent);
		border-radius: var(--radius);
		padding: 1rem 1.15rem;
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.verdict.verdict-ok {
		background: var(--success-soft);
		border-color: color-mix(in srgb, var(--success) 30%, transparent);
	}

	.verdict-head {
		display: flex;
		gap: 0.8rem;
		align-items: flex-start;
	}

	.verdict-head h2 {
		font-size: 1.05rem;
		letter-spacing: -0.01em;
	}

	.verdict-icon {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: var(--success);
		color: #fff;
		font-weight: 800;
		font-size: 0.9rem;
		flex-shrink: 0;
	}

	.verdict-icon.warn {
		background: var(--danger);
	}

	.checklist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 0.5rem 1.2rem;
	}

	.checklist li {
		display: flex;
		gap: 0.55rem;
		align-items: flex-start;
		font-size: 0.88rem;
	}

	.checklist li div {
		display: flex;
		flex-direction: column;
	}

	.checklist .mark {
		color: var(--danger);
		font-weight: 800;
	}

	.checklist li.ok .mark {
		color: var(--success);
	}

	.checklist li.ok strong {
		color: var(--text-muted);
		font-weight: 600;
	}

	.split {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: 1.1rem;
		align-items: start;
	}

	.board-card,
	.bank-card {
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.board-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}

	.board-wrap {
		position: relative;
	}

	.board {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 10px;
	}

	.cell {
		position: relative;
		aspect-ratio: 16 / 11;
		border-radius: 7px;
		border: 1.5px dashed var(--border-strong);
		background: var(--surface);
		display: grid;
		place-items: center;
		overflow: hidden;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.cell:not(.empty) {
		border-style: solid;
		border-color: var(--border);
	}

	.cell.hover {
		border-color: var(--accent);
		background: var(--accent-soft);
	}

	.cell.from {
		opacity: 0.4;
		border-style: dashed;
	}

	.cell-hint {
		color: var(--border-strong);
		font-weight: 700;
		font-size: 1rem;
		user-select: none;
	}

	/* modo selección (clic/teclado) */
	.board.selecting .cell {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
	}

	.cell-place {
		border: 1px dashed var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
		border-radius: 7px;
		padding: 0.4rem 0.7rem;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.cell-place:hover {
		background: color-mix(in srgb, var(--accent) 18%, var(--surface));
	}

	.sel-row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.7rem;
		flex-wrap: wrap;
		border-top: 1px solid var(--border);
		padding-top: 0.8rem;
	}

	.sel-row .btn {
		margin-left: auto;
		padding: 0.4rem 0.8rem;
		font-size: 0.82rem;
	}

	.placed.selected,
	.piece.selected {
		border-color: var(--accent);
		background: var(--accent-soft);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
	}

	.placed {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.55rem 0.6rem;
		cursor: grab;
		touch-action: none;
		user-select: none;
		background: var(--surface);
		border: 0;
		border-radius: 7px;
		font: inherit;
		color: inherit;
		text-align: left;
	}

	.placed:active {
		cursor: grabbing;
	}

	.piece {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 0.7rem;
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: grab;
		touch-action: none;
		user-select: none;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.piece:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow-card);
	}

	.piece:active {
		cursor: grabbing;
	}

	.piece-icon {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		display: grid;
		place-items: center;
		background: var(--surface-2);
		border: 1px solid var(--border);
		color: var(--text-muted);
		flex-shrink: 0;
	}

	.piece-icon.vista {
		background: var(--accent-soft);
		border-color: color-mix(in srgb, var(--accent) 25%, var(--border));
		color: var(--accent);
	}

	.piece-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.25;
	}	.piece-text strong {
		font-size: 0.85rem;
	}

	.piece-text span {
		font-size: 0.72rem;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.grip {
		margin-left: auto;
		color: var(--border-strong);
		font-size: 0.7rem;
		letter-spacing: -2px;
	}

	.bank-list {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		min-height: 90px;
	}

	.bank-empty {
		border: 1.5px dashed var(--border-strong);
		border-radius: var(--radius-sm);
		padding: 1.2rem;
		text-align: center;
	}

	.rules {
		border-top: 1px solid var(--border);
		padding-top: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.rules ul {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.board-note {
		border-top: 1px solid var(--border);
		padding-top: 0.8rem;
	}

	/* overlay del patrón Z */
	.z-overlay {
		position: absolute;
		inset: 10px;
		width: calc(100% - 20px);
		height: calc(100% - 20px);
		pointer-events: none;
	}

	.z-line {
		stroke-dashoffset: 1;
		animation: z-draw 1.4s ease forwards;
		opacity: 0.85;
	}

	@keyframes z-draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	.z-legend {
		position: absolute;
		inset: 10px;
		pointer-events: none;
	}

	.znum {
		position: absolute;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--accent);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 800;
		display: grid;
		place-items: center;
	}

	.n1 {
		left: -4px;
		top: -4px;
	}

	.n2 {
		right: -4px;
		top: -4px;
	}

	.n3 {
		left: -4px;
		bottom: -4px;
	}

	.n4 {
		right: -4px;
		bottom: -4px;
	}

	/* fantasma de arrastre */
	.ghost {
		position: fixed;
		z-index: 60;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 0.7rem;
		background: var(--surface);
		border: 1px solid var(--accent);
		border-radius: var(--radius-sm);
		box-shadow: 0 18px 40px -12px rgb(15 23 42 / 0.4);
		pointer-events: none;
		transform: rotate(-1.5deg);
	}

	@media (max-width: 900px) {
		.split {
			grid-template-columns: 1fr;
		}
	}
</style>
