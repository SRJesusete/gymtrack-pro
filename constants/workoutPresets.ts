// ── Shared workout presets — 3 niveles por categoría ──

export interface PresetExerciseSimple {
  id: string;
  name: string;
  sets: number;
  reps: number;
  muscle: string;
}

export interface LevelDef {
  id: string;
  label: string;
  badge: string;        // e.g. "Principiante", "Intermedio", "Avanzado"
  color: string;        // badge color
  time: string;         // e.g. "~30 min"
  exercises: PresetExerciseSimple[];
}

export interface CategoryDef {
  id: string;
  title: string;
  icon: string;
  desc: string;
  color: string;
  levels: LevelDef[];
}

// ── PUSH ──

const PUSH_PRINCIPIANTE: PresetExerciseSimple[] = [
  { id: 'ex_bench_press',  name: 'Press Banca',          sets: 3, reps: 12, muscle: 'Pecho' },
  { id: 'ex_ohp',          name: 'Press Militar',         sets: 3, reps: 12, muscle: 'Hombros' },
  { id: 'ex_lateral_raise',name: 'Elevaciones Laterales',  sets: 3, reps: 15, muscle: 'Hombros' },
  { id: 'ex_french_press', name: 'Press Frances',         sets: 3, reps: 15, muscle: 'Brazos' },
];

const PUSH_INTERMEDIO: PresetExerciseSimple[] = [
  { id: 'ex_bench_press',  name: 'Press Banca',          sets: 4, reps: 8,  muscle: 'Pecho' },
  { id: 'ex_incline_bench',name: 'Press Inclinado',       sets: 3, reps: 10, muscle: 'Pecho' },
  { id: 'ex_ohp',          name: 'Press Militar',         sets: 4, reps: 8,  muscle: 'Hombros' },
  { id: 'ex_lateral_raise',name: 'Elevaciones Laterales',  sets: 3, reps: 12, muscle: 'Hombros' },
  { id: 'ex_french_press', name: 'Press Frances',         sets: 3, reps: 10, muscle: 'Brazos' },
];

const PUSH_AVANZADO: PresetExerciseSimple[] = [
  { id: 'ex_bench_press',  name: 'Press Banca',          sets: 5, reps: 5,  muscle: 'Pecho' },
  { id: 'ex_incline_bench',name: 'Press Inclinado',       sets: 4, reps: 8,  muscle: 'Pecho' },
  { id: 'ex_db_fly',       name: 'Aperturas Mancuernas',  sets: 3, reps: 12, muscle: 'Pecho' },
  { id: 'ex_ohp',          name: 'Press Militar',         sets: 4, reps: 6,  muscle: 'Hombros' },
  { id: 'ex_lateral_raise',name: 'Elevaciones Laterales',  sets: 4, reps: 12, muscle: 'Hombros' },
  { id: 'ex_french_press', name: 'Press Frances',         sets: 4, reps: 8,  muscle: 'Brazos' },
];

// ── PULL ──

const PULL_PRINCIPIANTE: PresetExerciseSimple[] = [
  { id: 'ex_lat_pulldown', name: 'Jalon al Pecho', sets: 3, reps: 12, muscle: 'Espalda' },
  { id: 'ex_barbell_row',  name: 'Remo con Barra',  sets: 3, reps: 12, muscle: 'Espalda' },
  { id: 'ex_barbell_curl', name: 'Curl de Biceps',  sets: 3, reps: 15, muscle: 'Brazos' },
];

