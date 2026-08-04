import { supabase } from './supabase';
import { db, EjercicioRutinaGuardado, Rutina, SesionCompletada } from '../db/db';

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesion iniciada');
  return user.id;
}

export async function limpiarDatosLocales(): Promise<void> {
  await db.rutinas.clear();
  await db.historial.clear();
  await db.sesionActiva.clear();
}

// ============================================================
// RUTINAS
// ============================================================

interface RutinaParaGuardar {
  nombre: string;
  esConBarra?: boolean;
  usaRpe?: boolean;
  series: Array<{ peso?: string; reps?: string; rpe?: string; porcentaje?: string }>;
}

export async function guardarRutinaEnSupabase(
  nombre: string,
  ejercicios: RutinaParaGuardar[]
): Promise<void> {
  const userId = await getUserId();

  const { data: rutina, error: err1 } = await supabase
    .from('rutinas')
    .insert({ usuario_id: userId, nombre })
    .select()
    .single();
  if (err1) throw err1;

  for (let i = 0; i < ejercicios.length; i++) {
    const ej = ejercicios[i];
    const { data: re, error: err2 } = await supabase
      .from('rutina_ejercicios')
      .insert({
        rutina_id: rutina.id,
        ejercicio_id: null,
        nombre_snapshot: ej.nombre,
        es_con_barra: ej.esConBarra ?? true,
        usa_rpe: ej.usaRpe ?? false,
        orden: i
      })
      .select()
      .single();
    if (err2) throw err2;

    const series = ej.series.map((s, j) => ({
      rutina_ejercicio_id: re.id,
      orden: j,
      peso: s.peso ? parseFloat(s.peso) : null,
      reps: parseInt(s.reps, 10) || 0,
      rpe: s.rpe ? parseFloat(s.rpe) : null,
      porcentaje: s.porcentaje ? parseFloat(s.porcentaje) : null
    }));
    const { error: err3 } = await supabase.from('serie_rutina').insert(series);
    if (err3) throw err3;
  }
}

export async function cargarRutinasDeSupabase(): Promise<Rutina[]> {
  const userId = await getUserId();

  const { data: rutinas, error } = await supabase
    .from('rutinas')
    .select(`
      id, nombre, fecha_creacion,
      rutina_ejercicios (
        nombre_snapshot, es_con_barra, usa_rpe, orden,
        serie_rutina ( orden, peso, reps, rpe, porcentaje )
      )
    `)
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (rutinas || []).map((r: any) => ({
    id: r.id,
    nombre: r.nombre,
    fechaCreacion: new Date(r.fecha_creacion).toLocaleDateString('es-ES'),
    ejercicios: (r.rutina_ejercicios || [])
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((re: any) => ({
        ejercicioId: 0,
        nombre: re.nombre_snapshot,
        esConBarra: re.es_con_barra,
        series: (re.serie_rutina || [])
          .sort((a: any, b: any) => a.orden - b.orden)
          .map((s: any) => ({
            peso: s.peso !== null && s.peso !== undefined ? String(s.peso) : '',
            reps: s.reps !== null && s.reps !== undefined ? String(s.reps) : '',
            rpe: s.rpe !== null && s.rpe !== undefined ? String(s.rpe) : '',
            porcentaje: s.porcentaje !== null && s.porcentaje !== undefined ? String(s.porcentaje) : ''
          }))
      }))
  }));
}

export async function actualizarRutinaEnSupabase(
  rutinaId: string,
  ejercicios: EjercicioRutinaGuardado[]
): Promise<void> {
  const { data: reRows, error: err0 } = await supabase
    .from('rutina_ejercicios')
    .select('id')
    .eq('rutina_id', rutinaId);
  if (err0) throw err0;

  for (const re of reRows || []) {
    const { error: errS } = await supabase
      .from('serie_rutina')
      .delete()
      .eq('rutina_ejercicio_id', re.id);
    if (errS) throw errS;
  }
  const { error: errE } = await supabase
    .from('rutina_ejercicios')
    .delete()
    .eq('rutina_id', rutinaId);
  if (errE) throw errE;

  for (let i = 0; i < ejercicios.length; i++) {
    const ej = ejercicios[i];
    const { data: re, error: err2 } = await supabase
      .from('rutina_ejercicios')
      .insert({
        rutina_id: rutinaId,
        ejercicio_id: null,
        nombre_snapshot: ej.nombre,
        es_con_barra: ej.esConBarra ?? true,
        usa_rpe: false,
        orden: i
      })
      .select()
      .single();
    if (err2) throw err2;

    const series = ej.series.map((s, j) => ({
      rutina_ejercicio_id: re.id,
      orden: j,
      peso: s.pesoReal || s.peso ? parseFloat(s.pesoReal || s.peso || '') : null,
      reps: parseInt(s.reps, 10) || 0,
      rpe: s.rpe ? parseFloat(s.rpe) : null,
      porcentaje: s.porcentaje ? parseFloat(s.porcentaje) : null
    }));
    const { error: err3 } = await supabase.from('serie_rutina').insert(series);
    if (err3) throw err3;
  }
}

export async function eliminarRutinaEnSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('rutinas').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// SESIONES / HISTORIAL
// ============================================================

