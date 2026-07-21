export interface Routine {
  id?: number;
  name: string;
  createdAt: Date;
}

export interface RoutineExercise {
  id?: number;
  routineId: number;
  exerciseId: number;
  orderIndex: number;
  targetSetsCount: number;
}

export interface WorkoutSession {
  id?: number;
  routineId: number;
  date: Date;
  bodyWeightToday: number;
  notes?: string;
}

export interface WorkoutSet {
  id?: number;
  workoutSessionId: number;
  exerciseId: number;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number; // Opcional, por si el atleta no lo anota
  isCompleted: boolean;
}