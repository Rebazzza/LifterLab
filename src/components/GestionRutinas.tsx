import React, { useState, useEffect, useMemo } from 'react';
import { db, Ejercicio, Rutina, EjercicioRutinaGuardado } from '../db/db';
import { SearchIcon, ChevronDownIcon, PlusIcon, TrashIcon, SaveIcon, ClipboardIcon, XIcon, PlayIcon } from './Icons';

interface Serie {
  peso: string;
  reps: string;
  rpe: string;
  porcentaje: string;
  usaRpe: boolean;
}

interface EjercicioSeleccionado {
  ejercicioId: number;
  nombre: string;
  categoria: string;
  esConBarra: boolean;
  usaRpe: boolean;
  series: Serie[];
}

interface GestionRutinasProps {
  onIniciarSesion: (rutina: Rutina, ejercicios: EjercicioRutinaGuardado[]) => void;
}

const CATEGORIAS = ['Sentadilla', 'Press de Banca', 'Peso Muerto', 'Accesorio'] as const;

const CATEGORIA_COLORS: Record<string, string> = {
  'Sentadilla': '#ef4444',
  'Press de Banca': '#6366f1',
  'Peso Muerto': '#d97706',
  'Accesorio': '#10b981'
};

export default function GestionRutinas({ onIniciarSesion }: GestionRutinasProps) {
  const [nombreRutina, setNombreRutina] = useState<string>('');
  const [catalogo, setCatalogo] = useState<Ejercicio[]>([]);
  const [ejercicios, setEjercicios] = useState<EjercicioSeleccionado[]>([]);
  const [rutinasGuardadas, setRutinasGuardadas] = useState<Rutina[]>([]);

  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriasAbiertas, setCategoriasAbiertas] = useState<Record<string, boolean>>({});
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [mostrarCatalogo, setMostrarCatalogo] = useState<boolean>(false);

  useEffect(() => {
    cargarDatosBD();
  }, []);

  const cargarDatosBD = async () => {
    try {
      const listaEjercicios = await db.ejercicios.toArray();
      const listaRutinas = await db.rutinas.toArray();
      setCatalogo(listaEjercicios);
      setRutinasGuardadas(listaRutinas);
    } catch (error) {
      console.error('Error al acceder a IndexedDB:', error);
    }
  };

  const catalogoFiltrado = useMemo(() => {
    let resultado = catalogo;
    if (filtroCategoria) {
      resultado = resultado.filter(ej => ej.categoria === filtroCategoria);
    }
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      resultado = resultado.filter(ej => ej.nombre.toLowerCase().includes(term));
    }
    return resultado;
  }, [catalogo, busqueda, filtroCategoria]);

  const catalogoPorCategoria = useMemo(() => {
    const map: Record<string, Ejercicio[]> = {};
    CATEGORIAS.forEach(cat => { map[cat] = []; });
    catalogoFiltrado.forEach(ej => {
      if (map[ej.categoria]) map[ej.categoria].push(ej);
    });
    return map;
  }, [catalogoFiltrado]);

  const toggleCategoria = (cat: string) => {
    setCategoriasAbiertas(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const agregarEjercicio = (ejercicio: Ejercicio) => {
    if (!ejercicio.id) return;
    const nuevoEjercicio: EjercicioSeleccionado = {
      ejercicioId: ejercicio.id,
      nombre: ejercicio.nombre,
      categoria: ejercicio.categoria,
      esConBarra: ejercicio.esConBarra,
      usaRpe: false,
      series: [{ peso: '', reps: '', rpe: '', porcentaje: '', usaRpe: false }]
    };
    setEjercicios([...ejercicios, nuevoEjercicio]);
    setMostrarCatalogo(false);
    setBusqueda('');
    setFiltroCategoria(null);
  };

  const agregarSerie = (ejercicioIndex: number) => {
    const nuevosEjercicios = [...ejercicios];
    const ultimaSerie = nuevosEjercicios[ejercicioIndex].series[nuevosEjercicios[ejercicioIndex].series.length - 1];
    const usaRpeEj = nuevosEjercicios[ejercicioIndex].usaRpe;

    nuevosEjercicios[ejercicioIndex].series.push({
      peso: ultimaSerie ? ultimaSerie.peso : '',
      reps: ultimaSerie ? ultimaSerie.reps : '',
      rpe: ultimaSerie ? ultimaSerie.rpe : '',
      porcentaje: ultimaSerie ? ultimaSerie.porcentaje : '',
      usaRpe: usaRpeEj
    });
    setEjercicios(nuevosEjercicios);
  };

  const eliminarSerie = (ejIdx: number, serIdx: number) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[ejIdx].series.splice(serIdx, 1);
    if (nuevosEjercicios[ejIdx].series.length === 0) {
      nuevosEjercicios.splice(ejIdx, 1);
    }
    setEjercicios(nuevosEjercicios);
  };

  const actualizarSerie = (
    ejercicioIndex: number,
    serieIndex: number,
    campo: keyof Serie,
    valor: string
  ) => {
    const nuevosEjercicios = [...ejercicios];
    nuevosEjercicios[ejercicioIndex].series[serieIndex][campo] = valor;
    setEjercicios(nuevosEjercicios);
  };

  const eliminarEjercicio = (ejIdx: number) => {
    const nuevos = [...ejercicios];
    nuevos.splice(ejIdx, 1);
    setEjercicios(nuevos);
  };

  const toggleRpeEjercicio = (ejIdx: number) => {
    const nuevosEjercicios = [...ejercicios];
    const nuevoValor = !nuevosEjercicios[ejIdx].usaRpe;
    nuevosEjercicios[ejIdx].usaRpe = nuevoValor;
    nuevosEjercicios[ejIdx].series = nuevosEjercicios[ejIdx].series.map(s => ({
      ...s,
      usaRpe: nuevoValor,
      rpe: nuevoValor ? s.rpe : ''
    }));
    setEjercicios(nuevosEjercicios);
  };

  const iniciarRutina = (rutina: Rutina) => {
    const ejerciciosParaSesion: EjercicioRutinaGuardado[] = rutina.ejercicios.map(ej => ({
      ejercicioId: ej.ejercicioId,
      nombre: ej.nombre,
      esConBarra: ej.esConBarra,
      series: ej.series.map(s => ({
        peso: s.peso || '',
        reps: s.reps,
        rpe: s.rpe,
        porcentaje: s.porcentaje,
        pesoReal: s.peso || ''
      }))
    }));
    onIniciarSesion(rutina, ejerciciosParaSesion);
  };

  const eliminarRutina = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Eliminar esta plantilla de rutina?')) {
      try {
        await db.rutinas.delete(id);
        await cargarDatosBD();
      } catch (err) {
        console.error('Error al eliminar rutina:', err);
      }
    }
  };

  const guardarRutinaEnBD = async () => {
    if (!nombreRutina.trim()) {
      alert('Ingresa un nombre para la rutina.');
      return;
    }
    if (ejercicios.length === 0) {
      alert('Anade al menos un ejercicio a la rutina.');
      return;
    }

    try {
      await db.rutinas.add({
        nombre: nombreRutina,
        fechaCreacion: new Date().toLocaleDateString('es-ES'),
        ejercicios: ejercicios.map(ej => ({
          ejercicioId: ej.ejercicioId,
          nombre: ej.nombre,
          esConBarra: ej.esConBarra,
          series: ej.series.map(s => ({
            peso: s.peso,
            reps: s.reps,
            rpe: s.rpe,
            porcentaje: s.porcentaje
          }))
        }))
      });

      setNombreRutina('');
      setEjercicios([]);
      await cargarDatosBD();
    } catch (error) {
      console.error('Error al guardar la rutina:', error);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', margin: '4px 0' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Gestion de Rutinas
        </h2>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>
          Crea y administra tus plantillas
        </p>
      </div>

      {/* Creador de Rutinas */}
      <div className="card-premium">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
              Nombre de la Sesion
            </label>
            <input
              type="text"
              placeholder="Ej: Push Day, SBD Semana 1"
              value={nombreRutina}
              onChange={(e) => setNombreRutina(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Boton para abrir selector de ejercicios */}
          <button
            onClick={() => setMostrarCatalogo(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px dashed var(--accent-indigo)',
              borderRadius: '10px',
              color: 'var(--accent-indigo)',
              fontSize: '13px',
              fontWeight: 'bold',
              gap: '8px'
            }}
          >
            <PlusIcon size={16} color="var(--accent-indigo)" />
            <span>Anadir Ejercicio</span>
          </button>
        </div>
      </div>

      {/* Lista de Ejercicios Agregados */}
      {ejercicios.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            Ejercicios de la Rutina ({ejercicios.length})
          </h4>

          {ejercicios.map((ej, ejIdx) => (
            <div key={ejIdx} className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: CATEGORIA_COLORS[ej.categoria] || 'var(--text-muted)',
                    flexShrink: 0
                  }}></span>
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ej.nombre}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleRpeEjercicio(ejIdx)}
                    style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold',
                      border: `1px solid ${ej.usaRpe ? 'rgba(217,119,6,0.4)' : 'var(--border-subtle)'}`,
                      backgroundColor: ej.usaRpe ? 'var(--accent-amber-glow)' : 'transparent',
                      color: ej.usaRpe ? 'var(--accent-amber)' : 'var(--text-muted)'
                    }}
                  >
                    RPE
                  </button>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {ej.series.length} {ej.series.length === 1 ? 'set' : 'sets'}
                  </span>
                  <button
                    onClick={() => eliminarEjercicio(ejIdx)}
                    style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>

              {/* Cabecera Sets */}
              <div style={{ display: 'grid', gridTemplateColumns: ej.usaRpe ? '28px 1fr 1fr 1fr 1fr 24px' : '28px 1fr 1fr 1fr 24px', gap: '4px', textAlign: 'center', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                <span>Set</span>
                <span>Kg</span>
                <span>Reps</span>
                {ej.usaRpe && <span>RPE</span>}
                <span>%</span>
                <span></span>
              </div>

              {/* Contenido de Sets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {ej.series.map((serie, serIdx) => (
                  <div key={serIdx} style={{ display: 'grid', gridTemplateColumns: ej.usaRpe ? '28px 1fr 1fr 1fr 1fr 24px' : '28px 1fr 1fr 1fr 24px', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textAlign: 'center' }}>
                      {serIdx + 1}
                    </span>

                    <input
                      type="number"
                      placeholder="Kg"
                      value={serie.peso}
                      onChange={(e) => actualizarSerie(ejIdx, serIdx, 'peso', e.target.value)}
                      style={{ padding: '6px', fontSize: '13px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
                    />

                    <input
                      type="number"
                      placeholder="--"
                      value={serie.reps}
                      onChange={(e) => actualizarSerie(ejIdx, serIdx, 'reps', e.target.value)}
                      style={{ padding: '6px', fontSize: '13px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
                    />

                    {ej.usaRpe && (
                      <select
                        value={serie.rpe}
                        onChange={(e) => actualizarSerie(ejIdx, serIdx, 'rpe', e.target.value)}
                        style={{ padding: '6px 2px', fontSize: '11px', textAlign: 'center', width: '100%', boxSizing: 'border-box', height: '32px', color: 'var(--accent-amber)', fontWeight: 'bold' }}
                      >
                        <option value="">--</option>
                        {['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'].map((val) => (
                          <option key={val} value={val}>@{val}</option>
                        ))}
                      </select>
                    )}

                    <input
                      type="number"
                      placeholder="%"
                      value={serie.porcentaje}
                      onChange={(e) => actualizarSerie(ejIdx, serIdx, 'porcentaje', e.target.value)}
                      style={{ padding: '6px', fontSize: '13px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
                    />

                    <button
                      onClick={() => eliminarSerie(ejIdx, serIdx)}
                      style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => agregarSerie(ejIdx)}
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: 'transparent',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  gap: '4px'
                }}
              >
                <PlusIcon size={12} color="var(--text-secondary)" />
                <span>Anadir Serie</span>
              </button>
            </div>
          ))}

          <button
            onClick={guardarRutinaEnBD}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', gap: '8px' }}
          >
            <SaveIcon size={16} color="white" />
            <span>Guardar Plantilla</span>
          </button>
        </div>
      )}

      {/* Listado de Rutinas Guardadas */}
      <div>
        <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Plantillas Guardadas ({rutinasGuardadas.length})
        </h4>

        {rutinasGuardadas.length === 0 ? (
          <div className="card-premium" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            <ClipboardIcon size={28} color="var(--text-muted)" />
            <p style={{ fontSize: '12px', marginTop: '8px' }}>No tienes rutinas registradas. Crea una arriba.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rutinasGuardadas.map((r) => (
              <div key={r.id} className="card-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', margin: 0 }}>{r.nombre}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                    {r.ejercicios.length} {r.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'} · {r.fechaCreacion}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => iniciarRutina(r)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', boxShadow: 'none', gap: '4px' }}
                  >
                    <PlayIcon size={12} color="white" />
                    <span>Iniciar</span>
                  </button>
                  <button
                    onClick={() => eliminarRutina(r.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      padding: '6px 8px'
                    }}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Selector de Ejercicios */}
      {mostrarCatalogo && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', zIndex: 1000, padding: '16px', paddingTop: '24px' }}>
          <div className="card-premium" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden', maxHeight: '100%' }}>
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Seleccionar Ejercicio</h3>
              <button onClick={() => { setMostrarCatalogo(false); setBusqueda(''); setFiltroCategoria(null); }} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', padding: '4px' }}>
                <XIcon size={20} />
              </button>
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                <SearchIcon size={16} color="var(--text-muted)" />
              </div>
              <input
                type="text"
                placeholder="Buscar ejercicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '34px', fontSize: '14px' }}
                autoFocus
              />
            </div>

            {/* Filtros de Categoria */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, overflowX: 'auto', paddingBottom: '2px' }}>
              <button
                onClick={() => setFiltroCategoria(null)}
                style={{
                  padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: !filtroCategoria ? 'var(--accent-indigo)' : 'transparent',
                  color: !filtroCategoria ? 'white' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap', flexShrink: 0
                }}
              >
                Todos ({catalogo.length})
              </button>
              {CATEGORIAS.map(cat => {
                const count = catalogo.filter(ej => ej.categoria === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(filtroCategoria === cat ? null : cat)}
                    style={{
                      padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 'bold',
                      border: `1px solid ${filtroCategoria === cat ? CATEGORIA_COLORS[cat] : 'var(--border-subtle)'}`,
                      backgroundColor: filtroCategoria === cat ? CATEGORIA_COLORS[cat] : 'transparent',
                      color: filtroCategoria === cat ? 'white' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap', flexShrink: 0
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Lista de Ejercicios */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {busqueda.trim() || filtroCategoria ? (
                /* Modo Busqueda / Filtro */
                catalogoFiltrado.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '12px' }}>No se encontraron ejercicios.</p>
                  </div>
                ) : (
                  catalogoFiltrado.map(ej => (
                    <button
                      key={ej.id}
                      onClick={() => agregarEjercicio(ej)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        backgroundColor: '#0b0b0d', border: '1px solid var(--border-subtle)',
                        padding: '10px 12px', borderRadius: '8px', color: 'white',
                        fontWeight: 'bold', fontSize: '13px', textAlign: 'left', gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: CATEGORIA_COLORS[ej.categoria], flexShrink: 0 }}></span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {ej.esConBarra && (
                          <span style={{ fontSize: '9px', color: 'var(--accent-indigo)', fontWeight: 'bold' }}>BARRA</span>
                        )}
                        <PlusIcon size={14} color="var(--accent-indigo)" />
                      </div>
                    </button>
                  ))
                )
              ) : (
                /* Modo Categorias Colapsables */
                CATEGORIAS.map(cat => {
                  const ejerciciosCat = catalogoPorCategoria[cat];
                  if (!ejerciciosCat || ejerciciosCat.length === 0) return null;
                  const abierta = !!categoriasAbiertas[cat];

                  return (
                    <div key={cat}>
                      <button
                        onClick={() => toggleCategoria(cat)}
                        style={{
                          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
                          padding: '10px 12px', borderRadius: '10px', color: 'white', fontWeight: 'bold', fontSize: '13px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CATEGORIA_COLORS[cat] }}></span>
                          <span>{cat}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'normal' }}>({ejerciciosCat.length})</span>
                        </div>
                        <div style={{ transform: abierta ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                          <ChevronDownIcon size={16} color="var(--text-muted)" />
                        </div>
                      </button>

                      {abierta && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '8px' }}>
                          {ejerciciosCat.map(ej => (
                            <button
                              key={ej.id}
                              onClick={() => agregarEjercicio(ej)}
                              style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: '#0b0b0d', border: '1px solid var(--border-subtle)',
                                padding: '10px 12px', borderRadius: '8px', color: 'white',
                                fontWeight: 'bold', fontSize: '12px', textAlign: 'left', gap: '8px'
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ej.nombre}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                {ej.esConBarra && (
                                  <span style={{ fontSize: '8px', color: 'var(--accent-indigo)', fontWeight: 'bold', padding: '2px 4px', backgroundColor: 'var(--accent-indigo-glow)', borderRadius: '4px' }}>BARRA</span>
                                )}
                                <PlusIcon size={14} color="var(--accent-indigo)" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

