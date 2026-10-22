<script lang="ts">
	import '#lib/styles/global.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="app-shell">
	<header class="app-header">
		<div class="logo" aria-hidden="true">3</div>
		<div class="brand">Experimento del 3</div>
		<div class="tag">Memoria icónica · atributos preatentivos</div>
	</header>

	<main class="app-main">
		{@render children()}
	</main>

	<footer class="app-footer">
		<span>tres.mango-ataulfo.com</span>
		<span>Módulo interactivo · Diseño y emisión de reportes</span>
	</footer>
</div>
