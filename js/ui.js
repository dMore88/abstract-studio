/**
 * Gestor de Interfaz de Usuario para Abstract Studio
 * Arquitectura modular y bien pensada:
 * 1. Figura Base (Semilla y Tamaño: pieza central o sangrado de fondo)
 * 2. Transformación Acumulativa (Estilo Illustrator)
 * 3. Textura & Materia (Jitter, Skip Chance, Line Swappiness estilo UJI)
 * 4. Esculpido Manual Directo (Cursor)
 * 5. Capas de Diferencia (Máx 3)
 */

import { ASPECT_RATIOS } from './engine.js';
import { PALETTES } from './palettes.js';
import { PRESETS } from './presets.js';

export class UIManager {
  constructor({ containerId, onStateChange, onUndo, onClearDeformations }) {
    this.container = document.getElementById(containerId);
    this.onStateChange = onStateChange;
    this.onUndo = onUndo;
    this.onClearDeformations = onClearDeformations;
  }

  render(state, engine) {
    if (!this.container) return;
    this.container.innerHTML = '';

    // Galería de Presets Iniciales
    this.renderPresetsSection(state, engine);

    // 0. Formato del Lienzo
    this.renderCanvasSection(state);

    // 1. Figura Base & 2. Transformación & 3. Textura
    this.renderCoreSection(state, engine);

    // 4. Esculpido Directo
    this.renderSculptSection(state, engine);

    // 5. Capas de Diferencia
    this.renderDifferenceSection(state);
  }

  renderPresetsSection(state, engine) {
    const section = document.createElement('div');
    section.className = 'control-group';
    section.innerHTML = `
      <span class="section-label">Galería de Composiciones</span>
      <div class="presets-wrap" id="presets-list"></div>
    `;
    const list = section.querySelector('#presets-list');

    PRESETS.forEach(preset => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'preset-chip';
      chip.textContent = preset.name;
      chip.addEventListener('click', () => {
        Object.assign(state.canvas, JSON.parse(JSON.stringify(preset.state.canvas)));
        Object.assign(state.pattern, JSON.parse(JSON.stringify(preset.state.pattern)));
        Object.assign(state.brush, JSON.parse(JSON.stringify(preset.state.brush)));
        state.differenceLayers = JSON.parse(JSON.stringify(preset.state.differenceLayers || []));
        engine.setDeformations(preset.deformations || []);

        this.render(state, engine);
        this.notifyChange();
        UIManager.showToast(`✨ ${preset.name}`);
      });
      list.appendChild(chip);
    });

