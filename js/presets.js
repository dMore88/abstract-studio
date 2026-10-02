/**
 * Abstract Studio - Multilayer Presets & Moiré Compositions
 * Curated for optical interference and clean parametric generative art.
 */

export const PRESETS = [
  {
    id: 'moire_radial',
    name: 'Radial Moiré (Optical Interference)',
    description: 'Two centrifugal radiation layers overlaid with subtle angular rotation (4.5°) producing dense moiré interference.',
    state: {
      canvas: {
        aspectRatio: '1:1',
        bgColor: '#ffffff',
        showSafeBounds: false,
        invertFigureGround: false
      },
      brushActive: false,
      brush: { mode: 'peak', radius: 75, strength: 60 },
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
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
          color: '#363a4d',
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
          name: 'Layer 2',
          type: 'pattern',
          visible: true,
          opacity: 100,
          blendMode: 'multiply',
          shape: 'line',
          width: 50,
          height: 50,
          rotation: 4.5,
          offsetX: 0,
          offsetY: 0,
          color: '#363a4d',
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
    name: 'Orthogonal Moiré (Mesh Weave)',
    description: 'Two cartesian grids of hairline strokes rotated by 3.5 degrees to create optical grid weave.',
    state: {
      canvas: {
        aspectRatio: '1:1',
        bgColor: '#ffffff',
        showSafeBounds: false,
        invertFigureGround: false
      },
      brushActive: false,
      brush: { mode: 'peak', radius: 75, strength: 60 },
      layers: [
        {
          id: 'grid-1',
          name: 'Grid Layer A',
          type: 'pattern',
          visible: true,
          opacity: 90,
          blendMode: 'source-over',
          shape: 'line',
          width: 70,
          height: 70,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          color: '#2a2d3e',
          strokeWidth: 1.0,
          fillMode: 'stroke',
          distribution: 'cartesian',
          cartesian: { gridType: 'basic', cols: 24, rows: 24 },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          jitter: 0
        },
        {
          id: 'grid-2',
          name: 'Grid Layer B (Rotated)',
          type: 'pattern',
          visible: true,
          opacity: 90,
          blendMode: 'multiply',
          shape: 'line',
          width: 70,
          height: 70,
          rotation: 3.5,
          offsetX: 0,
          offsetY: 0,
          color: '#2a2d3e',
          strokeWidth: 1.0,
          fillMode: 'stroke',
          distribution: 'cartesian',
          cartesian: { gridType: 'basic', cols: 24, rows: 24 },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          jitter: 0
        }
      ]
    }
  },
  {
    id: 'bauhaus_minimal',
    name: 'Bauhaus Primaries (Minimal Counterpoint)',
    description: 'Clean geometry with primary colors, strict grid rhythms, and balanced glyph accents.',
    state: {
      canvas: {
        aspectRatio: '1:1',
        bgColor: '#ffffff',
        showSafeBounds: false,
        invertFigureGround: false
      },
      brushActive: false,
      brush: { mode: 'peak', radius: 75, strength: 60 },
      layers: [
        {
          id: 'bauhaus-1',
          name: 'Geometric Grid',
          type: 'pattern',
          visible: true,
          opacity: 100,
          blendMode: 'source-over',
          shape: 'circle',
          width: 45,
          height: 45,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          color: '#1a1b22',
          strokeWidth: 1.8,
          fillMode: 'stroke',
          distribution: 'cartesian',
          cartesian: { gridType: 'basic', cols: 7, rows: 7 },
          gradation: { enabled: false },
          anomaly: { enabled: false },
          jitter: 0
        },
        {
          id: 'bauhaus-2',
          name: 'Accent Arch',
          type: 'element',
          visible: true,
          opacity: 90,
          blendMode: 'multiply',
          shape: 'horseshoe',
          width: 140,
          height: 140,
          rotation: 45,
          offsetX: 20,
          offsetY: -30,
          color: '#d9383a',
          strokeWidth: 2,
          fillMode: 'fill'
        }
      ]
    }
  }
];
