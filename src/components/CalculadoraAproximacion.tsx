import React, { useState } from 'react';
import ModalCalculadoraDiscos from './ModalCalculadoraDiscos';
import { BarbellIcon } from './Icons';

interface StepAproximacion {
  nombre: string;
  peso: number;
  reps: number | string;
  porcentaje: number;
  descanso: string;
  esTrabajo?: boolean;
}

export default function CalculadoraAproximacion() {
  const [pesoObjetivo, setPesoObjetivo] = useState<string>('');
  const [repsObjetivo, setRepsObjetivo] = useState<string>('5');
  const [rpeObjetivo, setRpeObjetivo] = useState<string>('8');
  const [pesoBarra, setPesoBarra] = useState<number>(20);
  const [pesoModal, setPesoModal] = useState<number | null>(null);

  const [seriesCompletadas, setSeriesCompletadas] = useState<{ [key: number]: boolean }>({});

  const redondearPeso = (peso: number): number => {
    return Math.round(peso / 2.5) * 2.5;
  };

  // ALGORITMO DINÁMICO REFACTORIZADO
  const calcularSeriesAproximacion = (): StepAproximacion[] => {
    const target = parseFloat(pesoObjetivo);
    const targetReps = parseInt(repsObjetivo) || 1;
    const targetRpe = parseFloat(rpeObjetivo) || 10;

    if (!target || target <= pesoBarra) return [];

    // 1. Matriz de Repeticiones Dinámicas basadas en las Reps Objetivo
    // Si haces más reps en el target, haces ligeramente más reps en los calentamientos previos.
    let repsSet1: number; // ~45%
    let repsSet2: number; // ~65%
    let repsSet3: number; // ~80%
    let repsSet4: number; // ~90%

    if (targetReps >= 10) {
      repsSet1 = 8;
      repsSet2 = 6;
      repsSet3 = 4;
      repsSet4 = 2;
    } else if (targetReps >= 6) {
      repsSet1 = 6;
      repsSet2 = 4;
      repsSet3 = 3;
      repsSet4 = 2;
    } else if (targetReps >= 3) {
      repsSet1 = 5;
      repsSet2 = 3;
      repsSet3 = 2;
      repsSet4 = 1;
    } else {
      // Para singles y dobles pesados (1 - 2 reps)
      repsSet1 = 5;
      repsSet2 = 3;
      repsSet3 = 1;
      repsSet4 = 1;
    }

    const steps: StepAproximacion[] = [];

    // Paso 0: Barra Sola (Movilidad & Patrón Motor)
    const repsBarra = targetReps >= 8 ? '2 × 10' : '2 × 8';
    steps.push({
      nombre: 'Barra Sola (Movilidad & RUTA)',
      peso: pesoBarra,
      reps: repsBarra,
      porcentaje: Math.round((pesoBarra / target) * 100),
      descanso: 'Sin descanso'
    });

    // Paso 1: ~45% - Activación y Vascularización
    const peso45 = redondearPeso(target * 0.45);
    if (peso45 > pesoBarra + 2.5) {
      steps.push({
        nombre: 'Calentamiento Articular',
        peso: peso45,
        reps: repsSet1,
        porcentaje: Math.round((peso45 / target) * 100),
        descanso: '45-60 seg'
      });
    }

    // Paso 2: ~65% - Aclimatación y Velocidad
    const peso65 = redondearPeso(target * 0.65);
    const pesoAnterior1 = steps[steps.length - 1].peso;
    if (peso65 > pesoAnterior1 + 2.5) {
      steps.push({
        nombre: 'Velocidad de Barra',
        peso: peso65,
        reps: repsSet2,
        porcentaje: Math.round((peso65 / target) * 100),
        descanso: '60-90 seg'
      });
    }

    // Paso 3: ~80% - Activación Neuromuscular
    const peso80 = redondearPeso(target * 0.80);
    const pesoAnterior2 = steps[steps.length - 1].peso;
    if (peso80 > pesoAnterior2 + 2.5 && (target - peso80) >= 5) {
      steps.push({
        nombre: 'Acondicionamiento Nervioso',
        peso: peso80,
        reps: repsSet3,
        porcentaje: Math.round((peso80 / target) * 100),
        descanso: '2 min'
      });
    }

    // Paso 4: ~90% - Single / Primer Táctico
    // Se activa dinámicamente si el objetivo es exigente (RPE >= 8 o peso alto)
    const peso90 = redondearPeso(target * 0.90);
    const pesoAnterior3 = steps[steps.length - 1].peso;
    
    if ((targetRpe >= 8 || target >= 100) && peso90 > pesoAnterior3 && (target - peso90) >= 5) {
      steps.push({
        nombre: targetReps <= 3 ? 'Single Táctico (Potenciación)' : 'Aclimatación Final',
        peso: peso90,
        reps: repsSet4,
        porcentaje: Math.round((peso90 / target) * 100),
        descanso: '2.5 - 3 min'
      });
    }

    // Paso Final: Set Objetivo de Trabajo
    steps.push({
      nombre: `Set de Trabajo (@${targetRpe})`,
      peso: target,
      reps: targetReps,
      porcentaje: 100,
      descanso: 'Empieza entrenamiento principal',
      esTrabajo: true
    });

    return steps;
  };

  const series = calcularSeriesAproximacion();

  const toggleCompletado = (idx: number) => {
    setSeriesCompletadas(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {pesoModal !== null && (
        <ModalCalculadoraDiscos pesoKg={pesoModal} onCerrar={() => setPesoModal(null)} />
      )}

      <div className="card-premium">
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'white', marginBottom: '14px', textAlign: 'center' }}>
          Configurar Serie de Trabajo
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Peso Objetivo (kg)
            </label>
            <input
              type="number"
              placeholder="Ej: 140"
              value={pesoObjetivo}
              onChange={(e) => {
                setPesoObjetivo(e.target.value);
                setSeriesCompletadas({});
              }}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                Reps Objetivo
              </label>
              <input
                type="number"
                placeholder="Reps"
                value={repsObjetivo}
                onChange={(e) => setRepsObjetivo(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                Esfuerzo (RPE)
              </label>
              <select
                value={rpeObjetivo}
                onChange={(e) => setRpeObjetivo(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', height: '43px' }}
              >
                <option value="10">@10 (Al fallo)</option>
                <option value="9">@9 (1 en reserva)</option>
                <option value="8">@8 (2 en reserva)</option>
                <option value="7">@7 (3 en reserva)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Peso de Barra
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[15, 20, 25].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPesoBarra(p)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: pesoBarra === p ? 'var(--accent-indigo)' : 'var(--bg-card)',
                    color: pesoBarra === p ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {p} kg
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {series.length > 0 && (
        <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Protocolo Adaptativo de Calentamiento
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {series.map((step, idx) => {
              const completado = !!seriesCompletadas[idx];
              const esTrabajo = step.esTrabajo;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: esTrabajo ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                    backgroundColor: completado
                      ? 'rgba(16, 185, 129, 0.08)'
                      : esTrabajo
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'rgba(30, 30, 35, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <button
                      onClick={() => toggleCompletado(idx)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: completado ? 'none' : '1px solid var(--text-muted)',
                        backgroundColor: completado ? 'var(--accent-emerald)' : 'transparent',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {completado ? '✓' : ''}
                    </button>

                    <div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: esTrabajo ? 'var(--accent-indigo)' : 'white',
                        textDecoration: completado ? 'line-through' : 'none',
                        opacity: completado ? 0.6 : 1,
                        margin: 0
                      }}>
                        {step.peso} kg × {step.reps} {typeof step.reps === 'number' ? (step.reps === 1 ? 'rep' : 'reps') : ''}
                      </p>
                      <p style={{
                        fontSize: '10px',
                        color: 'var(--text-secondary)',
                        opacity: completado ? 0.5 : 0.8,
                        margin: '2px 0 0 0'
                      }}>
                        {step.nombre} ({step.porcentaje}%) • ⏱️ {step.descanso}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPesoModal(step.peso)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      backgroundColor: 'var(--border-subtle)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <BarbellIcon size={12} color="white" />
                    <span>Discos</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ backgroundColor: '#09090b', padding: '10px', borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', marginTop: '4px' }}>
            <strong>Dinámica del algoritmo:</strong> Si cambias la meta a 10 reps, verás que las aproximaciones te asignan más reps (8, 6, 4...). Si buscas 1-3 reps, las aproximaciones se reducen automáticamente (5, 3, 2, 1) para preservar la frescura nerviosa.
          </div>
        </div>
      )}

    </div>
  );
}