<script lang="ts">
	import '#lib/styles/global.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="app-shell">
	<header class="app-header">
		<div class="logo" aria-hidden="true">◔</div>
		<div class="brand">Juicio al pastel 3D</div>
		<div class="tag">Ángulos y perspectiva vs. línea base</div>
	</header>

	<main class="app-main">
		{@render children()}
	</main>

	<footer class="app-footer">
		<span>pastel.mango-ataulfo.com</span>
		<span>Módulo interactivo · Diseño y emisión de reportes</span>
	</footer>
</div>
