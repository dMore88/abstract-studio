/**
 * Abstract Studio - Presets Multicapa y Composiciones Moiré
 */

export const PRESETS = [
  {
    id: 'moire_radial',
    name: 'Moiré Radial (Interferencia Óptica)',
    description: 'Dos capas de radiación centrífuga superpuestas con ligero desplazamiento angular y modo diferencia.',
    state: {
      canvas: {
        aspectRatio: '1:1',
        bgColor: '#0a0a0d',
        showSafeBounds: false,
        invertFigureGround: false
      },
      brushActive: false,
      brush: { mode: 'peak', radius: 75, strength: 60 },
      layers: [
        {
          id: 'layer-1',
          name: 'Radiación Base A',
          type: 'pattern',
          visible: true,
          opacity: 100,
          blendMode: 'source-over',
          shape: 'line',
          width: 50,
          height: 50,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          color: '#f4f4f5',
          strokeWidth: 1.2,
          fillMode: 'stroke',
          distribution: 'polar',
          polar: {
            scheme: 'centrifugal',
            rays: 48,
            rings: 6,
            spiralTwist: 0,
            radius: 0.44,
            centerX: 0,
            centerY: 0
          },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          similarity: { enabled: false },
          concentration: { enabled: false },
          space: { enabled: false },
          jitter: 0
        },
        {
          id: 'layer-2',
          name: 'Radiación Moiré B',
          type: 'pattern',
          visible: true,
          opacity: 100,
          blendMode: 'difference',
          shape: 'line',
          width: 50,
          height: 50,
          rotation: 4.5,
          offsetX: 0,
          offsetY: 0,
          color: '#f4f4f5',
          strokeWidth: 1.2,
          fillMode: 'stroke',
          distribution: 'polar',
          polar: {
            scheme: 'centrifugal',
            rays: 48,
            rings: 6,
            spiralTwist: 0,
            radius: 0.44,
            centerX: 0,
            centerY: 0
          },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          similarity: { enabled: false },
          concentration: { enabled: false },
          space: { enabled: false },
          jitter: 0
        }
      ]
    }
  },
  {
    id: 'moire_grid',
    name: 'Moiré Ortogonal (Tejido de Malla)',
    description: 'Dos retículas cartesianas de líneas finas con rotación asimétrica de 3.5 grados.',
    state: {
      canvas: {
        aspectRatio: '1:1',
        bgColor: '#080c14',
        showSafeBounds: false,
        invertFigureGround: false
      },
      brushActive: false,
      brush: { mode: 'peak', radius: 75, strength: 60 },
      layers: [
        {
          id: 'layer-grid-1',
          name: 'Retícula Primaria',
          type: 'pattern',
          visible: true,
          opacity: 90,
          blendMode: 'source-over',
          shape: 'line',
          width: 80,
          height: 80,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          color: '#38bdf8',
          strokeWidth: 1.0,
          fillMode: 'stroke',
          distribution: 'cartesian',
          cartesian: {
            gridType: 'basic',
            cols: 14,
            rows: 14
          },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          similarity: { enabled: false },
          concentration: { enabled: false },
          space: { enabled: false },
          jitter: 0
        },
        {
          id: 'layer-grid-2',
          name: 'Retícula Angular (Moiré)',
          type: 'pattern',
          visible: true,
          opacity: 90,
          blendMode: 'difference',
          shape: 'line',
          width: 80,
          height: 80,
          rotation: 4.2,
          offsetX: 0,
          offsetY: 0,
          color: '#f43f5e',
          strokeWidth: 1.0,
          fillMode: 'stroke',
          distribution: 'cartesian',
          cartesian: {
            gridType: 'basic',
            cols: 14,
            rows: 14
          },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          similarity: { enabled: false },
          concentration: { enabled: false },
          space: { enabled: false },
          jitter: 0
        }
      ]
    }
  },
  {
    id: 'washi_zen',
    name: 'Grabado Washi & Sol Zen',
    description: 'Trama lineal continua con micro-corrugado táctil y elemento de acento circular de contraste.',
    state: {
      canvas: {
        aspectRatio: '9:16',
        bgColor: '#090d16',
        showSafeBounds: false,
        invertFigureGround: false
      },
      brushActive: false,
      brush: { mode: 'peak', radius: 80, strength: 70 },
      layers: [
        {
          id: 'layer-accent-zen',
          name: 'Sol Zen Carmesí',
          type: 'element',
          visible: true,
          opacity: 90,
          blendMode: 'source-over',
          shape: 'circle',
          size: 260,
          posX: 50,
          posY: 38,
          rotation: 0,
          color: '#ef4444',
          strokeWidth: 2,
          fillMode: 'fill'
        },
        {
          id: 'layer-washi-lines',
          name: 'Trama Washi con Jitter',
          type: 'pattern',
          visible: true,
          opacity: 95,
          blendMode: 'difference',
          shape: 'line',
          width: 90,
          height: 90,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          color: '#f8fafc',
          strokeWidth: 1.3,
          fillMode: 'stroke',
          distribution: 'linear',
          linear: {
            copies: 52,
            angle: 0,
            waviness: 1.5
          },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          similarity: { enabled: false },
          concentration: { enabled: false },
          space: { enabled: false },
          jitter: 1.4
        }
      ]
    }
  },
  {
    id: 'modular_gradation',
    name: 'Gradación & Anomalía Focal',
    description: 'Retícula deslizante de estrellas y rombos con gradación diagonal y perturbación gravitatoria focal.',
    state: {
      canvas: {
        aspectRatio: '1:1',
        bgColor: '#121217',
        showSafeBounds: false,
        invertFigureGround: false
      },
      brushActive: false,
      brush: { mode: 'peak', radius: 75, strength: 60 },
      layers: [
        {
          id: 'layer-star-flow',
          name: 'Matriz Paramétrica de Estrellas',
          type: 'pattern',
          visible: true,
          opacity: 100,
          blendMode: 'source-over',
          shape: 'star4',
          width: 52,
          height: 52,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          color: '#e2e8f0',
          strokeWidth: 1.4,
          fillMode: 'stroke',
          distribution: 'cartesian',
          cartesian: {
            gridType: 'sliding',
            cols: 7,
            rows: 7,
            slideOffset: 0.5
          },
          gradation: {
            enabled: true,
            type: 'rotation',
            pathway: 'diagonal',
            range: 180
          },
          anomaly: {
            enabled: true,
            epicenterX: 0.5,
            epicenterY: 0.5,
            radius: 190,
            shape: 'rhombus',
            highlightColor: true
          },
          similarity: { enabled: false },
          concentration: { enabled: false },
          space: { enabled: false },
          jitter: 0
        }
      ]
    }
  }
];
