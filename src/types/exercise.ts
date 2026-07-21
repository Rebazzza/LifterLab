export interface Exercise {
  id?: number;
  name: string;
  category: 'Squat' | 'Bench' | 'Deadlift' | 'Accessory';
  usesBar: boolean; // El booleano que activa tu calculadora de discos
}