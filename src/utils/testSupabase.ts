import { supabase } from '../lib/supabase';

export const probarConexionSupabase = async () => {
  try {
    // 1. Intentar consultar la lista de ejercicios globales
    const { data, error } = await supabase.from('ejercicios').select('*');

    if (error) {
      console.error('Error de conexión con Supabase:', error.message);
      return false;
    }

    console.log('Conexión exitosa con Supabase. Ejercicios encontrados:', data);
    return true;
  } catch (err) {
    console.error('Error inesperado:', err);
    return false;
  }
};