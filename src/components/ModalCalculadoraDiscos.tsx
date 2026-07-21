import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface ModalCalculadoraDiscosProps {
  pesoKg: number;
  onCerrar: () => void;
}

interface DiscoConfig {
  peso: number;
  color: string;
  altura: number;
  ancho: number;
  textoColor?: string;
}

export default function ModalCalculadoraDiscos({ pesoKg, onCerrar }: ModalCalculadoraDiscosProps) {
  const [pesoBarra, setPesoBarra] = useState<number>(20);
  const [usarSeguros, setUsarSeguros] = useState<boolean>(false);
  const [pesoSeguroPorLado, setPesoSeguroPorLado] = useState<number>(2.5);

  const discosDisponibles: DiscoConfig[] = [
    { peso: 25, color: '#dc2626', altura: 76, ancho: 12 },
    { peso: 20, color: '#2563eb', altura: 76, ancho: 10 },
    { peso: 15, color: '#eab308', altura: 68, ancho: 9, textoColor: '#000' },
    { peso: 10, color: '#16a34a', altura: 60, ancho: 8 },
    { peso: 5, color: '#f97316', altura: 50, ancho: 7 },
    { peso: 2.5, color: '#71717a', altura: 42, ancho: 6 },
    { peso: 1.25, color: '#e4e4e7', altura: 34, ancho: 5, textoColor: '#000' },
    { peso: 0.5, color: '#3f3f46', altura: 28, ancho: 4 }
  ];

  const pesoBaseTotal = pesoBarra + (usarSeguros ? pesoSeguroPorLado * 2 : 0);

  const calcularDiscosPorLado = () => {
    let pesoPorLado = (pesoKg - pesoBaseTotal) / 2;
    if (pesoPorLado <= 0) return [];

    const resultado: { disco: DiscoConfig; cantidad: number }[] = [];

    for (const disco of discosDisponibles) {
      if (pesoPorLado >= disco.peso) {
        const cantidad = Math.floor(pesoPorLado / disco.peso);
        resultado.push({ disco, cantidad });
        pesoPorLado -= cantidad * disco.peso;
        pesoPorLado = Math.round(pesoPorLado * 100) / 100;
      }
    }

    return resultado;
  };

  const discosCalculados = calcularDiscosPorLado();
  const pesoDiscosTotal = discosCalculados.reduce((acc, item) => acc + item.disco.peso * item.cantidad * 2, 0);
  const pesoAlcanzado = pesoBaseTotal + pesoDiscosTotal;

  const listaDiscosParaDibujar: DiscoConfig[] = [];
  discosCalculados.forEach((item) => {
    for (let i = 0; i < item.cantidad; i++) {
      listaDiscosParaDibujar.push(item.disco);
    }
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
      <div className="card-premium" style={{ width: '100%', maxWidth: '400px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Cargar Barra</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Objetivo: <strong style={{ color: 'white' }}>{pesoKg} kg</strong></span>
          </div>
          <button onClick={onCerrar} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Peso Barra */}
        <div style={{ backgroundColor: '#0b0b0d', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Peso Barra:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[15, 20, 25].map((p) => (
              <button
                key={p}
                onClick={() => setPesoBarra(p)}
                style={{
                  backgroundColor: pesoBarra === p ? 'var(--accent-indigo)' : 'var(--bg-card)',
                  color: 'white',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                {p} kg
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Seguros */}
        <div style={{ backgroundColor: '#0b0b0d', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: 'inline' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Seguros ({pesoSeguroPorLado * 2} kg):
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {usarSeguros && (
              <select
                value={pesoSeguroPorLado}
                onChange={(e) => setPesoSeguroPorLado(Number(e.target.value))}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '11px', padding: '2px 4px', borderRadius: '4px', height: '26px' }}
              >
                <option value={2.5}>2.5 kg c/u</option>
                <option value={0.5}>0.5 kg c/u</option>
              </select>
            )}
            <button
              onClick={() => setUsarSeguros(!usarSeguros)}
              style={{
                backgroundColor: usarSeguros ? 'var(--accent-emerald)' : 'var(--text-muted)',
                color: 'white',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              {usarSeguros ? 'SÍ' : 'NO'}
            </button>
          </div>
        </div>

        {/* Barra Gráfica */}
        <div style={{ backgroundColor: '#000', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '20px 10px 12px 10px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90px' }}>
            <div style={{ width: '6px', height: '40px', backgroundColor: '#52525b', borderRadius: '2px 0 0 2px' }}></div>
            <div style={{ width: '12px', height: '16px', backgroundColor: '#a1a1aa' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {listaDiscosParaDibujar.length > 0 ? (
                listaDiscosParaDibujar.map((disco, idx) => (
                  <div
                    key={idx}
                    title={`${disco.peso} kg`}
                    style={{
                      width: `${disco.ancho}px`,
                      height: `${disco.altura}px`,
                      backgroundColor: disco.color,
                      borderRadius: '3px',
                      border: '1px solid rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span style={{ writingMode: 'vertical-lr', fontSize: '8px', fontWeight: 'bold', color: disco.textoColor || '#fff', userSelect: 'none' }}>
                      {disco.peso}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '6px' }}>Sin discos</div>
              )}
            </div>

            {usarSeguros ? (
              <div
                title="Seguro"
                style={{
                  width: '10px',
                  height: '32px',
                  backgroundColor: '#eab308',
                  borderRadius: '3px',
                  marginLeft: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #ca8a04'
                }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'black' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
            ) : (
              <div style={{ width: '20px', height: '14px', backgroundColor: '#71717a', borderRadius: '0 4px 4px 0' }}></div>
            )}
          </div>
        </div>

        {/* Desglose Detallado */}
        {pesoKg < pesoBaseTotal ? (
          <p style={{ color: 'var(--accent-red)', fontSize: '12px', textAlign: 'center', margin: '6px 0' }}>
            El peso objetivo es menor al equipo base ({pesoBaseTotal} kg).
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cargar por lado:</span>
            {discosCalculados.map(({ disco, cantidad }) => (
              <div key={disco.peso} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0b0d', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: disco.color }}></div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{disco.peso} kg</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-indigo)' }}>x{cantidad}</span>
              </div>
            ))}
            {usarSeguros && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0b0b0d', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--accent-amber)' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ display: 'inline' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  Seguro ({pesoSeguroPorLado} kg)
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-amber)' }}>x1</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Carga Alcanzada:</span>
          <span style={{ fontWeight: '950', color: pesoAlcanzado === pesoKg ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontSize: '15px' }}>
            {pesoAlcanzado} kg
          </span>
        </div>

      </div>
    </div>
  );
}