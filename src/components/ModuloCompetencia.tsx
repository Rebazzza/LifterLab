import React, { useState } from 'react';
import ModalCalculadoraDiscos from './ModalCalculadoraDiscos';
import { BarbellIcon } from './Icons';

type EstadoIntento = 'pendiente' | 'valido' | 'nulo';
type Genero = 'masculino' | 'femenino';
type MotivoNulo = 'fuerza' | 'comando' | 'tecnica';

interface Intento {
  peso: string;
  rpe: string;
  estado: EstadoIntento;
  motivoNulo?: MotivoNulo;
}

interface LevantamientoComp {
  intento1: Intento;
  intento2: Intento;
  intento3: Intento;
  rackHeight?: string;
}

export default function ModuloCompetencia() {
  const [pesoCorporal, setPesoCorporal] = useState<string>('74');
  const [genero, setGenero] = useState<Genero>('masculino');

  const [squat, setSquat] = useState<LevantamientoComp>({
    intento1: { peso: '', rpe: '8', estado: 'pendiente' },
    intento2: { peso: '', rpe: '9', estado: 'pendiente' },
    intento3: { peso: '', rpe: '10', estado: 'pendiente' },
    rackHeight: ''
  });

  const [bench, setBench] = useState<LevantamientoComp>({
    intento1: { peso: '', rpe: '8', estado: 'pendiente' },
    intento2: { peso: '', rpe: '9', estado: 'pendiente' },
    intento3: { peso: '', rpe: '10', estado: 'pendiente' },
    rackHeight: ''
  });

  const [deadlift, setDeadlift] = useState<LevantamientoComp>({
    intento1: { peso: '', rpe: '8', estado: 'pendiente' },
    intento2: { peso: '', rpe: '9', estado: 'pendiente' },
    intento3: { peso: '', rpe: '10', estado: 'pendiente' }
  });

  const [pesoModalDiscos, setPesoModalDiscos] = useState<number | null>(null);

  // Redondeo obligatorio a múltiplos de 2.5 kg (Regla IPF)
  const redondear25 = (val: number): number => Math.round(val / 2.5) * 2.5;

  // Algoritmo de Sugerencia
  const calcularSiguientePeso = (intentoActual: Intento, numSiguiente: 2 | 3): number | null => {
    const p = parseFloat(intentoActual.peso);
    const rpe = parseFloat(intentoActual.rpe) || 8;

    if (!p || p <= 0 || intentoActual.estado === 'pendiente') return null;

    // Caso NULO 🔴
    if (intentoActual.estado === 'nulo') {
      if (intentoActual.motivoNulo === 'comando' && rpe <= 8.5) {
        return redondear25(p + 2.5); // Subida leve si fue error de juez pero el peso voló
      }
      return p; // Repetir peso si fue falta de fuerza o técnica pesada
    }

    // Caso VÁLIDO 🟢
    // Calcular e1RM estimado del intento
    const e1RM = p / (1.0278 - 0.0278 * (1 + (10 - rpe)));

    let porcentajeIncremento = 0.03; // Base del 3%

    if (numSiguiente === 2) {
      if (rpe <= 7) porcentajeIncremento = 0.065;      // Salto veloz
      else if (rpe <= 8) porcentajeIncremento = 0.05;  // Salto estándar de Opener
      else if (rpe <= 9) porcentajeIncremento = 0.035; // Salto medido
      else porcentajeIncremento = 0.015;               // Salto de 2.5kg
    } else if (numSiguiente === 3) {
      if (rpe <= 7.5) porcentajeIncremento = 0.04;
      else if (rpe <= 8.5) porcentajeIncremento = 0.025;
      else if (rpe <= 9.5) porcentajeIncremento = 0.015;
      else porcentajeIncremento = 0; // Se mantiene si tocó el techo en el 2º
    }

    const sugerido = p + (e1RM * porcentajeIncremento);
    return Math.max(p + 2.5, redondear25(sugerido));
  };

  const obtenerMejorMarca = (lev: LevantamientoComp): number => {
    let max = 0;
    if (lev.intento3.estado === 'valido') max = Math.max(max, parseFloat(lev.intento3.peso) || 0);
    if (lev.intento2.estado === 'valido') max = Math.max(max, parseFloat(lev.intento2.peso) || 0);
    if (lev.intento1.estado === 'valido') max = Math.max(max, parseFloat(lev.intento1.peso) || 0);
    return max;
  };

  const mejorSquat = obtenerMejorMarca(squat);
  const mejorBench = obtenerMejorMarca(bench);
  const mejorDeadlift = obtenerMejorMarca(deadlift);
  const totalPowerlifting = mejorSquat + mejorBench + mejorDeadlift;

  const calcularPuntosDOTS = (): number => {
    const bw = parseFloat(pesoCorporal);
    if (!bw || bw <= 0 || totalPowerlifting <= 0) return 0;

    let a = -307.75376, b = 24.0900756, c = -0.19187592, d = 0.0007391293, e = -0.000001093;
    if (genero === 'femenino') {
      a = -57.96288; b = 13.6175032; c = -0.11266554; d = 0.0005158568; e = -0.0000010706;
    }

    const den = a + (b * bw) + (c * Math.pow(bw, 2)) + (d * Math.pow(bw, 3)) + (e * Math.pow(bw, 4));
    return Math.round(totalPowerlifting * (500 / den) * 100) / 100;
  };

  const renderTarjetaLevantamiento = (
    titulo: string,
    colorAccento: string,
    movKey: 'squat' | 'bench' | 'deadlift',
    datos: LevantamientoComp,
    setter: React.Dispatch<React.SetStateAction<LevantamientoComp>>
  ) => {
    const mejorMarca = obtenerMejorMarca(datos);

    // Auto-sugerencias en tiempo real
    const sug2 = calcularSiguientePeso(datos.intento1, 2);
    const sug3 = calcularSiguientePeso(datos.intento2, 3);

    return (
      <div className="card-premium" style={{ borderLeft: `4px solid ${colorAccento}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'white' }}>{titulo}</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Mejor Válido: <strong style={{ color: colorAccento }}>{mejorMarca > 0 ? `${mejorMarca} kg` : 'Sin marca'}</strong>
            </span>
          </div>

          {movKey !== 'deadlift' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Soporte:</span>
              <input
                type="text"
                placeholder="Ej: 12"
                value={datos.rackHeight || ''}
                onChange={(e) => setter({ ...datos, rackHeight: e.target.value })}
                style={{ width: '45px', padding: '4px', fontSize: '11px', textAlign: 'center', borderRadius: '6px' }}
              />
            </div>
          )}
        </div>

        {/* Intentos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(['intento1', 'intento2', 'intento3'] as const).map((num, idx) => {
            const item = datos[num];
            const esValido = item.estado === 'valido';
            const esNulo = item.estado === 'nulo';
            const sugerido = idx === 1 ? sug2 : idx === 2 ? sug3 : null;

            return (
              <div
                key={num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#0b0b0d',
                  padding: '10px',
                  borderRadius: '10px',
                  border: esValido
                    ? '1px solid var(--accent-emerald)'
                    : esNulo
                    ? '1px solid var(--accent-red)'
                    : '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                      {idx + 1}º
                    </span>
                    <input
                      type="number"
                      placeholder="kg"
                      value={item.peso}
                      onChange={(e) => {
                        const val = e.target.value;
                        setter(prev => ({
                          ...prev,
                          [num]: { ...prev[num], peso: val }
                        }));
                      }}
                      style={{ width: '80px', fontSize: '15px', fontWeight: 'bold', padding: '4px 6px', borderRadius: '6px' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>kg</span>

                    {/* Botón de Aplicar Sugerencia Inteligente */}
                    {sugerido && item.estado === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => setter(prev => ({ ...prev, [num]: { ...prev[num], peso: sugerido.toString() } }))}
                        style={{
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid var(--accent-indigo)',
                          color: 'var(--accent-indigo)',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        💡 Sugerir {sugerido} kg
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {parseFloat(item.peso) > 0 && (
                      <button
                        type="button"
                        onClick={() => setPesoModalDiscos(parseFloat(item.peso))}
                        style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--border-subtle)', border: 'none', color: 'white', cursor: 'pointer' }}
                      >
                        <BarbellIcon size={12} color="white" />
                      </button>
                    )}

                    {/* Selector de Estado */}
                    <button
                      type="button"
                      onClick={() => {
                        const proxEstado: EstadoIntento = item.estado === 'pendiente' ? 'valido' : item.estado === 'valido' ? 'nulo' : 'pendiente';
                        setter(prev => ({ ...prev, [num]: { ...prev[num], estado: proxEstado } }));
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: esValido ? 'var(--accent-emerald)' : esNulo ? 'var(--accent-red)' : '#27272a',
                        color: 'white'
                      }}
                    >
                      {esValido ? '🟢 VÁLIDO' : esNulo ? '🔴 NULO' : '⚪ PENDIENTE'}
                    </button>
                  </div>
                </div>

                {/* Fila de Sensaciones (RPE y Motivo) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Sensación (RPE):</span>
                    <select
                      value={item.rpe}
                      onChange={(e) => {
                        const val = e.target.value;
                        setter(prev => ({ ...prev, [num]: { ...prev[num], rpe: val } }));
                      }}
                      style={{ fontSize: '11px', padding: '2px 4px', borderRadius: '4px', height: '26px' }}
                    >
                      <option value="6">@6 (Muy fácil)</option>
                      <option value="7">@7 (Velocidad alta)</option>
                      <option value="8">@8 (2 reps reserva)</option>
                      <option value="8.5">@8.5 (1-2 en reserva)</option>
                      <option value="9">@9 (1 rep reserva)</option>
                      <option value="9.5">@9.5 (Límite dudoso)</option>
                      <option value="10">@10 (Máximo total)</option>
                    </select>
                  </div>

                  {esNulo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-red)', fontWeight: 'bold' }}>Fallo:</span>
                      <select
                        value={item.motivoNulo || 'fuerza'}
                        onChange={(e) => {
                          const val = e.target.value as MotivoNulo;
                          setter(prev => ({ ...prev, [num]: { ...prev[num], motivoNulo: val } }));
                        }}
                        style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '4px', height: '26px' }}
                      >
                        <option value="fuerza">Fuerza / Pesado</option>
                        <option value="comando">Comando de Juez</option>
                        <option value="tecnica">Técnico / Postura</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {pesoModalDiscos !== null && (
        <ModalCalculadoraDiscos pesoKg={pesoModalDiscos} onCerrar={() => setPesoModalDiscos(null)} />
      )}

      <div className="card-premium">
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'white', marginBottom: '12px', textAlign: 'center' }}>
    Planificador Estratégico de Competencia
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Peso Corporal (kg)
            </label>
            <input type="number" value={pesoCorporal} onChange={(e) => setPesoCorporal(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Categoría
            </label>
            <select value={genero} onChange={(e) => setGenero(e.target.value as Genero)} style={{ width: '100%', boxSizing: 'border-box', height: '40px' }}>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#09090b', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Oficial</span>
            <p style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: '2px 0 0 0' }}>{totalPowerlifting} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>kg</span></p>
          </div>
          <div>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Puntos DOTS</span>
            <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-indigo)', margin: '2px 0 0 0' }}>{calcularPuntosDOTS()}</p>
          </div>
        </div>
      </div>

      {renderTarjetaLevantamiento('Squat (Sentadilla)', '#dc2626', 'squat', squat, setSquat)}
      {renderTarjetaLevantamiento('Bench Press (Banca)', '#2563eb', 'bench', bench, setBench)}
      {renderTarjetaLevantamiento('Deadlift (Peso Muerto)', '#16a34a', 'deadlift', deadlift, setDeadlift)}
    </div>
  );
}