/**
 * Motor de Renderizado Vectorial por Capas para Arte Abstracto
 */

export const ASPECT_RATIOS = {
  '1:1': { label: '1:1 (Cuadrado)', width: 800, height: 800 },
  '9:16': { label: '9:16 (Vertical / Stories)', width: 540, height: 960 },
  '16:9': { label: '16:9 (Panorámico)', width: 960, height: 540 },
  '4:5': { label: '4:5 (Retrato / IG)', width: 640, height: 800 },
  '4:3': { label: '4:3 (Clásico)', width: 800, height: 600 }
};

export class AbstractEngine {
  constructor() {
    this.deformations = [];
    this.cursorPreview = null;
  }

  getBounds(aspectRatioKey = '1:1') {
    return ASPECT_RATIOS[aspectRatioKey] || ASPECT_RATIOS['1:1'];
  }

  addDeformation(x, y, brushConfig) {
    const radius = parseFloat(brushConfig.radius) || 70;
    const strength = parseFloat(brushConfig.strength) || 50;
    const mode = brushConfig.mode || 'peak';

    this.deformations.push({ x, y, radius, strength, mode });
  }

  undoDeformation() {
    return this.deformations.pop();
  }

  clearDeformations() {
    this.deformations = [];
  }

  setDeformations(defs) {
    this.deformations = Array.isArray(defs) ? JSON.parse(JSON.stringify(defs)) : [];
  }

