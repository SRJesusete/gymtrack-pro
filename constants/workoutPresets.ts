// ── Shared workout presets used by both the home screen and session/new screen ──

export interface PresetExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
}

export interface WorkoutPreset {
  id: string;
  label: string;
  name: string;
  time: string;
  exercises: PresetExerciseSimple[];
}

export interface PresetExerciseSimple {
  id: string;
  name: string;
  sets: number;
  reps: number;
  muscle: string;
}

// ── All quick-start presets (flattened for easy lookup) ──

const PUSH_LIGHT: PresetExerciseSimple[] = [
  { id: 'ex_bench_press', name: 'Press Banca', sets: 3, reps: 10, muscle: 'Pecho' },
  { id: 'ex_incline_bench', name: 'Press Inclinado', sets: 3, reps: 10, muscle: 'Pecho' },
  { id: 'ex_ohp', name: 'Press Militar', sets: 3, reps: 10, muscle: 'Hombros' },
  { id: 'ex_lateral_raise', name: 'Elevaciones Laterales', sets: 3, reps: 12, muscle: 'Hombros' },
  { id: 'ex_french_press', name: 'Press Francés', sets: 3, reps: 12, muscle: 'Brazos' },
];

const PUSH_INTENSE: PresetExerciseSimple[] = [
  { id: 'ex_bench_press', name: 'Press Banca', sets: 5, reps: 5, muscle: 'Pecho' },
  { id: 'ex_incline_bench', name: 'Press Inclinado', sets: 4, reps: 8, muscle: 'Pecho' },
  { id: 'ex_db_fly', name: 'Aperturas Mancuernas', sets: 3, reps: 12, muscle: 'Pecho' },
  { id: 'ex_ohp', name: 'Press Militar', sets: 4, reps: 8, muscle: 'Hombros' },
  { id: 'ex_lateral_raise', name: 'Elevaciones Laterales', sets: 4, reps: 12, muscle: 'Hombros' },
  { id: 'ex_french_press', name: 'Press Francés', sets: 3, reps: 10, muscle: 'Brazos' },
];

const PULL_LIGHT: PresetExerciseSimple[] = [
  { id: 'ex_lat_pulldown', name: 'Jalón al Pecho', sets: 3, reps: 10, muscle: 'Espalda' },
  { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 3, reps: 10, muscle: 'Espalda' },
  { id: 'ex_barbell_curl', name: 'Curl de Bíceps', sets: 3, reps: 12, muscle: 'Brazos' },
];

const PULL_INTENSE: PresetExerciseSimple[] = [
  { id: 'ex_deadlift', name: 'Peso Muerto', sets: 5, reps: 5, muscle: 'Espalda' },
  { id: 'ex_pullups', name: 'Dominadas', sets: 4, reps: 8, muscle: 'Espalda' },
  { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 4, reps: 8, muscle: 'Espalda' },
  { id: 'ex_lat_pulldown', name: 'Jalón al Pecho', sets: 3, reps: 10, muscle: 'Espalda' },
  { id: 'ex_barbell_curl', name: 'Curl de Bíceps', sets: 4, reps: 10, muscle: 'Brazos' },
];

const LEGS_LIGHT: PresetExerciseSimple[] = [
  { id: 'ex_squat', name: 'Sentadilla', sets: 3, reps: 12, muscle: 'Piernas' },
  { id: 'ex_leg_press', name: 'Prensa de Piernas', sets: 3, reps: 12, muscle: 'Piernas' },
  { id: 'ex_plank', name: 'Plancha Abdominal', sets: 3, reps: 30, muscle: 'Core' },
];

const LEGS_INTENSE: PresetExerciseSimple[] = [
  { id: 'ex_squat', name: 'Sentadilla', sets: 5, reps: 5, muscle: 'Piernas' },
  { id: 'ex_leg_press', name: 'Prensa de Piernas', sets: 4, reps: 8, muscle: 'Piernas' },
  { id: 'ex_deadlift', name: 'Peso Muerto Rumano', sets: 4, reps: 8, muscle: 'Piernas' },
  { id: 'ex_plank', name: 'Plancha Abdominal', sets: 3, reps: 45, muscle: 'Core' },
];

const FB_LIGHT: PresetExerciseSimple[] = [
  { id: 'ex_squat', name: 'Sentadilla', sets: 3, reps: 10, muscle: 'Piernas' },
  { id: 'ex_bench_press', name: 'Press Banca', sets: 3, reps: 10, muscle: 'Pecho' },
  { id: 'ex_lat_pulldown', name: 'Jalón al Pecho', sets: 3, reps: 10, muscle: 'Espalda' },
  { id: 'ex_ohp', name: 'Press Militar', sets: 3, reps: 10, muscle: 'Hombros' },
  { id: 'ex_plank', name: 'Plancha Abdominal', sets: 3, reps: 30, muscle: 'Core' },
];

const FB_INTENSE: PresetExerciseSimple[] = [
  { id: 'ex_deadlift', name: 'Peso Muerto', sets: 5, reps: 5, muscle: 'Espalda' },
  { id: 'ex_bench_press', name: 'Press Banca', sets: 5, reps: 5, muscle: 'Pecho' },
  { id: 'ex_squat', name: 'Sentadilla', sets: 5, reps: 5, muscle: 'Piernas' },
  { id: 'ex_pullups', name: 'Dominadas', sets: 4, reps: 8, muscle: 'Espalda' },
  { id: 'ex_ohp', name: 'Press Militar', sets: 4, reps: 8, muscle: 'Hombros' },
  { id: 'ex_barbell_curl', name: 'Curl de Bíceps', sets: 3, reps: 10, muscle: 'Brazos' },
  { id: 'ex_lateral_raise', name: 'Elevaciones Laterales', sets: 3, reps: 15, muscle: 'Hombros' },
];

