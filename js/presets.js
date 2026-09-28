/**
 * Presets de la Suite Creativa
 * Desde piezas centrales mínimas hasta fondos de textura densa sangrada
 */

export const PRESETS = [
  {
    id: 'seda_papel_uji',
    name: 'Seda & Papel Washi (Fondo Sangrado)',
    description: 'Textura de cientos de elipses con micro-corrugado y respiración de trazos que inundan el lienzo.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'aubergine', bgColor: '#081018' },
      pattern: {
        shape: 'circle',
        polygonSides: 4,
        size: 780, // Sangrado total como fondo
        centerX: 50,
        centerY: 50,
        copies: 380,
        scaleStep: 0.996,
        rotateStep: 0.45,
        moveX: 0.2,
        moveY: -0.3,
        anchor: 'bottom',
        jitter: 2.8,
        skipChance: 15,
        lineSwappiness: 25,
        waviness: 0,
        strokeWidth: 0.7,
        opacity: 0.22,
        color: '#f472b6'
      },
      brush: { mode: 'smooth', radius: 95, strength: 45 },
      differenceLayers: []
    },
    deformations: [
      { x: 270, y: 480, radius: 120, strength: 50, mode: 'smooth' }
    ]
  },
  {
    id: 'espiral_nautilus',
    name: 'Espiral Nautilus (Pieza Central)',
    description: 'Elipse base transformada acumulativamente con escala del 95.5% y giro continuo de 8.5°.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'terracotta', bgColor: '#180a22' },
      pattern: {
        shape: 'circle',
        polygonSides: 4,
        size: 320, // Objeto central contenido
        centerX: 50,
        centerY: 50,
        copies: 46,
        scaleStep: 0.955,
        rotateStep: 8.5,
        moveX: 1.5,
        moveY: -3.5,
        anchor: 'bottom',
        jitter: 0,
        skipChance: 0,
        lineSwappiness: 0,
        waviness: 0,
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
    name: 'Roseta Guilloché (Pieza Central)',
    description: 'Pétalos rotados radialmente a 360° generando mandalas e interferencias de Moiré.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'petrol', bgColor: '#060f17' },
      pattern: {
        shape: 'petal',
        polygonSides: 4,
        size: 280, // Objeto central
        centerX: 50,
        centerY: 50,
        copies: 36,
        scaleStep: 1.0,
        rotateStep: 10,
        moveX: 0,
        moveY: 0,
        anchor: 'center',
        jitter: 0,
        skipChance: 0,
        lineSwappiness: 0,
        waviness: 0,
        strokeWidth: 1.2,
        opacity: 0.85,
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
    description: 'Líneas paralelas de lado a lado con picos afilados esculpidos a mano sobre azul petróleo.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'petrol', bgColor: '#082c3d' },
      pattern: {
        shape: 'line',
        polygonSides: 4,
        size: 540, // Sangrado horizontal
        centerX: 50,
        centerY: 50,
        copies: 54,
        scaleStep: 1.0,
        rotateStep: 0,
        moveX: 0,
        moveY: 15,
        anchor: 'center',
        jitter: 0,
        skipChance: 0,
        lineSwappiness: 0,
        waviness: 2,
        strokeWidth: 1.2,
        opacity: 0.85,
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
    description: 'Ondas suaves con astro carmesí colocado en la capa de fondo detrás de las líneas.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'aubergine', bgColor: '#140822' },
      pattern: {
        shape: 'line',
        polygonSides: 4,
        size: 540,
        centerX: 50,
        centerY: 50,
        copies: 46,
        scaleStep: 1.0,
        rotateStep: 0,
        moveX: 0,
        moveY: 16,
        anchor: 'center',
        jitter: 0,
        skipChance: 0,
        lineSwappiness: 0,
        waviness: 3,
        strokeWidth: 1.2,
        opacity: 0.85,
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
    name: 'Afiche Minimalista (Generative Artistry)',
    description: '14 iteraciones limpias sin textura de ruido, tipografía en contraste y geometría pura.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'bauhaus', bgColor: '#18181b' },
      pattern: {
        shape: 'polygon',
        polygonSides: 4,
        size: 340,
        centerX: 50,
        centerY: 50,
        copies: 14,
        scaleStep: 0.88,
        rotateStep: 4,
        moveX: 0,
        moveY: 0,
        anchor: 'center',
        jitter: 0,
        skipChance: 0,
        lineSwappiness: 0,
        waviness: 0,
        strokeWidth: 2.2,
        opacity: 1.0,
        color: '#fafafa'
      },
      brush: { mode: 'twist', radius: 90, strength: 50 },
      differenceLayers: [
        {
          id: 'diff-1',
          name: 'Glifo Bauhaus',
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
