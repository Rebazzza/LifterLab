import React, { useState, useEffect } from 'react';
import { db, EjercicioRutinaGuardado, SerieGuardada, Ejercicio, SesionActiva } from '../db/db';
import ModalCalculadoraDiscos from './ModalCalculadoraDiscos';
import { CloseIcon, PlusIcon, TimerIcon, BarbellIcon, SearchIcon, CheckIcon, TrashIcon } from './Icons';

interface ModoEntrenamientoProps {
  sesion: SesionActiva;
  onActualizarSesion: (ejercicios: EjercicioRutinaGuardado[]) => void;
  onFinalizar: () => void;
  onCancelar: () => void;
  onSalir: () => void;
}

export default function ModoEntrenamiento({ sesion, onActualizarSesion, onFinalizar, onCancelar, onSalir }: ModoEntrenamientoProps) {
  const [ejercicios, setEjercicios] = useState<EjercicioRutinaGuardado[]>(sesion.ejercicios);
  const [tiempoDescanso, setTiempoDescanso] = useState<number>(0);
  const [timerActivo, setTimerActivo] = useState<boolean>(false);

  const [catalogo, setCatalogo] = useState<Ejercicio[]>([]);
  const [mostrarCatalogoModal, setMostrarCatalogoModal] = useState<boolean>(false);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState<string>('');
  const [pesoCalculadoraModal, setPesoCalculadoraModal] = useState<number | null>(null);

  useEffect(() => {
    db.ejercicios.toArray().then(setCatalogo);
  }, []);

  useEffect(() => {
    let intervalo: any = null;
    if (timerActivo && tiempoDescanso > 0) {
      intervalo = setInterval(() => setTiempoDescanso((prev) => prev - 1), 1000);
    } else if (tiempoDescanso === 0) {
      setTimerActivo(false);
      clearInterval(intervalo);
    }
    return () => clearInterval(intervalo);
  }, [timerActivo, tiempoDescanso]);

  useEffect(() => {
    onActualizarSesion(ejercicios);
  }, [ejercicios]);

  const iniciarDescanso = (segundos: number) => {
    setTiempoDescanso(segundos);
    setTimerActivo(true);
  };

  const toggleSerieCompletada = (ejIdx: number, serIdx: number) => {
    const nuevosEjercicios = [...ejercicios];
    const estadoActual = nuevosEjercicios[ejIdx].series[serIdx].completada;
    nuevosEjercicios[ejIdx].series[serIdx].completada = !estadoActual;
    setEjercicios(nuevosEjercicios);

    if (!estadoActual) {
      iniciarDescanso(180);
    }
  };

  const actualizarCampoSerie = (ejIdx: number, serIdx: number, campo: keyof SerieGuardada, valor: any) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[ejIdx].series[serIdx] = {
      ...nuevosEjercicios[ejIdx].series[serIdx],
      [campo]: valor
    };
    setEjercicios(nuevosEjercicios);
  };

  const agregarSerieEnEjecucion = (ejIdx: number) => {
    const nuevosEjercicios = [...ejercicios];
    const ultimaSerie = nuevosEjercicios[ejIdx].series[nuevosEjercicios[ejIdx].series.length - 1];

    nuevosEjercicios[ejIdx].series.push({
      reps: ultimaSerie ? ultimaSerie.reps : '5',
      rpe: ultimaSerie ? ultimaSerie.rpe : '8',
      porcentaje: ultimaSerie ? ultimaSerie.porcentaje : '',
      pesoReal: ultimaSerie ? ultimaSerie.pesoReal : '',
      completada: false
    });
    setEjercicios(nuevosEjercicios);
  };

  const eliminarSerie = (ejIdx: number, serIdx: number) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[ejIdx].series.splice(serIdx, 1);
    if (nuevosEjercicios[ejIdx].series.length === 0) {
      nuevosEjercicios.splice(ejIdx, 1);
    }
    setEjercicios(nuevosEjercicios);
  };

  const eliminarEjercicio = (ejIdx: number) => {
    if (!window.confirm('Eliminar este ejercicio del entrenamiento?')) return;
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios.splice(ejIdx, 1);
    setEjercicios(nuevosEjercicios);
  };

  const agregarEjercicioExtra = (ejercicio: Ejercicio) => {
    if (!ejercicio.id) return;
    setEjercicios([
      ...ejercicios,
      {
        ejercicioId: ejercicio.id,
        nombre: ejercicio.nombre,
        esConBarra: ejercicio.esConBarra ?? true,
        series: [{ reps: '5', rpe: '8', porcentaje: '', pesoReal: '', completada: false }]
      }
    ]);
    setMostrarCatalogoModal(false);
    setBusquedaCatalogo('');
  };

  const guardarSesion = async () => {
    try {
      await db.historial.add({
        rutinaNombre: sesion.rutina.nombre,
        fecha: new Date().toLocaleString('es-ES'),
        ejercicios: ejercicios
      });
      onFinalizar();
    } catch (error) {
      console.error('Error al guardar sesion:', error);
    }
  };

  const formatearTiempo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const catalogoFiltrado = busquedaCatalogo.trim()
    ? catalogo.filter(ej => ej.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase()))
    : catalogo;

  return (
    <div className="fade-in" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Modal Calculadora de Discos */}
      {pesoCalculadoraModal !== null && (
        <ModalCalculadoraDiscos pesoKg={pesoCalculadoraModal} onCerrar={() => setPesoCalculadoraModal(null)} />
      )}

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="chip chip-emerald" style={{ fontSize: '9px', padding: '2px 8px' }}>En Ejecucion</span>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '4px 0 0 0', color: 'white' }}>{sesion.rutina.nombre}</h2>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onSalir}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              gap: '4px'
            }}
          >
            Volver
          </button>
          <button
            onClick={onCancelar}
            style={{
              backgroundColor: 'var(--accent-red-glow)',
              border: '1px solid var(--accent-red)',
              color: 'var(--accent-red)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              gap: '4px'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Temporizador */}
      <div style={{
        backgroundColor: timerActivo ? 'var(--accent-indigo-glow)' : '#0b0b0d',
        border: `1px solid ${timerActivo ? 'var(--accent-indigo)' : 'var(--border-subtle)'}`,
        padding: '12px 14px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TimerIcon size={18} color={timerActivo ? '#c7d2fe' : 'var(--text-secondary)'} />
          <div>
            <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: timerActivo ? '#c7d2fe' : 'var(--text-secondary)' }}>
              Descanso
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: 'white' }}>{formatearTiempo(tiempoDescanso)}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => iniciarDescanso(60)} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>+1m</button>
          <button onClick={() => iniciarDescanso(120)} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>+2m</button>
          <button onClick={() => iniciarDescanso(180)} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>+3m</button>
          {tiempoDescanso > 0 && (
            <button onClick={() => setTiempoDescanso(0)} style={{ backgroundColor: 'var(--accent-red-glow)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Parar</button>
          )}
        </div>
      </div>

      {/* Ejercicios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {ejercicios.map((ej, ejIdx) => {
          const esBarra = ej.esConBarra ?? true;

          return (
            <div key={ejIdx} className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '15px', fontWeight: '900', color: 'white', margin: 0 }}>{ej.nombre}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {esBarra && (
                    <span className="chip chip-indigo" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      <BarbellIcon size={10} color="#a5b4fc" /> Barra
                    </span>
                  )}
                  <button
                    onClick={() => eliminarEjercicio(ejIdx)}
                    style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>

              {/* Encabezados de Tabla */}
              <div style={{ display: 'grid', gridTemplateColumns: '20px 1.2fr 1fr 1fr 30px 20px', gap: '4px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                <span>SET</span>
                <span>KG</span>
                <span>REPS</span>
                <span>RPE</span>
                <span></span>
                <span></span>
              </div>

              {/* Lista de series */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ej.series.map((serie, serIdx) => (
                  <div
                    key={serIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '20px 1.2fr 1fr 1fr 30px 20px',
                      gap: '4px',
                      alignItems: 'center',
                      backgroundColor: serie.completada ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      padding: '4px 2px',
                      borderRadius: '8px',
                      border: serie.completada ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textAlign: 'center' }}>{serIdx + 1}</span>

                    {/* KG + Boton Discos */}
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0b0b0d', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '2px', overflow: 'hidden' }}>
                      <input
                        type="number"
                        placeholder="KG"
                        value={serie.pesoReal || ''}
                        onChange={(e) => actualizarCampoSerie(ejIdx, serIdx, 'pesoReal', e.target.value)}
                        style={{ backgroundColor: 'transparent', border: 'none', color: 'white', textAlign: 'center', width: '100%', fontSize: '13px', fontWeight: 'bold', padding: '4px 2px', boxShadow: 'none' }}
                      />
                      {esBarra && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setPesoCalculadoraModal(Number(serie.pesoReal || 0));
                          }}
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: '3px 4px',
                            color: 'white',
                            flexShrink: 0
                          }}
                        >
                          <BarbellIcon size={12} color="white" />
                        </button>
                      )}
                    </div>

                    {/* REPS */}
                    <input
                      type="number"
                      placeholder="Reps"
                      value={serie.reps}
                      onChange={(e) => actualizarCampoSerie(ejIdx, serIdx, 'reps', e.target.value)}
                      style={{ padding: '6px 2px', fontSize: '13px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
                    />

                    {/* RPE */}
                    <select
                      value={serie.rpe || '8'}
                      onChange={(e) => actualizarCampoSerie(ejIdx, serIdx, 'rpe', e.target.value)}
                      style={{ padding: '6px 0', fontSize: '12px', textAlign: 'center', width: '100%', boxSizing: 'border-box', height: '34px', color: 'var(--accent-amber)', fontWeight: 'bold' }}
                    >
                      {['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'].map((val) => (
                        <option key={val} value={val}>@{val}</option>
                      ))}
                    </select>

                    {/* DONE CHECKBOX */}
                    <button
                      onClick={() => toggleSerieCompletada(ejIdx, serIdx)}
                      style={{
                        height: '24px', width: '24px', borderRadius: '6px', border: 'none',
                        backgroundColor: serie.completada ? 'var(--accent-emerald)' : 'var(--bg-card)',
                        borderStyle: serie.completada ? 'none' : 'solid',
                        borderWidth: '1px', borderColor: 'var(--border-subtle)',
                        color: 'white', cursor: 'pointer', margin: '0 auto', fontSize: '11px'
                      }}
                    >
                      {serie.completada ? <CheckIcon size={12} color="white" /> : ''}
                    </button>

                    {/* ELIMINAR */}
                    <button onClick={() => eliminarSerie(ejIdx, serIdx)} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                      <CloseIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => agregarSerieEnEjecucion(ejIdx)}
                style={{
                  width: '100%', marginTop: '4px', padding: '8px',
                  backgroundColor: 'transparent',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '11px', fontWeight: 'bold', gap: '4px'
                }}
              >
                <PlusIcon size={12} color="var(--text-secondary)" />
                <span>Anadir Serie</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Boton Catalogo Adicional */}
      <button
        onClick={() => setMostrarCatalogoModal(true)}
        style={{
          width: '100%', padding: '12px',
          backgroundColor: 'transparent',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '12px',
          color: 'var(--accent-indigo)',
          fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', gap: '8px'
        }}
      >
        <PlusIcon size={16} color="var(--accent-indigo)" />
        <span>Anadir Ejercicio Adicional</span>
      </button>

      {/* Modal Catalogo */}
      {mostrarCatalogoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card-premium" style={{ width: '100%', maxWidth: '380px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Seleccionar Ejercicio</h3>
              <button onClick={() => { setMostrarCatalogoModal(false); setBusquedaCatalogo(''); }} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', padding: '4px' }}>
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                <SearchIcon size={14} color="var(--text-muted)" />
              </div>
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={busquedaCatalogo}
                onChange={(e) => setBusquedaCatalogo(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '32px', fontSize: '13px' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {catalogoFiltrado.map((ej) => (
                <button
                  key={ej.id}
                  onClick={() => agregarEjercicioExtra(ej)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: '#0b0b0d', border: '1px solid var(--border-subtle)',
                    padding: '10px 12px', borderRadius: '8px',
                    color: 'white', fontWeight: 'bold', fontSize: '13px', textAlign: 'left'
                  }}
                >
                  <span>{ej.nombre}</span>
                  <span className="chip chip-indigo" style={{ fontSize: '8px', padding: '2px 6px' }}>
                    {ej.esConBarra ? 'Barra' : 'Otro'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guardar Sesion */}
      <button
        onClick={guardarSesion}
        className="btn-primary"
        style={{
          width: '100%', padding: '14px',
          fontSize: '15px', fontWeight: '900',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginTop: '10px', gap: '8px'
        }}
      >
        <CheckIcon size={18} color="white" />
        <span>Finalizar Entrenamiento</span>
      </button>

    </div>
  );
}
