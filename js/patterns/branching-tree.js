/**
 * Patrón 2: Ramificaciones Fractales y Árboles Botánicos (L-Systems)
 * Modela el crecimiento de árboles, redes vasculares y hojas mediante recursión armónica
 */

export const branchingTreePattern = {
  id: 'branching-tree',
  name: 'Ramificaciones Fractales (Árboles)',
  subtitle: 'Sistemas botánicos de ramificación y redes vasculares',
  description: 'Simulación del principio botánico de ramificación fractal (similar a L-Systems y morfología de árboles). Modula el ángulo de apertura, niveles de crecimiento y curvatura orgánica.',

  presets: [
    { name: 'Roble Majestuoso', values: { depth: 9, branchAngle: 28, lengthRatio: 0.72, leafSize: 4.0, asymmetry: 0, palette: 'forest' } },
    { name: 'Cerezo Sakura', values: { depth: 9, branchAngle: 34, lengthRatio: 0.70, leafSize: 6.5, asymmetry: -4, palette: 'sakura' } },
    { name: 'Sauce Llorón', values: { depth: 10, branchAngle: 18, lengthRatio: 0.76, leafSize: 3.5, asymmetry: 8, palette: 'willow' } },
    { name: 'Bonsái Otoñal', values: { depth: 8, branchAngle: 42, lengthRatio: 0.68, leafSize: 7.0, asymmetry: 12, palette: 'autumn' } },
    { name: 'Red Coralina', values: { depth: 10, branchAngle: 48, lengthRatio: 0.66, leafSize: 2.0, asymmetry: 0, palette: 'coral' } }
  ],

  parameters: {
    depth: {
      label: 'Niveles de crecimiento (Profundidad)',
      type: 'slider',
      min: 4,
      max: 11,
      step: 1,
      default: 9,
      unit: ''
    },
    branchAngle: {
      label: 'Ángulo de ramificación',
      type: 'slider',
      min: 10,
      max: 60,
      step: 0.5,
      default: 28,
      unit: '°'
    },
    lengthRatio: {
      label: 'Tasa de reducción de rama',
      type: 'slider',
      min: 0.55,
      max: 0.80,
      step: 0.01,
      default: 0.72,
      unit: ''
    },
    leafSize: {
      label: 'Tamaño de hojas terminales',
      type: 'slider',
      min: 0,
      max: 10,
      step: 0.5,
      default: 4.5,
      unit: 'px'
    },
    asymmetry: {
      label: 'Fototropismo / Inclinación (Viento)',
      type: 'slider',
      min: -20,
      max: 20,
      step: 0.5,
      default: 0,
      unit: '°'
    },
    palette: {
      label: 'Paleta estacional',
      type: 'palette',
      default: 'forest',
      palettes: {
        forest: {
          name: 'Bosque Profundo',
          colors: ['#3f2e1e', '#166534', '#22c55e', '#86efac', '#dcfce7']
        },
        sakura: {
          name: 'Cerezo Sakura',
          colors: ['#4a2511', '#9d174d', '#db2777', '#f472b6', '#fce7f3']
        },
        autumn: {
          name: 'Otoño Dorado',
          colors: ['#451a03', '#9a3412', '#ea580c', '#f59e0b', '#fef08a']
        },
        willow: {
          name: 'Sauce Místico',
          colors: ['#1e293b', '#0f766e', '#14b8a6', '#5eead4', '#ccfbf1']
        },
        coral: {
          name: 'Coral Marino',
          colors: ['#4c0519', '#be123c', '#f43f5e', '#fb7185', '#ffe4e6']
        }
      }
    }
  },

  /**
   * Genera el SVG del árbol botánico
   */
  generateSVG(params, bounds = { width: 800, height: 800 }) {
    const { width, height } = bounds;
    const maxDepth = parseInt(params.depth, 10);
    const branchAngle = (parseFloat(params.branchAngle) * Math.PI) / 180;
    const ratio = parseFloat(params.lengthRatio);
    const leafRadius = parseFloat(params.leafSize);
    const tilt = (parseFloat(params.asymmetry) * Math.PI) / 180;

    const paletteDef = this.parameters.palette.palettes[params.palette] || this.parameters.palette.palettes.forest;
    const colors = paletteDef.colors;

    let branchElements = [];
    let leafElements = [];

    // Longitud inicial del tronco
    const initialLen = height * 0.22;
    const startX = width / 2;
    const startY = height * 0.92;

    function buildBranch(x, y, len, angle, currentDepth) {
      const x2 = x + len * Math.sin(angle);
      const y2 = y - len * Math.cos(angle);

      // Grosor decreciente
      const strokeWidth = Math.max(1, (maxDepth - currentDepth + 1) * 1.4);
      
      // Color progresivo de madera a follaje
      const colorProgress = currentDepth / maxDepth;
      const branchColor = interpolateColors(colors[0], colors[1], colorProgress);

      branchElements.push(
        `<line x1="${x.toFixed(2)}" y1="${y.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${branchColor}" stroke-width="${strokeWidth.toFixed(1)}" stroke-linecap="round" />`
      );

      // Si alcanzamos la profundidad máxima, dibujamos hojas
      if (currentDepth >= maxDepth) {
        if (leafRadius > 0) {
          const leafColor = colors[Math.min(colors.length - 1, Math.floor(2 + Math.random() * 3))];
          leafElements.push(
            `<circle cx="${x2.toFixed(2)}" cy="${y2.toFixed(2)}" r="${leafRadius.toFixed(1)}" fill="${leafColor}" fill-opacity="0.85" />`
          );
        }
        return;
      }

      // Ramificación binaria con asimetría natural
      const nextLen = len * ratio;
      buildBranch(x2, y2, nextLen, angle - branchAngle + tilt * 0.3, currentDepth + 1);
      buildBranch(x2, y2, nextLen, angle + branchAngle + tilt * 0.3, currentDepth + 1);
    }

    // Iniciar recursión del tronco
    buildBranch(startX, startY, initialLen, tilt, 1);

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Nature Gen Art: Fractal Tree (Depth: ${maxDepth}, Angle: ${params.branchAngle}°) -->
  <rect width="100%" height="100%" fill="#070a0f" />
  <g id="tree-branches">
    ${branchElements.join('\n    ')}
  </g>
  <g id="tree-leaves">
    ${leafElements.join('\n    ')}
  </g>
</svg>`.trim();
  },

  toCode(params) {
    return `// Nature Gen Art: Botanical Fractal Tree
const config = ${JSON.stringify(params, null, 2)};

function drawTree(ctx, x, y, len, angle, depth) {
  const branchAngle = (config.branchAngle * Math.PI) / 180;
  const x2 = x + len * Math.sin(angle);
  const y2 = y - len * Math.cos(angle);

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = Math.max(1, (config.depth - depth + 1) * 1.5);
  ctx.strokeStyle = '#22c55e';
  ctx.stroke();

  if (depth < config.depth) {
    drawTree(ctx, x2, y2, len * config.lengthRatio, angle - branchAngle, depth + 1);
    drawTree(ctx, x2, y2, len * config.lengthRatio, angle + branchAngle, depth + 1);
  }
}
`;
  }
};

function interpolateColors(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

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
