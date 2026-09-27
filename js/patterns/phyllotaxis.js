/**
 * Patrón 1: Filotaxis / Espiral de Fermat (Disposición de semillas en la naturaleza)
 * Basado en la fórmula polar de Vogel:
 *   θ = n * α (donde α ≈ 137.508° es el ángulo áureo)
 *   r = c * sqrt(n)
 */

export const phyllotaxisPattern = {
  id: 'phyllotaxis',
  name: 'Filotaxis (Espirales de Fermat)',
  subtitle: 'Geometría botánica de girasoles, piñas y suculentas',
  description: 'Distribución óptima de empaquetamiento natural en plantas descrita matemáticamente por Vogel usando el ángulo áureo (~137.508°). Pequeñas variaciones angulares producen dramáticas simetrías secundarias.',

  presets: [
    { name: 'Girasol Áureo', values: { angle: 137.508, points: 750, spread: 5.2, dotScale: 3.2, shape: 'circle', palette: 'sunflower', sizeEvolution: 'grow', colorMapping: 'radius' } },
    { name: 'Suculenta Fractal', values: { angle: 137.30, points: 900, spread: 4.6, dotScale: 4.0, shape: 'petal', palette: 'emerald', sizeEvolution: 'grow', colorMapping: 'radius' } },
    { name: 'Flor de Loto', values: { angle: 137.60, points: 650, spread: 5.5, dotScale: 3.8, shape: 'petal', palette: 'lotus', sizeEvolution: 'grow', colorMapping: 'index' } },
    { name: 'Remolino Cuántico', values: { angle: 99.50, points: 1100, spread: 4.2, dotScale: 2.6, shape: 'circle', palette: 'cyan_ocean', sizeEvolution: 'shrink', colorMapping: 'angle' } },
    { name: 'Estrella Cristalina', values: { angle: 137.92, points: 800, spread: 5.0, dotScale: 3.0, shape: 'diamond', palette: 'monochrome', sizeEvolution: 'constant', colorMapping: 'radius' } }
  ],

  parameters: {
    points: {
      label: 'Cantidad de elementos',
      type: 'slider',
      min: 50,
      max: 2500,
      step: 10,
      default: 750,
      unit: ''
    },
    angle: {
      label: 'Ángulo de divergencia',
      type: 'slider',
      min: 130.0,
      max: 145.0,
      step: 0.01,
      default: 137.508,
      unit: '°'
    },
    spread: {
      label: 'Factor de dispersión (c)',
      type: 'slider',
      min: 1.0,
      max: 12.0,
      step: 0.1,
      default: 5.2,
      unit: ''
    },
    dotScale: {
      label: 'Tamaño del elemento',
      type: 'slider',
      min: 0.5,
      max: 8.0,
      step: 0.1,
      default: 3.2,
      unit: 'px'
    },
    sizeEvolution: {
      label: 'Evolución de tamaño',
      type: 'segmented',
      default: 'grow',
      options: [
        { label: 'Crece', value: 'grow' },
        { label: 'Constante', value: 'constant' },
        { label: 'Decrece', value: 'shrink' }
      ]
    },
    shape: {
      label: 'Morfología',
      type: 'segmented',
      default: 'circle',
      options: [
        { label: 'Círculo', value: 'circle' },
        { label: 'Pétalo', value: 'petal' },
        { label: 'Diamante', value: 'diamond' }
      ]
    },
    colorMapping: {
      label: 'Gradiente de color',
      type: 'segmented',
      default: 'radius',
      options: [
        { label: 'Por Radio', value: 'radius' },
        { label: 'Por Índice', value: 'index' },
        { label: 'Por Ángulo', value: 'angle' }
      ]
    },
    palette: {
      label: 'Paleta botánica',
      type: 'palette',
      default: 'sunflower',
      palettes: {
        sunflower: {
          name: 'Girasol Solar',
          colors: ['#78350f', '#b45309', '#d97706', '#f59e0b', '#fde047']
        },
        emerald: {
          name: 'Suculenta',
          colors: ['#064e3b', '#047857', '#10b981', '#34d399', '#a7f3d0']
        },
        lotus: {
          name: 'Flor de Loto',
          colors: ['#831843', '#be185d', '#ec4899', '#f472b6', '#fce7f3']
        },
        cyan_ocean: {
          name: 'Bioluminiscente',
          colors: ['#083344', '#0e7490', '#06b6d4', '#67e8f9', '#cffafe']
        },
        monochrome: {
          name: 'Plumilla Tinta',
          colors: ['#334155', '#64748b', '#94a3b8', '#cbd5e1', '#ffffff']
        }
      }
    }
  },

  /**
   * Genera el contenido SVG puro para los parámetros dados
   */
  generateSVG(params, bounds = { width: 800, height: 800 }) {
    const { width, height } = bounds;
    const cx = width / 2;
    const cy = height / 2;

    const n = parseInt(params.points, 10);
    const angleDeg = parseFloat(params.angle);
    const angleRad = (angleDeg * Math.PI) / 180;
    const c = parseFloat(params.spread);
    const baseSize = parseFloat(params.dotScale);
    const evolution = params.sizeEvolution || 'grow';
    const shape = params.shape || 'circle';
    const colorMode = params.colorMapping || 'radius';
    
    // Obtener paleta
    const paletteDef = this.parameters.palette.palettes[params.palette] || this.parameters.palette.palettes.sunflower;
    const colors = paletteDef.colors;

    const maxR = c * Math.sqrt(n);
    let elements = [];

    for (let i = 1; i <= n; i++) {
      // Fórmula polar de Vogel
      const theta = i * angleRad;
      const r = c * Math.sqrt(i);

      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);

      // Si se sale del lienzo, lo omitimos para mantener limpio el marco
      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;

      // Cálculo de tamaño progresivo
      const progress = i / n;
      let size = baseSize;
      if (evolution === 'grow') {
        size = baseSize * (0.35 + 1.65 * progress);
      } else if (evolution === 'shrink') {
        size = baseSize * (2.0 - 1.65 * progress);
      }

      // Cálculo de color
      let colorFactor = 0;
      if (colorMode === 'radius') {
        colorFactor = r / (maxR || 1);
      } else if (colorMode === 'index') {
        colorFactor = progress;
      } else if (colorMode === 'angle') {
        colorFactor = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI);
      }
      colorFactor = Math.max(0, Math.min(1, colorFactor));
      const color = interpolateColorArray(colors, colorFactor);

      // Renderizado según forma morfológica
      if (shape === 'circle') {
        elements.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(size / 2).toFixed(2)}" fill="${color}" fill-opacity="0.92" />`);
      } else if (shape === 'petal') {
        const rotation = (theta * 180 / Math.PI).toFixed(1);
        const rx = (size * 1.2).toFixed(2);
        const ry = (size * 0.55).toFixed(2);
        elements.push(`<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${rx}" ry="${ry}" transform="rotate(${rotation} ${x.toFixed(2)} ${y.toFixed(2)})" fill="${color}" fill-opacity="0.88" />`);
      } else if (shape === 'diamond') {
        const d = (size * 0.8).toFixed(2);
        const rotation = ((theta * 180 / Math.PI) + 45).toFixed(1);
        elements.push(`<rect x="${(x - d/2).toFixed(2)}" y="${(y - d/2).toFixed(2)}" width="${d}" height="${d}" transform="rotate(${rotation} ${x.toFixed(2)} ${y.toFixed(2)})" fill="${color}" fill-opacity="0.9" />`);
      }
    }

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Nature Gen Art: Phyllotaxis (Angle: ${angleDeg}°, Points: ${n}) -->
  <rect width="100%" height="100%" fill="#070a0f" />
  <g id="phyllotaxis-layer">
    ${elements.join('\n    ')}
  </g>
