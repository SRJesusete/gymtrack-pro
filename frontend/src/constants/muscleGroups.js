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

// Verified YouTube video IDs (Spanish technique tutorials) per exercise.
export const VIDEO_IDS = {
  // Pecho
  "Press Banca": "VgEkiylX3Qo",
  "Press Banca Inclinado": "swMjJqFzxCQ",
  "Press Banca Declinado": "L1U8yy4OqbQ",
  "Aperturas con Mancuernas": "kgt1Ik1yXpk",
  "Cruce de Poleas": "TmYsga_aOfo",
  Flexiones: "InGwq6APE40",
  // Espalda
  "Peso Muerto": "59KftU68hHQ",
  Dominadas: "XDIGtArAenQ",
  "Jalón al Pecho": "fVU5ODcbmik",
  "Remo con Barra": "j7h2ytbt5nc",
  "Remo con Mancuerna": "ryhxLQUn-cQ",
  "Remo T-Bar": "VsiEATZdNQw",
  // Piernas
  Sentadilla: "zWhrzLouoQ0",
  "Sentadilla Búlgara": "IdilLr9nyuQ",
  "Sentadilla Isométrica": "sgGXhqKJjcQ",
  "Prensa de Piernas": "hl-EJUQ2yuc",
  Zancadas: "SXHpc19u9MQ",
  "Extensión de Cuádriceps": "ndnA6yvGoqQ",
  "Curl Femoral": "CBCPBnMzsMI",
  "Gemelos en Prensa": "L4YnlvVLxtU",
  "Hip Thrust": "3aTb9Megbuo",
  "Puente de Glúteos": "ea2tQUJ9lGk",
  // Hombros
  "Press Militar": "j_Buh54Sb-w",
  "Press Arnold": "JdMgGoAPKjg",
  "Elevaciones Laterales": "V3LaKO8iZUE",
  "Elevaciones Frontales": "O0n4ITO_288",
  "Elevación Lateral en Polea": "bke5gJKJqh8",
  "Pájaro con Mancuernas": "RG_41P2hP0s",
  "Face Pull": "Q18p2QtQAes",
  "Remo al Cuello": "tpCINjIeGng",
  // Brazos
  "Curl de Bíceps": "zNZ5RmhGqjc",
  "Curl Concentrado": "EbOn-SVVbaA",
  Martillo: "RHdacbwKbTo",
  "Press Francés": "SHL-rkBlK0w",
  "Press Francés Acostado": "iQLnqT0zpAs",
  // Core
  "Plancha Abdominal": "AD1YG9b88bk",
  "Crunch Abdominal": "yhHsPYtzYuU",
  "Elevación de Piernas": "-TFVKtx9tg4",
  "Elevación en Barra": "n8CC7XJJrFw",
  "Giro Ruso": "0autvlUL28c",
  "Rueda Abdominal": "KBAn_7SBDwQ",
};

const norm = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function getVideoId(name) {
  if (VIDEO_IDS[name]) return VIDEO_IDS[name];
  const n = norm(name);
  for (const [key, id] of Object.entries(VIDEO_IDS)) {
    const k = norm(key);
    if (n === k || n.includes(k) || k.includes(n)) return id;
  }
  return null;
}

const T = (search, tips, errors) => ({ search, tips, errors });

