import React, { useState, useEffect } from 'react';
import { db, Ejercicio } from '../db/db';
import { TrophyIcon, BarbellIcon, PlusIcon, FolderIcon, ChevronDownIcon } from './Icons';

interface RecordEjercicio {
  nombre: string;
  maxPeso: number;
  maxReps: number;
  maxEst1RM: number;
  ultimoRPE: number;
  fecha: string;
}

export default function Perfil() {
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

  const cargarDatosPerfil = async () => {
    try {
      const historial = await db.historial.toArray();
      const catalogo = await db.ejercicios.toArray();
      setEjerciciosCustom(catalogo);

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
          Records personales e inventario de ejercicios
        </p>
      </div>

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

    </div>
  );
}
