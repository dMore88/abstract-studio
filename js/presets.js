/**
 * Presets Iniciales de Arte Abstracto por Capas
 */

export const PRESETS = [
  {
    id: 'cordillera_petroleo',
    name: 'Cordillera de Picos (Como tu pieza 2)',
    description: 'Formato vertical 9:16 con líneas en azul petróleo y picos triangulares esculpidos.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'petrol', bgColor: '#082c3d' },
      pattern: { type: 'lines', density: 56, strokeWidth: 1.2, angle: 0, baseWaviness: 2, color: '#a5f3fc' },
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
    name: 'Paisaje Zen con Sol (Como tu pieza 3)',
    description: 'Fondo medianoche, ondas de terreno continuas y un astro carmesí colocado detrás de la trama.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'aubergine', bgColor: '#140822' },
      pattern: { type: 'lines', density: 48, strokeWidth: 1.2, angle: 0, baseWaviness: 3, color: '#818cf8' },
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
          size: 90,
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
    id: 'prismas_terracota',
    name: 'Prismas Concéntricos (Como tu pieza 1)',
    description: 'Hexágonos concéntricos apilados con marco geométrico translúcido al frente.',
    state: {
      canvas: { aspectRatio: '9:16', paletteId: 'terracotta', bgColor: '#180a22' },
      pattern: { type: 'concentric', polygonSides: 6, density: 40, strokeWidth: 1.2, angle: 0, baseWaviness: 0, color: '#ea580c' },
      brush: { mode: 'peak', radius: 85, strength: 75 },
      differenceLayers: [
        {
          id: 'diff-1',
          name: 'Marco Translúcido',
          active: true,
          type: 'rectangle',
          placement: 'in-front',
          x: 32,
          y: 68,
          size: 260,
          aspect: 0.65,
          color: '#155e75',
          opacity: 0.45,
          borderOnly: false,
          blendMode: 'screen'
        }
      ]
    },
    deformations: [
      { x: 160, y: 440, radius: 85, strength: 80, mode: 'peak' },
      { x: 270, y: 320, radius: 100, strength: 110, mode: 'peak' },
      { x: 400, y: 420, radius: 80, strength: 85, mode: 'peak' }
    ]
  },
  {
    id: 'bauhaus_typo',
    name: 'Bauhaus Tipográfico',
    description: 'Líneas diagonales dinámicas con glifo tipográfico en modo diferencia.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'bauhaus', bgColor: '#18181b' },
      pattern: { type: 'lines', density: 38, strokeWidth: 1.5, angle: 45, baseWaviness: 0, color: '#fafafa' },
      brush: { mode: 'twist', radius: 90, strength: 60 },
      differenceLayers: [
        {
          id: 'diff-1',
          name: 'Glifo Bauhaus',
          active: true,
          type: 'text',
          text: 'B',
          fontFamily: 'sans',
          placement: 'in-front',
          x: 50,
          y: 50,
          size: 260,
          color: '#dc2626',
          opacity: 0.9,
          blendMode: 'difference'
        }
      ]
    },
    deformations: [
      { x: 400, y: 400, radius: 120, strength: 70, mode: 'twist' }
    ]
  },
  {
    id: 'lienzo_virgen',
    name: 'Lienzo Virgen (Comenzar de Cero)',
    description: 'Trama limpia de líneas horizontales para experimentar y esculpir libremente.',
    state: {
      canvas: { aspectRatio: '1:1', paletteId: 'chalk_black', bgColor: '#090d16' },
      pattern: { type: 'lines', density: 42, strokeWidth: 1.2, angle: 0, baseWaviness: 3, color: '#f1f5f9' },
      brush: { mode: 'peak', radius: 70, strength: 55 },
      differenceLayers: []
    },
    deformations: []
  }
];
