/**
 * Abstract Studio - User Interface Manager
 * Figma Studio Architecture:
 * - Floating Layers Panel with solid black active layer state
 * - Vertical Tool Rail with icon buttons
 * - Flyout Popover Inspector for active editing panel
 * - Full English translation
 */

import { Shapes, SHAPE_KEYS } from './shapes.js';
import { PRESETS } from './presets.js';
import { PALETTES } from './palettes.js';

export class UIManager {
  constructor({
    layersContainerId = 'layers-sidebar',
    popoverContainerId = 'popover-inspector',
    toolRailId = 'tool-rail',
    onStateChange,
    onLayerSelect
  }) {
    this.layersContainer = document.getElementById(layersContainerId);
    this.popoverContainer = document.getElementById(popoverContainerId);
    this.toolRail = document.getElementById(toolRailId);
    this.onStateChange = onStateChange;
    this.onLayerSelect = onLayerSelect;

    // Active flyout panel: 'shape' | 'pattern' | 'style' | null
    // Defaults to 'shape' open as in the design screenshot
    this.activePanel = 'shape';
    this.currentState = null;

    this.initEventListeners();
  }

  notifyChange() {
    if (this.onStateChange) this.onStateChange();
  }

  initEventListeners() {
    // 1. Tool Rail button click handling
    if (this.toolRail) {
      this.toolRail.addEventListener('click', (e) => {
        const btn = e.target.closest('.rail-btn');
        if (!btn || btn.classList.contains('hidden-rail-btn')) return;

        const panelKey = btn.dataset.panel;
        if (this.activePanel === panelKey) {
          // Toggle off if clicking the active one
          this.closePopover();
        } else {
          // Open or switch to the new panel
          this.openPanel(panelKey);
        }
      });
    }

    // 2. Click outside closes the popover
    document.addEventListener('pointerdown', (e) => {
      if (!this.popoverContainer || !this.activePanel) return;

      // If clicked inside popover or inside tool rail, do not close
      if (this.popoverContainer.contains(e.target) || (this.toolRail && this.toolRail.contains(e.target))) {
        return;
      }

      this.closePopover();
    });

    // 3. Escape key closes popover
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activePanel) {
        this.closePopover();
      }
    });
  }

  openPanel(panelKey) {
    this.activePanel = panelKey;
    if (this.currentState) {
      this.render(this.currentState);
    }
  }

  closePopover() {
    this.activePanel = null;
    if (this.popoverContainer) {
      this.popoverContainer.classList.remove('open');
      this.popoverContainer.innerHTML = '';
    }
    if (this.toolRail) {
      this.toolRail.querySelectorAll('.rail-btn').forEach(btn => btn.classList.remove('active'));
    }
  }

  render(state) {
    this.currentState = state;
    this.renderLayersPanel(state);
    this.updateToolRail();
    this.renderPopover(state);
  }

  updateToolRail() {
    if (!this.toolRail) return;
    this.toolRail.querySelectorAll('.rail-btn').forEach(btn => {
      const panelKey = btn.dataset.panel;
      btn.classList.toggle('active', this.activePanel === panelKey);
    });
  }

  // =========================================================================
  // 1. LAYERS PANEL (Floating Left)
  // =========================================================================

  renderLayersPanel(state) {
    if (!this.layersContainer) return;
    this.layersContainer.innerHTML = '';

    // Header: LAYERS count + Add pattern +
    const header = document.createElement('div');
    header.className = 'layers-header';
    header.innerHTML = `
      <div class="layers-header-title">
        <span>LAYERS</span>
        <span class="layers-badge">${state.layers.length}</span>
      </div>
      <button id="btn-add-pattern-layer" class="btn-add-layer" title="Add Generative Pattern Layer">
        <span>Add pattern</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    `;
    this.layersContainer.appendChild(header);

    // List of layers (rendered top to bottom)
    const list = document.createElement('div');
    list.className = 'layers-list';

    for (let idx = state.layers.length - 1; idx >= 0; idx--) {
      const layer = state.layers[idx];
      const isActive = layer.id === state.activeLayerId;
      const shapeDef = Shapes[layer.shape] || Shapes.circle;

      const card = document.createElement('div');
      card.className = `layer-card ${isActive ? 'active' : ''}`;
      
      const subInfo = `${layer.distribution || 'polar'} • ${layer.blendMode === 'difference' || layer.blendMode === 'multiply' ? 'Moiré' : 'Pattern'}`;

      card.innerHTML = `
        <div class="layer-card-left">
          <div class="layer-thumb">
            ${shapeDef.iconSvg || `<svg viewBox="-20 -20 40 40"><circle cx="0" cy="0" r="12" fill="currentColor"/></svg>`}
          </div>
          <div class="layer-meta">
            <span class="layer-title">${layer.name || `Layer ${idx + 1}`}</span>
            <span class="layer-sub">${subInfo}</span>
          </div>
        </div>

        <div class="layer-actions">
          <button class="layer-action-btn btn-toggle-vis" title="${layer.visible ? 'Hide layer' : 'Show layer'}">
            ${layer.visible
              ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
              : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9.88 9.88 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`
            }
          </button>
          <button class="layer-action-btn btn-delete-layer" title="Delete layer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
          <span class="layer-action-btn layer-drag-handle" title="Reorder layer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
          </span>
        </div>
      `;

      // Select Layer
      card.addEventListener('click', (e) => {
        if (e.target.closest('.layer-action-btn')) return;
        state.activeLayerId = layer.id;
        if (this.onLayerSelect) this.onLayerSelect(layer.id);
        this.render(state);
      });

      // Toggle Visibility
      const btnVis = card.querySelector('.btn-toggle-vis');
      btnVis.addEventListener('click', (e) => {
        e.stopPropagation();
        layer.visible = !layer.visible;
        this.render(state);
        this.notifyChange();
      });

      // Delete Layer
      const btnDel = card.querySelector('.btn-delete-layer');
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.layers.length <= 1) {
          UIManager.showToast('⚠️ At least one layer is required');
          return;
        }
        state.layers.splice(idx, 1);
        if (state.activeLayerId === layer.id) {
          state.activeLayerId = state.layers[state.layers.length - 1].id;
        }
        this.render(state);
        this.notifyChange();
        UIManager.showToast('🗑️ Layer removed');
      });

      list.appendChild(card);
    }

    this.layersContainer.appendChild(list);

    // Add Pattern Layer event
    header.querySelector('#btn-add-pattern-layer').addEventListener('click', () => {
      const newId = `layer-${Date.now().toString().slice(-4)}`;
      const newLayer = {
        id: newId,
        name: `Layer ${state.layers.length + 1}`,
        type: 'pattern',
        visible: true,
        opacity: 100,
        blendMode: state.layers.length > 0 ? 'multiply' : 'source-over',
        shape: 'line',
        width: 50,
        height: 50,
        rotation: state.layers.length * 4.5,
        offsetX: 0,
        offsetY: 0,
        color: '#363a4d',
        strokeWidth: 1.2,
        fillMode: 'stroke',
        distribution: 'polar',
        polar: { scheme: 'centrifugal', rays: 48, rings: 6, radius: 0.44, spiralTwist: 0 },
        jitter: 0
      };
      state.layers.push(newLayer);
      state.activeLayerId = newId;
      this.render(state);
      this.notifyChange();
      UIManager.showToast('➕ New pattern layer added');
    });
  }

  // =========================================================================
  // 2. FLYOUT POPOVER INSPECTOR
  // =========================================================================

  renderPopover(state) {
    if (!this.popoverContainer) return;

    if (!this.activePanel) {
      this.popoverContainer.classList.remove('open');
      this.popoverContainer.innerHTML = '';
      return;
    }

    this.popoverContainer.classList.add('open');
    this.popoverContainer.innerHTML = '';

    const activeLayer = state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
    if (!activeLayer) {
      this.popoverContainer.innerHTML = '<div class="popover-section-label">Select a layer</div>';
      return;
    }

    if (this.activePanel === 'shape') {
      this.renderShapePopover(state, activeLayer);
    } else if (this.activePanel === 'pattern') {
      this.renderPatternPopover(state, activeLayer);
    } else if (this.activePanel === 'style') {
      this.renderStylePopover(state, activeLayer);
    }
  }

  // --- POPOVER 1: SHAPE ---
  renderShapePopover(state, layer) {
    const container = this.popoverContainer;

    // Header label
    const title = document.createElement('div');
    title.className = 'popover-section-label';
    title.textContent = 'Shape';
    container.appendChild(title);

    // 1. Shapes Grid (7 columns)
    const grid = document.createElement('div');
    grid.className = 'shape-grid';

    // List of keys to display matching the screenshot
    const displayShapes = [
      'circle', 'rect', 'triangle_eq', 'wave', 'horseshoe', 'hexagon', 'line',
      'rhombus', 'grid_cross', 'c_ring', 'capsule', 'cross', 'glyph_1', 'glyph_5',
      'teardrop', 'star4'
    ];

    displayShapes.forEach(shapeKey => {
      const shapeDef = Shapes[shapeKey];
      if (!shapeDef) return;

      const isCurrent = (layer.shape || 'circle') === shapeKey;
      const btn = document.createElement('button');
      btn.className = `shape-pill-btn ${isCurrent ? 'active' : ''}`;
      btn.title = shapeDef.name;

      // Use Phosphor icon if available, otherwise inline vector
      if (shapeDef.phFillClass) {
        btn.innerHTML = `<i class="${shapeDef.phFillClass}"></i>`;
      } else {
        btn.innerHTML = shapeDef.iconSvg;
      }

      btn.addEventListener('click', () => {
        layer.shape = shapeKey;
        this.render(state);
        this.notifyChange();
      });

      grid.appendChild(btn);
    });

    container.appendChild(grid);

    // 2. 2x2 Slider Grid (Width, Height, Rotation, Stroke Width)
    const controlsGrid = document.createElement('div');
    controlsGrid.className = 'control-grid-2x2';
    controlsGrid.innerHTML = `
      <!-- Width -->
      <div class="control-field">
        <label class="control-label">Width</label>
        <div class="control-slider-row">
          <input type="range" class="range-slider-input" id="inp-shape-width" min="5" max="250" value="${layer.width || 50}">
          <input type="text" class="number-pill-box" id="num-shape-width" value="${layer.width || 50}">
        </div>
      </div>

      <!-- Height -->
      <div class="control-field">
        <label class="control-label">Height</label>
        <div class="control-slider-row">
          <input type="range" class="range-slider-input" id="inp-shape-height" min="5" max="250" value="${layer.height || 50}">
          <input type="text" class="number-pill-box" id="num-shape-height" value="${layer.height || 50}">
        </div>
      </div>

      <!-- Rotation -->
      <div class="control-field">
        <label class="control-label">Rotation (°)</label>
        <div class="control-slider-row">
          <input type="range" class="range-slider-input" id="inp-shape-rot" min="0" max="360" step="0.5" value="${layer.rotation || 0}">
          <input type="text" class="number-pill-box" id="num-shape-rot" value="${layer.rotation || 0}">
        </div>
      </div>

      <!-- Stroke Width -->
      <div class="control-field">
        <label class="control-label">Stroke Width</label>
        <div class="control-slider-row">
          <input type="range" class="range-slider-input" id="inp-shape-stroke" min="0.2" max="10" step="0.1" value="${layer.strokeWidth || 1.2}">
          <input type="text" class="number-pill-box" id="num-shape-stroke" value="${layer.strokeWidth || 1.2}">
        </div>
      </div>
    `;

    // Bind slider & numeric input sync
    this.bindRangeAndNumber(controlsGrid, 'inp-shape-width', 'num-shape-width', (val) => {
      layer.width = parseFloat(val);
      this.notifyChange();
    });

    this.bindRangeAndNumber(controlsGrid, 'inp-shape-height', 'num-shape-height', (val) => {
      layer.height = parseFloat(val);
      this.notifyChange();
    });

    this.bindRangeAndNumber(controlsGrid, 'inp-shape-rot', 'num-shape-rot', (val) => {
      layer.rotation = parseFloat(val);
      this.notifyChange();
    });

    this.bindRangeAndNumber(controlsGrid, 'inp-shape-stroke', 'num-shape-stroke', (val) => {
      layer.strokeWidth = parseFloat(val);
      this.notifyChange();
    });

    container.appendChild(controlsGrid);

    // 3. Bottom Row: Fill / Stroke toggle & Shape Color
    const bottomRow = document.createElement('div');
    bottomRow.className = 'control-row-bottom';

    const isStroke = (layer.fillMode || 'stroke') === 'stroke';
    const hexColor = (layer.color || '#363a4d').toUpperCase();

    bottomRow.innerHTML = `
      <!-- Fill / Stroke -->
      <div class="control-field">
        <label class="control-label">Fill / Stroke</label>
        <div class="segmented-pill-container">
          <button class="segmented-pill-btn ${isStroke ? 'active' : ''}" id="btn-fillmode-stroke">Stroke</button>
          <button class="segmented-pill-btn ${!isStroke ? 'active' : ''}" id="btn-fillmode-fill">Fill</button>
        </div>
      </div>

      <!-- Shape Color -->
      <div class="control-field">
        <label class="control-label">Shape Color</label>
        <div class="color-picker-box">
          <div class="color-swatch-btn" id="shape-color-swatch" style="background-color: ${layer.color || '#363a4d'};">
            <input type="color" class="color-swatch-native" id="native-color-picker" value="${layer.color || '#363a4d'}">
          </div>
          <span class="color-hex-text" id="color-hex-label">${hexColor}</span>
        </div>
      </div>
    `;

    // Fill / Stroke events
    bottomRow.querySelector('#btn-fillmode-stroke').addEventListener('click', () => {
      layer.fillMode = 'stroke';
      this.render(state);
      this.notifyChange();
    });

    bottomRow.querySelector('#btn-fillmode-fill').addEventListener('click', () => {
      layer.fillMode = 'fill';
      this.render(state);
      this.notifyChange();
    });

    // Native Color Picker
    const colorInput = bottomRow.querySelector('#native-color-picker');
    const colorSwatch = bottomRow.querySelector('#shape-color-swatch');
    const colorHexLabel = bottomRow.querySelector('#color-hex-label');

    colorInput.addEventListener('input', (e) => {
      layer.color = e.target.value;
      colorSwatch.style.backgroundColor = e.target.value;
      colorHexLabel.textContent = e.target.value.toUpperCase();
      this.notifyChange();
    });

    container.appendChild(bottomRow);
  }

  // --- POPOVER 2: PATTERN & DISTRIBUTION ---
  renderPatternPopover(state, layer) {
    const container = this.popoverContainer;

    const title = document.createElement('div');
    title.className = 'popover-section-label';
    title.textContent = 'Distribution & Moiré';
    container.appendChild(title);

    const distMode = layer.distribution || 'polar';

    // Distribution Mode Toggle
    const modePill = document.createElement('div');
    modePill.className = 'distribution-mode-pill';
    modePill.innerHTML = `
      <button class="dist-pill-btn ${distMode === 'polar' ? 'active' : ''}" data-dist="polar">Radial (Polar)</button>
      <button class="dist-pill-btn ${distMode === 'linear' ? 'active' : ''}" data-dist="linear">Linear</button>
      <button class="dist-pill-btn ${distMode === 'cartesian' ? 'active' : ''}" data-dist="cartesian">Grid</button>
    `;

    modePill.querySelectorAll('.dist-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        layer.distribution = btn.dataset.dist;
        this.render(state);
        this.notifyChange();
      });
    });
    container.appendChild(modePill);

    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'control-grid-2x2';

    if (distMode === 'polar') {
      const p = layer.polar || (layer.polar = { scheme: 'centrifugal', rays: 48, rings: 6, radius: 0.44 });
      fieldsContainer.innerHTML = `
        <div class="control-field">
          <label class="control-label">Rays / Copies</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-rays" min="6" max="120" value="${p.rays || 48}">
            <input type="text" class="number-pill-box" id="num-rays" value="${p.rays || 48}">
          </div>
        </div>

        <div class="control-field">
          <label class="control-label">Radius / Scale</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-radius" min="0.1" max="1.0" step="0.02" value="${p.radius || 0.44}">
            <input type="text" class="number-pill-box" id="num-radius" value="${p.radius || 0.44}">
          </div>
        </div>

        <div class="control-field">
          <label class="control-label">Rings</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-rings" min="1" max="24" value="${p.rings || 6}">
            <input type="text" class="number-pill-box" id="num-rings" value="${p.rings || 6}">
          </div>
        </div>

        <div class="control-field">
          <label class="control-label">Spiral Twist</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-twist" min="-180" max="180" value="${p.spiralTwist || 0}">
            <input type="text" class="number-pill-box" id="num-twist" value="${p.spiralTwist || 0}">
          </div>
        </div>
      `;

      this.bindRangeAndNumber(fieldsContainer, 'inp-rays', 'num-rays', (val) => { p.rays = parseInt(val, 10); this.notifyChange(); });
      this.bindRangeAndNumber(fieldsContainer, 'inp-radius', 'num-radius', (val) => { p.radius = parseFloat(val); this.notifyChange(); });
      this.bindRangeAndNumber(fieldsContainer, 'inp-rings', 'num-rings', (val) => { p.rings = parseInt(val, 10); this.notifyChange(); });
      this.bindRangeAndNumber(fieldsContainer, 'inp-twist', 'num-twist', (val) => { p.spiralTwist = parseFloat(val); this.notifyChange(); });

    } else if (distMode === 'linear') {
      const l = layer.linear || (layer.linear = { copies: 36, angle: 0, waviness: 0 });
      fieldsContainer.innerHTML = `
        <div class="control-field">
          <label class="control-label">Copies</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-lin-copies" min="4" max="100" value="${l.copies || 36}">
            <input type="text" class="number-pill-box" id="num-lin-copies" value="${l.copies || 36}">
          </div>
        </div>

        <div class="control-field">
          <label class="control-label">Waviness</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-lin-wave" min="0" max="10" step="0.2" value="${l.waviness || 0}">
            <input type="text" class="number-pill-box" id="num-lin-wave" value="${l.waviness || 0}">
          </div>
        </div>
      `;

      this.bindRangeAndNumber(fieldsContainer, 'inp-lin-copies', 'num-lin-copies', (val) => { l.copies = parseInt(val, 10); this.notifyChange(); });
      this.bindRangeAndNumber(fieldsContainer, 'inp-lin-wave', 'num-lin-wave', (val) => { l.waviness = parseFloat(val); this.notifyChange(); });

    } else {
      const c = layer.cartesian || (layer.cartesian = { cols: 12, rows: 12 });
      fieldsContainer.innerHTML = `
        <div class="control-field">
          <label class="control-label">Columns</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-grid-cols" min="2" max="32" value="${c.cols || 12}">
            <input type="text" class="number-pill-box" id="num-grid-cols" value="${c.cols || 12}">
          </div>
        </div>

        <div class="control-field">
          <label class="control-label">Rows</label>
          <div class="control-slider-row">
            <input type="range" class="range-slider-input" id="inp-grid-rows" min="2" max="32" value="${c.rows || 12}">
            <input type="text" class="number-pill-box" id="num-grid-rows" value="${c.rows || 12}">
          </div>
        </div>
      `;

      this.bindRangeAndNumber(fieldsContainer, 'inp-grid-cols', 'num-grid-cols', (val) => { c.cols = parseInt(val, 10); this.notifyChange(); });
      this.bindRangeAndNumber(fieldsContainer, 'inp-grid-rows', 'num-grid-rows', (val) => { c.rows = parseInt(val, 10); this.notifyChange(); });
    }

    container.appendChild(fieldsContainer);

    // Quick Action: Create Moiré Dual Pair button
    const btnMoire = document.createElement('button');
    btnMoire.className = 'btn-action-wide';
    btnMoire.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/></svg>
      <span>Create Moiré Pair (Auto Rotate & Blend)</span>
    `;
    btnMoire.addEventListener('click', () => {
      const clone = JSON.parse(JSON.stringify(layer));
      clone.id = `layer-${Date.now().toString().slice(-4)}`;
      clone.name = `${layer.name} (Rotated)`;
      clone.rotation = +(clone.rotation + 4.5).toFixed(2);
      clone.blendMode = 'multiply';
      state.layers.push(clone);
      state.activeLayerId = clone.id;
      this.render(state);
      this.notifyChange();
      UIManager.showToast('✨ Optical Moiré pair generated');
    });

    container.appendChild(btnMoire);
  }

  // --- POPOVER 3: APPEARANCE & STYLE ---
  renderStylePopover(state, layer) {
    const container = this.popoverContainer;

    const title = document.createElement('div');
    title.className = 'popover-section-label';
    title.textContent = 'Appearance & Style';
    container.appendChild(title);

    // Curated Palettes Grid
    const palTitle = document.createElement('div');
    palTitle.className = 'control-label';
    palTitle.style.marginBottom = '8px';
    palTitle.textContent = 'Curated Palettes';
    container.appendChild(palTitle);

    const palGrid = document.createElement('div');
    palGrid.className = 'palette-swatches-grid';

    Object.values(PALETTES).slice(0, 4).forEach(palette => {
      const chip = document.createElement('div');
      chip.className = 'palette-chip';
      chip.innerHTML = `
        <span class="palette-chip-title">${palette.name}</span>
        <div class="palette-chip-colors">
          ${palette.swatches.map(c => `<div class="palette-chip-color" style="background-color: ${c};"></div>`).join('')}
        </div>
      `;

      chip.addEventListener('click', () => {
        state.canvas.bgColor = palette.bg;
        layer.color = palette.line;
        this.render(state);
        this.notifyChange();
        UIManager.showToast(`🎨 Applied ${palette.name}`);
      });

      palGrid.appendChild(chip);
    });
    container.appendChild(palGrid);

    // Blend Mode & Canvas Background
    const styleControls = document.createElement('div');
    styleControls.className = 'control-grid-2x2';
    styleControls.innerHTML = `
      <div class="control-field">
        <label class="control-label">Blend Mode</label>
        <select class="select-dropdown-styled" id="select-blend-mode">
          <option value="source-over" ${layer.blendMode === 'source-over' ? 'selected' : ''}>Normal</option>
          <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>Multiply (Moiré)</option>
          <option value="difference" ${layer.blendMode === 'difference' ? 'selected' : ''}>Difference</option>
          <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>Screen</option>
        </select>
      </div>

      <div class="control-field">
        <label class="control-label">Opacity (%)</label>
        <div class="control-slider-row">
          <input type="range" class="range-slider-input" id="inp-opacity" min="0" max="100" value="${layer.opacity ?? 100}">
          <input type="text" class="number-pill-box" id="num-opacity" value="${layer.opacity ?? 100}">
        </div>
      </div>
    `;

    styleControls.querySelector('#select-blend-mode').addEventListener('change', (e) => {
      layer.blendMode = e.target.value;
      this.notifyChange();
    });

    this.bindRangeAndNumber(styleControls, 'inp-opacity', 'num-opacity', (val) => {
      layer.opacity = parseInt(val, 10);
      this.notifyChange();
    });

    container.appendChild(styleControls);
  }

  // --- Helper: Synchronize Range Slider and Numeric Pill Input ---
  bindRangeAndNumber(parentEl, rangeId, numberId, onChange) {
    const rangeEl = parentEl.querySelector(`#${rangeId}`);
    const numEl = parentEl.querySelector(`#${numberId}`);
    if (!rangeEl || !numEl) return;

    rangeEl.addEventListener('input', (e) => {
      numEl.value = e.target.value;
      onChange(e.target.value);
    });

    numEl.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = rangeEl.value;
      const min = parseFloat(rangeEl.min);
      const max = parseFloat(rangeEl.max);
      val = Math.max(min, Math.min(max, val));
      numEl.value = val;
      rangeEl.value = val;
      onChange(val);
    });
  }

  // --- Static Toast Notification ---
  static showToast(message) {
    let toast = document.getElementById('studio-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'studio-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }
}
