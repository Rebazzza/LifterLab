import Dexie, { Table } from 'dexie';

export interface Ejercicio {
  id?: number;
  nombre: string;
  categoria: 'Sentadilla' | 'Press de Banca' | 'Peso Muerto' | 'Accesorio';
  esConBarra: boolean;
}

export interface SerieGuardada {
  peso?: string;
  reps: string;
  rpe: string;
  porcentaje: string;
  pesoReal?: string;
  completada?: boolean;
}

export interface EjercicioRutinaGuardado {
  ejercicioId: number;
  nombre: string;
  esConBarra?: boolean;
  series: SerieGuardada[];
}

export interface Rutina {
  id?: number;
  nombre: string;
  fechaCreacion: string;
  ejercicios: EjercicioRutinaGuardado[];
}

export interface SesionCompletada {
  id?: number;
  rutinaNombre: string;
  fecha: string;
  ejercicios: EjercicioRutinaGuardado[];
}

export interface SesionActiva {
  id?: number;
  rutina: Rutina;
  ejercicios: EjercicioRutinaGuardado[];
  fechaInicio: string;
  ultimoCambio: string;
}

export class PowerliftingDatabase extends Dexie {
  ejercicios!: Table<Ejercicio>;
  rutinas!: Table<Rutina>;
  historial!: Table<SesionCompletada>;
  sesionActiva!: Table<SesionActiva>;

  constructor() {
    super('PowerliftingDB');
    this.version(6).stores({
      ejercicios: '++id, nombre, categoria, esConBarra',
      rutinas: '++id, nombre, fechaCreacion',
      historial: '++id, rutinaNombre, fecha',
      sesionActiva: '++id'
    });
  }
}

export const db = new PowerliftingDatabase();

// Inserción de un catálogo masivo y variado
db.on('populate', () => {
  db.ejercicios.bulkAdd([
    // ==========================================
    // SENTADILLA Y VARIANTES
    // ==========================================
    { nombre: 'Squat (Sentadilla Competencia)', categoria: 'Sentadilla', esConBarra: true },
    { nombre: 'Pause Squat (Pausa en el Hoyo)', categoria: 'Sentadilla', esConBarra: true },
    { nombre: 'Tempo Squat (3-0-3)', categoria: 'Sentadilla', esConBarra: true },
    { nombre: 'Pin Squat (Sentadilla en Racks)', categoria: 'Sentadilla', esConBarra: true },
    { nombre: 'Box Squat (Sentadilla a Caja)', categoria: 'Sentadilla', esConBarra: true },
    { nombre: 'Front Squat (Sentadilla Frontal)', categoria: 'Sentadilla', esConBarra: true },
    { nombre: 'Safety Bar Squat (Barra SSB)', categoria: 'Sentadilla', esConBarra: true },
    { nombre: 'Zercher Squat', categoria: 'Sentadilla', esConBarra: true },

    // ==========================================
    // PRESS DE BANCA Y VARIANTES
    // ==========================================
    { nombre: 'Bench Press (Press de Banca Competencia)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Pause Bench Press (Pausa Larga en Pecho)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Spoto Press (Pausa Flotante sobre Pecho)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Larsen Press (Banca sin Apoyo de Pies)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Close Grip Bench Press (Agarre Estrecho)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Pin Press (Press desde Soportes/Racks)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Incline Bench Press (Banca Inclinada con Barra)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Floor Press (Press desde el Suelo)', categoria: 'Press de Banca', esConBarra: true },
    { nombre: 'Guillotine Press (Press Guillotina)', categoria: 'Press de Banca', esConBarra: true },

    // ==========================================
    // PESO MUERTO Y VARIANTES
    // ==========================================
    { nombre: 'Deadlift (Peso Muerto Convencional)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Sumo Deadlift (Peso Muerto Sumo)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Pause Deadlift (Pausa a Espinilla/Rodilla)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Deficit Deadlift (Peso Muerto con Déficit)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Block / Rack Pull (Peso Muerto desde Bloques)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Romanian Deadlift (RDL con Barra)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Stiff Leg Deadlift (Piernas Rígidas)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Reeves Deadlift (Agarre de Discos)', categoria: 'Peso Muerto', esConBarra: true },
    { nombre: 'Jefferson Deadlift (Peso Muerto Asimétrico)', categoria: 'Peso Muerto', esConBarra: true },

    // ==========================================
    // ACCESORIOS - PIERNA Y CADERA
    // ==========================================
    { nombre: 'Prensa 45° (Leg Press)', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Hack Squat (Sentadilla Hack en Máquina)', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Sissy Squat', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Bulgarian Split Squat (Sentadilla Búlgara)', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Zurcher Lunge / Zancadas', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Extensión de Cuádriceps en Máquina', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Curl Femoral Acostado/Sentado', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Glute Ham Raise (GHR)', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Nordic Hamstring Curl', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Hip Thrust (Empuje de Cadera con Barra)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Elevación de Talones para Gemelos', categoria: 'Accesorio', esConBarra: false },

    // ==========================================
    // ACCESORIOS - ESPALDA Y CORTE/TORAX
    // ==========================================
    { nombre: 'Pendlay Row (Remo Pendlay)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Barbell Row (Remo con Barra a 45°)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Meadows Row (Remo Unilateral con Barra en Esquina)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Remo Gironda / Jalón en Polea Baja', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Jalón al Pecho (Lat Pulldown)', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Dominadas / Chin-Ups (Con o Sin Lastre)', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Seal Row (Remo en Banco Elevado)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Pullover con Mancuerna / Polea', categoria: 'Accesorio', esConBarra: false },

    // ==========================================
    // ACCESORIOS - HOMBRO Y BRAZOS
    // ==========================================
    { nombre: 'Overhead Press (Press Militar de Pie)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Push Press (Press con Impulso)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Z-Press (Press Sentado en el Suelo)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Press Arnold con Mancuernas', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Elevaciones Laterales con Mancuerna/Polea', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Face Pulls en Polea Alta', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'JM Press (Variante para Tríceps de Powerlifter)', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Press Francés con Barra Z', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Fondos en Paralelas (Dips)', categoria: 'Accesorio', esConBarra: false },
    { nombre: 'Curl de Bíceps con Barra Z/Recta', categoria: 'Accesorio', esConBarra: true },
    { nombre: 'Curl Martillo con Mancuernas', categoria: 'Accesorio', esConBarra: false },
  ]);
});