<script lang="ts">
	import '#lib/styles/global.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="app-shell">
	<header class="app-header">
		<div class="logo" aria-hidden="true">Z</div>
		<div class="brand">Arma tu dashboard en Z</div>
		<div class="tag">Arquitectura visual · patrón de lectura</div>
	</header>

	<main class="app-main">
		{@render children()}
	</main>

	<footer class="app-footer">
		<span>tablero.mango-ataulfo.com</span>
		<span>Módulo interactivo · Diseño y emisión de reportes</span>
	</footer>
</div>
