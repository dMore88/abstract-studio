/**
 * Patrón 4: Trama Esculpible (Intervención y Deformación a Mano)
 * Combina arte generativo matemático con esculpido manual directo mediante el cursor
 */

export const sculptTerrainPattern = {
  id: 'sculpt-terrain',
  name: 'Trama Esculpible (Esculpido a Mano)',
  subtitle: 'Líneas generativas deformadas en vivo con tu cursor',
  description: 'Trama matemática base intervenida directamente con el ratón. Haz clic y arrastra sobre el lienzo para esculpir picos afilados, colinas suaves o valles orgánicos.',
  naturalOrigin: '⛰️ Topografía, estratos geológicos y curvas de nivel esculpidas por el tiempo.',

  // Historial de intervenciones manuales del usuario
  deformations: [],
  sun: { active: true, x: 580, y: 480, radius: 46 },
  cursorPreview: null,

  presets: [
    {
      name: 'Lienzo Virgen (Para Esculpir)',
      values: { lineCount: 48, baseWaviness: 3, brushMode: 'peak', brushRadius: 70, brushStrength: 50, showSun: 'yes', palette: 'petrol' },
      deformations: []
    },
    {
      name: 'Cordillera de Picos (Como tu pieza 2)',
      values: { lineCount: 52, baseWaviness: 2, brushMode: 'peak', brushRadius: 65, brushStrength: 60, showSun: 'no', palette: 'petrol' },
      deformations: [
        { x: 260, y: 320, radius: 65, strength: 75, mode: 'peak' },
        { x: 420, y: 260, radius: 80, strength: 95, mode: 'peak' },
        { x: 540, y: 360, radius: 70, strength: 80, mode: 'peak' },
        { x: 340, y: 480, radius: 75, strength: 85, mode: 'peak' },
        { x: 600, y: 220, radius: 60, strength: 70, mode: 'peak' },
        { x: 180, y: 420, radius: 55, strength: 65, mode: 'peak' },
        { x: 480, y: 440, radius: 65, strength: 70, mode: 'peak' }
      ]
    },
    {
      name: 'Paisaje Zen con Sol (Como tu pieza 3)',
      values: { lineCount: 42, baseWaviness: 4, brushMode: 'smooth', brushRadius: 100, brushStrength: 45, showSun: 'yes', palette: 'aubergine' },
      deformations: [
        { x: 240, y: 520, radius: 90, strength: 55, mode: 'smooth' },
        { x: 380, y: 500, radius: 85, strength: 60, mode: 'smooth' },
        { x: 520, y: 530, radius: 95, strength: 50, mode: 'smooth' },
        { x: 680, y: 460, radius: 110, strength: 85, mode: 'smooth' }
      ]
    },
    {
      name: 'Ecos de Terracota (Como tu pieza 1)',
      values: { lineCount: 46, baseWaviness: 2, brushMode: 'peak', brushRadius: 90, brushStrength: 80, showSun: 'no', palette: 'terracotta' },
      deformations: [
        { x: 220, y: 400, radius: 95, strength: 90, mode: 'peak' },
        { x: 400, y: 300, radius: 110, strength: 120, mode: 'peak' },
        { x: 580, y: 380, radius: 90, strength: 85, mode: 'peak' }
      ]
    }
  ],

  parameters: {
    brushMode: {
      label: 'Herramienta de Esculpido',
      type: 'segmented',
      default: 'peak',
      options: [
        { label: '▲ Pico Afilado', value: 'peak' },
        { label: '∩ Colina Suave', value: 'smooth' },
        { label: '🌀 Torsión', value: 'twist' },
        { label: '— Aplanar', value: 'flatten' }
      ]
    },
    brushRadius: {
      label: 'Radio del pincel',
      type: 'slider',
      min: 25,
      max: 160,
      step: 5,
      default: 70,
      unit: 'px'
    },
    brushStrength: {
      label: 'Fuerza de deformación',
      type: 'slider',
      min: 10,
      max: 120,
      step: 5,
      default: 55,
      unit: 'px'
    },
    lineCount: {
      label: 'Densidad de líneas',
      type: 'slider',
      min: 20,
      max: 85,
      step: 1,
      default: 48,
      unit: ''
    },
    baseWaviness: {
      label: 'Ondulación base matemática',
      type: 'slider',
      min: 0,
      max: 20,
      step: 1,
      default: 3,
      unit: 'px'
    },
    showSun: {
      label: 'Cuerpo Celeste (Sol/Luna)',
      type: 'segmented',
      default: 'yes',
      options: [
        { label: 'Visible', value: 'yes' },
        { label: 'Oculto', value: 'no' }
      ]
    },
    palette: {
      label: 'Paleta cromática',
      type: 'palette',
      default: 'petrol',
      palettes: {
        petrol: {
          name: 'Petróleo & Cian (Pieza 2)',
          colors: ['#051c27', '#082c3d', '#155e75', '#38bdf8', '#a5f3fc'],
          bg: '#082c3d',
          line: '#a5f3fc',
          sun: '#f59e0b'
        },
        aubergine: {
          name: 'Medianoche & Carmesí (Pieza 3)',
          colors: ['#12071d', '#1f0d31', '#4c1d95', '#818cf8', '#e11d48'],
          bg: '#140822',
          line: '#6366f1',
          sun: '#e11d48'
        },
        terracotta: {
          name: 'Ciruela & Terracota (Pieza 1)',
          colors: ['#1c0c24', '#2d1238', '#9a3412', '#ea580c', '#fdba74'],
          bg: '#180a22',
          line: '#ea580c',
          sun: '#fb923c'
        },
        chalk_black: {
          name: 'Carbón & Tiza',
          colors: ['#020617', '#0f172a', '#334155', '#94a3b8', '#f8fafc'],
          bg: '#090d16',
          line: '#f1f5f9',
          sun: '#ef4444'
        },
        emerald_abyss: {
          name: 'Abismo Esmeralda',
          colors: ['#021d17', '#064e3b', '#047857', '#34d399', '#a7f3d0'],
          bg: '#04231b',
          line: '#6ee7b7',
          sun: '#facc15'
        }
      }
    }
  },

  /**
   * Agrega una deformación manual cuando el usuario hace clic o arrastra
   */
  addDeformation(x, y, params) {
    const radius = parseFloat(params.brushRadius);
    const strength = parseFloat(params.brushStrength);
    const mode = params.brushMode || 'peak';

    this.deformations.push({ x, y, radius, strength, mode });
  },

  undoLastDeformation() {
    return this.deformations.pop();
  },

  clearDeformations() {
    this.deformations = [];
  },

  /**
   * Genera el SVG completo combinando la trama base y las deformaciones del usuario
   */
  generateSVG(params, bounds = { width: 800, height: 800 }) {
    const { width, height } = bounds;
    const numLines = parseInt(params.lineCount, 10);
    const baseWave = parseFloat(params.baseWaviness);
    const showSun = params.showSun === 'yes';

    const paletteDef = this.parameters.palette.palettes[params.palette] || this.parameters.palette.palettes.petrol;
    const bgColor = paletteDef.bg;
    const lineColor = paletteDef.line;
    const sunColor = paletteDef.sun;

    // Dimensiones del área de trama
    const topMargin = height * 0.12;
    const bottomMargin = height * 0.88;
    const lineSpacing = (bottomMargin - topMargin) / (numLines - 1);
    const numPointsPerLine = 140;
    const stepX = (width * 0.88) / (numPointsPerLine - 1);
    const startX = width * 0.06;

    const paths = [];

    // Dibujar Sol/Luna celeste si está activo
    let sunSvg = '';
    if (showSun) {
      sunSvg = `
      <!-- Sol / Luna Celeste -->
      <circle cx="${this.sun.x}" cy="${this.sun.y}" r="${this.sun.radius}" fill="${sunColor}" fill-opacity="0.9" filter="drop-shadow(0 0 16px ${sunColor}44)" />
      `;
    }

    // Calcular cada línea de la trama
    for (let l = 0; l < numLines; l++) {
      const baseY = topMargin + l * lineSpacing;
      let d = '';

      for (let p = 0; p < numPointsPerLine; p++) {
        const x = startX + p * stepX;
        let y = baseY;

        // Ondulación natural sutil base
        if (baseWave > 0) {
          const normX = p / numPointsPerLine;
          y += Math.sin(normX * Math.PI * 4 + l * 0.25) * (baseWave * 0.6)
             + Math.cos(normX * Math.PI * 2 + l * 0.15) * (baseWave * 0.4);
        }

        // Aplicar deformaciones manuales esculpidas por el usuario
        for (const def of this.deformations) {
          const dx = x - def.x;
          const dy = y - def.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < def.radius) {
            const factor = Math.max(0, 1 - dist / def.radius);

            if (def.mode === 'peak') {
              // Pico afilado triangular (lineal)
              y -= def.strength * factor;
            } else if (def.mode === 'smooth') {
              // Colina suave (coseno / campana)
              const smoothFactor = 0.5 * (1 + Math.cos((Math.PI * dist) / def.radius));
              y -= def.strength * smoothFactor;
            } else if (def.mode === 'twist') {
              // Torsión
              y += Math.sin((dx / def.radius) * Math.PI) * (def.strength * 0.6) * factor;
            } else if (def.mode === 'flatten') {
              // Aplanar hacia la línea base
              y = y * (1 - factor) + baseY * factor;
            }
          }
        }

        if (p === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }

      // Gradiente o atenuación sutil de opacidad
      const lineProgress = l / numLines;
      const opacity = (0.35 + 0.65 * lineProgress).toFixed(2);

      paths.push(`<path d="${d}" fill="none" stroke="${lineColor}" stroke-width="1.2" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />`);
    }

    // Indicador visual del cursor (anillo del pincel durante la edición)
    let cursorRing = '';
    if (this.cursorPreview) {
      const { cx, cy, r } = this.cursorPreview;
      cursorRing = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${lineColor}" stroke-width="1" stroke-dasharray="4 4" opacity="0.6" pointer-events="none" />`;
    }

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="cursor: crosshair;">
  <!-- Nature Gen Art: Trama Esculpible Manual (Líneas: ${numLines}, Intervenciones: ${this.deformations.length}) -->
  <rect width="100%" height="100%" fill="${bgColor}" />
  ${sunSvg}
  <g id="sculpted-lines">
    ${paths.join('\n    ')}
  </g>
  ${cursorRing}
</svg>`.trim();
  },

  toCode(params) {
    return `// Nature Gen Art: Trama Esculpible Manual
// Puntos base con ${this.deformations.length} intervenciones manuales de esculpido.
const config = ${JSON.stringify(params, null, 2)};
const deformations = ${JSON.stringify(this.deformations, null, 2)};

// Renderiza cada línea evaluando las deformaciones acumuladas del usuario.
`;
  }
};
