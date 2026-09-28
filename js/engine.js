/**
 * Motor de Renderizado Vectorial para Arte Abstracto
 * Integra arquetipos geométricos, transformación acumulativa (estilo Illustrator)
 * y micro-textura de papel/fibra (estilo UJI).
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
    const behindDiffs = (state.differenceLayers || [])
      .filter(l => l.active && l.placement === 'behind')
      .map(l => this.renderDifferenceElement(l, bounds))
      .join('\n');

    // 2. Capa 1: Trama / Transformación de Arquetipo con Textura y Deformaciones
    const patternSvg = this.renderPatternLayer(state.pattern, bounds);

    // 3. Capas de diferencia (Encima de la trama)
    const inFrontDiffs = (state.differenceLayers || [])
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
  <!-- Abstract Studio - Canvas: ${width}x${height} -->
  <rect width="100%" height="100%" fill="${bgColor}" />
  
  <!-- Capa Fondo: Elementos de Diferencia Detrás -->
  <g id="layer-diff-behind">
    ${behindDiffs}
  </g>

  <!-- Capa 1: Arquetipo Transformado & Esculpido -->
  <g id="layer-pattern">
    ${patternSvg}
  </g>

  <!-- Capa Frente: Elementos de Diferencia Delante -->
  <g id="layer-diff-front">
    ${inFrontDiffs}
  </g>

  <!-- Pincel de Esculpido -->
  ${cursorRing}
</svg>`.trim();
  }

  /**
   * Renderiza la capa de trama según el arquetipo
   */
  renderPatternLayer(config, bounds) {
    const archetype = config.archetype || 'lines';

    if (archetype === 'spiral_nautilus' || archetype === 'radial_rosette' || archetype === 'concentric_tunnel') {
      return this.renderIterativeTransform(config, bounds);
    } else if (archetype === 'grid') {
      return this.renderGridPattern(config, bounds);
    } else {
      return this.renderLinesPattern(config, bounds);
    }
  }

  /**
   * Motor de Transformación Acumulativa (Inspirado en Illustrator Transform Effect + Textura UJI)
   */
  renderIterativeTransform(config, bounds) {
    const { width, height } = bounds;
    const cx = width / 2;
    const cy = height / 2;

    const copies = parseInt(config.copies, 10) || 50;
    const scaleFactor = parseFloat(config.scaleStep) || 0.96;
    const rotateStep = (parseFloat(config.rotateStep) || 8) * (Math.PI / 180);
    const moveX = parseFloat(config.moveX) || 0;
    const moveY = parseFloat(config.moveY) || 0;
    const jitter = parseFloat(config.jitter) || 0;
    const strokeWidth = parseFloat(config.strokeWidth) || 1.0;
    const baseOpacity = parseFloat(config.opacity) || 0.7;
    const lineColor = config.color || '#a5f3fc';
    const archetype = config.archetype || 'spiral_nautilus';

    // Punto de ancla (Centro o Excéntrico hacia un borde)
    const anchorX = config.anchor === 'bottom' ? cx : config.anchor === 'side' ? cx - 120 : cx;
    const anchorY = config.anchor === 'bottom' ? cy + 180 : cy;

    // Generar vértices de la figura base
    const baseShape = this.generateBaseShape(archetype, config, bounds);
    const paths = [];

    for (let i = 0; i < copies; i++) {
      const progress = i / copies;
      
      // Escala y rotación acumuladas
      let currentScale = 1;
      let angle = 0;
      let tx = 0;
      let ty = 0;

      if (archetype === 'radial_rosette') {
        // En roseta radial: rotación completa alrededor de 360°
        angle = (i / copies) * Math.PI * 2 + (parseFloat(config.angle || 0) * Math.PI / 180);
        currentScale = Math.pow(scaleFactor, i * 0.1);
      } else {
        // En espiral / túnel: escala y rotación acumulativa como Illustrator
        currentScale = Math.pow(scaleFactor, i);
        angle = i * rotateStep + (parseFloat(config.angle || 0) * Math.PI / 180);
        tx = i * moveX;
        ty = i * moveY;
      }

      // Si la escala se vuelve microscópica o gigantesca, omitimos
      if (currentScale < 0.02 || currentScale > 8) continue;

      let d = '';
      const numVerts = baseShape.length;

      for (let v = 0; v < numVerts; v++) {
        const pt = baseShape[v];

        // 1. Relativo al ancla
        const rx = pt.x - anchorX;
        const ry = pt.y - anchorY;

        // 2. Escala y rotación matricial
        let x = anchorX + currentScale * (rx * Math.cos(angle) - ry * Math.sin(angle)) + tx;
        let y = anchorY + currentScale * (rx * Math.sin(angle) + ry * Math.cos(angle)) + ty;

        // 3. Textura analógica de Micro-corrugado / Fibra de papel (UJI effect)
        if (jitter > 0) {
          const jx = (Math.sin(i * 12.9898 + v * 78.233) * 0.5) * jitter;
          const jy = (Math.cos(i * 39.346 + v * 11.135) * 0.5) * jitter;
          x += jx;
          y += jy;
        }

        // 4. Aplicar deformaciones manuales del cursor
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
              const swirl = (factor * Math.PI * def.strength) / 25;
              const curDist = Math.hypot(dx, dy);
              const curAngle = Math.atan2(dy, dx) + swirl;
              x = def.x + Math.cos(curAngle) * curDist;
              y = def.y + Math.sin(curAngle) * curDist;
            }
          }
        }

        if (v === 0) {
          d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
          d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
      }

      d += ' Z'; // Cerrar figura

      // Cálculo de opacidad gradual para generar volumen tipo velo / seda
      let op = baseOpacity;
      if (copies > 150) {
        op = (baseOpacity * 0.35 + 0.65 * (1 - progress * 0.7)).toFixed(2);
      }

      paths.push(`<path d="${d}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round" />`);
    }

    return paths.join('\n    ');
  }

  /**
   * Genera los vértices de la figura semilla base
   */
  generateBaseShape(archetype, config, bounds) {
    const { width, height } = bounds;
    const cx = width / 2;
    const cy = height / 2;
    const points = [];

    if (archetype === 'spiral_nautilus') {
      // Elipse vertical esbelta (como en la Imagen 5 de Illustrator)
      const rx = width * 0.18;
      const ry = height * 0.32;
      const steps = 72;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        points.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
      }
    } else if (archetype === 'radial_rosette') {
      // Pétalo simétrico (como en la Imagen 3 de Illustrator)
      const steps = 60;
      const r = width * 0.22;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        // Curva en forma de pétalo
        const modR = r * (0.8 + 0.4 * Math.sin(a));
        points.push({ x: cx + modR * Math.cos(a) * 0.6, y: cy - modR * Math.sin(a) });
      }
    } else if (archetype === 'concentric_tunnel') {
      // Polígono con ondulación perimetral (como en la Imagen 1)
      const sides = parseInt(config.polygonSides, 10) || 7;
      const baseR = width * 0.42;
      const steps = 90;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        // Suavizado armónico poligonal
        const polyWave = Math.cos(a * sides) * 0.15;
        const r = baseR * (1 + polyWave);
        points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
      }
    }

    return points;
  }

  /**
   * Trama Tradicional de Líneas Paralelas (con soporte de micro-jitter de papel)
   */
  renderLinesPattern(config, bounds) {
    const { width, height } = bounds;
    const numLines = parseInt(config.density, 10) || 45;
    const strokeWidth = parseFloat(config.strokeWidth) || 1.2;
    const angleDeg = parseFloat(config.angle) || 0;
    const baseWave = parseFloat(config.baseWaviness) || 0;
    const jitter = parseFloat(config.jitter) || 0;
    const lineColor = config.color || '#a5f3fc';

    const cx = width / 2;
    const cy = height / 2;
    const rad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const diag = Math.hypot(width, height);
    const lineSpacing = diag / (numLines + 1);
    const numPointsPerLine = 130;
    const stepT = diag / (numPointsPerLine - 1);
    const halfDiag = diag / 2;

    const paths = [];

    for (let l = 0; l < numLines; l++) {
      const lineOffset = -halfDiag + (l + 1) * lineSpacing;
      let d = '';

      for (let p = 0; p < numPointsPerLine; p++) {
        const t = -halfDiag + p * stepT;
        let u = t;
        let v = lineOffset;

        // Ondulación matemática base
        if (baseWave > 0) {
          const normP = p / numPointsPerLine;
          v += Math.sin(normP * Math.PI * 4 + l * 0.25) * (baseWave * 0.7);
        }

        let x = cx + u * cosA - v * sinA;
        let y = cy + u * sinA + v * cosA;

        // Textura de papel / micro-corrugado
        if (jitter > 0) {
          x += (Math.sin(l * 13.1 + p * 37.3) * 0.5) * jitter;
          y += (Math.cos(l * 29.7 + p * 19.1) * 0.5) * jitter;
        }

        // Deformaciones manuales esculpidas por el usuario
        for (const def of this.deformations) {
          const dx = x - def.x;
          const dy = y - def.y;
          const dist = Math.hypot(dx, dy);

          if (dist < def.radius) {
            const factor = Math.max(0, 1 - dist / def.radius);
            if (def.mode === 'peak') {
              x -= sinA * def.strength * factor;
              y -= cosA * def.strength * factor;
            } else if (def.mode === 'smooth') {
              const smoothFactor = 0.5 * (1 + Math.cos((Math.PI * dist) / def.radius));
              x -= sinA * def.strength * smoothFactor;
              y -= cosA * def.strength * smoothFactor;
            } else if (def.mode === 'twist') {
              const swirl = (factor * Math.PI * def.strength) / 30;
              const curDist = Math.hypot(dx, dy);
              const curAngle = Math.atan2(dy, dx) + swirl;
              x = def.x + Math.cos(curAngle) * curDist;
              y = def.y + Math.sin(curAngle) * curDist;
            } else if (def.mode === 'flatten') {
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

      const opacity = (0.35 + 0.65 * (l / numLines)).toFixed(2);
      paths.push(`<path d="${d}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />`);
    }

    return paths.join('\n    ');
  }

  renderGridPattern(config, bounds) {
    const hConfig = { ...config, angle: 0 };
    const vConfig = { ...config, angle: 90 };
    return this.renderLinesPattern(hConfig, bounds) + '\n' + this.renderLinesPattern(vConfig, bounds);
  }

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

  toCode(state) {
    return `// Abstract Studio - Vector Generative Code
const state = ${JSON.stringify(state, null, 2)};
const deformations = ${JSON.stringify(this.deformations, null, 2)};
`;
  }
}
