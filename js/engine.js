/**
 * Motor de Renderizado Vectorial para Abstract Studio
 * Integra:
 * 1. Figura Base (con tamaño desde pieza central hasta sangrado total de fondo)
 * 2. Transformación acumulativa (estilo Illustrator)
 * 3. Textura y materia (Jitter, Skip Chance y Line Swappiness estilo UJI)
 * 4. Esculpido manual directo con el cursor
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
    const bgColor = state.canvas.bgColor || '#0a0e17';

    // 1. Capas de diferencia (Detrás de la trama)
    const behindDiffs = (state.differenceLayers || [])
      .filter(l => l.active && l.placement === 'behind')
      .map(l => this.renderDifferenceElement(l, bounds))
      .join('\n');

    // 2. Capa 1: Geometría Transformada, Textura y Deformaciones
    const patternSvg = this.renderCoreGeometry(state.pattern, bounds);

    // 3. Capas de diferencia (Encima de la trama)
    const inFrontDiffs = (state.differenceLayers || [])
      .filter(l => l.active && l.placement === 'in-front')
      .map(l => this.renderDifferenceElement(l, bounds))
      .join('\n');

    // 4. Cursor del pincel de esculpido
    let cursorRing = '';
    if (this.cursorPreview) {
      const { cx, cy, r } = this.cursorPreview;
      cursorRing = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${state.pattern.color || '#38bdf8'}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.65" pointer-events="none" />`;
    }

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="cursor: crosshair;">
  <!-- Abstract Studio Composition (${width}x${height}) -->
  <rect width="100%" height="100%" fill="${bgColor}" />
  
  <!-- Capa Fondo: Elementos de Diferencia Detrás -->
  <g id="layer-diff-behind">
    ${behindDiffs}
  </g>

  <!-- Capa Principal: Geometría & Textura -->
  <g id="layer-core-geometry">
    ${patternSvg}
  </g>

  <!-- Capa Frente: Elementos de Diferencia Delante -->
  <g id="layer-diff-front">
    ${inFrontDiffs}
  </g>

  <!-- Anillo del Pincel -->
  ${cursorRing}
</svg>`.trim();
  }

  /**
   * Renderiza el motor iterativo central (Figura base + Transformaciones + Textura)
   */
  renderCoreGeometry(config, bounds) {
    const { width, height } = bounds;
    
    // Parámetros de Figura Base
    const shapeType = config.shape || 'circle';
    const polygonSides = parseInt(config.polygonSides, 10) || 4;
    const baseRadius = parseFloat(config.size) || 300;
    const centerX = (parseFloat(config.centerX || 50) / 100) * width;
    const centerY = (parseFloat(config.centerY || 50) / 100) * height;

    // Parámetros de Transformación Acumulativa
    const copies = parseInt(config.copies, 10) || 50;
    const scaleFactor = parseFloat(config.scaleStep) || 0.96;
    const rotateStep = (parseFloat(config.rotateStep) || 8) * (Math.PI / 180);
    const moveX = parseFloat(config.moveX) || 0;
    const moveY = parseFloat(config.moveY) || 0;
    const anchor = config.anchor || 'center';

    // Parámetros de Textura & Materia (UJI)
    const jitter = parseFloat(config.jitter) || 0;
    const skipChance = (parseFloat(config.skipChance) || 0) / 100;
    const swappiness = (parseFloat(config.lineSwappiness) || 0) / 100;
    const waviness = parseFloat(config.waviness) || 0;
    const strokeWidth = parseFloat(config.strokeWidth) || 1.0;
    const baseOpacity = parseFloat(config.opacity) || 0.8;
    const lineColor = config.color || '#a5f3fc';

    // Punto de Ancla para la rotación acumulativa
    const anchorX = anchor === 'bottom' ? centerX : anchor === 'side' ? centerX - baseRadius * 0.5 : centerX;
    const anchorY = anchor === 'bottom' ? centerY + baseRadius * 0.5 : centerY;

    // Generar vértices de la figura semilla base
    const rawShape = this.createSeedVertices(shapeType, polygonSides, baseRadius, centerX, centerY, bounds);
    const numVerts = rawShape.length;
    const paths = [];

    // Bucle iterativo de repetición
    for (let i = 0; i < copies; i++) {
      const progress = i / copies;
      const currentScale = Math.pow(scaleFactor, i);
      const angle = i * rotateStep;
      const tx = i * moveX;
      const ty = i * moveY;

      // Evitar escalas absurdas que colapsan o saturan la memoria
      if (currentScale < 0.01 || currentScale > 10) continue;

      // Clonar y transformar vértices
      let verts = [];
      for (let v = 0; v < numVerts; v++) {
        const pt = rawShape[v];
        const rx = pt.x - anchorX;
        const ry = pt.y - anchorY;

        // Escala y rotación afín
        let x = anchorX + currentScale * (rx * Math.cos(angle) - ry * Math.sin(angle)) + tx;
        let y = anchorY + currentScale * (rx * Math.sin(angle) + ry * Math.cos(angle)) + ty;

        // Ondulación perimetral (Waviness)
        if (waviness > 0) {
          const wAngle = (v / numVerts) * Math.PI * 6 + i * 0.2;
          const wVal = Math.sin(wAngle) * waviness * currentScale;
          x += Math.cos(wAngle) * wVal;
          y += Math.sin(wAngle) * wVal;
        }

        // Textura analógica de Micro-corrugado / Jitter
        if (jitter > 0) {
          const jx = (Math.sin(i * 17.13 + v * 53.71) * 0.5) * jitter;
          const jy = (Math.cos(i * 29.81 + v * 19.33) * 0.5) * jitter;
          x += jx;
          y += jy;
        }

        // Deformaciones manuales esculpidas con el cursor
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

        verts.push({ x, y });
      }

      // Cruce de hebras / Swappiness (deshilachado textil)
      if (swappiness > 0) {
        const swapCount = Math.floor(numVerts * swappiness * 0.2);
        for (let s = 0; s < swapCount; s++) {
          const idxA = Math.floor(Math.abs(Math.sin(i * 9.1 + s * 3.7)) * numVerts) % numVerts;
          const idxB = (idxA + 2 + Math.floor(Math.abs(Math.cos(i * 5.3 + s * 7.1)) * 6)) % numVerts;
          const temp = verts[idxA];
          verts[idxA] = verts[idxB];
          verts[idxB] = temp;
        }
      }

      // Construcción del trazado SVG con soporte de Skip Chance (Respiración/saltos)
      let d = '';
      let isDrawing = false;
      const isClosed = shapeType !== 'line';

      for (let v = 0; v < numVerts; v++) {
        // Test estocástico de salto de segmento
        const skipHash = Math.abs(Math.sin(i * 43.1 + v * 97.7));
        const shouldSkip = skipChance > 0 && skipHash < skipChance;

        if (shouldSkip) {
          isDrawing = false; // Levantar la plumilla
          continue;
        }

        const vx = verts[v].x.toFixed(1);
        const vy = verts[v].y.toFixed(1);

        if (!isDrawing) {
          d += ` M ${vx} ${vy}`;
          isDrawing = true;
        } else {
          d += ` L ${vx} ${vy}`;
        }
      }

      if (isClosed && isDrawing && skipChance === 0) {
        d += ' Z';
      }

      // Opacidad adaptativa para miles de líneas
      let op = baseOpacity;
      if (copies > 150) {
        op = (baseOpacity * 0.4 + 0.6 * (1 - progress * 0.6)).toFixed(2);
      }

      if (d.trim().length > 0) {
        paths.push(`<path d="${d}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round" />`);
      }
    }

    return paths.join('\n    ');
  }

  /**
   * Genera los vértices de la figura base
   */
  createSeedVertices(shape, sides, radius, cx, cy, bounds) {
    const points = [];

    if (shape === 'circle') {
      const steps = 80;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        points.push({ x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) });
      }
    } else if (shape === 'polygon') {
      const numSides = Math.max(3, sides);
      const pointsPerSide = 16;
      for (let i = 0; i < numSides; i++) {
        const a1 = (i / numSides) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / numSides) * Math.PI * 2 - Math.PI / 2;
        const p1 = { x: cx + radius * Math.cos(a1), y: cy + radius * Math.sin(a1) };
        const p2 = { x: cx + radius * Math.cos(a2), y: cy + radius * Math.sin(a2) };

        for (let j = 0; j < pointsPerSide; j++) {
          const t = j / pointsPerSide;
          points.push({
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
          });
        }
      }
    } else if (shape === 'line') {
      const steps = 90;
      const halfW = radius;
      for (let s = 0; s < steps; s++) {
        const t = (s / (steps - 1)) * 2 - 1;
        points.push({ x: cx + t * halfW, y: cy });
      }
    } else if (shape === 'petal') {
      const steps = 72;
      for (let s = 0; s < steps; s++) {
        const a = (s / steps) * Math.PI * 2;
        const modR = radius * (0.8 + 0.4 * Math.sin(a));
        points.push({ x: cx + modR * Math.cos(a) * 0.6, y: cy - modR * Math.sin(a) });
      }
    }

    return points;
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
    return `// Abstract Studio - Generative Vector Code
const state = ${JSON.stringify(state, null, 2)};
const deformations = ${JSON.stringify(this.deformations, null, 2)};
`;
  }
}
