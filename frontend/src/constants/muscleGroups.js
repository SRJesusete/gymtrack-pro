export const MUSCLE_GROUPS = [
  { key: "Pecho", label: "Pecho", color: "#FF4D4D" },
  { key: "Espalda", label: "Espalda", color: "#3B82F6" },
  { key: "Piernas", label: "Piernas", color: "#22C55E" },
  { key: "Hombros", label: "Hombros", color: "#F97316" },
  { key: "Brazos", label: "Brazos", color: "#A855F7" },
  { key: "Core", label: "Core", color: "#EAB308" },
];

export function groupColor(key) {
  return MUSCLE_GROUPS.find((g) => g.key === key)?.color || "#D4FF00";
}

export const YT_RED = "#FF3B30";

export const VIDEO_TIPS = {
  "Press Banca": { search: "press banca tecnica correcta gym", tips: ["Pies firmes en el suelo", "Retrae las escápulas", "Arco lumbar ligero", "Baja la barra al pecho controladamente"], errors: ["Rebotar la barra en el pecho", "Levantar los pies", "Hombros desprotegidos"] },
  "Press Banca Inclinado": { search: "press banca inclinado tecnica", tips: ["Banco a 30-45°", "Codos a 45° del torso", "Control en la bajada"], errors: ["Angulo demasiado alto (>60°)", "Abrir demasiado los codos"] },
  "Aperturas con Mancuernas": { search: "aperturas con mancuernas pecho tecnica", tips: ["Ligera flexion de codos", "Abrir hasta sentir estiramiento", "Contraer pectoral al cerrar"], errors: ["Bajar demasiado las mancuernas", "Estirar los brazos completamente"] },
  "Cruce de Poleas": { search: "cruce de poleas pecho tecnica", tips: ["Poleas altas", "Ligera inclinacion hacia delante", "Cruzar las manos al final"], errors: ["Usar demasiado peso", "Movimiento brusco"] },
  Sentadilla: { search: "sentadilla con barra tecnica correcta", tips: ["Barra sobre los trapecios", "Espalda recta, pecho arriba", "Bajar hasta paralelo o mas", "Rodillas alineadas con pies"], errors: ["Talones despegan del suelo", "Rodillas se colapsan hacia dentro", "Espalda se redondea"] },
  "Prensa de Piernas": { search: "prensa piernas tecnica gym", tips: ["Espalda pegada al respaldo", "90° de flexion de rodilla", "No bloquear rodillas al extender"], errors: ["Bajar demasiado (gluteos se levantan)", "Extender completamente las piernas"] },
  "Peso Muerto": { search: "peso muerto tecnica correcta principiantes", tips: ["Barra sobre medio pie", "Espalda neutra siempre", "Activar dorsales antes de tirar", "Cadera y hombros suben juntos"], errors: ["Espalda redondeada", "Barra se aleja del cuerpo", "Tiron brusco inicial"] },
  Dominadas: { search: "dominadas tecnica correcta espalda", tips: ["Agarre prono (palmas hacia fuera)", "Activar escapulas al inicio", "Subir hasta barbilla sobre barra"], errors: ["Balanceo del cuerpo", "No completar el rango", "Hombros encogidos"] },
  "Remo con Barra": { search: "remo con barra tecnica espalda", tips: ["Torso a 45°", "Barra hacia el ombligo", "Codos pegados al cuerpo"], errors: ["Torso demasiado erguido", "Usar impulso de piernas"] },
  "Jalón al Pecho": { search: "jalon al pecho tecnica dorsal", tips: ["Agarre ancho", "Pecho arriba", "Llevar barra a la clavicula", "Control en la subida"], errors: ["Balanceo hacia atras", "Tirar con los biceps"] },
  "Press Militar": { search: "press militar con barra tecnica hombros", tips: ["Barra desde las claviculas", "Core activado", "Empujar vertical, cabeza adelante"], errors: ["Arquear la espalda", "Empujar hacia delante"] },
  "Elevaciones Laterales": { search: "elevaciones laterales mancuernas tecnica", tips: ["Ligera flexion de codos", "Subir hasta altura de hombros", "Control en la bajada", "No usar impulso"], errors: ["Subir demasiado las mancuernas", "Balancear el cuerpo", "Encoger los hombros"] },
  "Curl de Bíceps": { search: "curl de biceps con barra tecnica", tips: ["Codos pegados al cuerpo", "Solo mover el antebrazo", "Apretar biceps arriba", "Bajar controladamente"], errors: ["Balancear el cuerpo", "Mover los hombros", "No extender completamente"] },
  "Press Francés": { search: "press frances triceps tecnica", tips: ["Codos fijos apuntando al techo", "Bajar la barra controladamente", "Extender completamente"], errors: ["Abrir los codos", "Bajar demasiado rapido"] },
  "Plancha Abdominal": { search: "plancha abdominal tecnica correcta", tips: ["Codos bajo los hombros", "Cuerpo en linea recta", "Gluteos y abdomen contraidos", "Mirada al suelo"], errors: ["Cadera hundida", "Cadera demasiado alta", "Aguantar la respiracion"] },
};

export function getVideoInfo(name) {
  const exact = VIDEO_TIPS[name];
  if (exact) return exact;
  for (const [key, val] of Object.entries(VIDEO_TIPS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return { search: `${name} ejercicio gym tecnica`, tips: [], errors: [] };
}

export function searchYouTube(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
