import React, { createContext, useContext, useState, useEffect } from 'react';

interface RestTimerContextType {
  tiempoRestante: number;
  tiempoTotal: number;
  activo: boolean;
  ejercicioNombre: string;
  iniciarTemporizador: (segundos: number, ejercicio?: string) => void;
  pausarTemporizador: () => void;
  reanudarTemporizador: () => void;
  detenerTemporizador: () => void;
  agregarTiempo: (segundos: number) => void;
}

const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [tiempoTotal, setTiempoTotal] = useState<number>(0);
  const [activo, setActivo] = useState<boolean>(false);
  const [ejercicioNombre, setEjercicioNombre] = useState<string>('Descanso');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activo && tiempoRestante > 0) {
      interval = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);
    } else if (tiempoRestante === 0 && activo) {
      setActivo(false);
      // Notificación sonora o vibración opcional al terminar
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activo, tiempoRestante]);

  const iniciarTemporizador = (segundos: number, ejercicio: string = 'Descanso') => {
    setTiempoTotal(segundos);
    setTiempoRestante(segundos);
    setEjercicioNombre(ejercicio);
    setActivo(true);
  };

  const pausarTemporizador = () => setActivo(false);
  const reanudarTemporizador = () => {
    if (tiempoRestante > 0) setActivo(true);
  };

  const detenerTemporizador = () => {
    setActivo(false);
    setTiempoRestante(0);
  };

  const agregarTiempo = (segundos: number) => {
    setTiempoRestante((prev) => Math.max(0, prev + segundos));
    setTiempoTotal((prev) => prev + segundos);
  };

  return (
    <RestTimerContext.Provider
      value={{
        tiempoRestante,
        tiempoTotal,
        activo,
        ejercicioNombre,
        iniciarTemporizador,
        pausarTemporizador,
        reanudarTemporizador,
        detenerTemporizador,
        agregarTiempo,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
};

export const useRestTimer = () => {
  const context = useContext(RestTimerContext);
  if (!context) {
    throw new Error('useRestTimer debe usarse dentro de un RestTimerProvider');
  }
  return context;
};