export const VIDEO_TIPS = {
  // ---- Pecho ----
  "Press Banca": T("press banca tecnica correcta gym", ["Pies firmes en el suelo", "Retrae las escápulas", "Arco lumbar ligero", "Baja la barra al pecho controladamente"], ["Rebotar la barra en el pecho", "Levantar los pies", "Hombros desprotegidos"]),
  "Press Banca Inclinado": T("press banca inclinado tecnica", ["Banco a 30-45°", "Codos a 45° del torso", "Control en la bajada"], ["Ángulo demasiado alto (>60°)", "Abrir demasiado los codos"]),
  "Press Banca Declinado": T("press banca declinado tecnica", ["Banco declinado 15-30°", "Baja la barra a la parte baja del pecho", "Codos algo recogidos"], ["Bajar la barra muy alta", "Perder el control por el declive"]),
  "Aperturas con Mancuernas": T("aperturas con mancuernas pecho tecnica", ["Ligera flexión de codos fija", "Abrir hasta sentir estiramiento", "Contraer el pectoral al cerrar"], ["Bajar demasiado las mancuernas", "Estirar los brazos por completo"]),
  "Cruce de Poleas": T("cruce de poleas pecho tecnica", ["Poleas altas", "Ligera inclinación hacia delante", "Cruzar las manos al final"], ["Usar demasiado peso", "Movimiento brusco"]),
  "Peck Deck": T("peck deck contractora pecho tecnica", ["Espalda pegada al respaldo", "Codos a la altura de los hombros", "Aprieta el pecho 1s"], ["Usar solo los brazos", "Rango incompleto"]),
  Flexiones: T("flexiones tecnica correcta", ["Cuerpo en línea recta", "Manos bajo los hombros", "Baja hasta casi tocar el suelo"], ["Cadera hundida o elevada", "Codos totalmente abiertos"]),
  // ---- Espalda ----
  Dominadas: T("dominadas tecnica correcta espalda", ["Agarre prono a la anchura de hombros", "Activa las escápulas al inicio", "Sube hasta pasar la barbilla"], ["Balanceo del cuerpo", "No completar el rango", "Tirar solo con bíceps"]),
  "Jalón al Pecho": T("jalon al pecho tecnica dorsal", ["Agarre ancho", "Pecho arriba", "Lleva la barra a la clavícula", "Control en la subida"], ["Balanceo hacia atrás", "Tirar con los bíceps"]),
  "Remo con Barra": T("remo con barra tecnica espalda", ["Torso a 45°", "Barra hacia el ombligo", "Codos pegados al cuerpo"], ["Torso demasiado erguido", "Usar impulso de piernas"]),
  "Remo con Mancuerna": T("remo con mancuerna tecnica espalda", ["Apoya rodilla y mano en el banco", "Tira del codo hacia la cadera", "Espalda neutra"], ["Rotar el torso", "Tirón con el brazo, no la espalda"]),
  "Remo T-Bar": T("remo t-bar tecnica espalda", ["Espalda recta, pecho arriba", "Tira hacia el abdomen", "Aprieta escápulas arriba"], ["Redondear la espalda", "Usar demasiado impulso"]),
  "Peso Muerto": T("peso muerto tecnica correcta principiantes", ["Barra sobre medio pie", "Espalda neutra siempre", "Activa dorsales antes de tirar", "Cadera y hombros suben juntos"], ["Espalda redondeada", "La barra se aleja del cuerpo", "Tirón brusco inicial"]),
  Pullover: T("pullover con mancuerna tecnica", ["Tumbado, mancuerna sobre el pecho", "Baja por detrás de la cabeza", "Codos ligeramente flexionados"], ["Bajar demasiado (dolor de hombro)", "Extender los codos del todo"]),
  Encogimientos: T("encogimientos trapecio tecnica", ["Sube los hombros hacia las orejas", "Aprieta 1s arriba", "Sin rotar los hombros"], ["Rotar los hombros", "Usar impulso del cuello"]),
  // ---- Piernas ----
  Sentadilla: T("sentadilla con barra tecnica correcta", ["Barra sobre los trapecios", "Espalda recta, pecho arriba", "Baja hasta paralelo o más", "Rodillas alineadas con los pies"], ["Talones se despegan", "Rodillas se colapsan hacia dentro", "Espalda redondeada"]),
  "Sentadilla Búlgara": T("sentadilla bulgara tecnica", ["Pie trasero sobre el banco", "Baja con la rodilla delantera", "Torso ligeramente inclinado"], ["Paso demasiado corto", "Rodilla sobrepasa mucho el pie"]),
  "Sentadilla Isométrica": T("sentadilla isometrica pared tecnica", ["Espalda apoyada en la pared", "Muslos paralelos al suelo", "Mantén la posición el tiempo objetivo"], ["Rodillas hacia dentro", "Apoyar las manos en los muslos"]),
  "Prensa de Piernas": T("prensa piernas tecnica gym", ["Espalda pegada al respaldo", "90° de flexión de rodilla", "No bloquees las rodillas al extender"], ["Bajar demasiado (glúteos se levantan)", "Extender del todo con tirón"]),
  Zancadas: T("zancadas tecnica correcta piernas", ["Paso largo y estable", "Baja la rodilla trasera al suelo", "Torso erguido"], ["Rodilla delantera pasa mucho el pie", "Perder el equilibrio"]),
  "Extension de Cuadriceps": T("extension de cuadriceps tecnica", ["Ajusta el rodillo al tobillo", "Extiende sin bloquear de golpe", "Baja controlado"], ["Usar impulso", "Rango incompleto"]),
  "Curl Femoral": T("curl femoral maquina tecnica", ["Rodillo sobre el tendón de Aquiles", "Flexiona llevando el talón al glúteo", "Baja controlado"], ["Levantar la cadera", "Usar demasiado peso"]),
  "Gemelos en Prensa": T("gemelos en prensa tecnica", ["Empuja con la punta del pie", "Estira abajo, contrae arriba", "Rango completo"], ["Rebotar", "Rango corto"]),
  "Hip Thrust": T("hip thrust tecnica gluteo", ["Espalda alta apoyada en el banco", "Empuja con los talones", "Aprieta glúteos arriba, tibia vertical"], ["Hiperextender la lumbar", "No llegar a la extensión completa"]),
  "Puente de Glúteos": T("puente de gluteos tecnica", ["Tumbado, pies apoyados", "Sube la cadera apretando glúteos", "Cuerpo recto arriba"], ["Arquear la lumbar", "Empujar con la punta de los pies"]),
  // ---- Hombros ----
  "Press Militar": T("press militar con barra tecnica hombros", ["Barra desde las clavículas", "Core activado", "Empuja vertical, cabeza adelante al final"], ["Arquear la espalda", "Empujar hacia delante"]),
  "Press Arnold": T("press arnold tecnica hombros", ["Empieza con palmas hacia ti", "Gira mientras subes", "Control en toda la fase"], ["Usar demasiado peso", "Rotación brusca"]),
  "Elevaciones Laterales": T("elevaciones laterales mancuernas tecnica", ["Ligera flexión de codos", "Sube hasta la altura de los hombros", "Baja controlado, sin impulso"], ["Subir demasiado", "Balancear el cuerpo", "Encoger los hombros"]),
  "Elevaciones Frontales": T("elevaciones frontales tecnica hombros", ["Sube al frente hasta la altura del hombro", "Codos casi rectos", "Sin balanceo"], ["Usar impulso de cadera", "Subir por encima del hombro"]),
  "Elevación Lateral en Polea": T("elevacion lateral en polea tecnica", ["Polea baja detrás del cuerpo", "Eleva lateral controlado", "Aprieta el deltoides arriba"], ["Usar el trapecio", "Movimiento con tirón"]),
  "Pajaro con Mancuernas": T("pajaro deltoides posterior tecnica", ["Torso inclinado adelante", "Abre los brazos a los lados", "Aprieta escápulas"], ["Levantar el torso", "Usar impulso"]),
  "Face Pull": T("face pull tecnica hombros", ["Cuerda a la altura de la cara", "Tira separando las manos", "Codos altos"], ["Peso excesivo", "Bajar los codos"]),
  "Remo al Cuello": T("remo al cuello tecnica hombros", ["Sube la barra hacia la barbilla", "Codos por encima de las muñecas", "Agarre a la anchura de hombros"], ["Agarre demasiado cerrado", "Subir con muñecas dobladas"]),
  // ---- Brazos ----
  "Curl de Bíceps": T("curl de biceps con barra tecnica", ["Codos pegados al cuerpo", "Solo mueve el antebrazo", "Aprieta el bíceps arriba", "Baja controlado"], ["Balancear el cuerpo", "Mover los hombros", "No extender del todo"]),
  "Curl Concentrado": T("curl concentrado biceps tecnica", ["Codo apoyado en el muslo", "Sube controlado", "Contrae fuerte arriba"], ["Usar impulso", "Despegar el codo del muslo"]),
  Martillo: T("curl martillo biceps tecnica", ["Agarre neutro (palmas enfrentadas)", "Codos fijos", "Sube y baja controlado"], ["Balanceo", "Rango incompleto"]),
  "Press Francés": T("press frances triceps tecnica", ["Codos fijos apuntando al techo", "Baja la barra controladamente", "Extiende por completo"], ["Abrir los codos", "Bajar demasiado rápido"]),
  "Press Francés Acostado": T("press frances acostado triceps tecnica", ["Tumbado, codos apuntando arriba", "Baja hacia la frente", "Extiende sin bloquear de golpe"], ["Mover los codos", "Perder el control en la bajada"]),
  "Extensión de Tríceps en Polea": T("extension triceps polea tecnica", ["Codos pegados al cuerpo", "Extiende hasta abajo", "Aprieta el tríceps"], ["Mover los codos", "Ayudarse con el cuerpo"]),
  Fondos: T("fondos triceps tecnica", ["Cuerpo lo más vertical posible", "Baja hasta 90° de codo", "Sube extendiendo el tríceps"], ["Bajar demasiado (hombro)", "Balancear las piernas"]),
  // ---- Core ----
  "Plancha Abdominal": T("plancha abdominal tecnica correcta", ["Codos bajo los hombros", "Cuerpo en línea recta", "Glúteos y abdomen contraídos", "Mirada al suelo"], ["Cadera hundida", "Cadera demasiado alta", "Aguantar la respiración"]),
  "Crunch Abdominal": T("crunch abdominal tecnica", ["Sube con el abdomen, no el cuello", "Barbilla separada del pecho", "Baja controlado"], ["Tirar de la cabeza", "Usar impulso"]),
  "Elevación de Piernas": T("elevacion de piernas abdominal tecnica", ["Lumbar pegada al suelo", "Sube las piernas controladas", "Baja sin tocar el suelo"], ["Arquear la lumbar", "Usar impulso"]),
  "Elevación en Barra": T("elevacion de piernas en barra tecnica", ["Cuélgate sin balanceo", "Sube las rodillas/piernas al pecho", "Baja controlado"], ["Balancearse", "Usar impulso para subir"]),
  "Giro Ruso": T("giro ruso russian twist tecnica", ["Torso inclinado atrás", "Gira de lado a lado con control", "Abdomen apretado"], ["Girar solo los brazos", "Redondear la espalda"]),
  "Rueda Abdominal": T("rueda abdominal ab wheel tecnica", ["Abdomen y glúteos apretados", "Rueda hacia delante sin arquear", "Vuelve controlado"], ["Arquear la lumbar", "Extender más de lo que controlas"]),
};

export function getVideoInfo(name) {
  const exact = VIDEO_TIPS[name];
  if (exact) return exact;
  const n = norm(name);
  for (const [key, val] of Object.entries(VIDEO_TIPS)) {
    const k = norm(key);
    if (n === k || n.includes(k) || k.includes(n)) return val;
  }
  return { search: `${name} ejercicio gym tecnica`, tips: [], errors: [] };
}

export function searchYouTube(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