  /**
   * Genera el SVG completo a partir del estado de capas
   */
  renderSVG(state) {
    const bounds = this.getBounds(state.canvas.aspectRatio);
    const { width, height } = bounds;
    const bgColor = state.canvas.bgColor;

    // 1. Capas de diferencia (Detrás de la trama)
    const behindDiffs = state.differenceLayers
      .filter(l => l.active && l.placement === 'behind')
      .map(l => this.renderDifferenceElement(l, bounds))
      .join('\n');

    // 2. Capa 1: Trama / Patrón de repetición con deformaciones
    const patternSvg = this.renderPatternLayer(state.pattern, bounds);

    // 3. Capas de diferencia (Encima de la trama)
    const inFrontDiffs = state.differenceLayers
      .filter(l => l.active && l.placement === 'in-front')
      .map(l => this.renderDifferenceElement(l, bounds))
      .join('\n');

    // 4. Cursor de esculpido
    let cursorRing = '';
    if (this.cursorPreview) {
      const { cx, cy, r } = this.cursorPreview;
      cursorRing = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${state.pattern.color || '#38bdf8'}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.65" pointer-events="none" />`;
    }

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="cursor: crosshair;">
  <!-- Abstract Gen Art - Canvas: ${width}x${height} -->
  <rect width="100%" height="100%" fill="${bgColor}" />
  
  <!-- Capa 2 (Fondo): Elementos de Diferencia Detrás -->
  <g id="layer-diff-behind">
    ${behindDiffs}
  </g>

  <!-- Capa 1: Trama de Repetición y Esculpido -->
  <g id="layer-pattern">
    ${patternSvg}
  </g>

  <!-- Capa 2 (Frente): Elementos de Diferencia Delante -->
  <g id="layer-diff-front">
    ${inFrontDiffs}
  </g>

  <!-- Indicador del Pincel -->
  ${cursorRing}
</svg>`.trim();
  }

  /**
   * Renderiza la capa de trama según el tipo (líneas, concéntricos, rejilla)
   */
  renderPatternLayer(config, bounds) {
    const { width, height } = bounds;
    const type = config.type || 'lines';

    if (type === 'concentric') {
      return this.renderConcentricPattern(config, bounds);
    } else if (type === 'grid') {
      return this.renderGridPattern(config, bounds);
    } else {
      return this.renderLinesPattern(config, bounds);
    }
  }

  /**
   * Trama 1: Líneas Paralelas (con rotación de ángulo y deformación)
   */
  renderLinesPattern(config, bounds) {
    const { width, height } = bounds;
    const numLines = parseInt(config.density, 10) || 45;
    const strokeWidth = parseFloat(config.strokeWidth) || 1.2;
    const angleDeg = parseFloat(config.angle) || 0;
    const baseWave = parseFloat(config.baseWaviness) || 0;
    const lineColor = config.color || '#a5f3fc';

    const cx = width / 2;
    const cy = height / 2;
    const rad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Diagonal para cubrir todo el lienzo sin cortes al rotar
    const diag = Math.sqrt(width * width + height * height);
    const lineSpacing = diag / (numLines + 1);
    const numPointsPerLine = 120;
    const stepT = diag / (numPointsPerLine - 1);
    const halfDiag = diag / 2;

    const paths = [];

    for (let l = 0; l < numLines; l++) {
      const lineOffset = -halfDiag + (l + 1) * lineSpacing;
      let d = '';

      for (let p = 0; p < numPointsPerLine; p++) {
        const t = -halfDiag + p * stepT;

        // Coordenadas base en el plano rotado
        let u = t;
        let v = lineOffset;

        // Ondulación base matemática
        if (baseWave > 0) {
          const normP = p / numPointsPerLine;
          v += Math.sin(normP * Math.PI * 4 + l * 0.25) * (baseWave * 0.7);
        }

        // Transformación a coordenadas del lienzo (X, Y)
        let x = cx + u * cosA - v * sinA;
        let y = cy + u * sinA + v * cosA;

        // Aplicar deformaciones manuales del usuario en espacio de lienzo
        for (const def of this.deformations) {
          const dx = x - def.x;
          const dy = y - def.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < def.radius) {
            const factor = Math.max(0, 1 - dist / def.radius);

            if (def.mode === 'peak') {
              // Pico afilado: deformación normal a la línea hacia el origen del arrastre
              const pushX = -sinA * def.strength * factor;
              const pushY = -cosA * def.strength * factor;
              x += pushX;
              y += pushY;
            } else if (def.mode === 'smooth') {
              const smoothFactor = 0.5 * (1 + Math.cos((Math.PI * dist) / def.radius));
              x += -sinA * def.strength * smoothFactor;
              y += -cosA * def.strength * smoothFactor;
            } else if (def.mode === 'twist') {
              const swirlAngle = (factor * Math.PI * def.strength) / 30;
              const curDist = Math.hypot(dx, dy);
              const curAngle = Math.atan2(dy, dx) + swirlAngle;
              x = def.x + Math.cos(curAngle) * curDist;
              y = def.y + Math.sin(curAngle) * curDist;
            } else if (def.mode === 'flatten') {
              // Restaura suavemente hacia coordenadas nominales
              const nominalX = cx + u * cosA - lineOffset * sinA;
              const nominalY = cy + u * sinA + lineOffset * cosA;
              x = x * (1 - factor) + nominalX * factor;
              y = y * (1 - factor) + nominalY * factor;
            }
          }
        }

        if (p === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }

      const opacity = (0.4 + 0.6 * (l / numLines)).toFixed(2);
      paths.push(`<path d="${d}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />`);
    }

