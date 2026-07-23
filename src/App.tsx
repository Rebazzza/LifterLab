import React, { useState, useEffect, useCallback } from 'react';
import Inicio from './components/Inicio';
import GestionRutinas from './components/GestionRutinas';
import HistorialEntrenamientos from './components/HistorialEntrenamientos';
import Herramientas from './components/Herramientas';
import Perfil from './components/Perfil';
import ModoEntrenamiento from './components/ModoEntrenamiento';
import { HomeIcon, RoutinesIcon, HistoryIcon, ToolsIcon, ProfileIcon, PlayIcon, TimerIcon } from './components/Icons';
import { db, Rutina, EjercicioRutinaGuardado, SesionActiva } from './db/db';

type TabType = 'inicio' | 'rutinas' | 'historial' | 'herramientas' | 'perfil';

export default function App() {
  const [tabActiva, setTabActiva] = useState<TabType>('inicio');
  const [sesionActiva, setSesionActiva] = useState<SesionActiva | null>(null);
  const [mostrandoEntrenamiento, setMostrandoEntrenamiento] = useState<boolean>(false);

  const [tiempoDescanso, setTiempoDescanso] = useState<number>(0);
  const [timerActivo, setTimerActivo] = useState<boolean>(false);

  useEffect(() => {
    cargarSesionActiva();
  }, []);

  useEffect(() => {
    let intervalo: any = null;
    if (timerActivo && tiempoDescanso > 0) {
      intervalo = setInterval(() => setTiempoDescanso((prev) => prev - 1), 1000);
    } else if (tiempoDescanso === 0 && timerActivo) {
      setTimerActivo(false);
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [timerActivo, tiempoDescanso]);

  const cargarSesionActiva = async () => {
    try {
      const sesiones = await db.sesionActiva.toArray();
      if (sesiones.length > 0) {
        setSesionActiva(sesiones[0]);
      }
    } catch (error) {
      console.error('Error al cargar sesion activa:', error);
    }
  };

  const iniciarSesion = useCallback(async (rutina: Rutina, ejercicios: EjercicioRutinaGuardado[]) => {
    const ahora = new Date().toLocaleString('es-ES');
    const nuevaSesion: SesionActiva = {
      rutina,
      ejercicios,
      fechaInicio: ahora,
      ultimoCambio: ahora
    };
    await db.sesionActiva.clear();
    await db.sesionActiva.add(nuevaSesion);
    setSesionActiva(nuevaSesion);
    setMostrandoEntrenamiento(true);
  }, []);

  const actualizarSesion = useCallback(async (ejercicios: EjercicioRutinaGuardado[]) => {
    if (!sesionActiva) return;
    const sesionActualizada = {
      ...sesionActiva,
      ejercicios,
      ultimoCambio: new Date().toLocaleString('es-ES')
    };
    await db.sesionActiva.clear();
    await db.sesionActiva.add(sesionActualizada);
    setSesionActiva(sesionActualizada);

    if (sesionActiva.rutina.id) {
      await db.rutinas.update(sesionActiva.rutina.id, {
        ejercicios: ejercicios.map(ej => ({
          ejercicioId: ej.ejercicioId,
          nombre: ej.nombre,
          esConBarra: ej.esConBarra,
          series: ej.series.map(s => ({
            peso: s.pesoReal || s.peso || '',
            reps: s.reps,
            rpe: s.rpe,
            porcentaje: s.porcentaje
          }))
        }))
      });
    }
  }, [sesionActiva]);

  const finalizarSesion = useCallback(async () => {
    await db.sesionActiva.clear();
    setSesionActiva(null);
    setMostrandoEntrenamiento(false);
    setTimerActivo(false);
    setTiempoDescanso(0);
  }, []);

  const cancelarSesion = useCallback(async () => {
    if (!window.confirm('Cancelar entrenamiento? Los cambios no se guardaran en el historial.')) return;
    await db.sesionActiva.clear();
    setSesionActiva(null);
    setMostrandoEntrenamiento(false);
    setTimerActivo(false);
    setTiempoDescanso(0);
  }, []);

  const continuarSesion = useCallback(() => {
    setMostrandoEntrenamiento(true);
  }, []);

  const navegarA = (tab: TabType) => {
    setMostrandoEntrenamiento(false);
    setTabActiva(tab);
  };

  const formatearTiempo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>

      {/* Contenido Principal */}
      <div style={{ flex: 1, width: '100%' }}>
        {mostrandoEntrenamiento && sesionActiva ? (
          <ModoEntrenamiento
            sesion={sesionActiva}
            onActualizarSesion={actualizarSesion}
            onFinalizar={finalizarSesion}
            onCancelar={cancelarSesion}
            onSalir={() => setMostrandoEntrenamiento(false)}
            tiempoDescanso={tiempoDescanso}
            timerActivo={timerActivo}
            onIniciarDescanso={(s) => { setTiempoDescanso(s); setTimerActivo(true); }}
            onPararDescanso={() => { setTiempoDescanso(0); setTimerActivo(false); }}
            onSetTiempoDescanso={setTiempoDescanso}
          />
        ) : (
          <>
            {tabActiva === 'inicio' && <Inicio setTabActiva={setTabActiva} />}
            {tabActiva === 'rutinas' && <GestionRutinas onIniciarSesion={iniciarSesion} />}
            {tabActiva === 'historial' && <HistorialEntrenamientos />}
            {tabActiva === 'herramientas' && <Herramientas />}
            {tabActiva === 'perfil' && <Perfil />}
          </>
        )}
      </div>

      {/* Barra de Sesion Activa Flotante */}
      {sesionActiva && !mostrandoEntrenamiento && (
        <div className="floating-workout-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <span className="chip chip-emerald" style={{ fontSize: '9px', padding: '2px 6px', flexShrink: 0 }}>
              Activa
            </span>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sesionActiva.rutina.nombre}
            </span>
          </div>

          {timerActivo && tiempoDescanso > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <TimerIcon size={14} color="#c7d2fe" />
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#c7d2fe', fontVariantNumeric: 'tabular-nums' }}>
                {formatearTiempo(tiempoDescanso)}
              </span>
            </div>
          )}

          <button
            onClick={continuarSesion}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '11px', borderRadius: '8px', boxShadow: 'none', gap: '4px', flexShrink: 0 }}
          >
            <PlayIcon size={12} color="white" />
            <span>Continuar</span>
          </button>
        </div>
      )}

      {/* Barra de Navegacion Inferior */}
      <div className="bottom-nav">
        <button
          onClick={() => navegarA('inicio')}
          className={`bottom-nav-item ${tabActiva === 'inicio' && !mostrandoEntrenamiento ? 'active' : ''}`}
        >
          <HomeIcon size={20} />
          <span style={{ marginTop: '2px' }}>Inicio</span>
        </button>

        <button
          onClick={() => navegarA('rutinas')}
          className={`bottom-nav-item ${tabActiva === 'rutinas' && !mostrandoEntrenamiento ? 'active' : ''}`}
        >
          <RoutinesIcon size={20} />
          <span style={{ marginTop: '2px' }}>Rutinas</span>
        </button>

        <button
          onClick={() => navegarA('herramientas')}
          className={`bottom-nav-item ${tabActiva === 'herramientas' && !mostrandoEntrenamiento ? 'active' : ''}`}
        >
          <ToolsIcon size={20} />
          <span style={{ marginTop: '2px' }}>Herramientas</span>
        </button>

        <button
          onClick={() => navegarA('historial')}
          className={`bottom-nav-item ${tabActiva === 'historial' && !mostrandoEntrenamiento ? 'active' : ''}`}
        >
          <HistoryIcon size={20} />
          <span style={{ marginTop: '2px' }}>Historial</span>
        </button>

        <button
          onClick={() => navegarA('perfil')}
          className={`bottom-nav-item ${tabActiva === 'perfil' && !mostrandoEntrenamiento ? 'active' : ''}`}
        >
          <ProfileIcon size={20} />
          <span style={{ marginTop: '2px' }}>Perfil</span>
        </button>
      </div>

    </div>
  );
}
