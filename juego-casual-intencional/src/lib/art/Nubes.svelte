<svg viewBox="0 0 480 300" role="img" aria-label="Ilustración: nubes moviéndose en un cielo azul">
	<rect width="480" height="300" fill="#dbeafe" />
	<circle cx="400" cy="58" r="34" fill="#fde68a" />
	<circle cx="400" cy="58" r="46" fill="#fde68a" opacity="0.35" />

	<g class="drift d1">
		<ellipse cx="150" cy="128" rx="74" ry="30" fill="#ffffff" />
		<circle cx="118" cy="108" r="30" fill="#ffffff" />
		<circle cx="164" cy="100" r="38" fill="#ffffff" />
		<circle cx="204" cy="122" r="26" fill="#ffffff" />
	</g>

	<g class="drift d2">
		<ellipse cx="320" cy="212" rx="62" ry="25" fill="#f1f5f9" />
		<circle cx="296" cy="196" r="27" fill="#f1f5f9" />
		<circle cx="340" cy="190" r="32" fill="#f1f5f9" />
	</g>

	<g class="drift d3">
		<ellipse cx="90" cy="246" rx="48" ry="19" fill="#e2e8f0" />
		<circle cx="72" cy="233" r="21" fill="#e2e8f0" />
		<circle cx="106" cy="229" r="25" fill="#e2e8f0" />
	</g>
</svg>

<style>
	.drift {
		animation: drift 14s ease-in-out infinite alternate;
	}

	.d2 {
		animation-duration: 18s;
		animation-delay: -6s;
	}

	.d3 {
		animation-duration: 22s;
		animation-delay: -11s;
	}

	@keyframes drift {
		from {
			transform: translateX(-16px);
		}
		to {
			transform: translateX(16px);
		}
	}
</style>
