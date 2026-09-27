/**
 * Patrón 3: Campos de Flujo Orgánico (Viento, Corrientes y Dunas)
 * Inspirado en la dinámica de fluidos naturales, estelas de viento y magnetismo biológico
 */

export const flowFieldPattern = {
  id: 'flow-field',
  name: 'Campos de Flujo (Viento y Corrientes)',
  subtitle: 'Dinámica de fluidos, estelas eólicas y corrientes marinas',
  description: 'Simula el movimiento continuo de partículas arrastradas por un campo vectorial orgánico (ruido de gradiente). Modela fenómenos como corrientes oceánicas, dunas desérticas y estelas atmosféricas.',
  naturalOrigin: 'Física de fluidos laminares y turbulencias en la atmósfera y los océanos.',

  presets: [
    { name: 'Bruma Marina', values: { particles: 450, length: 70, noiseScale: 0.0035, curl: 1.0, strokeWidth: 1.2, opacity: 0.65, palette: 'ocean_mist' } },
    { name: 'Dunas del Sahara', values: { particles: 550, length: 90, noiseScale: 0.0020, curl: 0.6, strokeWidth: 1.4, opacity: 0.75, palette: 'desert_dunes' } },
    { name: 'Aurora Boreal', values: { particles: 600, length: 110, noiseScale: 0.0040, curl: 1.4, strokeWidth: 1.0, opacity: 0.80, palette: 'aurora' } },
    { name: 'Fibras de Seda', values: { particles: 750, length: 50, noiseScale: 0.0060, curl: 2.0, strokeWidth: 0.8, opacity: 0.55, palette: 'silk' } },
    { name: 'Tinta Japonesa (Sumi-e)', values: { particles: 400, length: 80, noiseScale: 0.0030, curl: 0.8, strokeWidth: 2.2, opacity: 0.85, palette: 'sumi_e' } }
  ],

  parameters: {
    particles: {
      label: 'Cantidad de filamentos',
      type: 'slider',
      min: 100,
      max: 1200,
      step: 25,
      default: 500,
      unit: ''
    },
    length: {
      label: 'Longitud del flujo',
      type: 'slider',
      min: 20,
      max: 160,
      step: 5,
      default: 80,
      unit: 'px'
    },
    noiseScale: {
      label: 'Turbulencia (Frecuencia)',
      type: 'slider',
      min: 0.001,
      max: 0.012,
      step: 0.0005,
      default: 0.0035,
      unit: ''
    },
    curl: {
      label: 'Remolino / Torsión',
      type: 'slider',
      min: 0.2,
      max: 3.0,
      step: 0.1,
      default: 1.0,
      unit: 'x'
    },
    strokeWidth: {
      label: 'Grosor del trazo',
      type: 'slider',
      min: 0.4,
      max: 4.0,
      step: 0.2,
      default: 1.2,
      unit: 'px'
    },
    opacity: {
      label: 'Opacidad del filamento',
      type: 'slider',
      min: 0.2,
      max: 1.0,
      step: 0.05,
      default: 0.70,
      unit: ''
    },
    palette: {
      label: 'Paleta elemental',
      type: 'palette',
      default: 'ocean_mist',
      palettes: {
        ocean_mist: {
          name: 'Bruma Marina',
          colors: ['#0f172a', '#0369a1', '#06b6d4', '#38bdf8', '#e0f2fe']
        },
        desert_dunes: {
          name: 'Dunas Doradas',
          colors: ['#451a03', '#9a3412', '#d97706', '#f59e0b', '#fef08a']
        },
        aurora: {
          name: 'Aurora Boreal',
          colors: ['#064e3b', '#10b981', '#06b6d4', '#6366f1', '#e879f9']
        },
        silk: {
          name: 'Fibras Florales',
          colors: ['#4a044e', '#86198f', '#c026d3', '#f472b6', '#fdf4ff']
        },
        sumi_e: {
          name: 'Tinta Minimalista',
          colors: ['#1e293b', '#475569', '#94a3b8', '#e2e8f0', '#ffffff']
        }
      }
    }
  },

  /**
   * Genera el SVG con trazados vectoriales orgánicos continuos
   */
  generateSVG(params, bounds = { width: 800, height: 800 }) {
    const { width, height } = bounds;
    const numParticles = parseInt(params.particles, 10);
    const steps = parseInt(params.length, 10);
    const scale = parseFloat(params.noiseScale);
    const curl = parseFloat(params.curl);
    const strokeWidth = parseFloat(params.strokeWidth);
    const opacity = parseFloat(params.opacity);

    const paletteDef = this.parameters.palette.palettes[params.palette] || this.parameters.palette.palettes.ocean_mist;
    const colors = paletteDef.colors;

    const noise = createNoise2D(42);
    const stepSize = 4;
    const paths = [];

    // Distribución pseudoaleatoria regular para una densidad homogénea
    for (let i = 0; i < numParticles; i++) {
      let x = (Math.sin(i * 997.1) * 0.5 + 0.5) * width;
      let y = (Math.cos(i * 613.7) * 0.5 + 0.5) * height;

      let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      let validPoints = 0;

      for (let s = 0; s < steps; s++) {
        // Mapear ángulo a partir del ruido
        const nVal = noise(x * scale, y * scale);
        const angle = nVal * Math.PI * 2 * curl;

        x += Math.cos(angle) * stepSize;
        y += Math.sin(angle) * stepSize;

        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        validPoints++;

        if (x < -50 || x > width + 50 || y < -50 || y > height + 50) break;
      }

      if (validPoints > 3) {
        const colorProgress = i / numParticles;
        const color = interpolateColorArray(colors, colorProgress);
        paths.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />`);
      }
    }

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Nature Gen Art: Flow Field (${numParticles} Streamlines, Scale: ${scale}) -->
  <rect width="100%" height="100%" fill="#070a0f" />
  <g id="flow-field-layer">
    ${paths.join('\n    ')}
  </g>
</svg>`.trim();
  },

  toCode(params) {
    return `// Nature Gen Art: Organic Flow Field
const config = ${JSON.stringify(params, null, 2)};

function renderFlowField(ctx, width, height) {
  // Uses 2D Perlin or Simplex noise gradient angles:
  // angle = noise(x * config.noiseScale, y * config.noiseScale) * Math.PI * 2 * config.curl;
  // Step forward iteratively along the vector angle to draw smooth fluid curves.
}
`;
  }
};

/**
 * Generador de ruido 2D de gradiente determinista rápido y autónomo
 */
function createNoise2D(seed = 1) {
  const p = new Uint8Array(512);
  const permutation = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
    250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
    172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
    228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,
    107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
  for (let i = 0; i < 256; i++) {
    p[i] = permutation[(i + seed) % 256];
    p[256 + i] = p[i];
  }

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(t, a, b) { return a + t * (b - a); }
  function grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  return function(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = p[X] + Y;
    const B = p[X + 1] + Y;
    return lerp(v, lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
                   lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1)));
  };
}

function interpolateColorArray(colors, factor) {
  if (colors.length === 0) return '#ffffff';
  if (colors.length === 1) return colors[0];
  const scaled = Math.max(0, Math.min(1, factor)) * (colors.length - 1);
  const index = Math.floor(scaled);
  const subFactor = scaled - index;

  if (index >= colors.length - 1) return colors[colors.length - 1];

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
