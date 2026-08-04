import React, { useState, useEffect } from 'react';
import { db, Ejercicio } from '../db/db';
import { supabase } from '../lib/supabase';
import { TrophyIcon, BarbellIcon, PlusIcon, FolderIcon, ChevronDownIcon, UserIcon, LogoutIcon, SettingsIcon, SaveIcon } from './Icons';
import { cargarHistorialDeSupabase, cargarPerfilUsuario, guardarPerfilUsuario, guardarConfigUsuario, PerfilUsuario, ConfigUsuario } from '../lib/api';

interface RecordEjercicio {
  nombre: string;
  maxPeso: number;
  maxReps: number;
  maxEst1RM: number;
  ultimoRPE: number;
  fecha: string;
}

interface FormPerfil {
  nombre: string;
  genero: string;
  unidadPeso: string;
  pesoCorporal: string;
  alturaCm: string;
}

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [config, setConfig] = useState<ConfigUsuario | null>(null);
  const [formPerfil, setFormPerfil] = useState<FormPerfil>({
    nombre: '',
    genero: 'masculino',
    unidadPeso: 'kg',
    pesoCorporal: '',
    alturaCm: ''
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cerrandoSesion, setCerrandoSesion] = useState<boolean>(false);

  const [records, setRecords] = useState<RecordEjercicio[]>([]);
  const [ejerciciosCustom, setEjerciciosCustom] = useState<Ejercicio[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false);

  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevaCategoria, setNuevaCategoria] = useState<'Sentadilla' | 'Press de Banca' | 'Peso Muerto' | 'Accesorio'>('Accesorio');
  const [esConBarra, setEsConBarra] = useState<boolean>(true);

  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const calcular1RMTeorico = (peso: number, reps: number, rpe: number) => {
    if (!peso || !reps) return 0;
    const repsTeoricas = reps + (10 - rpe);
    if (repsTeoricas > 10) return peso;
    return Math.round(peso / (1.0278 - (0.0278 * repsTeoricas)));
  };

  const iniciales = (nombre: string) => {
    return nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('');
  };

  const cargarDatosPerfil = async () => {
    setCargando(true);
    try {
      const datos = await cargarPerfilUsuario();
      const historial = await cargarHistorialDeSupabase();
      const catalogo = await db.ejercicios.toArray();

      setPerfil(datos.perfil);
      setConfig(datos.config);
      setEjerciciosCustom(catalogo);
      setFormPerfil({
        nombre: datos.perfil.nombre,
        genero: datos.perfil.genero,
        unidadPeso: datos.perfil.unidadPeso,
        pesoCorporal: datos.perfil.pesoCorporal !== null ? String(datos.perfil.pesoCorporal) : '',
        alturaCm: datos.perfil.alturaCm !== null ? String(datos.perfil.alturaCm) : ''
      });

      const mapRecords: { [key: string]: RecordEjercicio } = {};

      historial.forEach((sesion) => {
        sesion.ejercicios.forEach((ej) => {
          ej.series.forEach((serie) => {
            const pesoVal = parseFloat(serie.pesoReal || '0');
            const repsVal = parseInt(serie.reps || '0');
            const rpeVal = parseFloat(serie.rpe || '10');

            if (pesoVal > 0) {
              const est1RMVal = calcular1RMTeorico(pesoVal, repsVal, rpeVal);
              const actual = mapRecords[ej.nombre];

              if (!actual || est1RMVal > actual.maxEst1RM || pesoVal > actual.maxPeso) {
                mapRecords[ej.nombre] = {
                  nombre: ej.nombre,
                  maxPeso: Math.max(actual?.maxPeso || 0, pesoVal),
                  maxReps: pesoVal >= (actual?.maxPeso || 0) ? repsVal : (actual?.maxReps || 0),
                  maxEst1RM: Math.max(actual?.maxEst1RM || 0, est1RMVal),
                  ultimoRPE: rpeVal,
                  fecha: sesion.fecha.split(' ')[0]
                };
              }
            }
          });
        });
      });

      setRecords(Object.values(mapRecords));
    } catch (e) {
      console.error('Error al cargar datos en Perfil:', e);
    } finally {
      setCargando(false);
    }
  };

  const guardarCambiosPerfil = async () => {
    if (!formPerfil.nombre.trim()) {
      alert('El nombre no puede estar vacio.');
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      await guardarPerfilUsuario({
        nombre: formPerfil.nombre.trim(),
        genero: formPerfil.genero,
        unidadPeso: formPerfil.unidadPeso,
        pesoCorporal: formPerfil.pesoCorporal.trim() !== '' ? parseFloat(formPerfil.pesoCorporal) : null,
        alturaCm: formPerfil.alturaCm.trim() !== '' ? parseFloat(formPerfil.alturaCm) : null
      });
      setPerfil(prev => prev ? { ...prev, nombre: formPerfil.nombre.trim(), genero: formPerfil.genero, unidadPeso: formPerfil.unidadPeso } : prev);
      setMensaje('Perfil actualizado correctamente.');
      setTimeout(() => setMensaje(null), 2500);
    } catch (e) {
      console.error('Error al guardar perfil:', e);
      alert('No se pudo guardar el perfil. Verifica tu conexion.');
    } finally {
      setGuardando(false);
    }
  };

  const toggleConfig = async (campo: keyof ConfigUsuario, valor: boolean) => {
    if (!config) return;
    const nuevo = { ...config, [campo]: valor };
    setConfig(nuevo);
    try {
      await guardarConfigUsuario(nuevo);
    } catch (e) {
      console.error('Error al guardar configuracion:', e);
    }
  };

  const cerrarSesion = async () => {
    if (!window.confirm('¿Seguro que quieres cerrar sesion?')) return;
    setCerrandoSesion(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error al cerrar sesion:', e);
      setCerrandoSesion(false);
    }
  };

  const crearEjercicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      alert('Escribe un nombre.');
      return;
    }

    try {
      await db.ejercicios.add({
        nombre: nuevoNombre.trim(),
        categoria: nuevaCategoria,
        esConBarra: esConBarra
      });

      setNuevoNombre('');
      setMostrarFormulario(false);
      cargarDatosPerfil();
    } catch (err) {
      console.error('Error al agregar ejercicio:', err);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Cabecera */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>MI PERFIL</h2>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tu informacion, records y preferencias
        </p>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>Cargando perfil...</p>
      ) : (
        <>
          {/* Tarjeta de Usuario */}
          {perfil && (
            <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-indigo-hover))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '20px', color: 'white',
                  boxShadow: '0 6px 18px var(--accent-indigo-glow)'
                }}>
                  {iniciales(perfil.nombre) || 'U'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: '900', fontSize: '17px', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {perfil.nombre}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {perfil.email}
                  </p>
                </div>
              </div>

              {/* Formulario de datos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                    <UserIcon size={12} /> Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={formPerfil.nombre}
                    onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                      Genero
                    </label>
                    <select
                      value={formPerfil.genero}
                      onChange={(e) => setFormPerfil({ ...formPerfil, genero: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', height: '39px', padding: '6px 8px' }}
                    >
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                      Unidad de peso
                    </label>
                    <select
                      value={formPerfil.unidadPeso}
                      onChange={(e) => setFormPerfil({ ...formPerfil, unidadPeso: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', height: '39px', padding: '6px 8px' }}
                    >
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="lb">Libras (lb)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                      Peso corporal
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Ej: 82.5"
                      value={formPerfil.pesoCorporal}
                      onChange={(e) => setFormPerfil({ ...formPerfil, pesoCorporal: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej: 175"
                      value={formPerfil.alturaCm}
                      onChange={(e) => setFormPerfil({ ...formPerfil, alturaCm: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button
                  onClick={guardarCambiosPerfil}
                  className="btn-primary"
                  disabled={guardando}
                  style={{ width: '100%', padding: '11px', fontSize: '13px', fontWeight: 'bold', gap: '6px', opacity: guardando ? 0.6 : 1 }}
                >
                  <SaveIcon size={14} color="white" />
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>

                {mensaje && (
                  <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-emerald)', margin: 0 }}>
                    {mensaje}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Configuracion */}
          {config && (
            <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <SettingsIcon size={14} color="var(--text-secondary)" />
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                  Configuracion
                </h3>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '13px', color: 'white', margin: 0 }}>Sonidos</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Alertas y avisos del temporizador</p>
                </div>
                <button
                  onClick={() => toggleConfig('sonidos', !config.sonidos)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '9999px', flexShrink: 0,
                    backgroundColor: config.sonidos ? 'var(--accent-indigo)' : 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative', transition: 'all 0.2s', cursor: 'pointer'
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '2px', left: config.sonidos ? '22px' : '2px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: 'white', transition: 'left 0.2s'
                  }} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '13px', color: 'white', margin: 0 }}>Notificaciones</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Recordatorios y resumen de sesiones</p>
                </div>
                <button
                  onClick={() => toggleConfig('notificaciones', !config.notificaciones)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '9999px', flexShrink: 0,
                    backgroundColor: config.notificaciones ? 'var(--accent-indigo)' : 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative', transition: 'all 0.2s', cursor: 'pointer'
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '2px', left: config.notificaciones ? '22px' : '2px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: 'white', transition: 'left 0.2s'
                  }} />
                </button>
              </div>
            </div>
          )}

          {/* Records Personales Detectados */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <TrophyIcon size={14} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                Records Historicos ({records.length})
              </h3>
            </div>

            {records.length === 0 ? (
              <div className="card-premium" style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                <BarbellIcon size={28} color="var(--text-muted)" />
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Completa entrenamientos para registrar tus primeros records de fuerza.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {records.map((rec) => (
                  <div key={rec.nombre} className="card-premium" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>{rec.nombre}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rec.fecha}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Max Peso Real:</span>
                        <p style={{ fontSize: '14px', fontWeight: '900', color: 'white' }}>
                          {rec.maxPeso} kg <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--text-muted)' }}>x{rec.maxReps}</span>
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>1RM Estimado:</span>
                        <p style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-indigo)' }}>
                          {rec.maxEst1RM} kg
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario Agregar Ejercicios al catalogo */}
          <div className="card-premium">
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'transparent', padding: 0, color: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusIcon size={16} color="var(--accent-indigo)" />
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Registrar Ejercicio</span>
              </div>
              <div style={{ transform: mostrarFormulario ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <ChevronDownIcon size={16} color="var(--text-muted)" />
              </div>
            </button>

            {mostrarFormulario && (
              <form onSubmit={crearEjercicio} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Nombre del Ejercicio
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Press Militar con Barra"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Categoria
                    </label>
                    <select
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value as any)}
                      style={{ width: '100%', boxSizing: 'border-box', height: '39px', padding: '6px 8px' }}
                    >
                      <option value="Sentadilla">Sentadilla</option>
                      <option value="Press de Banca">Press de Banca</option>
                      <option value="Peso Muerto">Peso Muerto</option>
                      <option value="Accesorio">Accesorio</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Requiere Barra
                    </label>
                    <button
                      type="button"
                      onClick={() => setEsConBarra(!esConBarra)}
                      style={{
                        width: '100%', padding: '9px 0', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: esConBarra ? 'var(--accent-indigo)' : 'var(--bg-card)',
                        color: esConBarra ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {esConBarra ? 'SI (Barra)' : 'NO (Otro)'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px', marginTop: '4px', fontSize: '13px' }}>
                  Anadir al Catalogo
                </button>
              </form>
            )}
          </div>

          {/* Lista del Catalogo Base */}
          <div className="card-premium">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FolderIcon size={14} color="var(--text-secondary)" />
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                Ejercicios en Catalogo ({ejerciciosCustom.length})
              </h3>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
              {ejerciciosCustom.map((ej) => (
                <div
                  key={ej.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{ej.nombre}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ej.categoria}</span>
                    {ej.esConBarra && (
                      <BarbellIcon size={12} color="var(--accent-indigo)" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cerrar Sesion */}
          <button
            onClick={cerrarSesion}
            disabled={cerrandoSesion}
            style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              backgroundColor: 'var(--accent-red-glow)',
              border: '1px solid var(--accent-red)',
              color: 'var(--accent-red)',
              fontSize: '13px', fontWeight: 'bold', gap: '8px',
              cursor: 'pointer', opacity: cerrandoSesion ? 0.6 : 1
            }}
          >
            <LogoutIcon size={16} color="var(--accent-red)" />
            {cerrandoSesion ? 'Cerrando sesion...' : 'Cerrar Sesion'}
          </button>
        </>
      )}

    </div>
  );
}
