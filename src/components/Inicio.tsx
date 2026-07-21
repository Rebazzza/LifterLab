import React, { useState, useEffect } from 'react';
import { db, SesionCompletada } from '../db/db';
import { BarbellIcon, PlayIcon, HistoryIcon, ProfileIcon, ToolsIcon } from './Icons';

interface InicioProps {
  setTabActiva: (tab: 'inicio' | 'rutinas' | 'historial' | 'herramientas' | 'perfil') => void;
}

interface PRsInfo {
  sentadilla: { maxPeso: number; est1RM: number };
  banca: { maxPeso: number; est1RM: number };
  pesoMuerto: { maxPeso: number; est1RM: number };
}

export default function Inicio({ setTabActiva }: InicioProps) {
  const [totalSesiones, setTotalSesiones] = useState<number>(0);
  const [reciente, setReciente] = useState<SesionCompletada | null>(null);
  const [prs, setPrs] = useState<PRsInfo>({
    sentadilla: { maxPeso: 0, est1RM: 0 },
    banca: { maxPeso: 0, est1RM: 0 },
    pesoMuerto: { maxPeso: 0, est1RM: 0 }
  });

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const calcular1RMTeorico = (peso: number, reps: number, rpe: number) => {
    if (!peso || !reps) return 0;
    const repsTeoricas = reps + (10 - rpe);
    if (repsTeoricas > 10) return peso;
    return Math.round(peso / (1.0278 - (0.0278 * repsTeoricas)));
  };

  const cargarDatosDashboard = async () => {
    try {
      const historialArr = await db.historial.toArray();
      setTotalSesiones(historialArr.length);

      if (historialArr.length > 0) {
        setReciente(historialArr[historialArr.length - 1]);
      }

      const nuevosPrs: PRsInfo = {
        sentadilla: { maxPeso: 0, est1RM: 0 },
        banca: { maxPeso: 0, est1RM: 0 },
        pesoMuerto: { maxPeso: 0, est1RM: 0 }
      };

      historialArr.forEach(sesion => {
        sesion.ejercicios.forEach(ej => {
          const nombre = ej.nombre.toLowerCase();
          let categoria: 'sentadilla' | 'banca' | 'pesoMuerto' | null = null;

          if (nombre.includes('squat') || nombre.includes('sentadilla')) {
            categoria = 'sentadilla';
          } else if (nombre.includes('bench') || nombre.includes('banca') || nombre.includes('larsen')) {
            categoria = 'banca';
          } else if (nombre.includes('deadlift') || nombre.includes('peso muerto')) {
            categoria = 'pesoMuerto';
          }

          if (categoria) {
            ej.series.forEach(serie => {
              const pesoVal = parseFloat(serie.pesoReal || '0');
              const repsVal = parseInt(serie.reps || '0');
              const rpeVal = parseFloat(serie.rpe || '10');

              if (pesoVal > 0) {
                if (pesoVal > nuevosPrs[categoria!].maxPeso) {
                  nuevosPrs[categoria!].maxPeso = pesoVal;
                }

                const est1RMVal = calcular1RMTeorico(pesoVal, repsVal, rpeVal);
                if (est1RMVal > nuevosPrs[categoria!].est1RM) {
                  nuevosPrs[categoria!].est1RM = est1RMVal;
                }
              }
            });
          }
        });
      });

      setPrs(nuevosPrs);
    } catch (e) {
      console.error('Error al cargar datos en Inicio:', e);
    }
  };

  const totalSBD = prs.sentadilla.est1RM + prs.banca.est1RM + prs.pesoMuerto.est1RM;

  return (
    <div className="fade-in" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Cabecera / Identidad */}
      <div style={{ textAlign: 'center', margin: '12px 0 6px 0' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '0.05em', color: 'white', textTransform: 'uppercase' }}>
          LIFTER<span style={{ color: 'var(--accent-indigo)' }}>LAB</span>
        </h1>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '2px' }}>
          Centro de Control de Fuerza
        </p>
      </div>

      {/* Grid de Resumen Estadistico Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="card-premium" style={{ textAlign: 'center', padding: '16px 8px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            Sesiones
          </p>
          <p style={{ fontSize: '26px', fontWeight: '900', color: 'white', margin: '4px 0 0 0' }}>
            {totalSesiones}
          </p>
        </div>
        <div className="card-premium" style={{ textAlign: 'center', padding: '16px 8px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            SBD Total (Est.)
          </p>
          <p style={{ fontSize: '26px', fontWeight: '900', color: 'var(--accent-indigo)', margin: '4px 0 0 0' }}>
            {totalSBD > 0 ? `${totalSBD} kg` : '-- kg'}
          </p>
        </div>
      </div>

      {/* Seccion Records de Fuerza Principal */}
      <div>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Levantamientos Principales (1RM Est.)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Sentadilla */}
          <div className="card-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarbellIcon size={20} color="var(--text-secondary)" />
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>Sentadilla (Squat)</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max: {prs.sentadilla.maxPeso > 0 ? `${prs.sentadilla.maxPeso} kg` : '--'}</p>
              </div>
            </div>
            <p style={{ fontSize: '17px', fontWeight: '900', color: '#f3f4f6' }}>
              {prs.sentadilla.est1RM > 0 ? `${prs.sentadilla.est1RM} kg` : '--'}
            </p>
          </div>

          {/* Press de Banca */}
          <div className="card-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarbellIcon size={20} color="var(--accent-indigo)" />
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>Press de Banca</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max: {prs.banca.maxPeso > 0 ? `${prs.banca.maxPeso} kg` : '--'}</p>
              </div>
            </div>
            <p style={{ fontSize: '17px', fontWeight: '900', color: 'var(--accent-indigo)' }}>
              {prs.banca.est1RM > 0 ? `${prs.banca.est1RM} kg` : '--'}
            </p>
          </div>

          {/* Peso Muerto */}
          <div className="card-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarbellIcon size={20} color="var(--accent-amber)" />
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>Peso Muerto</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max: {prs.pesoMuerto.maxPeso > 0 ? `${prs.pesoMuerto.maxPeso} kg` : '--'}</p>
              </div>
            </div>
            <p style={{ fontSize: '17px', fontWeight: '900', color: 'var(--accent-amber)' }}>
              {prs.pesoMuerto.est1RM > 0 ? `${prs.pesoMuerto.est1RM} kg` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Acciones Rapidas */}
      <div>
        <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Acciones
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => setTabActiva('rutinas')}
            className="btn-primary"
            style={{ padding: '14px', flexDirection: 'column', gap: '6px', borderRadius: '12px' }}
          >
            <PlayIcon size={14} color="white" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Entrenar</span>
          </button>

          <button
            onClick={() => setTabActiva('herramientas')}
            className="btn-secondary"
            style={{ padding: '14px', flexDirection: 'column', gap: '6px', borderRadius: '12px' }}
          >
            <ToolsIcon size={16} color="var(--accent-indigo)" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Herramientas</span>
          </button>

          <button
            onClick={() => setTabActiva('historial')}
            className="btn-secondary"
            style={{ padding: '14px', flexDirection: 'column', gap: '6px', borderRadius: '12px' }}
          >
            <HistoryIcon size={16} color="var(--accent-emerald)" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Historial</span>
          </button>

          <button
            onClick={() => setTabActiva('perfil')}
            className="btn-secondary"
            style={{ padding: '14px', flexDirection: 'column', gap: '6px', borderRadius: '12px' }}
          >
            <ProfileIcon size={16} color="var(--accent-amber)" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Mis Records</span>
          </button>
        </div>
      </div>

      {/* Ultimo Entrenamiento */}
      {reciente && (
        <div className="card-premium" style={{ borderLeft: '3px solid var(--accent-emerald)' }}>
          <p style={{ fontSize: '9px', color: 'var(--accent-emerald)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            Ultima Sesion
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>
                {reciente.rutinaNombre}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {reciente.fecha.split(' ')[0]} · {reciente.ejercicios.length} ejercicios
              </p>
            </div>
            <button
              onClick={() => setTabActiva('historial')}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}
            >
              Ver
            </button>
          </div>
        </div>
      )}

      {/* Frase */}
      <div style={{ textAlign: 'center', padding: '12px 24px', color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
        "La consistencia supera al talento. Ejecuta con precision, mantén el foco."
      </div>

    </div>
  );
}
