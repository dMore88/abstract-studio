/**
 * Presets de la Suite Creativa: Desde lo Mínimo (Generative Artistry) hasta lo Denso (UJI)
 */

export const PRESETS = [
  {
    id: 'seda_papel_uji',
    name: 'Seda & Papel Washi (Estilo UJI)',
    description: 'Textura de miles de líneas con micro-corrugado analógico que emula fibras de papel japonés o seda.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'aubergine', bgColor: '#081018' },
      pattern: {
        archetype: 'spiral_nautilus',
        copies: 450,
        scaleStep: 0.996,
        rotateStep: 0.45,
        moveX: 0.25,
        moveY: -0.35,
        anchor: 'bottom',
        jitter: 2.6, // Textura de micro-corrugado
        strokeWidth: 0.7,
        opacity: 0.22,
        color: '#f472b6'
      },
      brush: { mode: 'smooth', radius: 90, strength: 40 },
      differenceLayers: []
    },
    deformations: [
      { x: 270, y: 480, radius: 120, strength: 45, mode: 'smooth' }
    ]
  },
  {
    id: 'espiral_nautilus',
    name: 'Espiral Nautilus (Illustrator Transform)',
    description: 'Elipse base transformada acumulativamente con escala del 95% y giro continuo de 8.5°.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'terracotta', bgColor: '#180a22' },
      pattern: {
        archetype: 'spiral_nautilus',
        copies: 48,
        scaleStep: 0.955,
        rotateStep: 8.5,
        moveX: 1.5,
        moveY: -3.5,
        anchor: 'bottom',
        jitter: 0,
        strokeWidth: 1.2,
        opacity: 0.85,
        color: '#ea580c'
      },
      brush: { mode: 'peak', radius: 70, strength: 50 },
      differenceLayers: []
    },
    deformations: []
  },
  {
    id: 'roseta_guilloche',
    name: 'Roseta Guilloché (Book of Shapes)',
    description: 'Pétalos rotados radialmente a 360° generando patrones de interferencia y mandalas.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'petrol', bgColor: '#060f17' },
      pattern: {
        archetype: 'radial_rosette',
        copies: 36,
        scaleStep: 1.0,
        rotateStep: 10,
        moveX: 0,
        moveY: 0,
        anchor: 'center',
        jitter: 0,
        strokeWidth: 1.2,
        opacity: 0.8,
        color: '#38bdf8'
      },
      brush: { mode: 'twist', radius: 80, strength: 45 },
      differenceLayers: []
    },
    deformations: []
  },
  {
    id: 'cordillera_petroleo',
    name: 'Cordillera de Picos (Tu pieza 2)',
    description: 'Trama de líneas horizontales con picos afilados esculpidos a mano sobre azul petróleo.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'petrol', bgColor: '#082c3d' },
      pattern: {
        archetype: 'lines',
        density: 56,
        strokeWidth: 1.2,
        angle: 0,
        baseWaviness: 2,
        jitter: 0,
        color: '#a5f3fc'
      },
      brush: { mode: 'peak', radius: 65, strength: 65 },
      differenceLayers: []
    },
    deformations: [
      { x: 180, y: 340, radius: 55, strength: 70, mode: 'peak' },
      { x: 270, y: 280, radius: 65, strength: 90, mode: 'peak' },
      { x: 370, y: 380, radius: 60, strength: 80, mode: 'peak' },
      { x: 230, y: 520, radius: 70, strength: 85, mode: 'peak' },
      { x: 420, y: 220, radius: 50, strength: 65, mode: 'peak' },
      { x: 120, y: 460, radius: 50, strength: 60, mode: 'peak' },
      { x: 330, y: 480, radius: 60, strength: 75, mode: 'peak' }
    ]
  },
  {
    id: 'zen_carmesi',
    name: 'Paisaje Zen con Sol (Tu pieza 3)',
    description: 'Colinas suaves con astro carmesí colocado en la capa de fondo detrás de las líneas.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'aubergine', bgColor: '#140822' },
      pattern: {
        archetype: 'lines',
        density: 48,
        strokeWidth: 1.2,
        angle: 0,
        baseWaviness: 3,
        jitter: 0,
        color: '#818cf8'
      },
      brush: { mode: 'smooth', radius: 85, strength: 55 },
      differenceLayers: [
        {
          id: 'diff-1',
          name: 'Sol Carmesí',
          active: true,
          type: 'circle',
          placement: 'behind',
          x: 74,
          y: 67,
          size: 95,
          color: '#e11d48',
          opacity: 0.95,
          blendMode: 'normal'
        }
      ]
    },
    deformations: [
      { x: 140, y: 640, radius: 80, strength: 50, mode: 'smooth' },
      { x: 250, y: 620, radius: 75, strength: 60, mode: 'smooth' },
      { x: 360, y: 660, radius: 85, strength: 50, mode: 'smooth' },
      { x: 460, y: 580, radius: 95, strength: 85, mode: 'smooth' }
    ]
  },
  {
    id: 'minimal_bauhaus',
    name: 'Minimalismo Afiche (Generative Artistry)',
    description: '12 iteraciones limpias sin textura de ruido, tipografía en contraste y geometría pura.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'bauhaus', bgColor: '#18181b' },
      pattern: {
        archetype: 'concentric_tunnel',
        copies: 14,
        scaleStep: 0.88,
        rotateStep: 4,
        moveX: 0,
        moveY: 0,
        anchor: 'center',
        polygonSides: 4,
        jitter: 0,
        strokeWidth: 2.2,
        opacity: 1.0,
        color: '#fafafa'
      },
      brush: { mode: 'twist', radius: 90, strength: 50 },
      differenceLayers: [
        {
          id: 'diff-1',
          name: 'Letra Bauhaus',
          active: true,
          type: 'text',
          text: '01',
          fontFamily: 'sans',
          placement: 'in-front',
          x: 50,
          y: 50,
          size: 180,
          color: '#dc2626',
          opacity: 0.9,
          blendMode: 'difference'
        }
      ]
    },
    deformations: []
  }
];