    return paths.join('\n    ');
  }

  /**
   * Trama 2: Polígonos y Conos Concéntricos (como la pieza 1)
   */
  renderConcentricPattern(config, bounds) {
    const { width, height } = bounds;
    const cx = width / 2;
    const cy = height / 2;
    const numRings = parseInt(config.density, 10) || 35;
    const strokeWidth = parseFloat(config.strokeWidth) || 1.2;
    const sides = parseInt(config.polygonSides, 10) || 6; // 3, 4, 6, 8 o 36 (círculo)
    const lineColor = config.color || '#ea580c';
    const angleDeg = parseFloat(config.angle) || 0;
    const rotOffset = (angleDeg * Math.PI) / 180;

    const maxR = Math.hypot(width, height) * 0.45;
    const stepR = maxR / numRings;
    const paths = [];

    for (let rIdx = 1; rIdx <= numRings; rIdx++) {
      const radius = rIdx * stepR;
      const points = [];
      const numVerts = sides >= 24 ? 90 : sides;

      for (let v = 0; v < numVerts; v++) {
        const theta = (v / numVerts) * Math.PI * 2 + rotOffset;
        let x = cx + radius * Math.cos(theta);
        let y = cy + radius * Math.sin(theta);

        // Deformación manual
        for (const def of this.deformations) {
          const dx = x - def.x;
          const dy = y - def.y;
          const dist = Math.hypot(dx, dy);

          if (dist < def.radius) {
            const factor = Math.max(0, 1 - dist / def.radius);
            if (def.mode === 'peak') {
              y -= def.strength * factor;
            } else if (def.mode === 'smooth') {
              y -= def.strength * 0.5 * (1 + Math.cos((Math.PI * dist) / def.radius));
            } else if (def.mode === 'twist') {
              const thetaNew = theta + factor * (def.strength / 20);
              x = cx + radius * Math.cos(thetaNew);
              y = cy + radius * Math.sin(thetaNew);
            }
          }
        }
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      const opacity = (0.35 + 0.65 * (rIdx / numRings)).toFixed(2);
      paths.push(`<polygon points="${points.join(' ')}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-linejoin="round" />`);
    }

    return paths.join('\n    ');
  }

  /**
   * Trama 3: Rejilla Cuadriculada / Cruzada
   */
  renderGridPattern(config, bounds) {
    const hConfig = { ...config, angle: 0 };
    const vConfig = { ...config, angle: 90 };
    return this.renderLinesPattern(hConfig, bounds) + '\n' + this.renderLinesPattern(vConfig, bounds);
  }

  /**
   * Renderiza una capa de diferencia (figura geométrica o tipografía)
   */
  renderDifferenceElement(layer, bounds) {
    const { width, height } = bounds;
    const x = (parseFloat(layer.x) / 100) * width;
    const y = (parseFloat(layer.y) / 100) * height;
    const size = parseFloat(layer.size) || 80;
    const color = layer.color || '#e11d48';
    const opacity = parseFloat(layer.opacity) || 0.85;
    const blendMode = layer.blendMode || 'normal';

    if (layer.type === 'circle') {
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size / 2).toFixed(1)}" fill="${color}" fill-opacity="${opacity}" style="mix-blend-mode: ${blendMode};" filter="drop-shadow(0 0 15px ${color}33)" />`;
    }

    if (layer.type === 'rectangle') {
      const w = size * (layer.aspect || 1.4);
      const h = size;
      const rx = (x - w / 2).toFixed(1);
      const ry = (y - h / 2).toFixed(1);
      const strokeAttr = layer.borderOnly ? `stroke="${color}" stroke-width="${layer.borderWidth || 2}" fill="none"` : `fill="${color}" fill-opacity="${opacity}"`;
      return `<rect x="${rx}" y="${ry}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ${strokeAttr} style="mix-blend-mode: ${blendMode};" rx="4" />`;
    }

    if (layer.type === 'polygon') {
      const sides = parseInt(layer.sides, 10) || 3;
      const points = [];
      const r = size / 2;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        points.push(`${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`);
      }
      return `<polygon points="${points.join(' ')}" fill="${color}" fill-opacity="${opacity}" style="mix-blend-mode: ${blendMode};" />`;
    }

    if (layer.type === 'text') {
      const text = layer.text || 'A';
      const fontSize = size;
      const fontFamily = layer.fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' :
                         layer.fontFamily === 'mono' ? 'ui-monospace, monospace' :
                         '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family='${fontFamily}' font-size="${fontSize}" font-weight="800" fill="${color}" fill-opacity="${opacity}" text-anchor="middle" dominant-baseline="central" style="mix-blend-mode: ${blendMode}; user-select: none;">${text}</text>`;
    }

    return '';
  }

  /**
   * Genera snippet de código limpio exportable
   */
  toCode(state) {
    return `// Abstract Gen Art Studio - Layered Composition Code
const state = ${JSON.stringify(state, null, 2)};
const deformations = ${JSON.stringify(this.deformations, null, 2)};

// Complete vector SVG generated with pure math and manual sculpted deformations.
`;
  }
}
