import React from 'react';

interface DiscoItem {
  disco: {
    peso: number;
    colorHex: string;
    nombre: string;
  };
  cantidad: number;
}

interface Props {
  discos: DiscoItem[];
  usaSeguro?: boolean;
}

// Configuración de proporciones visuales según el peso
const ALTURA_DISCO: { [key: number]: number } = {
  25: 84,  // Rojo
  20: 84,  // Azul
  15: 76,  // Amarillo
  10: 68,  // Verde
  5:  58,  // Naranja
  2.5: 48, // Gris
  1.25: 38 // Blanco
};

const GROSOR_DISCO: { [key: number]: number } = {
  25: 12,
  20: 10,
  15: 9,
  10: 8,
  5: 7,
  2.5: 6,
  1.25: 5
};

export default function VisualizadorBarra({ discos, usaSeguro = false }: Props) {
  // Aplanar la lista según las cantidades por lado
  const listaDiscos: typeof discos[0]['disco'][] = [];
  discos.forEach(({ disco, cantidad }) => {
    for (let i = 0; i < cantidad; i++) {
      listaDiscos.push(disco);
    }
  });

  return (
    <div 
      style={{ 
        backgroundColor: '#09090b', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: '12px', 
        padding: '16px 12px 12px', 
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Título con margen inferior para evitar solapamiento */}
      <span 
        style={{ 
          fontSize: '10px', 
          fontWeight: 'bold', 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        Carga Gráfica por Lado
      </span>

      {/* Área del lienzo de la barra */}
      <div 
        style={{ 
          width: '100%', 
          minHeight: '100px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflowX: 'auto',
          padding: '10px 0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          
          {/* Manga interna / Tope de la barra */}
          <div 
            style={{ 
              width: '10px', 
              height: '46px', 
              backgroundColor: '#3f3f46', 
              borderRadius: '3px 0 0 3px',
              borderRight: '1px solid #18181b'
            }} 
          />
          
          {/* Eje / Cuello de la barra */}
          <div 
            style={{ 
              width: '14px', 
              height: '20px', 
              backgroundColor: '#71717a' 
            }} 
          />

          {/* Discos cargados (de adentro hacia afuera) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0 1px' }}>
            {listaDiscos.length > 0 ? (
              listaDiscos.map((disco, idx) => {
                const altura = ALTURA_DISCO[disco.peso] || 50;
                const grosor = GROSOR_DISCO[disco.peso] || 8;
                const esTextoOscuro = disco.peso === 1.25 || disco.peso === 5 || disco.peso === 15;

                return (
                  <div
                    key={idx}
                    title={`Disco de ${disco.peso} kg`}
                    style={{
                      width: `${grosor}px`,
                      height: `${altura}px`,
                      backgroundColor: disco.colorHex,
                      borderRadius: '3px',
                      border: '1px solid rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span 
                      style={{ 
                        writingMode: 'vertical-lr', 
                        fontSize: '8px', 
                        fontWeight: '900', 
                        color: esTextoOscuro ? '#000' : '#fff', 
                        userSelect: 'none',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      {disco.peso}
                    </span>
                  </div>
                );
              })
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0 8px', fontWeight: 'bold' }}>
                Sin discos
              </span>
            )}
          </div>

          {/* Ganchos / Seguros IPF (si están activados) */}
          {usaSeguro ? (
            <div
              title="Seguro de Competencia IPF (2.5 kg)"
              style={{
                width: '14px',
                height: '36px',
                backgroundColor: '#eab308',
                borderRadius: '4px',
                border: '1px solid #ca8a04',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                marginLeft: '1px'
              }}
            >
              <span style={{ fontSize: '8px', fontWeight: '900', color: '#000' }}>🔒</span>
            </div>
          ) : (
            /* Extremo exterior estándar de la barra */
            <div 
              style={{ 
                width: '32px', 
                height: '18px', 
                backgroundColor: '#52525b', 
                borderRadius: '0 4px 4px 0', 
                borderLeft: '1px solid #27272a' 
              }} 
            />
          )}

        </div>
      </div>

      <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
        {usaSeguro ? 'Incluye collarín IPF de 2.5 kg en el extremo' : 'Vista lateral estándar'}
      </p>
    </div>
  );
}