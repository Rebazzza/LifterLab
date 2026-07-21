import React, { useState } from 'react';
import VisualizadorBarra from './VisualizadorBarra';

const DISCOS_DISPONIBLES = [
  { peso: 25, colorHex: '#dc2626', nombre: '25 kg' },
  { peso: 20, colorHex: '#2563eb', nombre: '20 kg' },
  { peso: 15, colorHex: '#eab308', nombre: '15 kg' },
  { peso: 10, colorHex: '#16a34a', nombre: '10 kg' },
  { peso: 5, colorHex: '#f97316',  nombre: '5 kg' },
  { peso: 2.5, colorHex: '#71717a', nombre: '2.5 kg' },
  { peso: 1.25, colorHex: '#e4e4e7', nombre: '1.25 kg' },
];

export default function CalculadoraDiscos() {
  const [pesoObjetivo, setPesoObjetivo] = useState<string>('');
  const [pesoBarra, setPesoBarra] = useState<number>(20);
  const [usaSeguroCompetencia, setUsaSeguroCompetencia] = useState<boolean>(false);

  const calcularDiscosPorLado = () => {
    const total = parseFloat(pesoObjetivo);
    const pesoMinimo = pesoBarra + (usaSeguroCompetencia ? 5 : 0);
    
    if (!total || total <= pesoMinimo) return [];

    let pesoRestantePorLado = (total - pesoBarra) / 2;
    if (usaSeguroCompetencia) {
      pesoRestantePorLado -= 2.5;
    }

    const resultado: { disco: typeof DISCOS_DISPONIBLES[0]; cantidad: number }[] = [];

    for (const disco of DISCOS_DISPONIBLES) {
      if (pesoRestantePorLado >= disco.peso) {
        const cantidad = Math.floor(pesoRestantePorLado / disco.peso);
        resultado.push({ disco, cantidad });
        pesoRestantePorLado = Number((pesoRestantePorLado - cantidad * disco.peso).toFixed(2));
      }
    }

    return resultado;
  };

  const discosPorLado = calcularDiscosPorLado();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div className="card-premium">
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px', color: 'white' }}>
          Distribución de Discos
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Peso Objetivo */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Peso Total Objetivo (kg)
            </label>
            <input
              type="number"
              placeholder="Ej: 140"
              value={pesoObjetivo}
              onChange={(e) => setPesoObjetivo(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }}
            />
          </div>

          {/* Peso Barra */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Peso de la Barra
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[15, 20, 25].map((peso) => (
                <button
                  key={peso}
                  type="button"
                  onClick={() => setPesoBarra(peso)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: pesoBarra === peso ? 'var(--accent-indigo)' : 'var(--bg-card)',
                    color: pesoBarra === peso ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {peso} kg
                </button>
              ))}
            </div>
          </div>

          {/* Switch de Ganchos */}
          <div 
            onClick={() => setUsaSeguroCompetencia(!usaSeguroCompetencia)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0b0b0d',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', margin: 0 }}>Ganchos de Competencia (IPF)</p>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>Suma 2.5 kg fijos por cada lado (5 kg total)</p>
            </div>
            
            <div style={{
              width: '40px',
              height: '22px',
              backgroundColor: usaSeguroCompetencia ? 'var(--accent-emerald)' : 'var(--text-muted)',
              borderRadius: '999px',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '3px',
                left: usaSeguroCompetencia ? '21px' : '3px',
                transition: 'left 0.2s'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {discosPorLado.length > 0 ? (
        <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', margin: 0 }}>
            Cargar por cada lado de la barra:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {usaSeguroCompetencia && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0b0d', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--accent-amber)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#eab308',
                    color: 'black'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'white' }}>Seguro IPF (2.5 kg)</span>
                </div>
                <span style={{ fontWeight: '900', fontSize: '15px', color: 'var(--accent-amber)' }}>x1</span>
              </div>
            )}

            {discosPorLado.map(({ disco, cantidad }) => (
              <div key={disco.peso} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0b0d', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '10px',
                    backgroundColor: disco.colorHex,
                    color: disco.peso === 1.25 || disco.peso === 5 ? 'black' : 'white',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    {disco.peso}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'white' }}>Disco de {disco.nombre}</span>
                </div>
                <span style={{ fontWeight: '900', fontSize: '15px', color: 'var(--accent-indigo)' }}>x{cantidad}</span>
              </div>
            ))}
          </div>

          <VisualizadorBarra discos={discosPorLado} usaSeguro={usaSeguroCompetencia} />
        </div>
      ) : (
        pesoObjetivo && parseFloat(pesoObjetivo) <= (pesoBarra + (usaSeguroCompetencia ? 5 : 0)) && (
          <div className="card-premium" style={{ textAlign: 'center', padding: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent-red)', fontWeight: 'bold', margin: 0 }}>
              El peso debe superar el peso base ({pesoBarra + (usaSeguroCompetencia ? 5 : 0)} kg).
            </p>
          </div>
        )
      )}

    </div>
  );
}