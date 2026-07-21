export interface UserProfile {
  id?: number; // El signo "?" significa opcional porque Dexie lo genera autoincremental
  gender: 'M' | 'F'; // Solo permite "M" o "F"
  bodyWeight: number;
  unitSystem: 'KG' | 'LBS';
  defaultBarWeight: 15 | 20 | 25;
  availablePlates: number[]; // Un arreglo de números, ej: [25, 20, 15]
}