const TORSO_LIGHT: PresetExerciseSimple[] = [
  { id: 'ex_bench_press', name: 'Press Banca', sets: 3, reps: 10, muscle: 'Pecho' },
  { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 3, reps: 10, muscle: 'Espalda' },
  { id: 'ex_ohp', name: 'Press Militar', sets: 3, reps: 10, muscle: 'Hombros' },
  { id: 'ex_lateral_raise', name: 'Elevaciones Laterales', sets: 3, reps: 12, muscle: 'Hombros' },
];

const TORSO_INTENSE: PresetExerciseSimple[] = [
  { id: 'ex_bench_press', name: 'Press Banca', sets: 4, reps: 8, muscle: 'Pecho' },
  { id: 'ex_incline_bench', name: 'Press Inclinado', sets: 4, reps: 8, muscle: 'Pecho' },
  { id: 'ex_pullups', name: 'Dominadas', sets: 4, reps: 8, muscle: 'Espalda' },
  { id: 'ex_barbell_row', name: 'Remo con Barra', sets: 4, reps: 8, muscle: 'Espalda' },
  { id: 'ex_ohp', name: 'Press Militar', sets: 4, reps: 8, muscle: 'Hombros' },
  { id: 'ex_lateral_raise', name: 'Elevaciones Laterales', sets: 3, reps: 12, muscle: 'Hombros' },
];

const ARMS_LIGHT: PresetExerciseSimple[] = [
  { id: 'ex_barbell_curl', name: 'Curl de Bíceps', sets: 3, reps: 12, muscle: 'Brazos' },
  { id: 'ex_french_press', name: 'Press Francés', sets: 3, reps: 12, muscle: 'Brazos' },
];

const ARMS_INTENSE: PresetExerciseSimple[] = [
  { id: 'ex_barbell_curl', name: 'Curl de Bíceps', sets: 4, reps: 10, muscle: 'Brazos' },
  { id: 'ex_french_press', name: 'Press Francés', sets: 4, reps: 10, muscle: 'Brazos' },
  { id: 'ex_lat_pulldown', name: 'Jalón al Pecho', sets: 3, reps: 12, muscle: 'Espalda' },
];

// ── Flat map: presetId → full object for session/new lookup ──

export const ALL_PRESETS: Record<string, { name: string; exercises: PresetExerciseSimple[] }> = {
  'push-light':     { name: 'Push Ligero',   exercises: PUSH_LIGHT },
  'push-intense':   { name: 'Push Intenso',  exercises: PUSH_INTENSE },
  'pull-light':     { name: 'Pull Ligero',   exercises: PULL_LIGHT },
  'pull-intense':   { name: 'Pull Intenso',  exercises: PULL_INTENSE },
  'legs-light':     { name: 'Piernas Ligero', exercises: LEGS_LIGHT },
  'legs-intense':   { name: 'Piernas Intenso', exercises: LEGS_INTENSE },
  'fb-light':       { name: 'Full Body Ligero', exercises: FB_LIGHT },
  'fb-intense':     { name: 'Full Body Intenso', exercises: FB_INTENSE },
  'torso-light':    { name: 'Torso Ligero',  exercises: TORSO_LIGHT },
  'torso-intense':  { name: 'Torso Intenso', exercises: TORSO_INTENSE },
  'arms-light':     { name: 'Brazos Ligero', exercises: ARMS_LIGHT },
  'arms-intense':   { name: 'Brazos Intenso', exercises: ARMS_INTENSE },
};

// ── Category definitions ──

export interface CategoryDef {
  id: string;
  title: string;
  icon: string;
  desc: string;
  color: string;
  presetIds: string[];
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'push',     title: 'Push',     icon: 'TrendingUp',  desc: 'Empuje: pecho, hombros, tríceps',            color: '#EF4444', presetIds: ['push-light', 'push-intense'] },
  { id: 'pull',     title: 'Pull',     icon: 'BarChart3',   desc: 'Tirón: espalda, bíceps',                     color: '#3B82F6', presetIds: ['pull-light', 'pull-intense'] },
  { id: 'piernas',  title: 'Piernas',  icon: 'Dumbbell',    desc: 'Cuádriceps, femoral, gemelos, glúteo',        color: '#22C55E', presetIds: ['legs-light', 'legs-intense'] },
  { id: 'fullbody', title: 'Full Body', icon: 'Flame',      desc: 'Cuerpo completo en una sesión',               color: '#F97316', presetIds: ['fb-light', 'fb-intense'] },
  { id: 'torso',    title: 'Torso',    icon: 'Target',      desc: 'Upper body: pecho + espalda + hombros',       color: '#A855F7', presetIds: ['torso-light', 'torso-intense'] },
  { id: 'brazos',   title: 'Brazos',   icon: 'Zap',         desc: 'Bíceps y tríceps',                            color: '#EAB308', presetIds: ['arms-light', 'arms-intense'] },
];
