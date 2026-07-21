import React, { useState } from 'react';
import Calculadora1RM from './Calculadora1RM';
import CalculadoraDiscos from './CalculadoraDiscos';
import CalculadoraAproximacion from './CalculadoraAproximacion';

export default function Herramientas() {
  const [subTab, setSubTab] = useState<'1rm' | 'discos' | 'aproximacion'>('1rm');

  return (
    <div className="fade-in" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Selector de Herramientas (Sub-pestañas estilizadas) */}
      <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setSubTab('1rm')}
          style={{
            flex: 1,
            padding: '8px 2px',
            borderRadius: '7px',
            fontSize: '11px',
            fontWeight: 'bold',
            backgroundColor: subTab === '1rm' ? 'var(--accent-indigo)' : 'transparent',
            color: subTab === '1rm' ? 'white' : 'var(--text-secondary)'
          }}
        >
          1RM
        </button>
        <button
          onClick={() => setSubTab('discos')}
          style={{
            flex: 1,
            padding: '8px 2px',
            borderRadius: '7px',
            fontSize: '11px',
            fontWeight: 'bold',
            backgroundColor: subTab === 'discos' ? 'var(--accent-indigo)' : 'transparent',
            color: subTab === 'discos' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Discos
        </button>
        <button
          onClick={() => setSubTab('aproximacion')}
          style={{
            flex: 1,
            padding: '8px 2px',
            borderRadius: '7px',
            fontSize: '11px',
            fontWeight: 'bold',
            backgroundColor: subTab === 'aproximacion' ? 'var(--accent-indigo)' : 'transparent',
            color: subTab === 'aproximacion' ? 'white' : 'var(--text-secondary)'
          }}
        >
          Calentamiento
        </button>
      </div>

      {/* Renderizado Dinámico */}
      {subTab === '1rm' && <Calculadora1RM />}
      {subTab === 'discos' && <CalculadoraDiscos />}
      {subTab === 'aproximacion' && <CalculadoraAproximacion />}

    </div>
  );
}
