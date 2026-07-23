import type { ComponentType } from 'react';

export interface ExerciseGuide {
  search: string;
  videoUrl: string;
  tips: string[];
  errors: string[];
}

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  'Press Banca': {
    search: 'press banca tecnica correcta gym',
    videoUrl: 'https://www.youtube.com/results?search_query=press+banca+tecnica+correcta+gym',
    tips: [
      'Pies firmes en el suelo durante todo el movimiento',
      'Retrae las escapulas (junta los omoplatos)',
      'Arco lumbar ligero y natural',
      'Baja la barra al pecho de forma controlada (2-3 segundos)',
      'Empuja explosivamente hacia arriba',
    ],
    errors: [
      'Rebotar la barra en el pecho',
      'Levantar los pies del suelo',
      'Hombros desprotegidos (sin retraer escapulas)',
      'Codos muy abiertos (90°) -- mantenlos a ~45°',
    ],
  },
  'Press Banca Inclinado': {
    search: 'press banca inclinado tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=press+banca+inclinado+tecnica+correcta',
    tips: [
      'Banco a 30-45° (no mas de 45°)',
      'Codos a 45° del torso',
      'Baja la barra a la parte superior del pecho',
      'Control en la bajada, explosivo en la subida',
    ],
    errors: [
      'Angulo demasiado alto (>60°)',
      'Abrir demasiado los codos',
      'Rebotar la barra',
    ],
  },
  'Aperturas con Mancuernas': {
    search: 'aperturas con mancuernas pecho tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=aperturas+con+mancuernas+pecho+tecnica',
    tips: [
      'Ligera flexion de codos (no bloquear)',
      'Abrir hasta sentir estiramiento en el pecho',
      'Contraer el pectoral al cerrar',
      'Movimiento en arco amplio',
    ],
    errors: [
      'Bajar demasiado las mancuernas (riesgo de lesion)',
      'Estirar los brazos completamente',
      'Usar demasiado peso',
    ],
  },
  'Cruce de Poleas': {
    search: 'cruce de poleas pecho tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=cruce+de+poleas+pecho+tecnica',
    tips: [
      'Poleas en posicion alta',
      'Ligera inclinacion del torso hacia delante',
      'Cruzar las manos al final del movimiento',
      'Apretar el pecho en la contraccion maxima',
    ],
    errors: [
      'Usar demasiado peso y perder control',
      'Movimiento brusco o con impulso',
      'No cruzar las manos',
    ],
  },
  Sentadilla: {
    search: 'sentadilla con barra tecnica correcta',
    videoUrl: 'https://www.youtube.com/results?search_query=sentadilla+con+barra+tecnica+correcta+principiantes',
    tips: [
      'Barra sobre los trapecios, no sobre el cuello',
      'Espalda recta y pecho arriba durante todo el movimiento',
      'Baja hasta que las caderas esten por debajo de las rodillas (o paralelo)',
      'Rodillas alineadas con la punta de los pies',
      'Empuja desde los talones al subir',
    ],
    errors: [
      'Talones se despegan del suelo',
      'Rodillas se colapsan hacia dentro (valgo)',
      'Espalda se redondea en la bajada',
      'No llegar a profundidad suficiente',
    ],
  },
  'Prensa de Piernas': {
    search: 'prensa piernas tecnica gym',
    videoUrl: 'https://www.youtube.com/results?search_query=prensa+piernas+tecnica+gym',
    tips: [
      'Espalda completamente pegada al respaldo',
      '90° de flexion de rodilla como minimo',
      'No bloquees las rodillas al extender',
      'Pies a la anchura de hombros',
    ],
    errors: [
      'Bajar demasiado y despegar los gluteos',
      'Extender completamente y bloquear rodillas',
      'Pies demasiado altos o bajos en la plataforma',
    ],
  },
  'Peso Muerto': {
    search: 'peso muerto tecnica correcta principiantes',
    videoUrl: 'https://www.youtube.com/results?search_query=peso+muerto+tecnica+correcta+principiantes',
    tips: [
      'Barra sobre la mitad del pie',
      'Espalda neutra durante TODO el movimiento',
      'Activa los dorsales antes de tirar (aprieta las axilas)',
      'Cadera y hombros suben a la vez',
      'La barra debe rozar las espinillas y muslos',
    ],
    errors: [
      'Espalda redondeada (riesgo alto de lesion)',
      'Barra se aleja del cuerpo',
      'Tiron brusco inicial (sin tension previa)',
      'Cadera sube antes que los hombros',
    ],
  },
  Dominadas: {
    search: 'dominadas tecnica correcta espalda',
    videoUrl: 'https://www.youtube.com/results?search_query=dominadas+tecnica+correcta+espalda+principiantes',
    tips: [
      'Agarre prono (palmas hacia fuera), anchura de hombros o mas',
      'Activa las escapulas antes de tirar',
      'Sube hasta que la barbilla supere la barra',
      'Baja controladamente hasta extension completa',
    ],
    errors: [
      'Balanceo del cuerpo (kipping no controlado)',
      'No completar el rango de movimiento',
      'Hombros encogidos (no activar dorsales)',
      'Medias repeticiones',
    ],
  },
  'Remo con Barra': {
    search: 'remo con barra tecnica espalda',
    videoUrl: 'https://www.youtube.com/results?search_query=remo+con+barra+tecnica+espalda',
    tips: [
      'Torso inclinado a 45°',
      'Lleva la barra hacia el ombligo',
      'Codos pegados al cuerpo',
      'Espalda recta, core activado',
    ],
    errors: [
      'Torso demasiado erguido (se convierte en encogimiento)',
      'Usar impulso de piernas o cadera',
      'Redondear la espalda',
    ],
  },
  'Jalon al Pecho': {
    search: 'jalon al pecho tecnica dorsal',
    videoUrl: 'https://www.youtube.com/results?search_query=jalon+al+pecho+tecnica+dorsal',
    tips: [
      'Agarre ancho (1.5x anchura de hombros)',
      'Pecho arriba, ligera inclinacion hacia atras',
      'Lleva la barra a la clavicula',
      'Controla la subida (no la sueltes)',
    ],
    errors: [
      'Balanceo excesivo hacia atras',
      'Tirar con los biceps en vez de la espalda',
      'Bajar la barra detras del cuello',
    ],
  },
  'Press Militar': {
    search: 'press militar con barra tecnica hombros',
    videoUrl: 'https://www.youtube.com/results?search_query=press+militar+con+barra+tecnica+hombros',
    tips: [
      'Barra apoyada en las claviculas',
      'Core firme y gluteos contraidos',
      'Empuja vertical, pasando la cabeza hacia delante',
      'Bloquea los codos arriba sin hiperextender',
    ],
    errors: [
      'Arquear excesivamente la espalda',
      'Empujar la barra hacia delante en vez de vertical',
      'No estabilizar el core',
    ],
  },
  'Elevaciones Laterales': {
    search: 'elevaciones laterales mancuernas tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=elevaciones+laterales+mancuernas+tecnica+correcta',
    tips: [
      'Ligera flexion de codos (unos 10-15°)',
      'Sube hasta la altura de los hombros (no mas)',
      'Controla la bajada (2-3 segundos)',
      'No uses impulso, mueve solo los brazos',
    ],
    errors: [
      'Subir demasiado las mancuernas (por encima de hombros)',
      'Balancear el cuerpo para generar impulso',
      'Encoger los hombros (trapecios)',
      'Bajar sin control',
    ],
  },
  'Curl de Biceps': {
    search: 'curl de biceps con barra tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=curl+de+biceps+con+barra+tecnica+correcta',
    tips: [
      'Codos pegados al cuerpo y fijos',
      'Solo mueve el antebrazo',
      'Aprieta el biceps en la parte alta',
      'Baja controladamente (excentrica lenta)',
    ],
    errors: [
      'Balancear el cuerpo para subir el peso',
      'Mover los hombros hacia delante',
      'No extender completamente en la bajada',
    ],
  },
  'Press Frances': {
    search: 'press frances triceps tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=press+frances+triceps+tecnica+correcta',
    tips: [
      'Codos fijos apuntando al techo',
      'Baja la barra/mancuerna controladamente hacia la frente',
      'Extiende completamente sin bloquear',
      'Solo se mueve el antebrazo',
    ],
    errors: [
      'Abrir los codos hacia los lados',
      'Bajar demasiado rapido sin control',
      'Usar demasiado peso',
    ],
  },
  'Plancha Abdominal': {
    search: 'plancha abdominal tecnica correcta',
    videoUrl: 'https://www.youtube.com/results?search_query=plancha+abdominal+tecnica+correcta',
    tips: [
      'Codos justo debajo de los hombros',
      'Cuerpo en linea recta de la cabeza a los talones',
      'Gluteos y abdomen contraidos',
      'Mirada al suelo (cuello neutro)',
      'Respira de forma controlada',
    ],
    errors: [
      'Cadera hundida (arquea la espalda)',
      'Cadera demasiado alta (forma de V invertida)',
      'Aguantar la respiracion',
      'Hombros encogidos',
    ],
  },
  'Extension de Cuadriceps': {
    search: 'extension de cuadriceps tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=extension+de+cuadriceps+tecnica+gym',
    tips: [
      'Ajusta el rodillo justo por encima de los tobillos',
      'Espalda pegada al respaldo',
      'Extiende hasta casi bloquear, sin llegar a bloquear',
      'Baja controladamente',
    ],
    errors: [
      'Balancear el cuerpo',
      'Bloquear las rodillas',
      'Subir demasiado rapido',
    ],
  },
  'Curl Femoral': {
    search: 'curl femoral tecnica gym',
    videoUrl: 'https://www.youtube.com/results?search_query=curl+femoral+tecnica+gym',
    tips: [
      'Cadera pegada al banco',
      'Agarra los asideros para estabilidad',
      'Flexiona las rodillas completamente',
      'Baja de forma controlada',
    ],
    errors: [
      'Levantar la cadera del banco',
      'Usar impulso',
      'No completar el rango',
    ],
  },
  'Gemelos en Prensa': {
    search: 'gemelos en prensa tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=gemelos+en+prensa+tecnica',
    tips: [
      'Puntas de los pies en el borde inferior de la plataforma',
      'Rodillas ligeramente flexionadas',
      'Empuja con las puntas, estirando tobillos al maximo',
      'Baja hasta sentir estiramiento',
    ],
    errors: [
      'Rebotar en la bajada',
      'Doblar las rodillas durante el movimiento',
      'No llegar al rango completo',
    ],
  },
  'Hip Thrust': {
    search: 'hip thrust tecnica correcta',
    videoUrl: 'https://www.youtube.com/results?search_query=hip+thrust+tecnica+correcta',
    tips: [
      'Espalda alta apoyada en el banco',
      'Barra sobre las caderas (usa proteccion)',
      'Barbilla al pecho (mirada al frente)',
      'Empuja con los gluteos hasta que el cuerpo este recto',
      'Aprieta gluteos arriba 1 segundo',
    ],
    errors: [
      'Hiperextender la espalda',
      'Apoyar demasiado alta la espalda en el banco',
      'No activar gluteos',
    ],
  },
  'Face Pull': {
    search: 'face pull tecnica correcta',
    videoUrl: 'https://www.youtube.com/results?search_query=face+pull+tecnica+correcta',
    tips: [
      'Polea a la altura de la cara',
      'Tira hacia la cara separando las manos',
      'Rotacion externa al final del movimiento',
      'Aprieta los rotadores y la espalda alta',
    ],
    errors: [
      'Usar demasiado peso',
      'No hacer rotacion externa',
      'Tirar con los brazos en vez de la espalda',
    ],
  },
  'Pajaro con Mancuernas': {
    search: 'pajaro con mancuernas tecnica',
    videoUrl: 'https://www.youtube.com/results?search_query=pajaro+mancuernas+deltoides+posterior+tecnica',
    tips: [
      'Torso inclinado casi paralelo al suelo',
      'Brazos casi extendidos, ligera flexion de codos',
      'Abre los brazos hacia los lados y arriba',
      'Aprieta la espalda alta',
    ],
    errors: [
      'Usar demasiado peso y balancear',
      'Subir los brazos demasiado alto',
      'Doblar mucho los codos',
    ],
  },
  'Press Arnold': {
    search: 'press arnold tecnica correcta',
    videoUrl: 'https://www.youtube.com/results?search_query=press+arnold+tecnica+correcta',
    tips: [
      'Empieza con las palmas mirando hacia ti',
      'Rota las palmas hacia fuera mientras subes',
      'Sube en arco, no en linea recta',
      'Controla la bajada rotando de vuelta',
    ],
    errors: [
      'No rotar las muñecas',
      'Subir recto sin el arco caracteristico',
      'Usar demasiado peso',
    ],
  },
};

export function getGuide(exerciseName: string): ExerciseGuide {
  const exact = EXERCISE_GUIDES[exerciseName];
  if (exact) return exact;
  for (const [key, val] of Object.entries(EXERCISE_GUIDES)) {
    if (exerciseName.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return {
    search: `${exerciseName} ejercicio gym tecnica`,
    videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' ejercicio gym tecnica')}`,
    tips: ['Manten una postura correcta', 'Controla el movimiento en ambas fases', 'Respira de forma adecuada'],
    errors: ['Usar demasiado peso', 'Mala postura', 'Movimiento sin control'],
  };
}

export const MUSCLE_GROUPS: { key: string; label: string; color: string }[] = [
  { key: 'Pecho', label: 'Pecho', color: '#EF4444' },
  { key: 'Espalda', label: 'Espalda', color: '#3B82F6' },
  { key: 'Piernas', label: 'Piernas', color: '#22C55E' },
  { key: 'Hombros', label: 'Hombros', color: '#F97316' },
  { key: 'Brazos', label: 'Brazos', color: '#A855F7' },
  { key: 'Core', label: 'Core', color: '#EAB308' },
];