    this.container.appendChild(section);
  }

  renderCanvasSection(state) {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = `
      <div class="section-title">📐 0. Lienzo & Proporción</div>
      <div class="control-group">
        <label class="control-label">Aspect Ratio</label>
        <div class="aspect-grid" id="aspect-ratio-buttons"></div>
      </div>
      <div class="control-group">
        <label class="control-label">Paleta de Color</label>
        <div class="palette-grid" id="palette-buttons"></div>
      </div>
    `;

    const aspectContainer = section.querySelector('#aspect-ratio-buttons');
    for (const [key, val] of Object.entries(ASPECT_RATIOS)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `aspect-btn ${state.canvas.aspectRatio === key ? 'active' : ''}`;
      btn.textContent = key;
      btn.title = val.label;
      btn.addEventListener('click', () => {
        state.canvas.aspectRatio = key;
        aspectContainer.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.notifyChange();
      });
      aspectContainer.appendChild(btn);
    }

    const paletteContainer = section.querySelector('#palette-buttons');
    for (const [palKey, pal] of Object.entries(PALETTES)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `palette-btn ${state.canvas.paletteId === palKey ? 'active' : ''}`;
      
      const swatches = pal.swatches.map(c => `<span style="background-color: ${c}"></span>`).join('');
      btn.innerHTML = `
        <div class="palette-colors">${swatches}</div>
        <span class="palette-name">${pal.name}</span>
      `;

      btn.addEventListener('click', () => {
        state.canvas.paletteId = palKey;
        state.canvas.bgColor = pal.bg;
        state.pattern.color = pal.line;
        
        if (state.differenceLayers.length > 0) {
          state.differenceLayers.forEach((l, idx) => {
            l.color = idx === 0 ? pal.accent1 : pal.accent2;
          });
        }

        paletteContainer.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.notifyChange();
      });
      paletteContainer.appendChild(btn);
    }

    this.container.appendChild(section);
  }

  renderCoreSection(state, engine) {
    const p = state.pattern;
    if (!p.distribution) {
      p.distribution = p.shape === 'line' ? 'linear' : 'radial';
    }
    if (p.angle === undefined) {
      p.angle = 0;
    }

    const section = document.createElement('div');
    section.className = 'control-section';

    let transformControlsHtml = '';

    if (p.distribution === 'linear') {
      if (p.shape === 'line') {
        transformControlsHtml = `
          <div class="control-group">
            <div class="control-header">
              <span class="control-label">Ángulo de Trama</span>
              <span class="control-value" id="val-angle">${p.angle}°</span>
            </div>
            <input type="range" id="input-angle" min="0" max="180" step="1" value="${p.angle}">
            <div class="quick-angle-buttons">
              <button type="button" class="btn-chip ${p.angle === 0 ? 'active' : ''}" data-angle="0">0° Horiz</button>
              <button type="button" class="btn-chip ${p.angle === 90 ? 'active' : ''}" data-angle="90">90° Vert</button>
              <button type="button" class="btn-chip ${p.angle === 45 ? 'active' : ''}" data-angle="45">45° Diag</button>
              <button type="button" class="btn-chip ${p.angle === 135 ? 'active' : ''}" data-angle="135">135° Diag</button>
            </div>
          </div>

          <div class="control-group">
            <div class="control-header">
              <span class="control-label">Copias de Repetición (Densidad)</span>
              <span class="control-value" id="val-copies">${p.copies}</span>
            </div>
            <input type="range" id="input-copies" min="5" max="500" step="5" value="${p.copies}">
          </div>
        `;
      } else {
        transformControlsHtml = `
          <div class="control-group">
            <div class="control-header">
              <span class="control-label">Copias de Repetición</span>
              <span class="control-value" id="val-copies">${p.copies}</span>
            </div>
            <input type="range" id="input-copies" min="5" max="300" step="5" value="${p.copies}">
          </div>

          <div class="control-group">
            <div class="control-header">
              <span class="control-label">Escala por Copia (%)</span>
              <span class="control-value" id="val-scaleStep">${Math.round(p.scaleStep * 100)}%</span>
            </div>
            <input type="range" id="input-scaleStep" min="80" max="120" step="0.2" value="${(p.scaleStep * 100).toFixed(1)}">
          </div>

          <div class="control-group">
            <div class="control-header">
              <span class="control-label">Giro por Copia</span>
              <span class="control-value" id="val-rotateStep">${p.rotateStep}°</span>
            </div>
            <input type="range" id="input-rotateStep" min="-45" max="45" step="0.5" value="${p.rotateStep}">
          </div>

          <div class="dual-slider-row">
            <div class="control-group flex-1">
              <span class="control-label-sm">Paso X: <span id="val-moveX">${p.moveX}px</span></span>
              <input type="range" id="input-moveX" min="-30" max="30" step="0.5" value="${p.moveX}">
            </div>
            <div class="control-group flex-1">
              <span class="control-label-sm">Paso Y: <span id="val-moveY">${p.moveY}px</span></span>
              <input type="range" id="input-moveY" min="-30" max="30" step="0.5" value="${p.moveY}">
            </div>
          </div>
        `;
      }
    } else if (p.distribution === 'radial') {
      transformControlsHtml = `
        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Copias de Repetición</span>
            <span class="control-value" id="val-copies">${p.copies}</span>
          </div>
          <input type="range" id="input-copies" min="5" max="800" step="5" value="${p.copies}">
        </div>

        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Escala por Copia (%)</span>
            <span class="control-value" id="val-scaleStep">${Math.round(p.scaleStep * 100)}%</span>
          </div>
          <input type="range" id="input-scaleStep" min="88" max="108" step="0.2" value="${(p.scaleStep * 100).toFixed(1)}">
        </div>

        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Giro por Copia</span>
            <span class="control-value" id="val-rotateStep">${p.rotateStep}°</span>
          </div>
          <input type="range" id="input-rotateStep" min="-25" max="25" step="0.2" value="${p.rotateStep}">
        </div>

        <div class="dual-slider-row">
          <div class="control-group flex-1">
            <span class="control-label-sm">Mover X: <span id="val-moveX">${p.moveX}px</span></span>
            <input type="range" id="input-moveX" min="-12" max="12" step="0.5" value="${p.moveX}">
          </div>
          <div class="control-group flex-1">
            <span class="control-label-sm">Mover Y: <span id="val-moveY">${p.moveY}px</span></span>
            <input type="range" id="input-moveY" min="-12" max="12" step="0.5" value="${p.moveY}">
          </div>
        </div>

        <div class="control-group">
          <label class="control-label-sm">Punto de Ancla (Eje)</label>
          <div class="segmented-control" id="anchor-control">
            <button type="button" class="segmented-btn ${p.anchor === 'center' ? 'active' : ''}" data-anchor="center">Centro</button>
            <button type="button" class="segmented-btn ${p.anchor === 'bottom' ? 'active' : ''}" data-anchor="bottom">Base Excéntrica</button>
            <button type="button" class="segmented-btn ${p.anchor === 'side' ? 'active' : ''}" data-anchor="side">Lateral</button>
          </div>
        </div>
      `;
    } else if (p.distribution === 'grid') {
      transformControlsHtml = `
        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Copias / Densidad de Malla</span>
            <span class="control-value" id="val-copies">${p.copies}</span>
          </div>
          <input type="range" id="input-copies" min="8" max="180" step="2" value="${p.copies}">
          <span class="sub-hint">${p.shape === 'line' ? 'Trama ortogonal cruzada (líneas horizontales + verticales)' : 'Matriz 2D regular de figuras geométricas'}</span>
        </div>
      `;
    }

    section.innerHTML = `
      <div class="section-title">🔷 1. Figura Base (La Semilla)</div>
      
      <div class="control-group">
        <label class="control-label">Geometría Semilla</label>
        <div class="segmented-control" id="shape-control">
          <button type="button" class="segmented-btn ${p.shape === 'circle' ? 'active' : ''}" data-shape="circle">Círculo</button>
          <button type="button" class="segmented-btn ${p.shape === 'polygon' ? 'active' : ''}" data-shape="polygon">Polígono</button>
          <button type="button" class="segmented-btn ${p.shape === 'line' ? 'active' : ''}" data-shape="line">Línea</button>
          <button type="button" class="segmented-btn ${p.shape === 'petal' ? 'active' : ''}" data-shape="petal">Pétalo</button>
        </div>
      </div>

      <div id="polygon-sides-group" class="control-group" style="display: ${p.shape === 'polygon' ? 'flex' : 'none'};">
        <label class="control-label-sm">Lados del Polígono</label>
        <div class="segmented-control" id="sides-control">
          <button type="button" class="segmented-btn ${p.polygonSides === 3 ? 'active' : ''}" data-sides="3">Triángulo</button>
          <button type="button" class="segmented-btn ${p.polygonSides === 4 ? 'active' : ''}" data-sides="4">Rombo</button>
          <button type="button" class="segmented-btn ${p.polygonSides === 5 ? 'active' : ''}" data-sides="5">Pentágono</button>
          <button type="button" class="segmented-btn ${p.polygonSides === 6 ? 'active' : ''}" data-sides="6">Hexágono</button>
          <button type="button" class="segmented-btn ${p.polygonSides === 8 ? 'active' : ''}" data-sides="8">Octágono</button>
        </div>
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">Tamaño Inicial (Radio / Sangrado)</span>
          <span class="control-value" id="val-size">${p.size}px</span>
        </div>
        <input type="range" id="input-size" min="30" max="1100" step="10" value="${p.size}" title="Hazlo pequeño para objeto central, o grande para sangrado total como fondo">
        <span class="sub-hint">Pequeño = Pieza central focal | Grande (>600px) = Sangrado como fondo</span>
      </div>

      <div class="section-title" style="margin-top: 0.8rem;">🔄 2. Distribución & Transformación</div>

      <div class="control-group">
        <label class="control-label">Modo de Distribución</label>
        <div class="segmented-control" id="distribution-control">
          <button type="button" class="segmented-btn ${p.distribution === 'linear' ? 'active' : ''}" data-dist="linear">Lineal (Trama)</button>
          <button type="button" class="segmented-btn ${p.distribution === 'radial' ? 'active' : ''}" data-dist="radial">Radial (Concéntrico)</button>
          <button type="button" class="segmented-btn ${p.distribution === 'grid' ? 'active' : ''}" data-dist="grid">Cuadrícula</button>
        </div>
      </div>

      ${transformControlsHtml}

      <div class="section-title" style="margin-top: 0.8rem;">🌾 3. Textura & Materia (UJI)</div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label" style="color: #38bdf8;">Micro-corrugado (Jitter / Fibra)</span>
          <span class="control-value" id="val-jitter">${(p.jitter || 0).toFixed(1)}px</span>
        </div>
        <input type="range" id="input-jitter" min="0" max="6" step="0.2" value="${p.jitter || 0}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">Salto de Líneas (Respiración / Skip)</span>
          <span class="control-value" id="val-skipChance">${p.skipChance || 0}%</span>
        </div>
        <input type="range" id="input-skipChance" min="0" max="60" step="5" value="${p.skipChance || 0}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">Cruce de Hebras (Deshilachado)</span>
          <span class="control-value" id="val-lineSwappiness">${p.lineSwappiness || 0}%</span>
        </div>
        <input type="range" id="input-lineSwappiness" min="0" max="60" step="5" value="${p.lineSwappiness || 0}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">Ondulación Perimetral</span>
          <span class="control-value" id="val-waviness">${p.waviness || 0}px</span>
        </div>
        <input type="range" id="input-waviness" min="0" max="25" step="1" value="${p.waviness || 0}">
      </div>

      <div class="dual-slider-row">
        <div class="control-group flex-1">
          <span class="control-label-sm">Grosor: <span id="val-strokeWidth">${p.strokeWidth}px</span></span>
          <input type="range" id="input-strokeWidth" min="0.2" max="4.0" step="0.1" value="${p.strokeWidth}">
        </div>
        <div class="control-group flex-1">
          <span class="control-label-sm">Opacidad: <span id="val-opacity">${Math.round(p.opacity * 100)}%</span></span>
          <input type="range" id="input-opacity" min="0.05" max="1.0" step="0.05" value="${p.opacity}">
        </div>
      </div>
    `;

    // Forma base
    const shapeBtns = section.querySelectorAll('#shape-control .segmented-btn');
    shapeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        p.shape = btn.dataset.shape;
        this.render(state, engine);
        this.notifyChange();
      });
    });

    // Lados de polígono
    const sidesBtns = section.querySelectorAll('#sides-control .segmented-btn');
    sidesBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sidesBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        p.polygonSides = parseInt(btn.dataset.sides, 10);
        this.notifyChange();
      });
    });

    // Modo de Distribución (Lineal, Radial, Cuadrícula)
    const distBtns = section.querySelectorAll('#distribution-control .segmented-btn');
    distBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        p.distribution = btn.dataset.dist;
        this.render(state, engine);
        this.notifyChange();
      });
    });

    // Ancla (si está visible en modo radial)
    const anchorBtns = section.querySelectorAll('#anchor-control .segmented-btn');
    anchorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        anchorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        p.anchor = btn.dataset.anchor;
        this.notifyChange();
      });
    });

    // Botones rápidos de Ángulo (si está visible en modo lineal para líneas)
    const angleChips = section.querySelectorAll('.quick-angle-buttons .btn-chip');
    const angleInput = section.querySelector('#input-angle');
    const angleDisplay = section.querySelector('#val-angle');
    angleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const ang = parseFloat(chip.dataset.angle);
        p.angle = ang;
        if (angleInput) angleInput.value = ang;
        if (angleDisplay) angleDisplay.textContent = `${ang}°`;
        angleChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.notifyChange();
      });
    });

    // Sliders
    this.bindSlider(section, 'size', p, 'px', (v) => v);
    this.bindSlider(section, 'angle', p, '°', (v) => {
      angleChips.forEach(c => c.classList.toggle('active', parseFloat(c.dataset.angle) === v));
      return v;
    });
    this.bindSlider(section, 'copies', p, '', (v) => v);
    this.bindSlider(section, 'scaleStep', p, '%', (v) => v / 100);
    this.bindSlider(section, 'rotateStep', p, '°', (v) => v);
    this.bindSlider(section, 'moveX', p, 'px', (v) => v);
    this.bindSlider(section, 'moveY', p, 'px', (v) => v);
    this.bindSlider(section, 'jitter', p, 'px', (v) => v);
    this.bindSlider(section, 'skipChance', p, '%', (v) => v);
    this.bindSlider(section, 'lineSwappiness', p, '%', (v) => v);
    this.bindSlider(section, 'waviness', p, 'px', (v) => v);
    this.bindSlider(section, 'strokeWidth', p, 'px', (v) => v);
    this.bindSlider(section, 'opacity', p, '', (v) => v);

    this.container.appendChild(section);
  }

  renderSculptSection(state, engine) {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = `
      <div class="section-title">✍️ 4. Esculpido Directo (Cursor)</div>
      
      <div class="control-group">
        <label class="control-label">Herramienta de Pincel</label>
        <div class="segmented-control" id="sculpt-mode-control">
          <button type="button" class="segmented-btn ${state.brush.mode === 'peak' ? 'active' : ''}" data-mode="peak">▲ Pico</button>
          <button type="button" class="segmented-btn ${state.brush.mode === 'smooth' ? 'active' : ''}" data-mode="smooth">∩ Colina</button>
          <button type="button" class="segmented-btn ${state.brush.mode === 'twist' ? 'active' : ''}" data-mode="twist">🌀 Giro</button>
          <button type="button" class="segmented-btn ${state.brush.mode === 'flatten' ? 'active' : ''}" data-mode="flatten">— Aplanar</button>
        </div>
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">Radio del Pincel</span>
          <span class="control-value" id="val-brushRadius">${state.brush.radius}px</span>
        </div>
        <input type="range" id="input-brushRadius" min="25" max="160" step="5" value="${state.brush.radius}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <span class="control-label">Fuerza de Deformación</span>
          <span class="control-value" id="val-brushStrength">${state.brush.strength}px</span>
        </div>
        <input type="range" id="input-brushStrength" min="10" max="120" step="5" value="${state.brush.strength}">
      </div>

      <div class="sculpt-actions-bar">
        <button type="button" id="btn-undo" class="btn">↶ Deshacer</button>
        <button type="button" id="btn-clear" class="btn">🗑️ Limpiar Trama</button>
      </div>
    `;

    const modeBtns = section.querySelectorAll('#sculpt-mode-control .segmented-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.brush.mode = btn.dataset.mode;
      });
    });

    this.bindSlider(section, 'brushRadius', state.brush, 'px', (v) => { state.brush.radius = v; return v; });
    this.bindSlider(section, 'brushStrength', state.brush, 'px', (v) => { state.brush.strength = v; return v; });

    section.querySelector('#btn-undo').addEventListener('click', () => {
      if (this.onUndo) this.onUndo();
    });

    section.querySelector('#btn-clear').addEventListener('click', () => {
      if (this.onClearDeformations) this.onClearDeformations();
    });

    this.container.appendChild(section);
  }

  renderDifferenceSection(state) {
    const maxLayers = 3;
    const count = (state.differenceLayers || []).length;

    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = `
      <div class="section-title-between">
        <span class="section-title">✨ 5. Capas de Diferencia (${count}/${maxLayers})</span>
        ${count < maxLayers ? '<button type="button" id="btn-add-diff" class="btn btn-sm btn-primary">+ Añadir</button>' : ''}
      </div>
      <div id="diff-layers-container" class="diff-layers-list"></div>
    `;

    const list = section.querySelector('#diff-layers-container');

    if (count === 0) {
      list.innerHTML = `<p class="empty-hint">Sin capas de diferencia. Añade un sol, prisma geométrico o tipografía para crear contraste.</p>`;
    } else {
      state.differenceLayers.forEach((layer, idx) => {
        const card = document.createElement('div');
        card.className = 'diff-card';
        card.innerHTML = `
          <div class="diff-card-header">
            <span class="diff-card-title">Capa ${idx + 1}: ${layer.name || layer.type}</span>
            <button type="button" class="btn-icon-xs btn-remove-layer" title="Eliminar capa">✕</button>
          </div>
          
          <div class="diff-card-body">
            <div class="control-group">
              <label class="control-label-sm">Elemento</label>
              <div class="segmented-control seg-type">
                <button type="button" class="segmented-btn ${layer.type === 'circle' ? 'active' : ''}" data-type="circle">Círculo</button>
                <button type="button" class="segmented-btn ${layer.type === 'rectangle' ? 'active' : ''}" data-type="rectangle">Marco</button>
                <button type="button" class="segmented-btn ${layer.type === 'polygon' ? 'active' : ''}" data-type="polygon">Polígono</button>
                <button type="button" class="segmented-btn ${layer.type === 'text' ? 'active' : ''}" data-type="text">Texto</button>
              </div>
            </div>

            <div class="control-group">
              <label class="control-label-sm">Profundidad</label>
              <div class="segmented-control seg-placement">
                <button type="button" class="segmented-btn ${layer.placement === 'behind' ? 'active' : ''}" data-place="behind">Detrás de la Trama</button>
                <button type="button" class="segmented-btn ${layer.placement === 'in-front' ? 'active' : ''}" data-place="in-front">Delante de la Trama</button>
              </div>
            </div>

            ${layer.type === 'text' ? `
            <div class="control-group">
              <label class="control-label-sm">Glifo / Texto</label>
              <input type="text" class="text-input" value="${layer.text || 'A'}" maxlength="8">
            </div>
            ` : ''}

            <div class="control-group">
              <div class="control-header">
                <span class="control-label-sm">Tamaño</span>
                <span class="control-value-sm val-size">${layer.size}px</span>
              </div>
              <input type="range" class="input-size" min="30" max="360" step="5" value="${layer.size}">
            </div>

            <div class="dual-slider-row">
              <div class="control-group flex-1">
                <span class="control-label-sm">Posición X: <span class="val-x">${layer.x}%</span></span>
                <input type="range" class="input-x" min="5" max="95" step="1" value="${layer.x}">
              </div>
              <div class="control-group flex-1">
                <span class="control-label-sm">Posición Y: <span class="val-y">${layer.y}%</span></span>
                <input type="range" class="input-y" min="5" max="95" step="1" value="${layer.y}">
              </div>
            </div>
          </div>
        `;

        card.querySelector('.btn-remove-layer').addEventListener('click', () => {
          state.differenceLayers.splice(idx, 1);
          this.renderDifferenceSection(state);
          this.notifyChange();
        });

        const segTypes = card.querySelectorAll('.seg-type .segmented-btn');
        segTypes.forEach(btn => {
          btn.addEventListener('click', () => {
            layer.type = btn.dataset.type;
            this.renderDifferenceSection(state);
            this.notifyChange();
          });
        });

        const segPlacements = card.querySelectorAll('.seg-placement .segmented-btn');
        segPlacements.forEach(btn => {
          btn.addEventListener('click', () => {
            segPlacements.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            layer.placement = btn.dataset.place;
            this.notifyChange();
          });
        });

        const textInput = card.querySelector('.text-input');
        if (textInput) {
          textInput.addEventListener('input', (e) => {
            layer.text = e.target.value;
            this.notifyChange();
          });
        }

        const sizeInput = card.querySelector('.input-size');
        const sizeVal = card.querySelector('.val-size');
        sizeInput.addEventListener('input', (e) => {
          layer.size = parseInt(e.target.value, 10);
          sizeVal.textContent = `${layer.size}px`;
          this.notifyChange();
        });

        const xInput = card.querySelector('.input-x');
        const xVal = card.querySelector('.val-x');
        xInput.addEventListener('input', (e) => {
          layer.x = parseInt(e.target.value, 10);
          xVal.textContent = `${layer.x}%`;
          this.notifyChange();
        });

        const yInput = card.querySelector('.input-y');
        const yVal = card.querySelector('.val-y');
        yInput.addEventListener('input', (e) => {
          layer.y = parseInt(e.target.value, 10);
          yVal.textContent = `${layer.y}%`;
          this.notifyChange();
        });

        list.appendChild(card);
      });
    }

    const btnAdd = section.querySelector('#btn-add-diff');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        if (state.differenceLayers.length >= maxLayers) return;
        const pal = PALETTES[state.canvas.paletteId] || PALETTES.petrol;
        const newLayer = {
          id: `diff-${Date.now()}`,
          name: `Elemento ${state.differenceLayers.length + 1}`,
          active: true,
          type: 'circle',
          placement: 'behind',
          x: 50,
          y: 50,
          size: 100,
          color: state.differenceLayers.length === 0 ? pal.accent1 : pal.accent2,
          opacity: 0.9,
          blendMode: 'normal'
        };
        state.differenceLayers.push(newLayer);
        this.renderDifferenceSection(state);
        this.notifyChange();
        UIManager.showToast('✨ Capa de diferencia añadida');
      });
    }

    this.container.appendChild(section);
  }

  bindSlider(container, key, targetObj, unit, transform) {
    const input = container.querySelector(`#input-${key}`);
    const display = container.querySelector(`#val-${key}`);
    if (input && display) {
      input.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        targetObj[key] = transform(val);
        display.textContent = `${val}${unit}`;
        this.notifyChange();
      });
    }
  }

  notifyChange() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  static showToast(message, duration = 2500) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}
