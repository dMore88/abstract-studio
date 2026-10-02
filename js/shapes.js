/**
 * Abstract Studio - Primitive Shapes & Parametric Geometry Catalog
 * Supports Dual Rendering: Accelerated 2D Canvas (60 FPS) and Pure Vector SVG.
 * English names & Phosphor Icons Fill weight support.
 */

export const Shapes = {
  circle: {
    id: "circle",
    name: "Circle",
    phFillClass: "ph-fill ph-circle",
    draw(ctx, size) {
      const r = size * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
    },
    svgPath(size) {
      const r = size * 0.5;
      return `<circle cx="0" cy="0" r="${r}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><circle cx="0" cy="0" r="14" fill="currentColor"/></svg>`
  },

  rect: {
    id: "rect",
    name: "Rectangle",
    phFillClass: "ph-fill ph-square",
    draw(ctx, size) {
      const w = size * 0.65;
      const h = size * 0.9;
      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.closePath();
    },
    svgPath(size) {
      const w = size * 0.65;
      const h = size * 0.9;
      return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><rect x="-10" y="-14" width="20" height="28" rx="2" fill="currentColor"/></svg>`
  },

  triangle_eq: {
    id: "triangle_eq",
    name: "Equilateral Triangle",
    phFillClass: "ph-fill ph-triangle",
    draw(ctx, size) {
      const r = size * 0.55;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.866, r * 0.5);
      ctx.lineTo(-r * 0.866, r * 0.5);
      ctx.closePath();
    },
    svgPath(size) {
      const r = size * 0.55;
      const p1 = `0,${-r}`;
      const p2 = `${r * 0.866},${r * 0.5}`;
      const p3 = `${-r * 0.866},${r * 0.5}`;
      return `<polygon points="${p1} ${p2} ${p3}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="0,-14 13,9 -13,9" fill="currentColor"/></svg>`
  },

  wave: {
    id: "wave",
    name: "Sine Wave",
    phFillClass: "ph-bold ph-wave-sine",
    draw(ctx, size) {
      const w = size * 0.9;
      const a = size * 0.25;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.bezierCurveTo(-w * 0.25, -a * 1.5, -w * 0.1, -a * 1.5, 0, 0);
      ctx.bezierCurveTo(w * 0.1, a * 1.5, w * 0.25, a * 1.5, w / 2, 0);
    },
    svgPath(size) {
      const w = size * 0.9;
      const a = size * 0.25;
      return `<path d="M ${-w / 2} 0 C ${-w * 0.25} ${-a * 1.5}, ${-w * 0.1} ${-a * 1.5}, 0 0 C ${w * 0.1} ${a * 1.5}, ${w * 0.25} ${a * 1.5}, ${w / 2} 0" fill="none" stroke="currentColor" stroke-width="2" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M -14 0 C -9 -10 -4 -10 0 0 C 4 10 9 10 14 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`
  },

  horseshoe: {
    id: "horseshoe",
    name: "Arch / Horseshoe",
    phFillClass: "ph-fill ph-magnet",
    draw(ctx, size) {
      const w = size * 0.6;
      const h = size * 0.7;
      const r = w / 2;
      ctx.beginPath();
      ctx.arc(0, -h / 4, r, Math.PI, 0, false);
      ctx.lineTo(r, h / 2);
      ctx.lineTo(r * 0.45, h / 2);
      ctx.lineTo(r * 0.45, -h / 4);
      ctx.arc(0, -h / 4, r * 0.45, 0, Math.PI, true);
      ctx.lineTo(-r * 0.45, h / 2);
      ctx.lineTo(-r, h / 2);
      ctx.closePath();
    },
    svgPath(size) {
      const w = size * 0.6;
      const h = size * 0.7;
      const r = w / 2;
      return `<path d="M ${-r} ${-h / 4} A ${r} ${r} 0 0 1 ${r} ${-h / 4} L ${r} ${h / 2} L ${r * 0.45} ${h / 2} L ${r * 0.45} ${-h / 4} A ${r * 0.45} ${r * 0.45} 0 0 0 ${-r * 0.45} ${-h / 4} L ${-r * 0.45} ${h / 2} L ${-r} ${h / 2} Z" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M -12 -2 A 12 12 0 0 1 12 -2 L 12 12 L 6 12 L 6 -2 A 6 6 0 0 0 -6 -2 L -6 12 L -12 12 Z" fill="currentColor"/></svg>`
  },

  hexagon: {
    id: "hexagon",
    name: "Hexagon",
    phFillClass: "ph-fill ph-hexagon",
    draw(ctx, size) {
      const r = size * 0.52;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    },
    svgPath(size) {
      const r = size * 0.52;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
      }
      return `<polygon points="${pts.join(" ")}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="13,0 6.5,11.3 -6.5,11.3 -13,0 -6.5,-11.3 6.5,-11.3" fill="currentColor"/></svg>`
  },

  line: {
    id: "line",
    name: "Straight Line",
    phFillClass: "ph-bold ph-line-segment",
    draw(ctx, size) {
      const len = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
    },
    svgPath(size) {
      const len = size * 0.5;
      return `<line x1="${-len}" y1="0" x2="${len}" y2="0" stroke="currentColor" stroke-width="2" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><line x1="-14" y1="0" x2="14" y2="0" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`
  },

  rhombus: {
    id: "rhombus",
    name: "Parallelogram / Rhombus",
    phFillClass: "ph-fill ph-diamond",
    draw(ctx, size) {
      const rx = size * 0.5;
      const ry = size * 0.35;
      ctx.beginPath();
      ctx.moveTo(-rx * 0.5, -ry);
      ctx.lineTo(rx, -ry);
      ctx.lineTo(rx * 0.5, ry);
      ctx.lineTo(-rx, ry);
      ctx.closePath();
    },
    svgPath(size) {
      const rx = size * 0.5;
      const ry = size * 0.35;
      return `<polygon points="${-rx * 0.5},${-ry} ${rx},${-ry} ${rx * 0.5},${ry} ${-rx},${ry}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="-6,-10 12,-10 6,10 -12,10" fill="currentColor"/></svg>`
  },

  grid_cross: {
    id: "grid_cross",
    name: "Grid / Cross Pattern",
    phFillClass: "ph-fill ph-crosshair",
    draw(ctx, size) {
      const s = size * 0.45;
      ctx.beginPath();
      ctx.moveTo(-s, -s);
      ctx.lineTo(s, s);
      ctx.moveTo(s, -s);
      ctx.lineTo(-s, s);
    },
    svgPath(size) {
      const s = size * 0.45;
      return `<g stroke="currentColor" stroke-width="2"><line x1="${-s}" y1="${-s}" x2="${s}" y2="${s}"/><line x1="${s}" y1="${-s}" x2="${-s}" y2="${s}"/></g>`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" stroke-width="2"/><line x1="-10" y1="0" x2="10" y2="0" stroke="currentColor" stroke-width="2"/><line x1="0" y1="-10" x2="0" y2="10" stroke="currentColor" stroke-width="2"/></svg>`
  },

  c_ring: {
    id: "c_ring",
    name: "Arc / C-Ring",
    phFillClass: "ph-fill ph-circle-dashed",
    draw(ctx, size) {
      const rOut = size * 0.5;
      const rIn = size * 0.28;
      ctx.beginPath();
      ctx.arc(0, 0, rOut, Math.PI * 0.25, Math.PI * 1.75, false);
      ctx.arc(0, 0, rIn, Math.PI * 1.75, Math.PI * 0.25, true);
      ctx.closePath();
    },
    svgPath(size) {
      const rOut = size * 0.5;
      const rIn = size * 0.28;
      const aStart = Math.PI * 0.25;
      const aEnd = Math.PI * 1.75;
      const x1 = (rOut * Math.cos(aStart)).toFixed(2);
      const y1 = (rOut * Math.sin(aStart)).toFixed(2);
      const x2 = (rOut * Math.cos(aEnd)).toFixed(2);
      const y2 = (rOut * Math.sin(aEnd)).toFixed(2);
      const x3 = (rIn * Math.cos(aEnd)).toFixed(2);
      const y3 = (rIn * Math.sin(aEnd)).toFixed(2);
      const x4 = (rIn * Math.cos(aStart)).toFixed(2);
      const y4 = (rIn * Math.sin(aStart)).toFixed(2);
      return `<path d="M ${x1},${y1} A ${rOut} ${rOut} 0 1 0 ${x2},${y2} L ${x3},${y3} A ${rIn} ${rIn} 0 1 1 ${x4},${y4} Z" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M 9,9 A 13 13 0 1 0 9,-9 L 5,-5 A 7 7 0 1 1 5,5 Z" fill="currentColor"/></svg>`
  },

  capsule: {
    id: "capsule",
    name: "Capsule / Pill",
    phFillClass: "ph-fill ph-pill",
    draw(ctx, size) {
      const w = size * 0.42;
      const h = size * 0.8;
      const r = w / 2;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + r, -h / 2);
      ctx.arc(0, -h / 2 + r, r, -Math.PI, 0, false);
      ctx.lineTo(w / 2, h / 2 - r);
      ctx.arc(0, h / 2 - r, r, 0, Math.PI, false);
      ctx.closePath();
    },
    svgPath(size) {
      const w = size * 0.42;
      const h = size * 0.8;
      const r = w / 2;
      return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${r}" ry="${r}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><rect x="-7" y="-14" width="14" height="28" rx="7" ry="7" fill="currentColor"/></svg>`
  },

  cross: {
    id: "cross",
    name: "Plus / Cross",
    phFillClass: "ph-fill ph-plus",
    draw(ctx, size) {
      const s = size * 0.5;
      const t = size * 0.18;
      ctx.beginPath();
      ctx.moveTo(-t, -s);
      ctx.lineTo(t, -s);
      ctx.lineTo(t, -t);
      ctx.lineTo(s, -t);
      ctx.lineTo(s, t);
      ctx.lineTo(t, t);
      ctx.lineTo(t, s);
      ctx.lineTo(-t, s);
      ctx.lineTo(-t, t);
      ctx.lineTo(-s, t);
      ctx.lineTo(-s, -t);
      ctx.lineTo(-t, -t);
      ctx.closePath();
    },
    svgPath(size) {
      const s = size * 0.5;
      const t = size * 0.18;
      return `<polygon points="${-t},${-s} ${t},${-s} ${t},${-t} ${s},${-t} ${s},${t} ${t},${t} ${t},${s} ${-t},${s} ${-t},${t} ${-s},${t} ${-s},${-t} ${-t},${-t}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="-4,-13 4,-13 4,-4 13,-4 13,4 4,4 4,13 -4,13 -4,4 -13,4 -13,-4 -4,-4" fill="currentColor"/></svg>`
  },

  glyph_1: {
    id: "glyph_1",
    name: "Numeral 1",
    phFillClass: "ph-bold ph-number-one",
    draw(ctx, size) {
      ctx.font = `900 ${Math.round(size * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', 0, 0);
    },
    svgPath(size) {
      return `<text x="0" y="0" font-size="${Math.round(size * 0.8)}" font-weight="900" text-anchor="middle" dominant-baseline="central" fill="currentColor">1</text>`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><text x="0" y="5" font-size="24" font-weight="900" text-anchor="middle" fill="currentColor">1</text></svg>`
  },

  glyph_5: {
    id: "glyph_5",
    name: "Numeral 5",
    phFillClass: "ph-bold ph-number-five",
    draw(ctx, size) {
      ctx.font = `900 ${Math.round(size * 0.8)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('5', 0, 0);
    },
    svgPath(size) {
      return `<text x="0" y="0" font-size="${Math.round(size * 0.8)}" font-weight="900" text-anchor="middle" dominant-baseline="central" fill="currentColor">5</text>`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><text x="0" y="5" font-size="24" font-weight="900" text-anchor="middle" fill="currentColor">5</text></svg>`
  },

  teardrop: {
    id: "teardrop",
    name: "Tear / Pin",
    phFillClass: "ph-fill ph-drop",
    draw(ctx, size) {
      const r = size * 0.35;
      const tipY = -size * 0.5;
      const cy = size * 0.15;
      ctx.beginPath();
      ctx.moveTo(0, tipY);
      ctx.bezierCurveTo(r * 1.3, -size * 0.1, r * 1.1, cy + r, 0, cy + r);
      ctx.bezierCurveTo(-r * 1.1, cy + r, -r * 1.3, -size * 0.1, 0, tipY);
      ctx.closePath();
    },
    svgPath(size) {
      const r = size * 0.35;
      const tipY = -size * 0.5;
      const cy = size * 0.15;
      return `<path d="M 0,${tipY} C ${r * 1.3},${-size * 0.1} ${r * 1.1},${cy + r} 0,${cy + r} C ${-r * 1.1},${cy + r} ${-r * 1.3},${-size * 0.1} 0,${tipY} Z" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M 0,-14 C 9,-2 8,13 0,13 C -8,13 -9,-2 0,-14 Z" fill="currentColor"/></svg>`
  },

  star4: {
    id: "star4",
    name: "4-Point Star",
    phFillClass: "ph-fill ph-sparkle",
    draw(ctx, size) {
      const rOut = size * 0.55;
      const rIn = size * 0.18;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? rOut : rIn;
        const x = r * Math.cos(a);
        const y = r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    },
    svgPath(size) {
      const rOut = size * 0.55;
      const rIn = size * 0.18;
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? rOut : rIn;
        pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
      }
      return `<polygon points="${pts.join(" ")}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="0,-15 4,-4 15,0 4,4 0,15 -4,4 -15,0 -4,-4" fill="currentColor"/></svg>`
  }
};

export const SHAPE_KEYS = Object.keys(Shapes);
