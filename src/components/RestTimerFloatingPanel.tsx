import React from 'react';
import { useRestTimer } from '../context/RestTimerContext';

export default function RestTimerFloatingPanel() {
  const {
    tiempoRestante,
    tiempoTotal,
    activo,
    ejercicioNombre,
    pausarTemporizador,
    reanudarTemporizador,
    detenerTemporizador,
    agregarTiempo,
  } = useRestTimer();

  if (tiempoRestante <= 0) return null;

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const tiempoFormateado = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  const porcentajeProgreso = ((tiempoTotal - tiempoRestante) / tiempoTotal) * 100;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '72px', // Posicionado justo arriba de la barra de navegación inferior
        left: '12px',
        right: '12px',
        backgroundColor: '#18181b',
        border: '1px solid var(--accent-indigo)',
        borderRadius: '14px',
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Barra de progreso superior */}
      <div
        style={{
          height: '3px',
          width: '100%',
          backgroundColor: '#27272a',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${porcentajeProgreso}%`,
            backgroundColor: 'var(--accent-indigo)',
            transition: 'width 1s linear',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              color: 'var(--accent-indigo)',
              letterSpacing: '0.05em',
            }}
          >
            ⏱️ {ejercicioNombre}
          </span>
          <p style={{ fontSize: '20px', fontWeight: '900', color: 'white', margin: 0 }}>
            {tiempoFormateado}
          </p>
        </div>

        {/* Botones de Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => agregarTiempo(30)}
            style={{
              backgroundColor: '#27272a',
              border: '1px solid var(--border-subtle)',
              color: 'white',
              borderRadius: '8px',
              padding: '6px 8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            +30s
          </button>

          <button
            type="button"
            onClick={activo ? pausarTemporizador : reanudarTemporizador}
            style={{
              backgroundColor: activo ? '#3f3f46' : 'var(--accent-indigo)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {activo ? 'Pausa' : 'Seguir'}
          </button>

          <button
            type="button"
            onClick={detenerTemporizador}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-red)',
              color: 'var(--accent-red)',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}