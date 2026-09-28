/**
 * Gestor de Interfaz de Usuario para Abstract Studio
 * Soporta arquetipos geométricos, transformación acumulativa estilo Illustrator
 * y slider de textura de papel / micro-corrugado estilo UJI.
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

    // 1. Presets Rápidos
    this.renderPresetsSection(state, engine);

    // 2. Lienzo & Formato (Aspect Ratio y Paletas)
    this.renderCanvasSection(state);

    // 3. Capa 1: Arquetipo & Transformación Acumulativa
    this.renderPatternSection(state);

    // 4. Herramientas de Esculpido Manual
    this.renderSculptSection(state, engine);

    // 5. Capas de Diferencia (Máx 3)
    this.renderDifferenceSection(state);
  }

  renderPresetsSection(state, engine) {
    const section = document.createElement('div');
    section.className = 'control-group';
    section.innerHTML = `
      <span class="section-label">Galería de Arquetipos / Presets</span>
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
        UIManager.showToast(`✨ Arquetipo cargado: ${preset.name}`);
      });
      list.appendChild(chip);
    });

    this.container.appendChild(section);
  }

  renderCanvasSection(state) {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = `
      <div class="section-title">📐 1. Lienzo & Proporción</div>
      <div class="control-group">
        <label class="control-label">Aspect Ratio</label>
        <div class="aspect-grid" id="aspect-ratio-buttons"></div>
      </div>
      <div class="control-group">
        <label class="control-label">Paleta Cromática</label>
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

  renderPatternSection(state) {
    const isTransformMode = ['spiral_nautilus', 'radial_rosette', 'concentric_tunnel'].includes(state.pattern.archetype);

    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = `
      <div class="section-title">〰️ 2. Capa 1: Arquetipo & Transformación</div>
      
      <div class="control-group">
        <label class="control-label">Arquetipo Base</label>
        <div class="segmented-control" id="archetype-control">
          <button type="button" class="segmented-btn ${state.pattern.archetype === 'lines' ? 'active' : ''}" data-archetype="lines">Líneas</button>
          <button type="button" class="segmented-btn ${state.pattern.archetype === 'spiral_nautilus' ? 'active' : ''}" data-archetype="spiral_nautilus">Nautilus</button>
          <button type="button" class="segmented-btn ${state.pattern.archetype === 'radial_rosette' ? 'active' : ''}" data-archetype="radial_rosette">Roseta</button>
          <button type="button" class="segmented-btn ${state.pattern.archetype === 'concentric_tunnel' ? 'active' : ''}" data-archetype="concentric_tunnel">Vórtice</button>
          <button type="button" class="segmented-btn ${state.pattern.archetype === 'grid' ? 'active' : ''}" data-archetype="grid">Rejilla</button>
        </div>
      </div>

      <!-- Controles Específicos de Transformación Acumulativa (Estilo Illustrator) -->
      <div id="transform-panel" style="display: ${isTransformMode ? 'flex' : 'none'}; flex-direction: column; gap: 0.8rem;">
        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Copias de Repetición</span>
            <span class="control-value" id="val-copies">${state.pattern.copies || 50}</span>
          </div>
          <input type="range" id="input-copies" min="5" max="800" step="5" value="${state.pattern.copies || 50}">
        </div>

        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Escala por Copia (%)</span>
            <span class="control-value" id="val-scaleStep">${Math.round((state.pattern.scaleStep || 0.96) * 100)}%</span>
          </div>
          <input type="range" id="input-scaleStep" min="88" max="104" step="0.2" value="${((state.pattern.scaleStep || 0.96) * 100).toFixed(1)}">
        </div>

        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Giro Angular por Copia</span>
            <span class="control-value" id="val-rotateStep">${state.pattern.rotateStep || 8}°</span>
          </div>
          <input type="range" id="input-rotateStep" min="0" max="30" step="0.5" value="${state.pattern.rotateStep || 8}">
        </div>

        <div class="dual-slider-row">
          <div class="control-group flex-1">
            <span class="control-label-sm">Mover X: <span id="val-moveX">${state.pattern.moveX || 0}px</span></span>
            <input type="range" id="input-moveX" min="-8" max="8" step="0.5" value="${state.pattern.moveX || 0}">
          </div>
          <div class="control-group flex-1">
            <span class="control-label-sm">Mover Y: <span id="val-moveY">${state.pattern.moveY || 0}px</span></span>
            <input type="range" id="input-moveY" min="-8" max="8" step="0.5" value="${state.pattern.moveY || 0}">
          </div>
        </div>

        <div class="control-group">
          <label class="control-label-sm">Eje de Rotación</label>
          <div class="segmented-control" id="anchor-control">
            <button type="button" class="segmented-btn ${state.pattern.anchor === 'center' ? 'active' : ''}" data-anchor="center">Centro</button>
            <button type="button" class="segmented-btn ${state.pattern.anchor === 'bottom' ? 'active' : ''}" data-anchor="bottom">Base Excéntrica</button>
            <button type="button" class="segmented-btn ${state.pattern.anchor === 'side' ? 'active' : ''}" data-anchor="side">Lateral</button>
          </div>
        </div>
      </div>

      <!-- Controles para Líneas Paralelas -->
      <div id="lines-panel" style="display: ${!isTransformMode ? 'flex' : 'none'}; flex-direction: column; gap: 0.8rem;">
        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Densidad de Líneas</span>
            <span class="control-value" id="val-density">${state.pattern.density || 45}</span>
          </div>
          <input type="range" id="input-density" min="15" max="85" step="1" value="${state.pattern.density || 45}">
        </div>

        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Ángulo General</span>
            <span class="control-value" id="val-angle">${state.pattern.angle || 0}°</span>
          </div>
          <input type="range" id="input-angle" min="0" max="180" step="1" value="${state.pattern.angle || 0}">
        </div>

        <div class="control-group">
          <div class="control-header">
            <span class="control-label">Ondulación Base</span>
            <span class="control-value" id="val-baseWaviness">${state.pattern.baseWaviness || 0}px</span>
          </div>
          <input type="range" id="input-baseWaviness" min="0" max="20" step="1" value="${state.pattern.baseWaviness || 0}">
        </div>
      </div>

      <!-- CONTROLES ARTÍSTICOS UNIVERSALES (Textura UJI + Grosor + Opacidad) -->
      <div class="control-group">
        <div class="control-header">
          <span class="control-label" style="color: #38bdf8;">🌾 Textura de Papel (Micro-corrugado)</span>
          <span class="control-value" id="val-jitter">${(state.pattern.jitter || 0).toFixed(1)}px</span>
        </div>
        <input type="range" id="input-jitter" min="0" max="6" step="0.2" value="${state.pattern.jitter || 0}">
      </div>

      <div class="dual-slider-row">
        <div class="control-group flex-1">
          <div class="control-header">
            <span class="control-label-sm">Grosor</span>
            <span class="control-value-sm" id="val-strokeWidth">${state.pattern.strokeWidth || 1}px</span>
          </div>
          <input type="range" id="input-strokeWidth" min="0.2" max="4.0" step="0.1" value="${state.pattern.strokeWidth || 1}">
        </div>

        <div class="control-group flex-1">
          <div class="control-header">
            <span class="control-label-sm">Opacidad</span>
            <span class="control-value-sm" id="val-opacity">${Math.round((state.pattern.opacity || 0.8) * 100)}%</span>
          </div>
          <input type="range" id="input-opacity" min="0.05" max="1.0" step="0.05" value="${state.pattern.opacity || 0.8}">
        </div>
      </div>
    `;

    // Selector de arquetipo
    const archBtns = section.querySelectorAll('#archetype-control .segmented-btn');
    archBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        archBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.pattern.archetype = btn.dataset.archetype;
        this.render(state, null);
        this.notifyChange();
      });
    });

    // Ancla
    const anchorBtns = section.querySelectorAll('#anchor-control .segmented-btn');
    anchorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        anchorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.pattern.anchor = btn.dataset.anchor;
        this.notifyChange();
      });
    });

    // Sliders de Transformación
    this.bindSlider(section, 'copies', state.pattern, '', (v) => v);
    this.bindSlider(section, 'scaleStep', state.pattern, '%', (v) => v / 100);
    this.bindSlider(section, 'rotateStep', state.pattern, '°', (v) => v);
    this.bindSlider(section, 'moveX', state.pattern, 'px', (v) => v);
    this.bindSlider(section, 'moveY', state.pattern, 'px', (v) => v);

    // Sliders de Líneas
    this.bindSlider(section, 'density', state.pattern, '', (v) => v);
    this.bindSlider(section, 'angle', state.pattern, '°', (v) => v);
    this.bindSlider(section, 'baseWaviness', state.pattern, 'px', (v) => v);

    // Sliders Universales
    this.bindSlider(section, 'jitter', state.pattern, 'px', (v) => v);
    this.bindSlider(section, 'strokeWidth', state.pattern, 'px', (v) => v);
    this.bindSlider(section, 'opacity', state.pattern, '', (v) => v);

    this.container.appendChild(section);
  }

  renderSculptSection(state, engine) {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.innerHTML = `
      <div class="section-title">✍️ 3. Esculpido Directo (Cursor)</div>
      
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
        <span class="section-title">✨ 4. Capas de Diferencia (${count}/${maxLayers})</span>
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
