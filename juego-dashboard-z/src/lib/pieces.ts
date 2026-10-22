export type PieceId = 'kpi' | 'trend' | 'table' | 'filters' | 'notes';

export interface Piece {
	id: PieceId;
	name: string;
	desc: string;
	kind: 'vista' | 'apoyo';
	icon: string;
}

const stroke = (body: string) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true">${body}</svg>`;

export const PIECES: Piece[] = [
	{
		id: 'kpi',
		name: 'KPI principal',
		desc: 'Ventas totales: $321K',
		kind: 'vista',
		icon: stroke(
			'<path d="M4.5 17.5a7.5 7.5 0 1 1 15 0"/><path d="M12 17.5l4.2-5.4"/><circle cx="12" cy="17.5" r="1.4" fill="currentColor" stroke="none"/><path d="M4.5 17.5h15"/>'
		)
	},
	{
		id: 'trend',
		name: 'Tendencia principal',
		desc: 'Gráfico de líneas del periodo',
		kind: 'vista',
		icon: stroke(
			'<path d="M4 4v16h16"/><polyline points="7 15 11 11 14 13 18 7.5"/><circle cx="18" cy="7.5" r="1.4" fill="currentColor" stroke="none"/>'
		)
	},
	{
		id: 'table',
		name: 'Tabla de detalle',
		desc: 'Detalle secundario por sucursal',
		kind: 'vista',
		icon: stroke(
			'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17"/><path d="M12 9.5v10"/><path d="M3.5 14.5h17"/>'
		)
	},
	{
		id: 'filters',
		name: 'Filtros y búsqueda',
		desc: 'Periodo, sucursal, buscador',
		kind: 'apoyo',
		icon: stroke('<path d="M4 5h16l-6.3 7.5V19l-3.4-1.9v-4.6z"/>')
	},
	{
		id: 'notes',
		name: 'Fuente y notas al pie',
		desc: 'Origen de datos y advertencias',
		kind: 'apoyo',
		icon: stroke(
			'<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 8.5h7"/><path d="M8.5 12.5h7"/><path d="M8.5 16.5h4"/>'
		)
	}
];

export const PIECE_MAP: Record<PieceId, Piece> = Object.fromEntries(
	PIECES.map((p) => [p.id, p])
) as Record<PieceId, Piece>;

export interface Check {
	ok: boolean;
	title: string;
	hint: string;
}

export const ALL_PIECES = PIECES.map((p) => p.id);

/** Valida la arquitectura visual del tablero 3×3. */
export function validateBoard(cells: (PieceId | null)[]): Check[] {
	const at = (id: PieceId) => cells.indexOf(id);
	const placed = ALL_PIECES.filter((p) => cells.includes(p)).length;

	const checks: Check[] = [
		{
			ok: at('kpi') === 0,
			title: 'Mensaje principal en la esquina superior izquierda',
			hint: 'La lectura en Z nace ahí: coloca el KPI en la celda 1 (arriba a la izquierda).'
		},
		{
			ok: at('trend') >= 0 && at('trend') <= 2,
			title: 'Tendencia principal en la banda superior',
			hint: 'El primer tramo de la Z va del KPI hacia la derecha: el gráfico de líneas arriba.'
		},
		{
			ok: at('filters') >= 0 && at('filters') <= 2,
			title: 'Filtros en la fila superior',
			hint: 'Los filtros se usan antes de interpretar: deben estar al inicio, junto al encabezado.'
		},
		{
			ok: at('notes') >= 6,
			title: 'Fuente y notas al pie en la fila inferior',
			hint: 'La Z termina abajo: la fuente de datos y las notas van en la última fila.'
		},
		{
			ok: at('table') >= 3,
			title: 'Tabla de detalle en la mitad inferior',
			hint: 'La Z desciende: el detalle secundario vive en las filas 2 o 3, donde la mirada cierra. Arriba compite con el KPI.'
		},
		{
			ok: placed === ALL_PIECES.length,
			title: `Todas las piezas colocadas (${placed} de ${ALL_PIECES.length})`,
			hint: 'Arrastra las piezas que quedaron en el banco al tablero.'
		}
	];

	return checks;
}
