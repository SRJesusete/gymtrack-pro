// Workout presets organized by difficulty level.

export const LEVELS = [
  { level: "principiante", title: "Principiante", subtitle: "Ideal si empiezas", icon: "Sprout", color: "#22C55E" },
  { level: "intermedio", title: "Intermedio", subtitle: "3-12 meses de gym", icon: "Flame", color: "#F59E0B" },
  { level: "avanzado", title: "Avanzado", subtitle: "+1 año entrenando", icon: "Trophy", color: "#FF3B30" },
];

export const WORKOUT_PRESETS = [
  {
    id: "preset_beginner_fullbody",
    name: "Full Body Inicial",
    description: "Entreno completo para empezar. Trabaja todos los grupos musculares con ejercicios básicos.",
    level: "principiante", color: "#22C55E", estimatedMinutes: 40,
    exercises: [
      { exerciseId: "ex_squat", exerciseName: "Sentadilla", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_bench_press", exerciseName: "Press Banca", muscleGroup: "Pecho", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_barbell_row", exerciseName: "Remo con Barra", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_ohp", exerciseName: "Press Militar", muscleGroup: "Hombros", defaultSets: 3, defaultReps: 8 },
      { exerciseId: "ex_plank", exerciseName: "Plancha Abdominal", muscleGroup: "Core", defaultSets: 3, defaultReps: 30 },
      { exerciseId: "ex_barbell_curl", exerciseName: "Curl de Bíceps", muscleGroup: "Brazos", defaultSets: 2, defaultReps: 12 },
    ],
  },
  {
    id: "preset_beginner_lower",
    name: "Piernas y Core",
    description: "Enfocado en tren inferior y abdominales. Perfecto para alternar con full body.",
    level: "principiante", color: "#22C55E", estimatedMinutes: 35,
    exercises: [
      { exerciseId: "ex_leg_press", exerciseName: "Prensa de Piernas", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 12 },
      { exerciseId: "ex_lunges", exerciseName: "Zancadas", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_glute_bridge", exerciseName: "Puente de Glúteos", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 15 },
      { exerciseId: "ex_crunch", exerciseName: "Crunch Abdominal", muscleGroup: "Core", defaultSets: 3, defaultReps: 15 },
      { exerciseId: "ex_plank", exerciseName: "Plancha Abdominal", muscleGroup: "Core", defaultSets: 3, defaultReps: 30 },
      { exerciseId: "ex_leg_raise", exerciseName: "Elevación de Piernas", muscleGroup: "Core", defaultSets: 2, defaultReps: 12 },
    ],
  },
  {
    id: "preset_beginner_upper",
    name: "Tren Superior Básico",
    description: "Pecho, espalda y hombros con ejercicios guiados. Técnica primero.",
    level: "principiante", color: "#22C55E", estimatedMinutes: 35,
    exercises: [
      { exerciseId: "ex_bench_press", exerciseName: "Press Banca", muscleGroup: "Pecho", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_lat_pulldown", exerciseName: "Jalón al Pecho", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_ohp", exerciseName: "Press Militar", muscleGroup: "Hombros", defaultSets: 3, defaultReps: 8 },
      { exerciseId: "ex_db_fly", exerciseName: "Aperturas con Mancuernas", muscleGroup: "Pecho", defaultSets: 2, defaultReps: 12 },
      { exerciseId: "ex_dumbbell_row", exerciseName: "Remo con Mancuerna", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_barbell_curl", exerciseName: "Curl de Bíceps", muscleGroup: "Brazos", defaultSets: 2, defaultReps: 15 },
    ],
  },
  {
    id: "preset_intermediate_pushpull",
    name: "Push-Pull",
    description: "Empuje y tracción en un solo entreno. Alta intensidad para ganar fuerza.",
    level: "intermedio", color: "#F59E0B", estimatedMinutes: 50,
    exercises: [
      { exerciseId: "ex_bench_press", exerciseName: "Press Banca", muscleGroup: "Pecho", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_barbell_row", exerciseName: "Remo con Barra", muscleGroup: "Espalda", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_ohp", exerciseName: "Press Militar", muscleGroup: "Hombros", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_pullups", exerciseName: "Dominadas", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 8 },
      { exerciseId: "ex_incline_bench", exerciseName: "Press Banca Inclinado", muscleGroup: "Pecho", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_face_pull", exerciseName: "Face Pull", muscleGroup: "Hombros", defaultSets: 3, defaultReps: 15 },
    ],
  },
  {
    id: "preset_intermediate_legs",
    name: "Pierna Intensa",
    description: "Sentadilla + peso muerto en la misma sesión. Para piernas fuertes.",
    level: "intermedio", color: "#F59E0B", estimatedMinutes: 55,
    exercises: [
      { exerciseId: "ex_squat", exerciseName: "Sentadilla", muscleGroup: "Piernas", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_deadlift", exerciseName: "Peso Muerto", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 6 },
      { exerciseId: "ex_leg_press", exerciseName: "Prensa de Piernas", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_quad_extension", exerciseName: "Extension de Cuadriceps", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 12 },
      { exerciseId: "ex_curl_femoral", exerciseName: "Curl Femoral", muscleGroup: "Piernas", defaultSets: 3, defaultReps: 12 },
      { exerciseId: "ex_calf_press", exerciseName: "Gemelos en Prensa", muscleGroup: "Piernas", defaultSets: 4, defaultReps: 15 },
    ],
  },
  {
    id: "preset_intermediate_hypertrophy",
    name: "Hipertrofia",
    description: "Volumen alto con ejercicios de aislamiento. Para ganar masa muscular.",
    level: "intermedio", color: "#F59E0B", estimatedMinutes: 55,
    exercises: [
      { exerciseId: "ex_incline_bench", exerciseName: "Press Banca Inclinado", muscleGroup: "Pecho", defaultSets: 4, defaultReps: 10 },
      { exerciseId: "ex_dumbbell_row", exerciseName: "Remo con Mancuerna", muscleGroup: "Espalda", defaultSets: 4, defaultReps: 10 },
      { exerciseId: "ex_lateral_raise", exerciseName: "Elevaciones Laterales", muscleGroup: "Hombros", defaultSets: 4, defaultReps: 15 },
      { exerciseId: "ex_hammer_curl", exerciseName: "Martillo", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 12 },
      { exerciseId: "ex_tricep_pushdown", exerciseName: "Extensión de Tríceps en Polea", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 12 },
      { exerciseId: "ex_arnold_press", exerciseName: "Press Arnold", muscleGroup: "Hombros", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_pec_deck", exerciseName: "Peck Deck", muscleGroup: "Pecho", defaultSets: 3, defaultReps: 12 },
    ],
  },
  {
    id: "preset_advanced_power",
    name: "Fuerza Total",
    description: "Los 3 grandes + accesorios. Bajo volumen, máxima intensidad.",
    level: "avanzado", color: "#FF3B30", estimatedMinutes: 65,
    exercises: [
      { exerciseId: "ex_squat", exerciseName: "Sentadilla", muscleGroup: "Piernas", defaultSets: 5, defaultReps: 5 },
      { exerciseId: "ex_bench_press", exerciseName: "Press Banca", muscleGroup: "Pecho", defaultSets: 5, defaultReps: 5 },
      { exerciseId: "ex_deadlift", exerciseName: "Peso Muerto", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 5 },
      { exerciseId: "ex_ohp", exerciseName: "Press Militar", muscleGroup: "Hombros", defaultSets: 4, defaultReps: 6 },
      { exerciseId: "ex_pullups", exerciseName: "Dominadas", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 8 },
      { exerciseId: "ex_dips", exerciseName: "Fondos", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 10 },
    ],
  },
  {
    id: "preset_advanced_split",
    name: "Push Avanzado",
    description: "Empuje de alto volumen. Pecho, hombro y tríceps al límite.",
    level: "avanzado", color: "#FF3B30", estimatedMinutes: 60,
    exercises: [
      { exerciseId: "ex_bench_press", exerciseName: "Press Banca", muscleGroup: "Pecho", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_incline_bench", exerciseName: "Press Banca Inclinado", muscleGroup: "Pecho", defaultSets: 4, defaultReps: 10 },
      { exerciseId: "ex_decline_bench", exerciseName: "Press Banca Declinado", muscleGroup: "Pecho", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_ohp", exerciseName: "Press Militar", muscleGroup: "Hombros", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_lateral_raise", exerciseName: "Elevaciones Laterales", muscleGroup: "Hombros", defaultSets: 4, defaultReps: 15 },
      { exerciseId: "ex_french_press", exerciseName: "Press Francés", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 12 },
      { exerciseId: "ex_tricep_pushdown", exerciseName: "Extensión de Tríceps en Polea", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 12 },
    ],
  },
  {
    id: "preset_advanced_pull",
    name: "Pull Avanzado",
    description: "Tracción intensa. Espalda, bíceps y antebrazo a fondo.",
    level: "avanzado", color: "#FF3B30", estimatedMinutes: 55,
    exercises: [
      { exerciseId: "ex_deadlift", exerciseName: "Peso Muerto", muscleGroup: "Espalda", defaultSets: 4, defaultReps: 6 },
      { exerciseId: "ex_pullups", exerciseName: "Dominadas", muscleGroup: "Espalda", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_barbell_row", exerciseName: "Remo con Barra", muscleGroup: "Espalda", defaultSets: 4, defaultReps: 8 },
      { exerciseId: "ex_lat_pulldown", exerciseName: "Jalón al Pecho", muscleGroup: "Espalda", defaultSets: 3, defaultReps: 10 },
      { exerciseId: "ex_face_pull", exerciseName: "Face Pull", muscleGroup: "Hombros", defaultSets: 3, defaultReps: 15 },
      { exerciseId: "ex_barbell_curl", exerciseName: "Curl de Bíceps", muscleGroup: "Brazos", defaultSets: 4, defaultReps: 10 },
      { exerciseId: "ex_hammer_curl", exerciseName: "Martillo", muscleGroup: "Brazos", defaultSets: 3, defaultReps: 12 },
    ],
  },
];

export function getPresetsByLevel(level) {
  return WORKOUT_PRESETS.filter((p) => p.level === level);
}
export function getPresetById(id) {
  return WORKOUT_PRESETS.find((p) => p.id === id);
}
