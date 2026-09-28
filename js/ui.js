/**
 * Gestor de Interfaz de Usuario para Abstract Studio
 * Modo: Carbón y Tiza (Charcoal & Chalk)
 * 1. Figura Base (Posición X/Y, Tamaño o Caja Delimitadora)
 * 2. Repetición (Lineal con apilamiento vertical o Radial concéntrico)
 * 3. Textura & Materia (Jitter, Skip Chance, Line Swappiness estilo UJI)
 * 4. Esculpido Manual Directo (Cursor)
 * 5. Capas de Diferencia
 *
 * Controles de precisión dual: Deslizador (Range) + Teclado (Number Input)
 */

import { ASPECT_RATIOS } from './engine.js';

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

    // 0. Formato del Lienzo
    this.renderCanvasSection(state);

    // 1. Figura Base & 2. Repetición (Lineal / Radial) & 3. Textura
    this.renderCoreSection(state, engine);

    // 4. Esculpido Directo
    this.renderSculptSection(state, engine);

    // 5. Capas de Diferencia
    this.renderDifferenceSection(state);
  }

  renderCanvasSection(state) {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = `
      <div class="section-title">📐 Lienzo & Proporción</div>
      <div class="control-group">
        <label class="control-label">Aspect Ratio</label>
        <div class="aspect-grid" id="aspect-ratio-buttons"></div>
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

    this.container.appendChild(section);
  }

  renderCoreSection(state, engine) {
    const p = state.pattern;
    if (!p.distribution) p.distribution = 'linear';
    if (p.angle === undefined) p.angle = 0;
    if (p.posX === undefined) p.posX = 50;
    if (p.posY === undefined) p.posY = 50;
    if (p.sizeX === undefined) p.sizeX = p.size || 500;
    if (p.sizeY === undefined) p.sizeY = p.size || 380;
    if (p.stepX === undefined) p.stepX = 0;
    if (p.stepY === undefined) p.stepY = 35;

    const section = document.createElement('div');
    section.className = 'control-section';

    let repetitionControlsHtml = '';

    if (p.distribution === 'linear') {
      if (p.shape === 'line') {
        repetitionControlsHtml = `
          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="num-copies">Copias de Repetición</label>
              <div class="control-input-wrapper">
                <input type="number" id="num-copies" class="number-input" min="1" max="500" step="1" value="${p.copies}">
              </div>
            </div>
            <input type="range" id="input-copies" min="1" max="500" step="1" value="${p.copies}">
          </div>

          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="num-angle">Ángulo de Trama</label>
              <div class="control-input-wrapper">
                <input type="number" id="num-angle" class="number-input" min="0" max="180" step="1" value="${p.angle}">
                <span class="unit-tag">°</span>
              </div>
            </div>
            <input type="range" id="input-angle" min="0" max="180" step="1" value="${p.angle}">
            <div class="quick-angle-buttons">
              <button type="button" class="btn-chip ${p.angle === 0 ? 'active' : ''}" data-angle="0">0° Horiz</button>
              <button type="button" class="btn-chip ${p.angle === 90 ? 'active' : ''}" data-angle="90">90° Vert</button>
              <button type="button" class="btn-chip ${p.angle === 45 ? 'active' : ''}" data-angle="45">45° Diag</button>
              <button type="button" class="btn-chip ${p.angle === 135 ? 'active' : ''}" data-angle="135">135° Diag</button>
            </div>
          </div>
        `;
      } else {
        // Figuras geométricas en repetición lineal: una debajo de la otra en vertical por defecto
        repetitionControlsHtml = `
          <div class="control-group">
            <div class="control-header">
              <label class="control-label" for="num-copies">Copias de Repetición</label>
              <div class="control-input-wrapper">
                <input type="number" id="num-copies" class="number-input" min="1" max="300" step="1" value="${p.copies}">
              </div>
            </div>
            <input type="range" id="input-copies" min="1" max="300" step="1" value="${p.copies}">
          </div>

          <div class="dual-slider-row">
            <div class="control-group flex-1">
              <div class="control-header">
                <label class="control-label-sm" for="num-stepY">Paso Vertical</label>
                <div class="control-input-wrapper">
                  <input type="number" id="num-stepY" class="number-input" min="-150" max="150" step="1" value="${p.stepY}">
                  <span class="unit-tag">px</span>
                </div>
              </div>
              <input type="range" id="input-stepY" min="-150" max="150" step="1" value="${p.stepY}">
            </div>
            <div class="control-group flex-1">
              <div class="control-header">
                <label class="control-label-sm" for="num-stepX">Paso Horizontal</label>
                <div class="control-input-wrapper">
                  <input type="number" id="num-stepX" class="number-input" min="-150" max="150" step="1" value="${p.stepX}">
                  <span class="unit-tag">px</span>
                </div>
              </div>
              <input type="range" id="input-stepX" min="-150" max="150" step="1" value="${p.stepX}">
            </div>
          </div>
          <span class="sub-hint">Paso vertical > 0 apila las figuras una debajo de la otra en vertical</span>

          <div class="dual-slider-row" style="margin-top: 0.35rem;">
            <div class="control-group flex-1">
              <div class="control-header">
                <label class="control-label-sm" for="num-scaleStep">Escala %</label>
                <div class="control-input-wrapper">
                  <input type="number" id="num-scaleStep" class="number-input" min="70" max="130" step="0.5" value="${Math.round(p.scaleStep * 100)}">
                  <span class="unit-tag">%</span>
                </div>
              </div>
              <input type="range" id="input-scaleStep" min="70" max="130" step="0.5" value="${Math.round(p.scaleStep * 100)}">
            </div>
            <div class="control-group flex-1">
              <div class="control-header">
                <label class="control-label-sm" for="num-rotateStep">Giro °</label>
                <div class="control-input-wrapper">
                  <input type="number" id="num-rotateStep" class="number-input" min="-45" max="45" step="0.5" value="${p.rotateStep}">
                  <span class="unit-tag">°</span>
                </div>
              </div>
              <input type="range" id="input-rotateStep" min="-45" max="45" step="0.5" value="${p.rotateStep}">
            </div>
          </div>
        `;
      }
    } else {
      // Repetición Radial
      repetitionControlsHtml = `
        <div class="control-group">
          <div class="control-header">
            <label class="control-label" for="num-copies">Copias de Repetición</label>
            <div class="control-input-wrapper">
              <input type="number" id="num-copies" class="number-input" min="2" max="800" step="1" value="${p.copies}">
            </div>
          </div>
          <input type="range" id="input-copies" min="2" max="800" step="1" value="${p.copies}">
        </div>

        <div class="dual-slider-row">
          <div class="control-group flex-1">
            <div class="control-header">
              <label class="control-label-sm" for="num-scaleStep">Escala %</label>
              <div class="control-input-wrapper">
                <input type="number" id="num-scaleStep" class="number-input" min="85" max="115" step="0.2" value="${(p.scaleStep * 100).toFixed(1)}">
                <span class="unit-tag">%</span>
              </div>
            </div>
            <input type="range" id="input-scaleStep" min="85" max="115" step="0.2" value="${(p.scaleStep * 100).toFixed(1)}">
          </div>
          <div class="control-group flex-1">
            <div class="control-header">
              <label class="control-label-sm" for="num-rotateStep">Giro °</label>
              <div class="control-input-wrapper">
                <input type="number" id="num-rotateStep" class="number-input" min="-30" max="30" step="0.2" value="${p.rotateStep}">
                <span class="unit-tag">°</span>
              </div>
            </div>
            <input type="range" id="input-rotateStep" min="-30" max="30" step="0.2" value="${p.rotateStep}">
          </div>
        </div>

        <div class="dual-slider-row">
          <div class="control-group flex-1">
            <div class="control-header">
              <label class="control-label-sm" for="num-moveX">Mover X</label>
              <div class="control-input-wrapper">
                <input type="number" id="num-moveX" class="number-input" min="-20" max="20" step="0.5" value="${p.moveX}">
                <span class="unit-tag">px</span>
              </div>
            </div>
            <input type="range" id="input-moveX" min="-20" max="20" step="0.5" value="${p.moveX}">
          </div>
          <div class="control-group flex-1">
            <div class="control-header">
              <label class="control-label-sm" for="num-moveY">Mover Y</label>
              <div class="control-input-wrapper">
                <input type="number" id="num-moveY" class="number-input" min="-20" max="20" step="0.5" value="${p.moveY}">
                <span class="unit-tag">px</span>
              </div>
            </div>
            <input type="range" id="input-moveY" min="-20" max="20" step="0.5" value="${p.moveY}">
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
    }

    section.innerHTML = `
      <div class="section-title">🔷 1. Figura Base (Semilla)</div>
      
      <div class="control-group">
        <label class="control-label">Geometría Semilla</label>
        <div class="segmented-control" id="shape-control">
          <button type="button" class="segmented-btn ${p.shape === 'line' ? 'active' : ''}" data-shape="line">Línea</button>
          <button type="button" class="segmented-btn ${p.shape === 'circle' ? 'active' : ''}" data-shape="circle">Círculo</button>
          <button type="button" class="segmented-btn ${p.shape === 'polygon' ? 'active' : ''}" data-shape="polygon">Polígono</button>
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

      <div class="dual-slider-row">
        <div class="control-group flex-1">
          <div class="control-header">
            <label class="control-label-sm" for="num-posX">Posición X</label>
            <div class="control-input-wrapper">
              <input type="number" id="num-posX" class="number-input" min="0" max="100" step="1" value="${p.posX}">
              <span class="unit-tag">%</span>
            </div>
          </div>
          <input type="range" id="input-posX" min="0" max="100" step="1" value="${p.posX}">
        </div>
        <div class="control-group flex-1">
          <div class="control-header">
            <label class="control-label-sm" for="num-posY">Posición Y</label>
            <div class="control-input-wrapper">
              <input type="number" id="num-posY" class="number-input" min="0" max="100" step="1" value="${p.posY}">
              <span class="unit-tag">%</span>
            </div>
          </div>
          <input type="range" id="input-posY" min="0" max="100" step="1" value="${p.posY}">
        </div>
      </div>

      ${p.shape === 'line' ? `
      <div class="dual-slider-row">
        <div class="control-group flex-1">
          <div class="control-header">
            <label class="control-label-sm" for="num-sizeX">Ancho Líneas</label>
            <div class="control-input-wrapper">
              <input type="number" id="num-sizeX" class="number-input" min="30" max="1400" step="10" value="${p.sizeX}">
              <span class="unit-tag">px</span>
            </div>
          </div>
          <input type="range" id="input-sizeX" min="30" max="1400" step="10" value="${p.sizeX}">
        </div>
        <div class="control-group flex-1">
          <div class="control-header">
            <label class="control-label-sm" for="num-sizeY">Alto / Cobertura</label>
            <div class="control-input-wrapper">
              <input type="number" id="num-sizeY" class="number-input" min="30" max="1400" step="10" value="${p.sizeY}">
              <span class="unit-tag">px</span>
            </div>
          </div>
          <input type="range" id="input-sizeY" min="30" max="1400" step="10" value="${p.sizeY}">
        </div>
      </div>
      <span class="sub-hint">Rectángulo delimitador: pequeño (<400px) = Objeto central | grande (>800px) = Fondo sangrado</span>
      ` : `
      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="num-size">Tamaño Base (Radio)</label>
          <div class="control-input-wrapper">
            <input type="number" id="num-size" class="number-input" min="20" max="1000" step="5" value="${p.size}">
            <span class="unit-tag">px</span>
          </div>
        </div>
        <input type="range" id="input-size" min="20" max="1000" step="5" value="${p.size}">
      </div>
      `}

      <div class="section-title" style="margin-top: 0.8rem;">🔄 2. Repetición</div>

      <div class="control-group">
        <label class="control-label">Tipo de Repetición</label>
        <div class="segmented-control" id="distribution-control">
          <button type="button" class="segmented-btn ${p.distribution === 'linear' ? 'active' : ''}" data-dist="linear">Lineal</button>
          <button type="button" class="segmented-btn ${p.distribution === 'radial' ? 'active' : ''}" data-dist="radial">Radial</button>
        </div>
      </div>

      ${repetitionControlsHtml}

      <div class="section-title" style="margin-top: 0.8rem;">🌾 3. Textura & Materia (UJI)</div>

      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="num-jitter">Micro-corrugado (Jitter / Fibra)</label>
          <div class="control-input-wrapper">
            <input type="number" id="num-jitter" class="number-input" min="0" max="8" step="0.1" value="${(p.jitter || 0).toFixed(1)}">
            <span class="unit-tag">px</span>
          </div>
        </div>
        <input type="range" id="input-jitter" min="0" max="8" step="0.1" value="${p.jitter || 0}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="num-skipChance">Salto de Líneas (Respiración)</label>
          <div class="control-input-wrapper">
            <input type="number" id="num-skipChance" class="number-input" min="0" max="60" step="1" value="${p.skipChance || 0}">
            <span class="unit-tag">%</span>
          </div>
        </div>
        <input type="range" id="input-skipChance" min="0" max="60" step="1" value="${p.skipChance || 0}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="num-lineSwappiness">Cruce de Hebras (Deshilachado)</label>
          <div class="control-input-wrapper">
            <input type="number" id="num-lineSwappiness" class="number-input" min="0" max="60" step="1" value="${p.lineSwappiness || 0}">
            <span class="unit-tag">%</span>
          </div>
        </div>
        <input type="range" id="input-lineSwappiness" min="0" max="60" step="1" value="${p.lineSwappiness || 0}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="num-waviness">Ondulación Perimetral</label>
          <div class="control-input-wrapper">
            <input type="number" id="num-waviness" class="number-input" min="0" max="30" step="1" value="${p.waviness || 0}">
            <span class="unit-tag">px</span>
          </div>
        </div>
        <input type="range" id="input-waviness" min="0" max="30" step="1" value="${p.waviness || 0}">
      </div>

      <div class="dual-slider-row">
        <div class="control-group flex-1">
          <div class="control-header">
            <label class="control-label-sm" for="num-strokeWidth">Grosor</label>
            <div class="control-input-wrapper">
              <input type="number" id="num-strokeWidth" class="number-input" min="0.2" max="6.0" step="0.1" value="${p.strokeWidth || 1.2}">
              <span class="unit-tag">px</span>
            </div>
          </div>
          <input type="range" id="input-strokeWidth" min="0.2" max="6.0" step="0.1" value="${p.strokeWidth || 1.2}">
        </div>
        <div class="control-group flex-1">
          <div class="control-header">
            <label class="control-label-sm" for="num-opacity">Opacidad</label>
            <div class="control-input-wrapper">
              <input type="number" id="num-opacity" class="number-input" min="5" max="100" step="1" value="${Math.round((p.opacity || 0.9) * 100)}">
              <span class="unit-tag">%</span>
            </div>
          </div>
          <input type="range" id="input-opacity" min="5" max="100" step="1" value="${Math.round((p.opacity || 0.9) * 100)}">
        </div>
      </div>
    `;

    // Selección de forma base
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

    // Modo de Repetición: Lineal vs Radial
    const distBtns = section.querySelectorAll('#distribution-control .segmented-btn');
    distBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        p.distribution = btn.dataset.dist;
        this.render(state, engine);
        this.notifyChange();
      });
    });

    // Ancla (modo radial)
    const anchorBtns = section.querySelectorAll('#anchor-control .segmented-btn');
    anchorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        anchorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        p.anchor = btn.dataset.anchor;
        this.notifyChange();
      });
    });

    // Botones rápidos de Ángulo (líneas en modo lineal)
    const angleChips = section.querySelectorAll('.quick-angle-buttons .btn-chip');
    const angleInput = section.querySelector('#input-angle');
    const angleNum = section.querySelector('#num-angle');
    angleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const ang = parseFloat(chip.dataset.angle);
        p.angle = ang;
        if (angleInput) angleInput.value = ang;
        if (angleNum) angleNum.value = ang;
        angleChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.notifyChange();
      });
    });

    // Bindeo dual (Slider + Number input sincronizados para teclado y cursor)
    this.bindControl(section, 'posX', p, '%', { min: 0, max: 100, step: 1 });
    this.bindControl(section, 'posY', p, '%', { min: 0, max: 100, step: 1 });
    this.bindControl(section, 'size', p, 'px', { min: 20, max: 1000, step: 5 });
    this.bindControl(section, 'sizeX', p, 'px', { min: 30, max: 1400, step: 10 });
    this.bindControl(section, 'sizeY', p, 'px', { min: 30, max: 1400, step: 10 });
    this.bindControl(section, 'copies', p, '', { min: 1, max: 800, step: 1 });
    this.bindControl(section, 'stepX', p, 'px', { min: -150, max: 150, step: 1 });
    this.bindControl(section, 'stepY', p, 'px', { min: -150, max: 150, step: 1 });
    this.bindControl(section, 'angle', p, '°', {
      min: 0,
      max: 180,
      step: 1,
      onUpdate: (v) => {
        angleChips.forEach(c => c.classList.toggle('active', parseFloat(c.dataset.angle) === v));
      }
    });
    this.bindControl(section, 'scaleStep', p, '%', {
      min: 50,
      max: 150,
      step: 0.2,
      transform: (v) => v / 100,
      reverse: (v) => Math.round(v * 100)
    });
    this.bindControl(section, 'rotateStep', p, '°', { min: -45, max: 45, step: 0.2 });
    this.bindControl(section, 'moveX', p, 'px', { min: -20, max: 20, step: 0.5 });
    this.bindControl(section, 'moveY', p, 'px', { min: -20, max: 20, step: 0.5 });
    this.bindControl(section, 'jitter', p, 'px', { min: 0, max: 8, step: 0.1 });
    this.bindControl(section, 'skipChance', p, '%', { min: 0, max: 60, step: 1 });
    this.bindControl(section, 'lineSwappiness', p, '%', { min: 0, max: 60, step: 1 });
    this.bindControl(section, 'waviness', p, 'px', { min: 0, max: 30, step: 1 });
    this.bindControl(section, 'strokeWidth', p, 'px', { min: 0.2, max: 6.0, step: 0.1 });
    this.bindControl(section, 'opacity', p, '%', {
      min: 5,
      max: 100,
      step: 1,
      transform: (v) => v / 100,
      reverse: (v) => Math.round(v * 100)
    });

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
          <label class="control-label" for="num-brushRadius">Radio del Pincel</label>
          <div class="control-input-wrapper">
            <input type="number" id="num-brushRadius" class="number-input" min="15" max="220" step="5" value="${state.brush.radius}">
            <span class="unit-tag">px</span>
          </div>
        </div>
        <input type="range" id="input-brushRadius" min="15" max="220" step="5" value="${state.brush.radius}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <label class="control-label" for="num-brushStrength">Fuerza de Deformación</label>
          <div class="control-input-wrapper">
            <input type="number" id="num-brushStrength" class="number-input" min="5" max="160" step="5" value="${state.brush.strength}">
            <span class="unit-tag">px</span>
          </div>
        </div>
        <input type="range" id="input-brushStrength" min="5" max="160" step="5" value="${state.brush.strength}">
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

    this.bindControl(section, 'brushRadius', state.brush, 'px', { min: 15, max: 220, step: 5 });
    this.bindControl(section, 'brushStrength', state.brush, 'px', { min: 5, max: 160, step: 5 });

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
                <button type="button" class="segmented-btn ${layer.placement === 'behind' ? 'active' : ''}" data-place="behind">Detrás</button>
                <button type="button" class="segmented-btn ${layer.placement === 'in-front' ? 'active' : ''}" data-place="in-front">Delante</button>
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
                <label class="control-label-sm">Tamaño</label>
                <div class="control-input-wrapper">
                  <input type="number" class="number-input input-num-size" min="30" max="400" step="5" value="${layer.size}">
                  <span class="unit-tag">px</span>
                </div>
              </div>
              <input type="range" class="input-size" min="30" max="400" step="5" value="${layer.size}">
            </div>

            <div class="dual-slider-row">
              <div class="control-group flex-1">
                <div class="control-header">
                  <label class="control-label-sm">Pos X</label>
                  <div class="control-input-wrapper">
                    <input type="number" class="number-input input-num-x" min="5" max="95" step="1" value="${layer.x}">
                    <span class="unit-tag">%</span>
                  </div>
                </div>
                <input type="range" class="input-x" min="5" max="95" step="1" value="${layer.x}">
              </div>
              <div class="control-group flex-1">
                <div class="control-header">
                  <label class="control-label-sm">Pos Y</label>
                  <div class="control-input-wrapper">
                    <input type="number" class="number-input input-num-y" min="5" max="95" step="1" value="${layer.y}">
                    <span class="unit-tag">%</span>
                  </div>
                </div>
                <input type="range" class="input-y" min="5" max="95" step="1" value="${layer.y}">
              </div>
            </div>
          </div>
        `;

        // Bindeo de capa
        const segTypes = card.querySelectorAll('.seg-type .segmented-btn');
        segTypes.forEach(btn => {
          btn.addEventListener('click', () => {
            segTypes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            layer.type = btn.dataset.type;
            this.renderDifferenceSection(state);
            this.notifyChange();
          });
        });

        const segPlace = card.querySelectorAll('.seg-placement .segmented-btn');
        segPlace.forEach(btn => {
          btn.addEventListener('click', () => {
            segPlace.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            layer.placement = btn.dataset.place;
            this.notifyChange();
          });
        });

        const textIn = card.querySelector('.text-input');
        if (textIn) {
          textIn.addEventListener('input', (e) => {
            layer.text = e.target.value;
            this.notifyChange();
          });
        }

        const sizeSlider = card.querySelector('.input-size');
        const sizeNum = card.querySelector('.input-num-size');
        if (sizeSlider && sizeNum) {
          sizeSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            layer.size = val;
            sizeNum.value = val;
            this.notifyChange();
          });
          sizeNum.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!Number.isNaN(val)) {
              layer.size = val;
              sizeSlider.value = val;
              this.notifyChange();
            }
          });
        }

        const xSlider = card.querySelector('.input-x');
        const xNum = card.querySelector('.input-num-x');
        if (xSlider && xNum) {
          xSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            layer.x = val;
            xNum.value = val;
            this.notifyChange();
          });
          xNum.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!Number.isNaN(val)) {
              layer.x = val;
              xSlider.value = val;
              this.notifyChange();
            }
          });
        }

        const ySlider = card.querySelector('.input-y');
        const yNum = card.querySelector('.input-num-y');
        if (ySlider && yNum) {
          ySlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            layer.y = val;
            yNum.value = val;
            this.notifyChange();
          });
          yNum.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (!Number.isNaN(val)) {
              layer.y = val;
              ySlider.value = val;
              this.notifyChange();
            }
          });
        }

        card.querySelector('.btn-remove-layer').addEventListener('click', () => {
          state.differenceLayers.splice(idx, 1);
          this.renderDifferenceSection(state);
          this.notifyChange();
          UIManager.showToast('Capa eliminada');
        });

        list.appendChild(card);
      });
    }

    const addBtn = section.querySelector('#btn-add-diff');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (state.differenceLayers.length >= maxLayers) return;
        const newLayer = {
          id: `diff-${Date.now()}`,
          name: `Elemento ${state.differenceLayers.length + 1}`,
          active: true,
          type: 'circle',
          placement: 'behind',
          x: 50,
          y: 50,
          size: 110,
          color: '#27272a',
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

  /**
   * Bindeo dual para controles numéricos: Slider (Range) + Teclado (Number Input)
   */
  bindControl(container, key, targetObj, unit = '', options = {}) {
    const rangeInput = container.querySelector(`#input-${key}`);
    const numInput = container.querySelector(`#num-${key}`);
    const transform = options.transform || ((v) => v);
    const reverse = options.reverse || ((v) => v);

    if (rangeInput) {
      rangeInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (Number.isNaN(val)) return;
        targetObj[key] = transform(val);
        if (numInput) {
          numInput.value = val;
        }
        if (options.onUpdate) options.onUpdate(val);
        this.notifyChange();
      });
    }

    if (numInput) {
      const handleNum = (e) => {
        let val = parseFloat(e.target.value);
        if (Number.isNaN(val)) return;
        if (options.min !== undefined && val < options.min) val = options.min;
        if (options.max !== undefined && val > options.max) val = options.max;
        targetObj[key] = transform(val);
        if (rangeInput) {
          rangeInput.value = reverse(val);
        }
        if (options.onUpdate) options.onUpdate(val);
        this.notifyChange();
      };

      numInput.addEventListener('input', handleNum);
      numInput.addEventListener('change', handleNum);
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
