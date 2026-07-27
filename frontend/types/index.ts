export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  category: string;
  description: string;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sortOrder: number;
  defaultSets: number;
  defaultReps: number;
}

export interface Session {
  id: string;
  userId: string;
  templateId: string | null;
  name: string;
  startedAt: string;
  completedAt: string | null;
  totalVolume: number;
  durationMinutes: number;
  notes: string;
  workoutType?: string;
}

export interface UserExercise {
  id: string;
  userId: string;
  name: string;
  muscleGroup: string;
  category: string;
  description: string;
  videoUrl?: string;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sortOrder: number;
}

export interface SessionSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  isPr: string; // "0" | "1"
  isWarmup: string; // "0" | "1"
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  prType: string;
  prValue: number;
  achievedAt: string;
  sessionId: string | null;
}

export interface SessionWithExercises extends Session {
  exercises: (SessionExercise & { sets: SessionSet[] })[];
}

export interface TemplateWithExercises extends Template {
  exercises: TemplateExercise[];
}

export interface VolumeByMuscleGroup {
  muscleGroup: string;
  volume: number;
  date: string;
}
