// Workout presets organized by difficulty level
// Each preset contains exercises from the DB with default sets/reps and video tutorials

export type WorkoutLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface PresetExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
  videoUrl: string;
}

export interface WorkoutPreset {
  id: string;
  name: string;
  description: string;
  level: WorkoutLevel;
  icon: string;
  color: string;
  estimatedMinutes: number;
  exercises: PresetExercise[];
}

export interface LevelInfo {
  level: WorkoutLevel;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  {
    level: 'principiante',
    title: 'Principiante',
    subtitle: 'Ideal si empiezas',
    icon: '🌱',
    color: '#10B981',
  },
  {
    level: 'intermedio',
    title: 'Intermedio',
    subtitle: '3-12 meses de gym',
    icon: '🔥',
    color: '#F59E0B',
  },
  {
    level: 'avanzado',
    title: 'Avanzado',
    subtitle: '+1 año entrenando',
    icon: '💪',
    color: '#EF4444',
  },
];

export const WORKOUT_PRESETS: WorkoutPreset[] = [
  // ─── PRINCIPIANTE ───
  {
    id: 'preset_beginner_fullbody',
    name: 'Full Body Inicial',
    description: 'Entreno completo para empezar. Trabaja todos los grupos musculares con ejercicios básicos.',
    level: 'principiante',
    icon: '🏋️',
    color: '#10B981',
    estimatedMinutes: 40,
    exercises: [
      { exerciseId: 'ex_squat', exerciseName: 'Sentadilla', muscleGroup: 'Piernas', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/U3HlEF_E9fo' },
      { exerciseId: 'ex_bench_press', exerciseName: 'Press Banca', muscleGroup: 'Pecho', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/rxD321l2svE' },
      { exerciseId: 'ex_barbell_row', exerciseName: 'Remo con Barra', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/G8l_8chR5BE' },
      { exerciseId: 'ex_ohp', exerciseName: 'Press Militar', muscleGroup: 'Hombros', defaultSets: 3, defaultReps: 8, videoUrl: 'https://youtu.be/2yjwXTZQDDI' },
      { exerciseId: 'ex_plank', exerciseName: 'Plancha Abdominal', muscleGroup: 'Core', defaultSets: 3, defaultReps: 30, videoUrl: 'https://youtu.be/pSHjTRCQxIw' },
      { exerciseId: 'ex_barbell_curl', exerciseName: 'Curl de Bíceps', muscleGroup: 'Brazos', defaultSets: 2, defaultReps: 12, videoUrl: 'https://youtu.be/kwG2ipFRgfo' },
    ],
  },
  {
    id: 'preset_beginner_lower',
    name: 'Piernas y Core',
    description: 'Enfocado en tren inferior y abdominales. Perfecto para alternar con full body.',
    level: 'principiante',
    icon: '🦵',
    color: '#10B981',
    estimatedMinutes: 35,
    exercises: [
      { exerciseId: 'ex_leg_press', exerciseName: 'Prensa de Piernas', muscleGroup: 'Piernas', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/IZxyjW7MPJQ' },
      { exerciseId: 'ex_lunges', exerciseName: 'Zancadas', muscleGroup: 'Piernas', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/QOVaHwm-Q6U' },
      { exerciseId: 'ex_glute_bridge', exerciseName: 'Puente de Glúteos', muscleGroup: 'Piernas', defaultSets: 3, defaultReps: 15, videoUrl: 'https://youtu.be/wPM8icPu6H8' },
      { exerciseId: 'ex_crunch', exerciseName: 'Crunch Abdominal', muscleGroup: 'Core', defaultSets: 3, defaultReps: 15, videoUrl: 'https://youtu.be/Xyd_fa5zoEU' },
      { exerciseId: 'ex_plank', exerciseName: 'Plancha Abdominal', muscleGroup: 'Core', defaultSets: 3, defaultReps: 30, videoUrl: 'https://youtu.be/pSHjTRCQxIw' },
      { exerciseId: 'ex_leg_raise', exerciseName: 'Elevación de Piernas', muscleGroup: 'Core', defaultSets: 2, defaultReps: 12, videoUrl: 'https://youtu.be/JB2oyawG9KI' },
    ],
  },
  {
    id: 'preset_beginner_upper',
    name: 'Tren Superior Básico',
    description: 'Pecho, espalda y hombros con ejercicios guiados. Técnica primero.',
    level: 'principiante',
    icon: '🎯',
    color: '#10B981',
    estimatedMinutes: 35,
    exercises: [
      { exerciseId: 'ex_bench_press', exerciseName: 'Press Banca', muscleGroup: 'Pecho', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/rxD321l2svE' },
      { exerciseId: 'ex_lat_pulldown', exerciseName: 'Jalón al Pecho', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/CAwf7n6Luuc' },
      { exerciseId: 'ex_ohp', exerciseName: 'Press Militar', muscleGroup: 'Hombros', defaultSets: 3, defaultReps: 8, videoUrl: 'https://youtu.be/2yjwXTZQDDI' },
      { exerciseId: 'ex_db_fly', exerciseName: 'Aperturas con Mancuernas', muscleGroup: 'Pecho', defaultSets: 2, defaultReps: 12, videoUrl: 'https://youtu.be/eozdVDA78K0' },
      { exerciseId: 'ex_dumbbell_row', exerciseName: 'Remo con Mancuerna', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/pYcpY20QaE8' },
      { exerciseId: 'ex_barbell_curl', exerciseName: 'Curl de Bíceps', muscleGroup: 'Brazos', defaultSets: 2, defaultReps: 15, videoUrl: 'https://youtu.be/kwG2ipFRgfo' },
    ],
  },

  // ─── INTERMEDIO ───
  {
    id: 'preset_intermediate_pushpull',
    name: 'Push-Pull',
    description: 'Empuje y tracción en un solo entreno. Alta intensidad para ganar fuerza.',
    level: 'intermedio',
    icon: '⚡',
    color: '#F59E0B',
    estimatedMinutes: 50,
    exercises: [
      { exerciseId: 'ex_bench_press', exerciseName: 'Press Banca', muscleGroup: 'Pecho', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/rxD321l2svE' },
      { exerciseId: 'ex_barbell_row', exerciseName: 'Remo con Barra', muscleGroup: 'Espalda', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/G8l_8chR5BE' },
      { exerciseId: 'ex_ohp', exerciseName: 'Press Militar', muscleGroup: 'Hombros', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/2yjwXTZQDDI' },
      { exerciseId: 'ex_pullups', exerciseName: 'Dominadas', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 8, videoUrl: 'https://youtu.be/eGo4IYlbE5g' },
      { exerciseId: 'ex_incline_bench', exerciseName: 'Press Banca Inclinado', muscleGroup: 'Pecho', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/SrqOu55lrY0' },
      { exerciseId: 'ex_face_pull', exerciseName: 'Face Pull', muscleGroup: 'Hombros', defaultSets: 3, defaultReps: 15, videoUrl: 'https://youtu.be/HSoHeSjvIdY' },
    ],
  },
  {
    id: 'preset_intermediate_legs',
    name: 'Pierna Intensa',
    description: 'Sentadilla + peso muerto en la misma sesión. Para piernas fuertes.',
    level: 'intermedio',
    icon: '🏔️',
    color: '#F59E0B',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'ex_squat', exerciseName: 'Sentadilla', muscleGroup: 'Piernas', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/U3HlEF_E9fo' },
      { exerciseId: 'ex_deadlift', exerciseName: 'Peso Muerto', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 6, videoUrl: 'https://youtu.be/ytGaGIn3SjE' },
      { exerciseId: 'ex_leg_press', exerciseName: 'Prensa de Piernas', muscleGroup: 'Piernas', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/IZxyjW7MPJQ' },
      { exerciseId: 'ex_quad_extension', exerciseName: 'Extension de Cuadriceps', muscleGroup: 'Piernas', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/YyvSfVjQeL0' },
      { exerciseId: 'ex_curl_femoral', exerciseName: 'Curl Femoral', muscleGroup: 'Piernas', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/1Tq3QdYUuHs' },
      { exerciseId: 'ex_calf_press', exerciseName: 'Gemelos en Prensa', muscleGroup: 'Piernas', defaultSets: 4, defaultReps: 15, videoUrl: 'https://youtu.be/JbyjNymZOt0' },
    ],
  },
  {
    id: 'preset_intermediate_hypertrophy',
    name: 'Hipertrofia',
    description: 'Volumen alto con ejercicios de aislamiento. Para ganar masa muscular.',
    level: 'intermedio',
    icon: '🎯',
    color: '#F59E0B',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'ex_incline_bench', exerciseName: 'Press Banca Inclinado', muscleGroup: 'Pecho', defaultSets: 4, defaultReps: 10, videoUrl: 'https://youtu.be/SrqOu55lrY0' },
      { exerciseId: 'ex_dumbbell_row', exerciseName: 'Remo con Mancuerna', muscleGroup: 'Espalda', defaultSets: 4, defaultReps: 10, videoUrl: 'https://youtu.be/pYcpY20QaE8' },
      { exerciseId: 'ex_lateral_raise', exerciseName: 'Elevaciones Laterales', muscleGroup: 'Hombros', defaultSets: 4, defaultReps: 15, videoUrl: 'https://youtu.be/3VcKaXpzqRo' },
      { exerciseId: 'ex_hammer_curl', exerciseName: 'Martillo', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/zC3nLlEvin4' },
      { exerciseId: 'ex_tricep_pushdown', exerciseName: 'Extensión de Tríceps en Polea', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/2-LAMcpzODU' },
      { exerciseId: 'ex_arnold_press', exerciseName: 'Press Arnold', muscleGroup: 'Hombros', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/6Z15_WdXadw' },
      { exerciseId: 'ex_pec_deck', exerciseName: 'Peck Deck', muscleGroup: 'Pecho', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/tGXIQR89-JE' },
    ],
  },

  // ─── AVANZADO ───
  {
    id: 'preset_advanced_power',
    name: 'Fuerza Total',
    description: 'Los 3 grandes + accesorios. Bajo volumen, máxima intensidad.',
    level: 'avanzado',
    icon: '🏆',
    color: '#EF4444',
    estimatedMinutes: 65,
    exercises: [
      { exerciseId: 'ex_squat', exerciseName: 'Sentadilla', muscleGroup: 'Piernas', defaultSets: 5, defaultReps: 5, videoUrl: 'https://youtu.be/U3HlEF_E9fo' },
      { exerciseId: 'ex_bench_press', exerciseName: 'Press Banca', muscleGroup: 'Pecho', defaultSets: 5, defaultReps: 5, videoUrl: 'https://youtu.be/rxD321l2svE' },
      { exerciseId: 'ex_deadlift', exerciseName: 'Peso Muerto', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 5, videoUrl: 'https://youtu.be/ytGaGIn3SjE' },
      { exerciseId: 'ex_ohp', exerciseName: 'Press Militar', muscleGroup: 'Hombros', defaultSets: 4, defaultReps: 6, videoUrl: 'https://youtu.be/2yjwXTZQDDI' },
      { exerciseId: 'ex_pullups', exerciseName: 'Dominadas', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 8, videoUrl: 'https://youtu.be/eGo4IYlbE5g' },
      { exerciseId: 'ex_dips', exerciseName: 'Fondos', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/0326dy_-CzM' },
    ],
  },
  {
    id: 'preset_advanced_split',
    name: 'Push Avanzado',
    description: 'Empuje de alto volumen. Pecho, hombro y tríceps al límite.',
    level: 'avanzado',
    icon: '🔴',
    color: '#EF4444',
    estimatedMinutes: 60,
    exercises: [
      { exerciseId: 'ex_bench_press', exerciseName: 'Press Banca', muscleGroup: 'Pecho', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/rxD321l2svE' },
      { exerciseId: 'ex_incline_bench', exerciseName: 'Press Banca Inclinado', muscleGroup: 'Pecho', defaultSets: 4, defaultReps: 10, videoUrl: 'https://youtu.be/SrqOu55lrY0' },
      { exerciseId: 'ex_decline_bench', exerciseName: 'Press Banca Declinado', muscleGroup: 'Pecho', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/LfyQBUKR8SE' },
      { exerciseId: 'ex_ohp', exerciseName: 'Press Militar', muscleGroup: 'Hombros', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/2yjwXTZQDDI' },
      { exerciseId: 'ex_lateral_raise', exerciseName: 'Elevaciones Laterales', muscleGroup: 'Hombros', defaultSets: 4, defaultReps: 15, videoUrl: 'https://youtu.be/3VcKaXpzqRo' },
      { exerciseId: 'ex_french_press', exerciseName: 'Press Francés', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/d_KZxkY_0cM' },
      { exerciseId: 'ex_tricep_pushdown', exerciseName: 'Extensión de Tríceps en Polea', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/2-LAMcpzODU' },
    ],
  },
  {
    id: 'preset_advanced_pull',
    name: 'Pull Avanzado',
    description: 'Tracción intensa. Espalda, bíceps y antebrazo a fondo.',
    level: 'avanzado',
    icon: '🔵',
    color: '#EF4444',
    estimatedMinutes: 55,
    exercises: [
      { exerciseId: 'ex_deadlift', exerciseName: 'Peso Muerto', muscleGroup: 'Espalda', defaultSets: 4, defaultReps: 6, videoUrl: 'https://youtu.be/ytGaGIn3SjE' },
      { exerciseId: 'ex_pullups', exerciseName: 'Dominadas', muscleGroup: 'Espalda', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/eGo4IYlbE5g' },
      { exerciseId: 'ex_barbell_row', exerciseName: 'Remo con Barra', muscleGroup: 'Espalda', defaultSets: 4, defaultReps: 8, videoUrl: 'https://youtu.be/G8l_8chR5BE' },
      { exerciseId: 'ex_lat_pulldown', exerciseName: 'Jalón al Pecho', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 10, videoUrl: 'https://youtu.be/CAwf7n6Luuc' },
      { exerciseId: 'ex_face_pull', exerciseName: 'Face Pull', muscleGroup: 'Hombros', defaultSets: 3, defaultReps: 15, videoUrl: 'https://youtu.be/HSoHeSjvIdY' },
      { exerciseId: 'ex_barbell_curl', exerciseName: 'Curl de Bíceps', muscleGroup: 'Brazos', defaultSets: 4, defaultReps: 10, videoUrl: 'https://youtu.be/kwG2ipFRgfo' },
      { exerciseId: 'ex_hammer_curl', exerciseName: 'Martillo', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, videoUrl: 'https://youtu.be/zC3nLlEvin4' },
    ],
  },
];

export function getPresetsByLevel(level: WorkoutLevel): WorkoutPreset[] {
  return WORKOUT_PRESETS.filter((p) => p.level === level);
}

export function getPresetById(id: string): WorkoutPreset | undefined {
  return WORKOUT_PRESETS.find((p) => p.id === id);
}
