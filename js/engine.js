/**
 * Abstract Studio - Motor Gráfico Unificado (Dual Canvas 2D + Vector SVG)
 * Soporta composición multicapa con Modos de Fusión para efectos Moiré,
 * distribuciones Cartesiana, Polar (Radiación) y Lineal, moduladores paramétricos,
 * textura analógica (micro-corrugado) y esculpido directo por cursor.
 */

import { Shapes } from './shapes.js';

export const ASPECT_RATIOS = {
  '1:1': { label: '1:1 (Cuadrado)', width: 800, height: 800 },
  '9:16': { label: '9:16 (Vertical / Stories)', width: 540, height: 960 },
  '16:9': { label: '16:9 (Panorámico / Cinema)', width: 960, height: 540 },
  '4:5': { label: '4:5 (Retrato / Instagram)', width: 640, height: 800 },
  '4:3': { label: '4:3 (Editorial Clásico)', width: 800, height: 600 }
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
    const radius = parseFloat(brushConfig.radius) || 75;
    const strength = parseFloat(brushConfig.strength) || 60;
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
   * Renderiza el estado completo en un Canvas 2D acelerado (HiDPI / Retina) a 60 FPS
   */
  renderCanvas(canvas, state) {
    if (!canvas) return;
    const bounds = this.getBounds(state.canvas.aspectRatio);
    const { width, height } = bounds;
    const dpr = window.devicePixelRatio || 1;

    // Configuración Retina HiDPI
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    canvas.style.aspectRatio = `${width} / ${height}`;

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Fondo de Lienzo
    let bgColor = state.canvas.bgColor || '#0e0e11';
    let fgInverted = !!state.canvas.invertFigureGround;
    if (fgInverted) {
      bgColor = state.canvas.invertedBgColor || '#f4f4f5';
    }
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Guías / Safe Bounds si están activadas
    if (state.canvas.showSafeBounds) {
      this.drawSafeBounds(ctx, width, height);
    }

    // 3. Renderizado de Capas en orden (Fondo -> Frente)
    const layers = state.layers || [];
    for (const layer of layers) {
      if (!layer.visible) continue;

      ctx.save();
      const alpha = (layer.opacity !== undefined ? layer.opacity : 100) / 100;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.globalCompositeOperation = layer.blendMode || 'source-over';

      if (layer.type === 'pattern') {
        this.renderPatternLayerCanvas(ctx, layer, bounds, fgInverted);
      } else if (layer.type === 'element') {
        this.renderElementLayerCanvas(ctx, layer, bounds, fgInverted);
      }
      ctx.restore();
    }

    // 4. Previsualización del Cursor de Esculpido
    if (this.cursorPreview && state.brushActive) {
      const { cx, cy, r } = this.cursorPreview;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  drawSafeBounds(ctx, width, height) {
    const margin = Math.round(Math.min(width, height) * 0.05);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Centro
    const cx = width / 2;
    const cy = height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renderizado Canvas de una Capa de Patrón
   */
  renderPatternLayerCanvas(ctx, layer, bounds, inverted) {
    const dist = layer.distribution || 'cartesian';
    if (dist === 'polar') {
      this.renderPolarPatternCanvas(ctx, layer, bounds, inverted);
    } else if (dist === 'linear') {
      this.renderLinearPatternCanvas(ctx, layer, bounds, inverted);
    } else {
      this.renderCartesianPatternCanvas(ctx, layer, bounds, inverted);
    }
  }

  /**
   * Distribución Cartesiana (Retícula ortogonal / cizalla / zigzag con moduladores)
   */
  renderCartesianPatternCanvas(ctx, layer, bounds, inverted) {
    const { width, height } = bounds;
    const cart = layer.cartesian || {};
    const cols = Math.max(1, parseInt(cart.cols, 10) || 6);
    const rows = Math.max(1, parseInt(cart.rows, 10) || 6);
    const gridType = cart.gridType || 'basic';
    const margin = Math.round(Math.min(width, height) * 0.06);
    const usableW = width - margin * 2;
    const usableH = height - margin * 2;

    const cellW = usableW / cols;
    const cellH = usableH / rows;

    const baseColor = inverted ? (layer.color === '#f4f4f5' ? '#0e0e11' : layer.color) : (layer.color || '#f4f4f5');
    const shapeDef = Shapes[layer.shape] || Shapes.circle;
    const baseW = parseFloat(layer.width) || 50;
    const baseH = parseFloat(layer.height) || 50;
    const baseRot = ((parseFloat(layer.rotation) || 0) * Math.PI) / 180;
    const offX = parseFloat(layer.offsetX) || 0;
    const offY = parseFloat(layer.offsetY) || 0;
    const fillMode = layer.fillMode || 'stroke';
    const strokeW = parseFloat(layer.strokeWidth) || 1.5;
    const jitter = parseFloat(layer.jitter) || 0;

    // Moduladores
    const grad = layer.gradation || {};
    const anom = layer.anomaly || {};
    const conc = layer.concentration || {};
    const sim = layer.similarity || {};
    const space = layer.space || {};

    ctx.save();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let cx = margin + (c + 0.5) * cellW + offX;
        let cy = margin + (r + 0.5) * cellH + offY;

        // Tipo de retícula
        if (gridType === 'sliding') {
          const slide = (parseFloat(cart.slideOffset) || 0.5) * cellW;
          if (r % 2 === 1) cx += slide;
        } else if (gridType === 'sheared') {
          const shearRad = ((parseFloat(cart.shearAngle) || 15) * Math.PI) / 180;
          cx += (r - rows / 2) * cellH * Math.tan(shearRad);
        } else if (gridType === 'zigzag') {
          const amp = cellW * 0.25;
          cx += (r % 2 === 0 ? 1 : -1) * amp;
        } else if (gridType === 'curved') {
          const curveAmp = parseFloat(cart.curveIntensity) || 20;
          const normY = (r / rows) - 0.5;
          cx += Math.sin(normY * Math.PI) * curveAmp;
        }

        // Concentración gravitatoria
        if (conc.enabled) {
          const ax = (conc.attractorX !== undefined ? conc.attractorX : 0.5) * width;
          const ay = (conc.attractorY !== undefined ? conc.attractorY : 0.5) * height;
          const dx = ax - cx;
          const dy = ay - cy;
          const dist = Math.hypot(dx, dy);
          const radConc = conc.radius || 200;
          if (dist < radConc && dist > 1) {
            const pull = (1 - dist / radConc) * ((conc.power || 50) / 100);
            if (conc.mode === 'void') {
              cx -= (dx / dist) * pull * 40;
              cy -= (dy / dist) * pull * 40;
            } else {
              cx += (dx / dist) * pull * 40;
              cy += (dy / dist) * pull * 40;
            }
          }
        }

        // Deformaciones del pincel
        let p = this.applyDeformations(cx, cy);
        cx = p.x;
        cy = p.y;

        // Jitter analógico
        if (jitter > 0) {
          cx += (Math.sin(r * 12.3 + c * 45.6) * 0.5) * jitter;
          cy += (Math.cos(r * 31.7 + c * 17.2) * 0.5) * jitter;
        }

        // Gradación
        let curRot = baseRot;
        let scaleX = 1;
        let scaleY = 1;
        if (grad.enabled) {
          let progress = 0;
          if (grad.pathway === 'horizontal') progress = c / (cols - 1 || 1);
          else if (grad.pathway === 'vertical') progress = r / (rows - 1 || 1);
          else if (grad.pathway === 'concentric') {
            const dNorm = Math.hypot(c - cols / 2, r - rows / 2) / Math.hypot(cols / 2, rows / 2);
            progress = Math.min(1, dNorm);
          } else {
            progress = (c / (cols - 1 || 1) + r / (rows - 1 || 1)) * 0.5;
          }

          const span = ((grad.range || 180) * Math.PI) / 180;
          if (grad.type === 'scale') {
            const sf = 0.3 + 1.2 * progress;
            scaleX *= sf;
            scaleY *= sf;
          } else {
            curRot += span * progress;
          }
        }

        // Anomalía
        let isAnomalous = false;
        let anomShape = shapeDef;
        if (anom.enabled) {
          const ex = (anom.epicenterX !== undefined ? anom.epicenterX : 0.5) * width;
          const ey = (anom.epicenterY !== undefined ? anom.epicenterY : 0.5) * height;
          const distToEpi = Math.hypot(cx - ex, cy - ey);
          if (distToEpi < (anom.radius || 180)) {
            isAnomalous = true;
            if (anom.shape && Shapes[anom.shape]) anomShape = Shapes[anom.shape];
            const anomFactor = 1 - distToEpi / (anom.radius || 180);
            scaleX *= (1 + anomFactor * 0.5);
            scaleY *= (1 + anomFactor * 0.5);
            curRot += anomFactor * Math.PI * 0.5;
          }
        }

        // Similitud (kinship orgánica)
        if (sim.enabled) {
          const simInt = (sim.intensity || 40) / 100;
          const wobble = Math.sin(r * 4.1 + c * 7.7) * simInt * 0.35;
          scaleX *= (1 + wobble);
          scaleY *= (1 - wobble);
          curRot += Math.cos(r * 2.3 + c * 5.1) * simInt * 0.25;
        }

        // Renderizar forma individual
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(curRot);
        ctx.scale(scaleX * (baseW / 100), scaleY * (baseH / 100));

        // Modo espacio 3D (extrusión isométrica)
        if (space.enabled) {
          this.drawIsometricExtrusion(ctx, isAnomalous ? anomShape : shapeDef, space, baseColor);
        }

        ctx.strokeStyle = isAnomalous && anom.highlightColor ? '#ef4444' : baseColor;
        ctx.fillStyle = isAnomalous && anom.highlightColor ? '#ef4444' : baseColor;
        ctx.lineWidth = strokeW / Math.max(0.1, (scaleX + scaleY) / 2);

        const targetShape = isAnomalous ? anomShape : shapeDef;
        targetShape.draw(ctx, 100);

        if (fillMode === 'fill') ctx.fill();
        else ctx.stroke();

        ctx.restore();
      }
    }

    ctx.restore();
  }

  /**
   * Distribución Polar (Radiación centrífuga, concéntrica, espiral para Moiré)
   */
  renderPolarPatternCanvas(ctx, layer, bounds, inverted) {
    const { width, height } = bounds;
    const polar = layer.polar || {};
    const scheme = polar.scheme || 'centrifugal';
    const rays = Math.max(3, parseInt(polar.rays, 10) || 24);
    const rings = Math.max(1, parseInt(polar.rings, 10) || 6);
    const spiralTwist = ((parseFloat(polar.spiralTwist) || 45) * Math.PI) / 180;
    const maxRadius = (polar.radius || 0.42) * Math.min(width, height);

    const cx0 = width / 2 + (parseFloat(polar.centerX) || 0) + (parseFloat(layer.offsetX) || 0);
    const cy0 = height / 2 + (parseFloat(polar.centerY) || 0) + (parseFloat(layer.offsetY) || 0);

    const baseColor = inverted ? (layer.color === '#f4f4f5' ? '#0e0e11' : layer.color) : (layer.color || '#f4f4f5');
    const shapeDef = Shapes[layer.shape] || Shapes.line;
    const baseW = parseFloat(layer.width) || 60;
    const baseH = parseFloat(layer.height) || 60;
    const baseRot = ((parseFloat(layer.rotation) || 0) * Math.PI) / 180;
    const fillMode = layer.fillMode || 'stroke';
    const strokeW = parseFloat(layer.strokeWidth) || 1.5;
    const jitter = parseFloat(layer.jitter) || 0;

    ctx.save();

    if (scheme === 'centrifugal' && layer.shape === 'line') {
      // Rayos continuos para un efecto Moiré ultra-puro y de alto rendimiento
      for (let i = 0; i < rays; i++) {
        const angle = (i * Math.PI * 2) / rays + baseRot;
        const x2 = cx0 + Math.cos(angle) * maxRadius;
        const y2 = cy0 + Math.sin(angle) * maxRadius;

        let p1 = this.applyDeformations(cx0, cy0);
        let p2 = this.applyDeformations(x2, y2);

        if (jitter > 0) {
          p2.x += Math.sin(i * 17.1) * jitter;
          p2.y += Math.cos(i * 23.4) * jitter;
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = strokeW;
        ctx.stroke();
      }
    } else {
      // Anillos y rayos con colocación modular
      for (let ring = 1; ring <= rings; ring++) {
        const rRatio = ring / rings;
        const currentR = rRatio * maxRadius;
        const twistAngle = scheme === 'spiral' ? rRatio * spiralTwist : 0;

        for (let ray = 0; ray < rays; ray++) {
          const rayAngle = (ray * Math.PI * 2) / rays + twistAngle + baseRot;
          let px = cx0 + Math.cos(rayAngle) * currentR;
          let py = cy0 + Math.sin(rayAngle) * currentR;

          // Deformaciones
          let p = this.applyDeformations(px, py);
          px = p.x;
          py = p.y;

          if (jitter > 0) {
            px += (Math.sin(ring * 19.1 + ray * 7.7) * 0.5) * jitter;
            py += (Math.cos(ring * 11.3 + ray * 13.9) * 0.5) * jitter;
          }

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(rayAngle + (scheme === 'concentric' ? Math.PI / 2 : 0));
          ctx.scale(baseW / 100, baseH / 100);

          ctx.strokeStyle = baseColor;
          ctx.fillStyle = baseColor;
          ctx.lineWidth = strokeW;

          shapeDef.draw(ctx, 100);
          if (fillMode === 'fill') ctx.fill();
          else ctx.stroke();

          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  /**
   * Distribución Lineal (Líneas paralelas o figuras con ondulación y espaciado continuo)
   */
  renderLinearPatternCanvas(ctx, layer, bounds, inverted) {
    const { width, height } = bounds;
    const lin = layer.linear || {};
    const copies = Math.max(1, parseInt(lin.copies, 10) || 36);
    const angleDeg = parseFloat(lin.angle || 0) + (parseFloat(layer.rotation) || 0);
    const strokeW = parseFloat(layer.strokeWidth) || 1.2;
    const baseColor = inverted ? (layer.color === '#f4f4f5' ? '#0e0e11' : layer.color) : (layer.color || '#f4f4f5');
    const waviness = parseFloat(lin.waviness) || 0;
    const jitter = parseFloat(layer.jitter) || 0;

    const rad = (angleDeg * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    const cx = width / 2 + (parseFloat(layer.offsetX) || 0);
    const cy = height / 2 + (parseFloat(layer.offsetY) || 0);
    const sizeX = (parseFloat(layer.width) || 100) * 5;
    const sizeY = (parseFloat(layer.height) || 100) * 4;

    const halfSpanY = sizeY / 2;
    const halfSpanX = sizeX / 2;
    const lineSpacing = copies > 1 ? sizeY / (copies - 1) : 0;
    const numPointsPerLine = Math.max(30, Math.min(200, Math.floor(sizeX / 3.5)));
    const stepT = numPointsPerLine > 1 ? sizeX / (numPointsPerLine - 1) : 0;

    ctx.save();
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = strokeW;

    for (let l = 0; l < copies; l++) {
      const lineOffset = copies > 1 ? -halfSpanY + l * lineSpacing : 0;
      ctx.beginPath();

      for (let p = 0; p < numPointsPerLine; p++) {
        const t = -halfSpanX + p * stepT;
        let u = t;
        let v = lineOffset;

        if (waviness > 0) {
          const normP = p / numPointsPerLine;
          v += Math.sin(normP * Math.PI * 4 + l * 0.25) * (waviness * 0.7);
        }

        let x = cx + u * cosA - v * sinA;
        let y = cy + u * sinA + v * cosA;

        if (jitter > 0) {
          x += (Math.sin(l * 13.1 + p * 37.3) * 0.5) * jitter;
          y += (Math.cos(l * 29.7 + p * 19.1) * 0.5) * jitter;
        }

        const deformed = this.applyDeformations(x, y);
        x = deformed.x;
        y = deformed.y;

        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renderiza una capa de Elemento / Acento (Círculo Zen, Glifo, Marco)
   */
  renderElementLayerCanvas(ctx, layer, bounds, inverted) {
    const { width, height } = bounds;
    const shapeDef = Shapes[layer.shape] || Shapes.circle;
    const px = (parseFloat(layer.posX !== undefined ? layer.posX : 50) / 100) * width;
    const py = (parseFloat(layer.posY !== undefined ? layer.posY : 50) / 100) * height;
    const size = parseFloat(layer.size) || 200;
    const rot = ((parseFloat(layer.rotation) || 0) * Math.PI) / 180;
    const color = inverted ? (layer.color === '#f4f4f5' ? '#0e0e11' : layer.color) : (layer.color || '#ef4444');
    const fillMode = layer.fillMode || 'fill';
    const strokeW = parseFloat(layer.strokeWidth) || 2;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeW;

    shapeDef.draw(ctx, size);
    if (fillMode === 'fill') ctx.fill();
    else ctx.stroke();

    ctx.restore();
  }

  drawIsometricExtrusion(ctx, shapeDef, spaceConfig, color) {
    const depth = parseFloat(spaceConfig.depth) || 25;
    const angleRad = ((parseFloat(spaceConfig.angle) || 30) * Math.PI) / 180;
    const dx = Math.cos(angleRad) * depth;
    const dy = Math.sin(angleRad) * depth;

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = color;
    ctx.translate(dx, dy);
    shapeDef.draw(ctx, 100);
    ctx.fill();
    ctx.restore();
  }

  applyDeformations(x, y) {
    let curX = x;
    let curY = y;
    for (const def of this.deformations) {
      const dx = curX - def.x;
      const dy = curY - def.y;
      const dist = Math.hypot(dx, dy);

      if (dist < def.radius) {
        const factor = Math.max(0, 1 - dist / def.radius);
        if (def.mode === 'peak') {
          curX -= (dx / (dist || 1)) * def.strength * factor;
          curY -= (dy / (dist || 1)) * def.strength * factor;
        } else if (def.mode === 'smooth') {
          const smoothFactor = 0.5 * (1 + Math.cos((Math.PI * dist) / def.radius));
          curX -= (dx / (dist || 1)) * def.strength * smoothFactor;
          curY -= (dy / (dist || 1)) * def.strength * smoothFactor;
        } else if (def.mode === 'twist') {
          const swirl = (factor * Math.PI * def.strength) / 30;
          const curAngle = Math.atan2(dy, dx) + swirl;
          curX = def.x + Math.cos(curAngle) * dist;
          curY = def.y + Math.sin(curAngle) * dist;
        }
      }
    }
    return { x: curX, y: curY };
  }

  /**
   * Generador Vectorial SVG puro e infinito (para exportar a Illustrator o Plotters)
   */
  renderSVG(state) {
    const bounds = this.getBounds(state.canvas.aspectRatio);
    const { width, height } = bounds;
    const bgColor = state.canvas.invertFigureGround
      ? (state.canvas.invertedBgColor || '#f4f4f5')
      : (state.canvas.bgColor || '#0e0e11');

    let layersMarkup = '';
    const layers = state.layers || [];

    for (const layer of layers) {
      if (!layer.visible) continue;
      const alpha = (layer.opacity !== undefined ? layer.opacity : 100) / 100;
      const blend = layer.blendMode || 'normal';

      layersMarkup += `\n  <!-- Capa: ${layer.name} (${layer.type}) -->\n`;
      layersMarkup += `  <g id="layer-${layer.id}" opacity="${alpha}" style="mix-blend-mode: ${blend};">\n`;

      if (layer.type === 'pattern') {
        layersMarkup += this.renderPatternLayerSVG(layer, bounds, state.canvas.invertFigureGround);
      } else if (layer.type === 'element') {
        layersMarkup += this.renderElementLayerSVG(layer, bounds, state.canvas.invertFigureGround);
      }

      layersMarkup += `  </g>\n`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- Abstract Studio - Composición Multicapa Generativa (${width}x${height}) -->
  <rect width="100%" height="100%" fill="${bgColor}" />
${layersMarkup}
</svg>`.trim();
  }

  renderPatternLayerSVG(layer, bounds, inverted) {
    const dist = layer.distribution || 'cartesian';
    const baseColor = inverted ? (layer.color === '#f4f4f5' ? '#0e0e11' : layer.color) : (layer.color || '#f4f4f5');
    const shapeDef = Shapes[layer.shape] || Shapes.circle;
    const strokeW = parseFloat(layer.strokeWidth) || 1.5;
    const fillMode = layer.fillMode || 'stroke';

    let out = '';

    if (dist === 'polar') {
      const polar = layer.polar || {};
      const rays = Math.max(3, parseInt(polar.rays, 10) || 24);
      const maxRadius = (polar.radius || 0.42) * Math.min(bounds.width, bounds.height);
      const cx0 = bounds.width / 2 + (parseFloat(polar.centerX) || 0) + (parseFloat(layer.offsetX) || 0);
      const cy0 = bounds.height / 2 + (parseFloat(polar.centerY) || 0) + (parseFloat(layer.offsetY) || 0);
      const baseRot = ((parseFloat(layer.rotation) || 0) * Math.PI) / 180;

      if (polar.scheme === 'centrifugal' && layer.shape === 'line') {
        for (let i = 0; i < rays; i++) {
          const angle = (i * Math.PI * 2) / rays + baseRot;
          const x2 = cx0 + Math.cos(angle) * maxRadius;
          const y2 = cy0 + Math.sin(angle) * maxRadius;
          out += `    <line x1="${cx0.toFixed(2)}" y1="${cy0.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${baseColor}" stroke-width="${strokeW}" />\n`;
        }
      } else {
        const rings = Math.max(1, parseInt(polar.rings, 10) || 6);
        for (let ring = 1; ring <= rings; ring++) {
          const currentR = (ring / rings) * maxRadius;
          for (let ray = 0; ray < rays; ray++) {
            const rayAngle = (ray * Math.PI * 2) / rays + baseRot;
            const px = cx0 + Math.cos(rayAngle) * currentR;
            const py = cy0 + Math.sin(rayAngle) * currentR;
            const deg = (rayAngle * 180) / Math.PI;
            out += `    <g transform="translate(${px.toFixed(2)},${py.toFixed(2)}) rotate(${deg.toFixed(2)}) scale(${(layer.width / 100).toFixed(2)},${(layer.height / 100).toFixed(2)})" ${fillMode === 'fill' ? `fill="${baseColor}"` : `fill="none" stroke="${baseColor}" stroke-width="${strokeW}"`}>\n      ${shapeDef.svgPath(100)}\n    </g>\n`;
          }
        }
      }
    } else {
      // Cartesiana
      const cart = layer.cartesian || {};
      const cols = Math.max(1, parseInt(cart.cols, 10) || 6);
      const rows = Math.max(1, parseInt(cart.rows, 10) || 6);
      const margin = Math.round(Math.min(bounds.width, bounds.height) * 0.06);
      const usableW = bounds.width - margin * 2;
      const usableH = bounds.height - margin * 2;
      const cellW = usableW / cols;
      const cellH = usableH / rows;
      const offX = parseFloat(layer.offsetX) || 0;
      const offY = parseFloat(layer.offsetY) || 0;
      const rotDeg = parseFloat(layer.rotation) || 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = margin + (c + 0.5) * cellW + offX;
          const cy = margin + (r + 0.5) * cellH + offY;
          out += `    <g transform="translate(${cx.toFixed(2)},${cy.toFixed(2)}) rotate(${rotDeg}) scale(${(layer.width / 100).toFixed(2)},${(layer.height / 100).toFixed(2)})" ${fillMode === 'fill' ? `fill="${baseColor}"` : `fill="none" stroke="${baseColor}" stroke-width="${strokeW}"`}>\n      ${shapeDef.svgPath(100)}\n    </g>\n`;
        }
      }
    }

    return out;
  }

  renderElementLayerSVG(layer, bounds, inverted) {
    const shapeDef = Shapes[layer.shape] || Shapes.circle;
    const px = ((parseFloat(layer.posX || 50) / 100) * bounds.width).toFixed(2);
    const py = ((parseFloat(layer.posY || 50) / 100) * bounds.height).toFixed(2);
    const size = parseFloat(layer.size) || 200;
    const rot = parseFloat(layer.rotation) || 0;
    const color = inverted ? (layer.color === '#f4f4f5' ? '#0e0e11' : layer.color) : (layer.color || '#ef4444');
    const fillMode = layer.fillMode || 'fill';
    const strokeW = parseFloat(layer.strokeWidth) || 2;

    return `    <g transform="translate(${px},${py}) rotate(${rot})" ${fillMode === 'fill' ? `fill="${color}"` : `fill="none" stroke="${color}" stroke-width="${strokeW}"`}>\n      ${shapeDef.svgPath(size)}\n    </g>\n`;
  }
}