const PULL_INTERMEDIO: PresetExerciseSimple[] = [
  { id: 'ex_lat_pulldown', name: 'Jalon al Pecho', sets: 4, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_barbell_row',  name: 'Remo con Barra',  sets: 4, reps: 10, muscle: 'Espalda' },
  { id: 'ex_pullups',      name: 'Dominadas',       sets: 3, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_barbell_curl', name: 'Curl de Biceps',  sets: 3, reps: 12, muscle: 'Brazos' },
];

const PULL_AVANZADO: PresetExerciseSimple[] = [
  { id: 'ex_deadlift',     name: 'Peso Muerto',     sets: 5, reps: 5,  muscle: 'Espalda' },
  { id: 'ex_pullups',      name: 'Dominadas',       sets: 4, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_barbell_row',  name: 'Remo con Barra',  sets: 4, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_lat_pulldown', name: 'Jalon al Pecho',  sets: 3, reps: 10, muscle: 'Espalda' },
  { id: 'ex_barbell_curl', name: 'Curl de Biceps',  sets: 4, reps: 10, muscle: 'Brazos' },
];

// ── PIERNAS ──

const LEGS_PRINCIPIANTE: PresetExerciseSimple[] = [
  { id: 'ex_squat',    name: 'Sentadilla',         sets: 3, reps: 12, muscle: 'Piernas' },
  { id: 'ex_leg_press',name: 'Prensa de Piernas',   sets: 3, reps: 12, muscle: 'Piernas' },
  { id: 'ex_plank',    name: 'Plancha Abdominal',   sets: 3, reps: 30, muscle: 'Core' },
];

const LEGS_INTERMEDIO: PresetExerciseSimple[] = [
  { id: 'ex_squat',    name: 'Sentadilla',         sets: 4, reps: 8,  muscle: 'Piernas' },
  { id: 'ex_leg_press',name: 'Prensa de Piernas',   sets: 4, reps: 10, muscle: 'Piernas' },
  { id: 'ex_deadlift', name: 'Peso Muerto Rumano',  sets: 3, reps: 10, muscle: 'Piernas' },
  { id: 'ex_plank',    name: 'Plancha Abdominal',   sets: 3, reps: 40, muscle: 'Core' },
];

const LEGS_AVANZADO: PresetExerciseSimple[] = [
  { id: 'ex_squat',    name: 'Sentadilla',         sets: 5, reps: 5,  muscle: 'Piernas' },
  { id: 'ex_leg_press',name: 'Prensa de Piernas',   sets: 4, reps: 8,  muscle: 'Piernas' },
  { id: 'ex_deadlift', name: 'Peso Muerto Rumano',  sets: 4, reps: 8,  muscle: 'Piernas' },
  { id: 'ex_plank',    name: 'Plancha Abdominal',   sets: 3, reps: 45, muscle: 'Core' },
];

// ── FULL BODY ──

const FB_PRINCIPIANTE: PresetExerciseSimple[] = [
  { id: 'ex_squat',        name: 'Sentadilla',         sets: 3, reps: 12, muscle: 'Piernas' },
  { id: 'ex_bench_press',  name: 'Press Banca',        sets: 3, reps: 12, muscle: 'Pecho' },
  { id: 'ex_lat_pulldown', name: 'Jalon al Pecho',     sets: 3, reps: 12, muscle: 'Espalda' },
  { id: 'ex_ohp',          name: 'Press Militar',      sets: 3, reps: 12, muscle: 'Hombros' },
  { id: 'ex_plank',        name: 'Plancha Abdominal',  sets: 3, reps: 30, muscle: 'Core' },
];

const FB_INTERMEDIO: PresetExerciseSimple[] = [
  { id: 'ex_squat',        name: 'Sentadilla',         sets: 4, reps: 8,  muscle: 'Piernas' },
  { id: 'ex_bench_press',  name: 'Press Banca',        sets: 4, reps: 8,  muscle: 'Pecho' },
  { id: 'ex_lat_pulldown', name: 'Jalon al Pecho',     sets: 4, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_barbell_row',  name: 'Remo con Barra',     sets: 3, reps: 10, muscle: 'Espalda' },
  { id: 'ex_ohp',          name: 'Press Militar',      sets: 4, reps: 8,  muscle: 'Hombros' },
  { id: 'ex_plank',        name: 'Plancha Abdominal',  sets: 3, reps: 40, muscle: 'Core' },
];

const FB_AVANZADO: PresetExerciseSimple[] = [
  { id: 'ex_deadlift',     name: 'Peso Muerto',        sets: 5, reps: 5,  muscle: 'Espalda' },
  { id: 'ex_bench_press',  name: 'Press Banca',        sets: 5, reps: 5,  muscle: 'Pecho' },
  { id: 'ex_squat',        name: 'Sentadilla',         sets: 5, reps: 5,  muscle: 'Piernas' },
  { id: 'ex_pullups',      name: 'Dominadas',          sets: 4, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_ohp',          name: 'Press Militar',      sets: 4, reps: 8,  muscle: 'Hombros' },
  { id: 'ex_barbell_curl', name: 'Curl de Biceps',      sets: 3, reps: 10, muscle: 'Brazos' },
  { id: 'ex_lateral_raise',name: 'Elevaciones Laterales', sets: 3, reps: 15, muscle: 'Hombros' },
];

// ── TORSO ──

const TORSO_PRINCIPIANTE: PresetExerciseSimple[] = [
  { id: 'ex_bench_press',  name: 'Press Banca',        sets: 3, reps: 12, muscle: 'Pecho' },
  { id: 'ex_barbell_row',  name: 'Remo con Barra',     sets: 3, reps: 12, muscle: 'Espalda' },
  { id: 'ex_ohp',          name: 'Press Militar',      sets: 3, reps: 12, muscle: 'Hombros' },
  { id: 'ex_lateral_raise',name: 'Elevaciones Laterales', sets: 3, reps: 15, muscle: 'Hombros' },
];

const TORSO_INTERMEDIO: PresetExerciseSimple[] = [
  { id: 'ex_bench_press',  name: 'Press Banca',        sets: 4, reps: 8,  muscle: 'Pecho' },
  { id: 'ex_incline_bench',name: 'Press Inclinado',    sets: 3, reps: 10, muscle: 'Pecho' },
  { id: 'ex_pullups',      name: 'Dominadas',          sets: 3, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_barbell_row',  name: 'Remo con Barra',     sets: 4, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_ohp',          name: 'Press Militar',      sets: 4, reps: 8,  muscle: 'Hombros' },
];

const TORSO_AVANZADO: PresetExerciseSimple[] = [
  { id: 'ex_bench_press',  name: 'Press Banca',        sets: 5, reps: 5,  muscle: 'Pecho' },
  { id: 'ex_incline_bench',name: 'Press Inclinado',    sets: 4, reps: 8,  muscle: 'Pecho' },
  { id: 'ex_pullups',      name: 'Dominadas',          sets: 4, reps: 8,  muscle: 'Espalda' },
  { id: 'ex_barbell_row',  name: 'Remo con Barra',     sets: 4, reps: 6,  muscle: 'Espalda' },
  { id: 'ex_ohp',          name: 'Press Militar',      sets: 4, reps: 6,  muscle: 'Hombros' },
  { id: 'ex_lateral_raise',name: 'Elevaciones Laterales', sets: 3, reps: 12, muscle: 'Hombros' },
];

// ── BRAZOS ──

const ARMS_PRINCIPIANTE: PresetExerciseSimple[] = [
  { id: 'ex_barbell_curl', name: 'Curl de Biceps',  sets: 3, reps: 15, muscle: 'Brazos' },
  { id: 'ex_french_press', name: 'Press Frances',   sets: 3, reps: 15, muscle: 'Brazos' },
];

const ARMS_INTERMEDIO: PresetExerciseSimple[] = [
  { id: 'ex_barbell_curl', name: 'Curl de Biceps',  sets: 4, reps: 10, muscle: 'Brazos' },
  { id: 'ex_french_press', name: 'Press Frances',   sets: 4, reps: 10, muscle: 'Brazos' },
  { id: 'ex_lat_pulldown', name: 'Jalon al Pecho',  sets: 3, reps: 12, muscle: 'Espalda' },
];

const ARMS_AVANZADO: PresetExerciseSimple[] = [
  { id: 'ex_barbell_curl', name: 'Curl de Biceps',  sets: 4, reps: 8,  muscle: 'Brazos' },
  { id: 'ex_french_press', name: 'Press Frances',   sets: 4, reps: 8,  muscle: 'Brazos' },
  { id: 'ex_lat_pulldown', name: 'Jalon al Pecho',  sets: 4, reps: 10, muscle: 'Espalda' },
];

// ── Categorías ──

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'push', title: 'Push', icon: 'TrendingUp', color: '#EF4444',
    desc: 'Empuje: pecho, hombros, triceps',
    levels: [
      { id: 'push-principiante', label: 'Principiante', badge: 'Facil',  color: '#22C55E', time: '~30 min', exercises: PUSH_PRINCIPIANTE },
      { id: 'push-intermedio',   label: 'Intermedio',   badge: 'Medio',  color: '#F97316', time: '~45 min', exercises: PUSH_INTERMEDIO },
      { id: 'push-avanzado',     label: 'Avanzado',     badge: 'Dificil',color: '#EF4444', time: '~55 min', exercises: PUSH_AVANZADO },
    ],
  },
  {
    id: 'pull', title: 'Pull', icon: 'BarChart3', color: '#3B82F6',
    desc: 'Tiron: espalda, biceps',
    levels: [
      { id: 'pull-principiante', label: 'Principiante', badge: 'Facil',  color: '#22C55E', time: '~25 min', exercises: PULL_PRINCIPIANTE },
      { id: 'pull-intermedio',   label: 'Intermedio',   badge: 'Medio',  color: '#F97316', time: '~40 min', exercises: PULL_INTERMEDIO },
      { id: 'pull-avanzado',     label: 'Avanzado',     badge: 'Dificil',color: '#EF4444', time: '~55 min', exercises: PULL_AVANZADO },
    ],
  },
  {
    id: 'piernas', title: 'Piernas', icon: 'Dumbbell', color: '#22C55E',
    desc: 'Cuadriceps, femoral, gemelos, gluteo',
    levels: [
      { id: 'legs-principiante', label: 'Principiante', badge: 'Facil',  color: '#22C55E', time: '~25 min', exercises: LEGS_PRINCIPIANTE },
      { id: 'legs-intermedio',   label: 'Intermedio',   badge: 'Medio',  color: '#F97316', time: '~40 min', exercises: LEGS_INTERMEDIO },
      { id: 'legs-avanzado',     label: 'Avanzado',     badge: 'Dificil',color: '#EF4444', time: '~50 min', exercises: LEGS_AVANZADO },
    ],
  },
  {
    id: 'fullbody', title: 'Full Body', icon: 'Flame', color: '#F97316',
    desc: 'Cuerpo completo en una sesion',
    levels: [
      { id: 'fb-principiante', label: 'Principiante', badge: 'Facil',  color: '#22C55E', time: '~35 min', exercises: FB_PRINCIPIANTE },
      { id: 'fb-intermedio',   label: 'Intermedio',   badge: 'Medio',  color: '#F97316', time: '~50 min', exercises: FB_INTERMEDIO },
      { id: 'fb-avanzado',     label: 'Avanzado',     badge: 'Dificil',color: '#EF4444', time: '~65 min', exercises: FB_AVANZADO },
    ],
  },
  {
    id: 'torso', title: 'Torso', icon: 'Target', color: '#A855F7',
    desc: 'Upper body: pecho + espalda + hombros',
    levels: [
      { id: 'torso-principiante', label: 'Principiante', badge: 'Facil',  color: '#22C55E', time: '~30 min', exercises: TORSO_PRINCIPIANTE },
      { id: 'torso-intermedio',   label: 'Intermedio',   badge: 'Medio',  color: '#F97316', time: '~45 min', exercises: TORSO_INTERMEDIO },
      { id: 'torso-avanzado',     label: 'Avanzado',     badge: 'Dificil',color: '#EF4444', time: '~55 min', exercises: TORSO_AVANZADO },
    ],
  },
  {
    id: 'brazos', title: 'Brazos', icon: 'Zap', color: '#EAB308',
    desc: 'Biceps y triceps',
    levels: [
      { id: 'arms-principiante', label: 'Principiante', badge: 'Facil',  color: '#22C55E', time: '~15 min', exercises: ARMS_PRINCIPIANTE },
      { id: 'arms-intermedio',   label: 'Intermedio',   badge: 'Medio',  color: '#F97316', time: '~25 min', exercises: ARMS_INTERMEDIO },
      { id: 'arms-avanzado',     label: 'Avanzado',     badge: 'Dificil',color: '#EF4444', time: '~35 min', exercises: ARMS_AVANZADO },
    ],
  },
];

// ── Flat map for session/new quickStart lookup ──

export const ALL_PRESETS: Record<string, { name: string; exercises: PresetExerciseSimple[] }> = {};
for (const cat of CATEGORIES) {
  for (const lvl of cat.levels) {
    ALL_PRESETS[lvl.id] = { name: `${cat.title} ${lvl.label}`, exercises: lvl.exercises };
  }
}
