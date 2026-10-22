export const ROWS = 4;
export const COLS = 12;
export const TARGET = 8; // cantidad fija de "3" en cada matriz

function rand(n: number): number {
	return Math.floor(Math.random() * n);
}

/**
 * Genera una matriz de ROWS x COLS dígitos con exactamente TARGET ocurrencias
 * del dígito 3. El resto son dígitos distintos de 3 para que el conteo sea
 * verificable.
 */
export function makeMatrix(): number[] {
	const others = [0, 1, 2, 4, 5, 6, 7, 8, 9];
	const cells: number[] = Array.from({ length: ROWS * COLS }, () => others[rand(others.length)]);

	const idx = Array.from({ length: ROWS * COLS }, (_, i) => i);
	for (let i = idx.length - 1; i > 0; i--) {
		const j = rand(i + 1);
		[idx[i], idx[j]] = [idx[j], idx[i]];
	}
	for (const i of idx.slice(0, TARGET)) cells[i] = 3;

	return cells;
}

export interface Attempt {
	id?: string;
	date: string;
	t1: number; // segundos, sin formato
	t2: number; // segundos, con atributos preatentivos
	ok1: boolean;
	ok2: boolean;
}

const KEY = 'exp3.attempts';

export function loadAttempts(): Attempt[] {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const data = JSON.parse(raw);
		return Array.isArray(data) ? (data as Attempt[]).slice(-8) : [];
	} catch {
		return [];
	}
}

export function saveAttempt(a: Attempt): Attempt[] {
	const all = [...loadAttempts(), a].slice(-8);
	try {
		localStorage.setItem(KEY, JSON.stringify(all));
	} catch {
		// almacenamiento no disponible: se ignora
	}
	return all;
}
