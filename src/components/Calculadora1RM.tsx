import React, { useState } from 'react';

export default function Calculadora1RM() {
  const [peso, setPeso] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [rpe, setRpe] = useState<string>('10');

  // Función Eficaz para calcular el 1RM
  const calcular1RM = (): number => {
    const p = parseFloat(peso);
    const r = parseInt(reps);
    const scoreRPE = parseFloat(rpe);

    if (!p || !r || p <= 0 || r <= 0) return 0;

    // Repeticiones equivalentes a RPE 10 (Reps completadas + Reps en reserva)
    const repsTeoricas = r + (10 - scoreRPE);

    // Si es 1 rep a RPE 10, el 1RM es exactamente el peso levantado
    if (repsTeoricas === 1) return Math.round(p);

    // Brzycki Limitado: Si las reps teóricas son muy altas (> 12), usamos una curva de decaimiento segura
    // Fórmula Brzycki: 1RM = Peso / (1.0278 - (0.0278 * Reps))
    const factorBrzycki = 1.0278 - 0.0278 * Math.min(repsTeoricas, 12);
    
    return Math.round(p / factorBrzycki);
  };

  const unRepMax = calcular1RM();
  const porcentajes = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

  // Cálculo inverso unificado de Peso para N Repeticiones a RPE 10
  const obtenerPesoParaReps = (rm: number, repCount: number): number => {
    if (repCount === 1) return rm;
    const factorInverso = 1.0278 - 0.0278 * repCount;
    return Math.round(rm * Math.max(factorInverso, 0.5)); // Limitar a un mínimo del 50%
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div className="card-premium">
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: 'white' }}>
          Calculadora de 1RM
        </h3>

        {/* Formulario */}
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
        </div>
      </div>

      {/* Resultado Principal */}
      {unRepMax > 0 && (
        <div style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-indigo-hover))', padding: '20px 16px', borderRadius: '14px', textAlign: 'center', boxShadow: 'var(--shadow-premium)' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.08em', color: '#e0e7ff', margin: '0 0 4px 0' }}>
            1RM Estimado
          </p>
          <p style={{ fontSize: '38px', fontWeight: '900', color: 'white', margin: 0 }}>
            {unRepMax} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#c7d2fe' }}>kg/lbs</span>
          </p>
        </div>
      )}

      {/* Tabla 1: Porcentajes Directos del 1RM */}
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

      {/* Tabla 2: Repeticiones Máximas Estimadas (RPE 10) */}
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