export type Verdict = 'casual' | 'intencional';
export type CardId = 'nubes' | 'semaforo' | 'soporte' | 'cartel' | 'ramas';

export interface Card {
	id: CardId;
	title: string;
	answer: Verdict;
	resumen: string;
	emisor: string;
	sensorial: string;
	operativo: string;
	cultural: string;
}

export const CARDS: Card[] = [
	{
		id: 'nubes',
		title: 'Nubes en movimiento',
		answer: 'casual',
		resumen: 'Nadie compuso esta imagen: es un fenómeno natural, sin propósito comunicativo.',
		emisor:
			'No hay emisor intencional. La "imagen" no fue diseñada por alguien; no existe un mensajero que haya elegido qué decir ni a quién.',
		sensorial:
			'Contraste bajo, blanco sobre azul, movimiento lento: el sistema visual lo clasifica casi de inmediato como fondo y apenas exige atención.',
		operativo:
			'Se percibe de pasada (por la ventana, caminando): ningún soporte invita a detenerse ni a decodificar nada.',
		cultural:
			'Cualcultura lo entiende como "cielo" o "clima", pero es una interpretación, no un mensaje codificado.'
	},
	{
		id: 'semaforo',
		title: 'Semáforo en rojo',
		answer: 'intencional',
		resumen:
			'Alguien diseñó este estímulo para provocar una respuesta concreta: detener el vehículo.',
		emisor:
			'Autoridad de tránsito: un emisor institucional con propósito explícito, estructurado y dirigido a un público específico (conductores).',
		sensorial:
			'El rojo es un atributo preatentivo: se detecta en milisegundos, sin esfuerzo consciente, y destaca sobre cualquier entorno urbano.',
		operativo:
			'Formato estandarizado, luminoso y de gran tamaño: diseñado para leerse desde lejos y en movimiento.',
		cultural:
			'Funciona por convención cultural compartida: rojo = detenerse. Sin ese código común, el mensaje se pierde en el filtro cultural.'
	},
	{
		id: 'soporte',
		title: 'Gráfico de incidencias de soporte',
		answer: 'intencional',
		resumen:
			'Cada elemento (título, color de acento, pico marcado) fue elegido para que alguien actúe.',
		emisor:
			'El equipo de soporte: organiza datos con la intención de que una audiencia tome una decisión (contratar, escalar, priorizar).',
		sensorial:
			'El título, el punto rojo sobre el pico y la rejilla suave guían la mirada hasta el hallazgo clave antes de que se lea un solo número.',
		operativo:
			'Vive dentro de un reporte o dashboard, en pantalla; está pensado para leerse rápido y desembocar en una acción posterior.',
		cultural:
			'Requiere alfabetización de datos: saber qué es un eje, una serie y un "pico" es saber leer el código.'
	},
	{
		id: 'cartel',
		title: 'Cartel publicitario',
		answer: 'intencional',
		resumen: 'Persuadir es su razón de ser: nada en él está puesto por casualidad.',
		emisor:
			'Una marca o comercio: emisor con interés declarado, que construye el mensaje para un público comprador específico.',
		sensorial:
			'Escala grande, contraste alto, forma estrellada y color saturado: ataca la percepción periférica para capturar la mirada.',
		operativo:
			'Vive en la calle o en un feed: tiene fracciones de segundo para impactar y por eso resume todo en una sola frase.',
		cultural:
			'Apela a códigos culturales compartidos (promoción, urgencia, estrellas de "oferta") que el público decodifica al instante.'
	},
	{
		id: 'ramas',
		title: 'Ramas de un árbol',
		answer: 'casual',
		resumen: 'El "diseño" lo hizo la biología; no hay intención comunicativa detrás de la forma.',
		emisor:
			'Sin emisor: la distribución de las ramas responde a la búsqueda de luz, no a un mensaje enviado hacia un público.',
		sensorial:
			'Verdes de bajo contraste y texturas repetidas: el sistema visual lo trata como escena, no como señal que exija foco.',
		operativo:
			'No pide interacción ni instrucción de uso: se contempla sin reglas de lectura ni soporte que ordene la mirada.',
		cultural:
			'Cualquier asociación ("natural", "tranquilo", "sombra") es una proyección del receptor, no un significado codificado.'
	}
];

export const FILTER_LABELS: { key: 'emisor' | 'sensorial' | 'operativo' | 'cultural'; label: string; desc: string }[] = [
	{ key: 'emisor', label: 'Emisor', desc: '¿Quién lo compuso y con qué propósito?' },
	{ key: 'sensorial', label: 'Filtro sensorial', desc: 'Ojos, contraste, escala, color' },
	{ key: 'operativo', label: 'Filtro operativo', desc: 'Dispositivo, medio y contexto de uso' },
	{ key: 'cultural', label: 'Filtro cultural', desc: 'Códigos que el receptor comparte' }
];
