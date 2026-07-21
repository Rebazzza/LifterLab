import Dexie, { type Table } from 'dexie';
import { UserProfile, Exercise, Routine, RoutineExercise, WorkoutSession, WorkoutSet } from '../types';

export class PowerliftingDB extends Dexie {
  // 1. Declaramos las tablas y les asignamos su tipo de datos respectivo
  user_profile!: Table<UserProfile>;
  exercises!: Table<Exercise>;
  routines!: Table<Routine>;
  routine_exercises!: Table<RoutineExercise>;
  workout_sessions!: Table<WorkoutSession>;
  workout_sets!: Table<WorkoutSet>;

  constructor() {
    super('PowerliftingDatabase');
    
    // 2. Definimos los índices de búsqueda para Dexie
    this.version(1).stores({
      user_profile: '++id',
      exercises: '++id, name, usesBar',
      routines: '++id, name',
      routine_exercises: '++id, routine_id, exercise_id, order_index',
      workout_sessions: '++id, routine_id, date',
      workout_sets: '++id, workout_session_id, exercise_id', 
    });
  }
}

// 3. Exportamos una única instancia de la base de datos para usarla en toda la app
export const db = new PowerliftingDB();
// Función para precargar los ejercicios básicos de fuerza
export async function seedDatabase() {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd([
      { name: 'Sentadilla Barra Baja (Low Bar)', category: 'Squat', usesBar: true },
      { name: 'Sentadilla Barra Alta (High Bar)', category: 'Squat', usesBar: true },
      { name: 'Press de Banca de Competición', category: 'Bench', usesBar: true },
      { name: 'Press de Banca con Pausa', category: 'Bench', usesBar: true },
      { name: 'Peso Muerto Convencional', category: 'Deadlift', usesBar: true },
      { name: 'Peso Muerto Sumo', category: 'Deadlift', usesBar: true },
      { name: 'Press Militar de Pie', category: 'Accessory', usesBar: true },
      { name: 'Dominadas (Pull ups)', category: 'Accessory', usesBar: false },
      { name: 'Fondos en Paralelas (Dips)', category: 'Accessory', usesBar: false },
    ]);
    console.log('Catalogo basico de Powerlifting cargado con exito.');
  }
}