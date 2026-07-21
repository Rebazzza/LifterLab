import React, { useState } from 'react';

// Tipos de fórmulas soportadas
type Formula1RM = 'brzycki' | 'epley' | 'lander' | 'wathan' | 'lombardi';

interface InfoFormula {
  id: Formula1RM;
  nombre: string;
  descripcion: string;
}

const FORMULAS: InfoFormula[] = [
  { id: 'brzycki', nombre: 'Brzycki', descripcion: 'Predeterminada. Ideal para 1-10 reps.' },
  { id: 'epley', nombre: 'Epley', descripcion: 'Muy popular. Muy precisa en 2-8 reps.' },
  { id: 'lander', nombre: 'Lander', descripcion: 'Utilizada en levantamiento de potencia (1-5 reps).' },
  { id: 'wathan', nombre: 'Wathan', descripcion: 'Curva no lineal. La mejor para +10 reps.' },
  { id: 'lombardi', nombre: 'Lombardi', descripcion: 'Fórmula conservadora basada en potencias.' },
];

export default function Calculadora1RM() {
  const [peso, setPeso] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [rpe, setRpe] = useState<string>('10');
  
  // Estado para la fórmula elegida (predeterminada: Brzycki)
  const [formula, setFormula] = useState<Formula1RM>('brzycki');
  const [mostrarOpcionesFormula, setMostrarOpcionesFormula] = useState<boolean>(false);

  // Función para ejecutar el cálculo de 1RM según la fórmula seleccionada
  const calcular1RM = (): number => {
    const p = parseFloat(peso);
    const r = parseInt(reps);
    const scoreRPE = parseFloat(rpe);

    if (!p || !r || p <= 0 || r <= 0) return 0;

    // Repeticiones equivalentes ajustadas por RPE (Reps realizadas + Reps en reserva)
    const repsTeoricas = r + (10 - scoreRPE);

    if (repsTeoricas === 1) return Math.round(p);

    let rmEstimado = 0;

    switch (formula) {
      case 'brzycki': {
        // Brzycki acotado a 12 reps para seguridad
        const repsLim = Math.min(repsTeoricas, 12);
        rmEstimado = p / (1.0278 - 0.0278 * repsLim);
        break;
      }
      case 'epley': {
        rmEstimado = p * (1 + repsTeoricas / 30);
        break;
      }
      case 'lander': {
        rmEstimado = (100 * p) / (101.3 - 2.6712 * repsTeoricas);
        break;
      }
      case 'wathan': {
        rmEstimado = (100 * p) / (48.8 + 53.8 * Math.exp(-0.075 * repsTeoricas));
        break;
      }
      case 'lombardi': {
        rmEstimado = p * Math.pow(repsTeoricas, 0.10);
        break;
      }
      default:
        rmEstimado = p / (1.0278 - 0.0278 * Math.min(repsTeoricas, 12));
    }

    return Math.round(rmEstimado);
  };

  const unRepMax = calcular1RM();
  const porcentajes = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

  // Cálculo inverso unificado de Peso para N Repeticiones
  const obtenerPesoParaReps = (rm: number, repCount: number): number => {
    if (repCount === 1) return rm;
    const factorInverso = 1.0278 - 0.0278 * repCount;
    return Math.round(rm * Math.max(factorInverso, 0.5));
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div className="card-premium">
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: 'white' }}>
          Calculadora de 1RM
        </h3>

        {/* Formulario de Entrada */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Peso Levantado (kg/lbs)
            </label>
            <input
              type="number"
              placeholder="Ej: 100"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                Repeticiones
              </label>
              <input
                type="number"
                min="1"
                max="12"
                placeholder="1-12"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                Esfuerzo (RPE)
              </label>
              <select
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', height: '43px', padding: '10px' }}
              >
                <option value="10">@10 (Máximo)</option>
                <option value="9.5">@9.5 (1 rep más en duda)</option>
                <option value="9">@9 (1 rep en reserva)</option>
                <option value="8.5">@8.5 (1-2 en reserva)</option>
                <option value="8">@8 (2 reps en reserva)</option>
                <option value="7.5">@7.5 (2-3 en reserva)</option>
                <option value="7">@7 (3 reps en reserva)</option>
              </select>
            </div>
          </div>

          {/* Selector de Fórmula Opcional */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setMostrarOpcionesFormula(!mostrarOpcionesFormula)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-indigo)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '4px 0'
              }}
            >
              <span>Fórmula: <strong style={{ color: 'white', textTransform: 'capitalize' }}>{formula}</strong> (Predeterminada)</span>
              <span>{mostrarOpcionesFormula ? '▲ Ocultar' : '▼ Cambiar'}</span>
            </button>

            {mostrarOpcionesFormula && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {FORMULAS.map((f) => {
                  const seleccionada = formula === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormula(f.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: seleccionada ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                        backgroundColor: seleccionada ? 'rgba(99, 102, 241, 0.12)' : '#0b0b0d',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: seleccionada ? 'var(--accent-indigo)' : 'white' }}>
                          {f.nombre}
                        </span>
                        {seleccionada && <span style={{ fontSize: '10px', color: 'var(--accent-indigo)', fontWeight: 'bold' }}>✓ Activa</span>}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {f.descripcion}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Resultado Principal */}
      {unRepMax > 0 && (
        <div style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-indigo-hover))', padding: '20px 16px', borderRadius: '14px', textAlign: 'center', boxShadow: 'var(--shadow-premium)' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.08em', color: '#e0e7ff', margin: '0 0 4px 0' }}>
            1RM Estimado ({FORMULAS.find(f => f.id === formula)?.nombre})
          </p>
          <p style={{ fontSize: '38px', fontWeight: '900', color: 'white', margin: 0 }}>
            {unRepMax} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#c7d2fe' }}>kg/lbs</span>
          </p>
        </div>
      )}

      {/* Tabla de Intensidades */}
      {unRepMax > 0 && (
        <div className="card-premium">
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
            Tabla de Intensidades (Porcentajes)
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
            {porcentajes.map((pct) => {
              const pesoPorcentaje = Math.round((unRepMax * pct) / 100);
              return (
                <div 
                  key={pct} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0b0d', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {pct}% de tu RM
                  </span>
                  <span style={{ fontWeight: '900', fontSize: '14px', color: 'white' }}>
                    {pesoPorcentaje} kg/lbs
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabla de Repeticiones Estimadas */}
      {unRepMax > 0 && (
        <div className="card-premium">
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
            Repeticiones Estimadas a RPE 10
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((repCount) => {
              const pesoEstimado = obtenerPesoParaReps(unRepMax, repCount);
              const pctEquivalent = Math.round((pesoEstimado / unRepMax) * 100);

              return (
                <div 
                  key={repCount} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0b0d', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {repCount} {repCount === 1 ? 'rep' : 'reps'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      ~{pctEquivalent}%
                    </span>
                    <span style={{ fontWeight: '900', fontSize: '14px', color: 'white' }}>
                      {pesoEstimado} kg/lbs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}