/**
 * Abstract Studio - Catálogo de Formas Primitivas y Geometría Paramétrica
 * Soporta renderizado dual: Canvas 2D (interactividad a 60 FPS) y SVG (exportación vectorial pura).
 */

export const Shapes = {
  circle: {
    id: "circle",
    name: "Círculo",
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

  square: {
    id: "square",
    name: "Cuadrado",
    draw(ctx, size) {
      const s = size * 0.5;
      ctx.beginPath();
      ctx.rect(-s, -s, size, size);
      ctx.closePath();
    },
    svgPath(size) {
      const s = size * 0.5;
      return `<rect x="${-s}" y="${-s}" width="${size}" height="${size}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><rect x="-13" y="-13" width="26" height="26" fill="currentColor"/></svg>`
  },

  rect: {
    id: "rect",
    name: "Rectángulo",
    draw(ctx, size) {
      const w = size * 0.8;
      const h = size * 0.45;
      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.closePath();
    },
    svgPath(size) {
      const w = size * 0.8;
      const h = size * 0.45;
      return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><rect x="-16" y="-9" width="32" height="18" fill="currentColor"/></svg>`
  },

  triangle_eq: {
    id: "triangle_eq",
    name: "Triángulo Equilátero",
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
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="0,-15 13,8 -13,8" fill="currentColor"/></svg>`
  },

  triangle_right: {
    id: "triangle_right",
    name: "Triángulo Rectángulo",
    draw(ctx, size) {
      const s = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(-s, -s);
      ctx.lineTo(s, s);
      ctx.lineTo(-s, s);
      ctx.closePath();
    },
    svgPath(size) {
      const s = size * 0.5;
      return `<polygon points="${-s},${-s} ${s},${s} ${-s},${s}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="-12,-12 12,12 -12,12" fill="currentColor"/></svg>`
  },

  rhombus: {
    id: "rhombus",
    name: "Rombo",
    draw(ctx, size) {
      const rx = size * 0.45;
      const ry = size * 0.65;
      ctx.beginPath();
      ctx.moveTo(0, -ry);
      ctx.lineTo(rx, 0);
      ctx.lineTo(0, ry);
      ctx.lineTo(-rx, 0);
      ctx.closePath();
    },
    svgPath(size) {
      const rx = size * 0.45;
      const ry = size * 0.65;
      return `<polygon points="0,${-ry} ${rx},0 0,${ry} ${-rx},0" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="0,-16 11,0 0,16 -11,0" fill="currentColor"/></svg>`
  },

  trapezoid: {
    id: "trapezoid",
    name: "Trapecio",
    draw(ctx, size) {
      const topW = size * 0.35;
      const botW = size * 0.7;
      const h = size * 0.55;
      ctx.beginPath();
      ctx.moveTo(-topW / 2, -h / 2);
      ctx.lineTo(topW / 2, -h / 2);
      ctx.lineTo(botW / 2, h / 2);
      ctx.lineTo(-botW / 2, h / 2);
      ctx.closePath();
    },
    svgPath(size) {
      const topW = size * 0.35;
      const botW = size * 0.7;
      const h = size * 0.55;
      return `<polygon points="${-topW / 2},${-h / 2} ${topW / 2},${-h / 2} ${botW / 2},${h / 2} ${-botW / 2},${h / 2}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="-6,-10 6,-10 14,10 -14,10" fill="currentColor"/></svg>`
  },

  arrow_up: {
    id: "arrow_up",
    name: "Flecha",
    draw(ctx, size) {
      const s = size;
      const tipY = -s * 0.48;
      const wingY = -s * 0.05;
      const botY = s * 0.48;
      const wingW = s * 0.42;
      const stemW = s * 0.18;
      ctx.beginPath();
      ctx.moveTo(0, tipY);
      ctx.lineTo(wingW, wingY);
      ctx.lineTo(stemW, wingY);
      ctx.lineTo(stemW, botY);
      ctx.lineTo(-stemW, botY);
      ctx.lineTo(-stemW, wingY);
      ctx.lineTo(-wingW, wingY);
      ctx.closePath();
    },
    svgPath(size) {
      const s = size;
      const tipY = -s * 0.48;
      const wingY = -s * 0.05;
      const botY = s * 0.48;
      const wingW = s * 0.42;
      const stemW = s * 0.18;
      return `<polygon points="0,${tipY} ${wingW},${wingY} ${stemW},${wingY} ${stemW},${botY} ${-stemW},${botY} ${-stemW},${wingY} ${-wingW},${wingY}" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="0,-14 12,-1 5,-1 5,14 -5,14 -5,-1 -12,-1" fill="currentColor"/></svg>`
  },

  hexagon: {
    id: "hexagon",
    name: "Hexágono",
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
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="14,0 7,12 -7,12 -14,0 -7,-12 7,-12" fill="currentColor"/></svg>`
  },

  star4: {
    id: "star4",
    name: "Estrella 4 Puntas",
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
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="currentColor"/></svg>`
  },

  crescent: {
    id: "crescent",
    name: "Lúnula / Creciente",
    draw(ctx, size) {
      const r = size * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.quadraticCurveTo(-r * 0.1, 0, 0, -r);
      ctx.closePath();
    },
    svgPath(size) {
      const r = size * 0.5;
      return `<path d="M 0,${-r} A ${r} ${r} 0 0 1 0,${r} Q ${-r * 0.1} 0 0,${-r} Z" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M 0,-14 A 14 14 0 0 1 0,14 Q -1.4 0 0,-14 Z" fill="currentColor"/></svg>`
  },

  teardrop: {
    id: "teardrop",
    name: "Gota / Lágrima",
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
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M 0,-15 C 10,-3 9,14 0,14 C -9,14 -10,-3 0,-15 Z" fill="currentColor"/></svg>`
  },

  capsule: {
    id: "capsule",
    name: "Píldora / Cápsula",
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
    name: "Cruz Griega",
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
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><polygon points="-4,-14 4,-14 4,-4 14,-4 14,4 4,4 4,14 -4,14 -4,4 -14,4 -14,-4 -4,-4" fill="currentColor"/></svg>`
  },

  c_ring: {
    id: "c_ring",
    name: "Anillo C",
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
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M 10,10 A 14 14 0 1 0 10,-10 L 6,-6 A 8 8 0 1 1 6,6 Z" fill="currentColor"/></svg>`
  },

  line: {
    id: "line",
    name: "Línea Recta",
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

  arc: {
    id: "arc",
    name: "Arco Curvo",
    draw(ctx, size) {
      const r = size * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 0.75, false);
    },
    svgPath(size) {
      const r = size * 0.5;
      const x1 = r;
      const y1 = 0;
      const x2 = (r * Math.cos(Math.PI * 0.75)).toFixed(2);
      const y2 = (r * Math.sin(Math.PI * 0.75)).toFixed(2);
      return `<path d="M ${x1},${y1} A ${r} ${r} 0 0 1 ${x2},${y2}" fill="none" stroke="currentColor" stroke-width="2" />`;
    },
    iconSvg: `<svg viewBox="-20 -20 40 40" class="shape-icon"><path d="M 14,0 A 14 14 0 0 1 -10,10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`
  }
};

export const SHAPE_KEYS = Object.keys(Shapes);
