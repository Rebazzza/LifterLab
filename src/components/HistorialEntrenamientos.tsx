import React, { useState, useEffect } from 'react';
import { db, SesionCompletada } from '../db/db';
import { TrashIcon, BarbellIcon, CalendarIcon } from './Icons';

export default function HistorialEntrenamientos() {
  const [historial, setHistorial] = useState<SesionCompletada[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const datos = await db.historial.reverse().toArray();
      setHistorial(datos);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setCargando(false);
    }
  };

  const eliminarSesion = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Eliminar este registro del historial?')) {
      try {
        await db.historial.delete(id);
        await cargarHistorial();
      } catch (error) {
        console.error('Error al eliminar registro:', error);
      }
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>HISTORIAL</h2>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Bitacora de sesiones finalizadas
        </p>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>Cargando registros...</p>
      ) : historial.length === 0 ? (
        <div className="card-premium" style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-muted)' }}>
          <BarbellIcon size={32} color="var(--text-muted)" />
          <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginTop: '12px' }}>No hay entrenamientos registrados.</p>
          <p style={{ fontSize: '11px', marginTop: '4px' }}>Completa y finaliza una rutina para registrar tus marcas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historial.map((sesion) => (
            <div key={sesion.id} className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Encabezado Sesion */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: 'white' }}>{sesion.rutinaNombre}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <CalendarIcon size={12} color="var(--text-secondary)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{sesion.fecha}</span>
                  </div>
                </div>
                <button
                  onClick={() => eliminarSesion(sesion.id)}
                  style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Eliminar de bitacora"
                >
                  <TrashIcon size={16} />
                </button>
              </div>

              {/* Ejercicios y Series */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sesion.ejercicios.map((ej, ejIdx) => {
                  const seriesCompletadas = ej.series.filter(s => s.completada || s.pesoReal);
                  if (seriesCompletadas.length === 0) return null;

                  return (
                    <div key={ejIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-indigo)' }}>
                        {ej.nombre}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {seriesCompletadas.map((serie, serIdx) => (
                          <span
                            key={serIdx}
                            style={{
                              backgroundColor: '#0b0b0d',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <span style={{ color: 'white' }}>{serie.pesoReal || 0} kg</span> x{serie.reps} <span style={{ color: 'var(--accent-amber)', fontSize: '10px' }}>@{serie.rpe}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