</svg>`.trim();
  },

  /**
   * Genera snippet de código limpio y portable para desarrolladores
   */
  toCode(params) {
    return `// Nature Gen Art: Phyllotaxis Fermat Spiral
// Run directly in any modern browser Canvas or SVG context:

const config = ${JSON.stringify(params, null, 2)};

function drawPhyllotaxis(ctx, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const angleRad = (config.angle * Math.PI) / 180;
  
  for (let i = 1; i <= config.points; i++) {
    const theta = i * angleRad;
    const r = config.spread * Math.sqrt(i);
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    
    ctx.beginPath();
    ctx.arc(x, y, config.dotScale / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  }
}
`;
  }
};

/**
 * Función auxiliar para interpolar entre varios colores hexadecimales
 */
function interpolateColorArray(colors, factor) {
  if (colors.length === 0) return '#ffffff';
  if (colors.length === 1) return colors[0];
  
  const scaled = factor * (colors.length - 1);
  const index = Math.floor(scaled);
  const subFactor = scaled - index;

  if (index >= colors.length - 1) {
    return colors[colors.length - 1];
  }

  const c1 = hexToRgb(colors[index]);
  const c2 = hexToRgb(colors[index + 1]);

  const r = Math.round(c1.r + (c2.r - c1.r) * subFactor);
  const g = Math.round(c1.g + (c2.g - c1.g) * subFactor);
  const b = Math.round(c1.b + (c2.b - c1.b) * subFactor);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}
