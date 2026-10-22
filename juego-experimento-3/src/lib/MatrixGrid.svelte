<script lang="ts">
	import { ROWS, COLS, TARGET } from './matrix';

	let {
		cells,
		highlight = false,
		dim = false
	}: { cells: number[]; highlight?: boolean; dim?: boolean } = $props();

	const label = $derived(
		highlight
			? `Matriz con ${TARGET} números 3 resaltados en color de acento`
			: `Matriz de ${ROWS * COLS} números en gris plano`
	);
</script>

<div class="matrix-wrap" class:dim role="img" aria-label={label}>
	{#each Array(ROWS) as _, r (r)}
		<div class="row">
			{#each Array(COLS) as _, c (c)}
				{@const v = cells[r * COLS + c]}
				<span class="cell" class:three={v === 3 && highlight}>{v}</span>
			{/each}
		</div>
	{/each}
</div>

<style>
	.matrix-wrap {
		display: inline-flex;
		flex-direction: column;
		gap: 6px;
		padding: 18px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow-card);
		user-select: none;
		transition: opacity 0.35s ease;
	}

	.matrix-wrap.dim {
		opacity: 0.35;
		pointer-events: none;
	}

	.row {
		display: flex;
		gap: 6px;
	}

	.cell {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		font-family: var(--mono);
		font-size: 1.15rem;
		color: #888888;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 6px;
		transition:
			color 0.25s ease,
			background 0.25s ease,
			border-color 0.25s ease;
	}

	.cell.three {
		color: var(--accent);
		background: var(--accent-soft);
		border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
		font-weight: 800;
		font-size: 1.25rem;
	}

	@media (max-width: 640px) {
		.matrix-wrap {
			padding: 12px;
			gap: 4px;
		}

		.row {
			gap: 4px;
		}

		.cell {
			width: clamp(22px, 6.4vw, 44px);
			height: clamp(22px, 6.4vw, 44px);
			font-size: clamp(0.8rem, 3vw, 1.15rem);
		}

		.cell.three {
			font-size: clamp(0.85rem, 3.2vw, 1.25rem);
		}
	}
</style>