export async function guardarSesionEnSupabase(
  rutinaNombre: string,
  ejercicios: EjercicioRutinaGuardado[]
): Promise<void> {
  const userId = await getUserId();

  const { data: sesion, error: err1 } = await supabase
    .from('sesiones')
    .insert({
      usuario_id: userId,
      nombre: rutinaNombre,
      estado: 'completada',
      fecha_fin: new Date().toISOString()
    })
    .select()
    .single();
  if (err1) throw err1;

  for (let i = 0; i < ejercicios.length; i++) {
    const ej = ejercicios[i];
    const { data: se, error: err2 } = await supabase
      .from('sesion_ejercicios')
      .insert({
        sesion_id: sesion.id,
        ejercicio_id: null,
        nombre: ej.nombre,
        es_con_barra: ej.esConBarra ?? true,
        orden: i
      })
      .select()
      .single();
    if (err2) throw err2;

    const series = ej.series.map((s, j) => ({
      sesion_ejercicio_id: se.id,
      orden: j,
      peso: s.peso ? parseFloat(s.peso) : null,
      peso_real: s.pesoReal ? parseFloat(s.pesoReal) : null,
      reps: parseInt(s.reps, 10) || 0,
      rpe: s.rpe ? parseFloat(s.rpe) : null,
      porcentaje: s.porcentaje ? parseFloat(s.porcentaje) : null,
      completada: s.completada ?? false
    }));
    const { error: err3 } = await supabase.from('serie_sesion').insert(series);
    if (err3) throw err3;
  }
}

export async function cargarHistorialDeSupabase(): Promise<SesionCompletada[]> {
  const userId = await getUserId();

  const { data: sesiones, error } = await supabase
    .from('sesiones')
    .select(`
      id, nombre, fecha_fin, created_at,
      sesion_ejercicios (
        nombre, es_con_barra, orden,
        serie_sesion ( orden, peso, peso_real, reps, rpe, porcentaje, completada )
      )
    `)
    .eq('usuario_id', userId)
    .eq('estado', 'completada')
    .order('fecha_fin', { ascending: false });
  if (error) throw error;

  return (sesiones || []).map((s: any) => ({
    id: s.id,
    rutinaNombre: s.nombre,
    fecha: new Date(s.fecha_fin || s.created_at).toLocaleString('es-ES'),
    ejercicios: (s.sesion_ejercicios || [])
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((se: any) => ({
        ejercicioId: 0,
        nombre: se.nombre,
        esConBarra: se.es_con_barra,
        series: (se.serie_sesion || [])
          .sort((a: any, b: any) => a.orden - b.orden)
          .map((sx: any) => ({
            peso: sx.peso !== null && sx.peso !== undefined ? String(sx.peso) : '',
            pesoReal: sx.peso_real !== null && sx.peso_real !== undefined ? String(sx.peso_real) : '',
            reps: sx.reps !== null && sx.reps !== undefined ? String(sx.reps) : '',
            rpe: sx.rpe !== null && sx.rpe !== undefined ? String(sx.rpe) : '',
            porcentaje: sx.porcentaje !== null && sx.porcentaje !== undefined ? String(sx.porcentaje) : '',
            completada: sx.completada
          }))
      }))
  }));
}

export async function eliminarSesionDeSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('sesiones').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// PERFIL Y CONFIGURACION DE USUARIO
// ============================================================

export interface PerfilUsuario {
  nombre: string;
  email: string;
  unidadPeso: string;
  pesoCorporal: number | null;
  alturaCm: number | null;
  genero: string;
}

export interface ConfigUsuario {
  sonidos: boolean;
  notificaciones: boolean;
}

export async function cargarPerfilUsuario(): Promise<{ perfil: PerfilUsuario; config: ConfigUsuario }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesion iniciada');

  const { data: perfil, error: err1 } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (err1 && err1.code !== 'PGRST116') throw err1;

  const { data: config, error: err2 } = await supabase
    .from('config_usuario')
    .select('*')
    .eq('usuario_id', user.id)
    .single();
  if (err2 && err2.code !== 'PGRST116') throw err2;

  return {
    perfil: {
      nombre: perfil?.nombre || user.user_metadata?.nombre || user.email?.split('@')[0] || 'Usuario',
      email: user.email || '',
      unidadPeso: perfil?.unidad_peso || 'kg',
      pesoCorporal: perfil?.peso_corporal ?? null,
      alturaCm: perfil?.altura_cm ?? null,
      genero: perfil?.genero || 'masculino'
    },
    config: {
      sonidos: config?.sonidos ?? true,
      notificaciones: config?.notificaciones ?? false
    }
  };
}

export async function guardarPerfilUsuario(datos: Partial<PerfilUsuario>): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    nombre: datos.nombre ?? undefined,
    unidad_peso: datos.unidadPeso ?? undefined,
    peso_corporal: datos.pesoCorporal ?? null,
    altura_cm: datos.alturaCm ?? null,
    genero: datos.genero ?? undefined,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

export async function guardarConfigUsuario(config: ConfigUsuario): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase.from('config_usuario').upsert({
    usuario_id: userId,
    sonidos: config.sonidos,
    notificaciones: config.notificaciones,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}
