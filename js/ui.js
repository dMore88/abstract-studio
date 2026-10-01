/**
 * Abstract Studio - Gestor de Interfaz de Usuario (Estilo Figma Creative Suite)
 * - Panel Izquierdo: Gestor de Capas Multicapa & Efectos Moiré
 * - Panel Derecho: Inspector de Propiedades Unificado (Geometría, Distribución, Moduladores y Materia)
 */

import { Shapes, SHAPE_KEYS } from './shapes.js';
import { PRESETS } from './presets.js';
import { PALETTES } from './palettes.js';

export class UIManager {
  constructor({
    layersContainerId,
    inspectorContainerId,
    onStateChange,
    onLayerSelect,
    onUndoDeformation,
    onClearDeformations
  }) {
    this.layersContainer = document.getElementById(layersContainerId);
    this.inspectorContainer = document.getElementById(inspectorContainerId);
    this.onStateChange = onStateChange;
    this.onLayerSelect = onLayerSelect;
    this.onUndoDeformation = onUndoDeformation;
    this.onClearDeformations = onClearDeformations;
  }

  notifyChange() {
    if (this.onStateChange) this.onStateChange();
  }

  render(state) {
    this.renderLayersPanel(state);
    this.renderInspector(state);
  }

  // =========================================================================
  // 1. PANEL DE CAPAS (COLUMNA IZQUIERDA - FIGMA STYLE)
  // =========================================================================

  renderLayersPanel(state) {
    if (!this.layersContainer) return;
    this.layersContainer.innerHTML = '';

    // Encabezado del panel de capas
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `
      <div class="panel-header-title">
        <span class="font-bold">Capas</span>
        <span class="layer-count-badge">${state.layers.length}</span>
      </div>
      <div class="layer-actions-group">
        <button id="btn-add-pattern" class="btn-tool" title="Añadir Capa de Patrón Generativo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          <span>Patrón</span>
        </button>
        <button id="btn-add-accent" class="btn-tool" title="Añadir Capa de Elemento / Acento">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
          <span>Acento</span>
        </button>
      </div>
    `;
    this.layersContainer.appendChild(header);

    // Botón de acceso rápido a Efecto Moiré
    const moireBar = document.createElement('div');
    moireBar.className = 'quick-action-bar';
    moireBar.innerHTML = `
      <button id="btn-quick-moire" class="btn-moire-quick" title="Crear automáticamente un par de patrones superpuestos para Moiré">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/></svg>
        <span>+ Par Moiré Interactivo</span>
      </button>
    `;
    this.layersContainer.appendChild(moireBar);

    // Lista de Capas (Ordenadas de Frente a Fondo)
    const list = document.createElement('div');
    list.className = 'layers-list';

    // Renderizar en orden inverso para que la capa superior aparezca primero visualmente
    for (let idx = state.layers.length - 1; idx >= 0; idx--) {
      const layer = state.layers[idx];
      const isActive = layer.id === state.activeLayerId;
      const shapeDef = Shapes[layer.shape] || Shapes.circle;

      const item = document.createElement('div');
      item.className = `layer-item ${isActive ? 'active' : ''} ${!layer.visible ? 'hidden-layer' : ''}`;
      item.innerHTML = `
        <div class="layer-item-main">
          <button class="layer-visibility-btn" title="${layer.visible ? 'Ocultar Capa' : 'Mostrar Capa'}">
            ${layer.visible
              ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
              : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9.88 9.88 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`
            }
          </button>
          
          <div class="layer-thumbnail">
            ${shapeDef.iconSvg}
          </div>

          <div class="layer-info">
            <span class="layer-name" title="${layer.name}">${layer.name}</span>
            <span class="layer-badge">${layer.type === 'pattern' ? (layer.distribution || 'patrón') : 'acento'} • ${layer.blendMode === 'difference' ? 'Moiré (Diff)' : layer.blendMode}</span>
          </div>
        </div>

        <div class="layer-item-controls">
          <button class="layer-order-btn btn-layer-up" title="Mover Arriba" ${idx === state.layers.length - 1 ? 'disabled' : ''}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button class="layer-order-btn btn-layer-down" title="Mover Abajo" ${idx === 0 ? 'disabled' : ''}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <button class="layer-delete-btn" title="Eliminar Capa" ${state.layers.length <= 1 ? 'disabled' : ''}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;

      // Clic para seleccionar
      item.querySelector('.layer-item-main').addEventListener('click', () => {
        state.activeLayerId = layer.id;
        this.render(state);
        this.notifyChange();
      });

      // Toggle visibilidad
      item.querySelector('.layer-visibility-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        layer.visible = !layer.visible;
        this.render(state);
        this.notifyChange();
      });

      // Mover arriba
      const btnUp = item.querySelector('.btn-layer-up');
      if (btnUp && idx < state.layers.length - 1) {
        btnUp.addEventListener('click', (e) => {
          e.stopPropagation();
          const temp = state.layers[idx];
          state.layers[idx] = state.layers[idx + 1];
          state.layers[idx + 1] = temp;
          this.render(state);
          this.notifyChange();
        });
      }

      // Mover abajo
      const btnDown = item.querySelector('.btn-layer-down');
      if (btnDown && idx > 0) {
        btnDown.addEventListener('click', (e) => {
          e.stopPropagation();
          const temp = state.layers[idx];
          state.layers[idx] = state.layers[idx - 1];
          state.layers[idx - 1] = temp;
          this.render(state);
          this.notifyChange();
        });
      }

      // Eliminar capa
      const btnDel = item.querySelector('.layer-delete-btn');
      if (btnDel && state.layers.length > 1) {
        btnDel.addEventListener('click', (e) => {
          e.stopPropagation();
          state.layers.splice(idx, 1);
          if (state.activeLayerId === layer.id) {
            state.activeLayerId = state.layers[state.layers.length - 1].id;
          }
          this.render(state);
          this.notifyChange();
          UIManager.showToast('🗑️ Capa eliminada');
        });
      }

      list.appendChild(item);
    }

    this.layersContainer.appendChild(list);

    // Sección de Presets al pie de las capas
    const presetsSection = document.createElement('div');
    presetsSection.className = 'panel-presets-footer';
    presetsSection.innerHTML = `
      <div class="panel-subtitle">Presets de Composición</div>
      <div class="presets-quick-grid" id="presets-quick-container"></div>
    `;
    const pContainer = presetsSection.querySelector('#presets-quick-container');
    PRESETS.forEach(preset => {
      const pBtn = document.createElement('button');
      pBtn.className = 'preset-chip-btn';
      pBtn.textContent = preset.name;
      pBtn.title = preset.description;
      pBtn.addEventListener('click', () => {
        // Cargar estado del preset clonado
        state.canvas = JSON.parse(JSON.stringify(preset.state.canvas));
        state.layers = JSON.parse(JSON.stringify(preset.state.layers));
        state.activeLayerId = state.layers[0]?.id;
        this.render(state);
        this.notifyChange();
        UIManager.showToast(`✨ Preset cargado: ${preset.name}`);
      });
      pContainer.appendChild(pBtn);
    });
    this.layersContainer.appendChild(presetsSection);

    // Eventos de botones de creación
    header.querySelector('#btn-add-pattern').addEventListener('click', () => {
      const newId = `layer-${Date.now().toString().slice(-4)}`;
      const newLayer = {
        id: newId,
        name: `Patrón ${state.layers.length + 1}`,
        type: 'pattern',
        visible: true,
        opacity: 100,
        blendMode: state.layers.length > 0 ? 'difference' : 'source-over',
        shape: 'circle',
        width: 60,
        height: 60,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        color: '#f4f4f5',
        strokeWidth: 1.4,
        fillMode: 'stroke',
        distribution: 'polar',
        polar: { scheme: 'centrifugal', rays: 36, rings: 5, radius: 0.42, spiralTwist: 0 },
        cartesian: { gridType: 'basic', cols: 6, rows: 6 },
        linear: { copies: 36, angle: 0, waviness: 0 },
        gradation: { enabled: false },
        anomaly: { enabled: false },
        similarity: { enabled: false },
        concentration: { enabled: false },
        space: { enabled: false },
        jitter: 0
      };
      state.layers.push(newLayer);
      state.activeLayerId = newId;
      this.render(state);
      this.notifyChange();
      UIManager.showToast('➕ Nueva capa de patrón creada');
    });

    header.querySelector('#btn-add-accent').addEventListener('click', () => {
      const newId = `layer-${Date.now().toString().slice(-4)}`;
      const newLayer = {
        id: newId,
        name: `Acento ${state.layers.length + 1}`,
        type: 'element',
        visible: true,
        opacity: 90,
        blendMode: 'source-over',
        shape: 'circle',
        size: 200,
        posX: 50,
        posY: 50,
        rotation: 0,
        color: '#ef4444',
        strokeWidth: 2,
        fillMode: 'fill'
      };
      state.layers.push(newLayer);
      state.activeLayerId = newId;
      this.render(state);
      this.notifyChange();
      UIManager.showToast('➕ Capa de acento agregada');
    });

    moireBar.querySelector('#btn-quick-moire').addEventListener('click', () => {
      // Reemplazar o añadir configuración Moiré dual
      const idA = `layer-${Date.now()}-a`;
      const idB = `layer-${Date.now()}-b`;
      state.layers = [
        {
          id: idA,
          name: 'Moiré Radial A',
          type: 'pattern',
          visible: true,
          opacity: 100,
          blendMode: 'source-over',
          shape: 'line',
          width: 50,
          height: 50,
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
          color: '#f4f4f5',
          strokeWidth: 1.2,
          fillMode: 'stroke',
          distribution: 'polar',
          polar: { scheme: 'centrifugal', rays: 48, rings: 5, radius: 0.44 },
          jitter: 0
        },
        {
          id: idB,
          name: 'Moiré Radial B (Rotado)',
          type: 'pattern',
          visible: true,
          opacity: 100,
          blendMode: 'difference',
          shape: 'line',
          width: 50,
          height: 50,
          rotation: 5.0,
          offsetX: 0,
          offsetY: 0,
          color: '#f4f4f5',
          strokeWidth: 1.2,
          fillMode: 'stroke',
          distribution: 'polar',
          polar: { scheme: 'centrifugal', rays: 48, rings: 5, radius: 0.44 },
          jitter: 0
        }
      ];
      state.activeLayerId = idB;
      this.render(state);
      this.notifyChange();
      UIManager.showToast('✨ Par Moiré interactivo creado');
    });
  }

  // =========================================================================
  // 2. INSPECTOR DE PROPIEDADES (COLUMNA DERECHA - FIGMA STYLE)
  // =========================================================================

  renderInspector(state) {
    if (!this.inspectorContainer) return;
    this.inspectorContainer.innerHTML = '';

    const activeLayer = state.layers.find(l => l.id === state.activeLayerId) || state.layers[0];
    if (!activeLayer) {
      this.inspectorContainer.innerHTML = '<div class="empty-inspector">Selecciona una capa para editar</div>';
      return;
    }

    // Cabecera de la capa seleccionada
    const layerHeader = document.createElement('div');
    layerHeader.className = 'inspector-header';
    layerHeader.innerHTML = `
      <div class="inspector-header-row">
        <input type="text" id="active-layer-name" class="layer-title-input" value="${activeLayer.name}" title="Editar nombre de capa">
        <span class="inspector-badge">${activeLayer.type === 'pattern' ? 'Generativo' : 'Elemento'}</span>
      </div>
      
      <div class="property-grid">
        <div class="property-field">
          <label class="field-label">Opacidad</label>
          <div class="dual-input">
            <input type="range" id="input-layer-opacity" min="0" max="100" value="${activeLayer.opacity ?? 100}">
            <input type="number" id="num-layer-opacity" class="mini-num" min="0" max="100" value="${activeLayer.opacity ?? 100}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Modo de Fusión (Moiré)</label>
          <select id="select-layer-blend" class="field-select">
            <option value="source-over" ${activeLayer.blendMode === 'source-over' ? 'selected' : ''}>Normal</option>
            <option value="difference" ${activeLayer.blendMode === 'difference' ? 'selected' : ''}>Diferencia (Moiré)</option>
            <option value="screen" ${activeLayer.blendMode === 'screen' ? 'selected' : ''}>Trama (Screen)</option>
            <option value="multiply" ${activeLayer.blendMode === 'multiply' ? 'selected' : ''}>Multiplicar</option>
            <option value="overlay" ${activeLayer.blendMode === 'overlay' ? 'selected' : ''}>Superponer</option>
          </select>
        </div>
      </div>
    `;

    // Sincronizar nombre
    const nameInput = layerHeader.querySelector('#active-layer-name');
    nameInput.addEventListener('change', () => {
      activeLayer.name = nameInput.value.trim() || 'Capa';
      this.renderLayersPanel(state);
      this.notifyChange();
    });

    // Opacidad
    this.bindRangeNum(
      layerHeader,
      '#input-layer-opacity',
      '#num-layer-opacity',
      val => {
        activeLayer.opacity = parseInt(val, 10);
        this.notifyChange();
      }
    );

    // Blend mode
    layerHeader.querySelector('#select-layer-blend').addEventListener('change', (e) => {
      activeLayer.blendMode = e.target.value;
      this.renderLayersPanel(state);
      this.notifyChange();
    });

    this.inspectorContainer.appendChild(layerHeader);

    // Renderizar propiedades según el tipo de capa
    if (activeLayer.type === 'pattern') {
      this.renderPatternProperties(activeLayer, state);
    } else {
      this.renderElementProperties(activeLayer, state);
    }
  }

  /**
   * Propiedades de Capa de Patrón Generativo
   */
  renderPatternProperties(layer, state) {
    const container = document.createElement('div');
    container.className = 'inspector-sections-stack';

    // 1. FORMA Y GEOMETRÍA PRIMITIVA
    const shapeBlock = document.createElement('div').attachTo(container, 'inspector-block');
    shapeBlock.innerHTML = `
      <div class="block-title">Módulo & Geometría</div>
      <div class="shape-picker-grid" id="shape-selector-grid"></div>

      <div class="property-grid pt-2">
        <div class="property-field">
          <label class="field-label">Ancho</label>
          <div class="dual-input">
            <input type="range" id="input-layer-width" min="10" max="300" value="${layer.width || 60}">
            <input type="number" id="num-layer-width" class="mini-num" min="10" max="300" value="${layer.width || 60}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Alto</label>
          <div class="dual-input">
            <input type="range" id="input-layer-height" min="10" max="300" value="${layer.height || 60}">
            <input type="number" id="num-layer-height" class="mini-num" min="10" max="300" value="${layer.height || 60}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Rotación (°)</label>
          <div class="dual-input">
            <input type="range" id="input-layer-rotation" min="0" max="360" step="0.5" value="${layer.rotation || 0}">
            <input type="number" id="num-layer-rotation" class="mini-num" min="0" max="360" step="0.5" value="${layer.rotation || 0}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Grosor Trazo</label>
          <div class="dual-input">
            <input type="range" id="input-layer-stroke" min="0.5" max="10" step="0.2" value="${layer.strokeWidth || 1.4}">
            <input type="number" id="num-layer-stroke" class="mini-num" min="0.5" max="10" step="0.2" value="${layer.strokeWidth || 1.4}">
          </div>
        </div>
      </div>

      <div class="property-grid pt-1">
        <div class="property-field">
          <label class="field-label">Relleno / Trazo</label>
          <div class="segmented-control">
            <button class="seg-btn ${layer.fillMode !== 'fill' ? 'active' : ''}" data-fill="stroke">Trazo</button>
            <button class="seg-btn ${layer.fillMode === 'fill' ? 'active' : ''}" data-fill="fill">Relleno</button>
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Color de Forma</label>
          <input type="color" id="input-layer-color" class="color-picker-input" value="${layer.color || '#f4f4f5'}">
        </div>
      </div>
    `;

    // Inyectar iconos de las 20 formas en el grid
    const shapeGrid = shapeBlock.querySelector('#shape-selector-grid');
    SHAPE_KEYS.forEach(key => {
      const s = Shapes[key];
      const btn = document.createElement('button');
      btn.className = `shape-btn ${layer.shape === key ? 'active' : ''}`;
      btn.innerHTML = s.iconSvg;
      btn.title = s.name;
      btn.addEventListener('click', () => {
        layer.shape = key;
        shapeGrid.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderLayersPanel(state);
        this.notifyChange();
      });
      shapeGrid.appendChild(btn);
    });

    // Binds de tamaño y rotación
    this.bindRangeNum(shapeBlock, '#input-layer-width', '#num-layer-width', val => {
      layer.width = parseFloat(val);
      this.notifyChange();
    });
    this.bindRangeNum(shapeBlock, '#input-layer-height', '#num-layer-height', val => {
      layer.height = parseFloat(val);
      this.notifyChange();
    });
    this.bindRangeNum(shapeBlock, '#input-layer-rotation', '#num-layer-rotation', val => {
      layer.rotation = parseFloat(val);
      this.notifyChange();
    });
    this.bindRangeNum(shapeBlock, '#input-layer-stroke', '#num-layer-stroke', val => {
      layer.strokeWidth = parseFloat(val);
      this.notifyChange();
    });

    // Fill mode
    shapeBlock.querySelectorAll('.seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        shapeBlock.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        layer.fillMode = btn.dataset.fill;
        this.notifyChange();
      });
    });

    // Color
    shapeBlock.querySelector('#input-layer-color').addEventListener('input', (e) => {
      layer.color = e.target.value;
      this.notifyChange();
    });

    // 2. DISTRIBUCIÓN ESPACIAL
    const distBlock = document.createElement('div').attachTo(container, 'inspector-block');
    const curDist = layer.distribution || 'cartesian';
    distBlock.innerHTML = `
      <div class="block-title">Distribución Espacial</div>
      <div class="segmented-control mb-3">
        <button class="seg-btn ${curDist === 'cartesian' ? 'active' : ''}" data-dist="cartesian">Cartesiana</button>
        <button class="seg-btn ${curDist === 'polar' ? 'active' : ''}" data-dist="polar">Polar / Radiación</button>
        <button class="seg-btn ${curDist === 'linear' ? 'active' : ''}" data-dist="linear">Lineal</button>
      </div>

      <div id="distribution-params-container"></div>
    `;

    distBlock.querySelectorAll('.segmented-control .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        layer.distribution = btn.dataset.dist;
        this.renderLayersPanel(state);
        this.renderInspector(state);
        this.notifyChange();
      });
    });

    const distParams = distBlock.querySelector('#distribution-params-container');
    if (curDist === 'polar') {
      this.renderPolarControls(distParams, layer);
    } else if (curDist === 'linear') {
      this.renderLinearControls(distParams, layer);
    } else {
      this.renderCartesianControls(distParams, layer);
    }

    // 3. MODULADORES PARAMÉTRICOS
    const modBlock = document.createElement('div').attachTo(container, 'inspector-block');
    modBlock.innerHTML = `<div class="block-title">Moduladores Paramétricos</div>`;

    // Gradación
    this.createModifierAccordion(modBlock, 'Gradación', layer.gradation, (content, mod) => {
      content.innerHTML = `
        <div class="property-grid">
          <div class="property-field">
            <label class="field-label">Tipo</label>
            <select id="grad-type" class="field-select">
              <option value="rotation" ${mod.type === 'rotation' ? 'selected' : ''}>Rotación</option>
              <option value="scale" ${mod.type === 'scale' ? 'selected' : ''}>Escala</option>
            </select>
          </div>
          <div class="property-field">
            <label class="field-label">Dirección</label>
            <select id="grad-path" class="field-select">
              <option value="diagonal" ${mod.pathway === 'diagonal' ? 'selected' : ''}>Diagonal</option>
              <option value="horizontal" ${mod.pathway === 'horizontal' ? 'selected' : ''}>Horizontal</option>
              <option value="vertical" ${mod.pathway === 'vertical' ? 'selected' : ''}>Vertical</option>
              <option value="concentric" ${mod.pathway === 'concentric' ? 'selected' : ''}>Concéntrico</option>
            </select>
          </div>
          <div class="property-field col-span-2">
            <label class="field-label">Rango (° o %) </label>
            <div class="dual-input">
              <input type="range" id="grad-range" min="30" max="360" value="${mod.range || 180}">
              <input type="number" id="grad-range-num" class="mini-num" min="30" max="360" value="${mod.range || 180}">
            </div>
          </div>
        </div>
      `;
      content.querySelector('#grad-type').addEventListener('change', e => { mod.type = e.target.value; this.notifyChange(); });
      content.querySelector('#grad-path').addEventListener('change', e => { mod.pathway = e.target.value; this.notifyChange(); });
      this.bindRangeNum(content, '#grad-range', '#grad-range-num', val => { mod.range = parseFloat(val); this.notifyChange(); });
    });

    // Anomalía Focal
    this.createModifierAccordion(modBlock, 'Anomalía Focal', layer.anomaly, (content, mod) => {
      content.innerHTML = `
        <div class="property-grid">
          <div class="property-field col-span-2">
            <label class="field-label">Radio de Perturbación</label>
            <div class="dual-input">
              <input type="range" id="anom-radius" min="50" max="400" value="${mod.radius || 180}">
              <input type="number" id="anom-radius-num" class="mini-num" min="50" max="400" value="${mod.radius || 180}">
            </div>
          </div>
          <div class="property-field">
            <label class="field-label">Forma Anómala</label>
            <select id="anom-shape" class="field-select">
              <option value="triangle_eq" ${mod.shape === 'triangle_eq' ? 'selected' : ''}>Triángulo</option>
              <option value="star4" ${mod.shape === 'star4' ? 'selected' : ''}>Estrella</option>
              <option value="rhombus" ${mod.shape === 'rhombus' ? 'selected' : ''}>Rombo</option>
              <option value="circle" ${mod.shape === 'circle' ? 'selected' : ''}>Círculo</option>
            </select>
          </div>
          <div class="property-field">
            <label class="field-label">Resaltar Carmesí</label>
            <input type="checkbox" id="anom-highlight" ${mod.highlightColor ? 'checked' : ''} class="mt-2">
          </div>
        </div>
      `;
      this.bindRangeNum(content, '#anom-radius', '#anom-radius-num', val => { mod.radius = parseFloat(val); this.notifyChange(); });
      content.querySelector('#anom-shape').addEventListener('change', e => { mod.shape = e.target.value; this.notifyChange(); });
      content.querySelector('#anom-highlight').addEventListener('change', e => { mod.highlightColor = e.target.checked; this.notifyChange(); });
    });

    // Concentración Gravitatoria
    this.createModifierAccordion(modBlock, 'Concentración Gravitatoria', layer.concentration, (content, mod) => {
      content.innerHTML = `
        <div class="property-grid">
          <div class="property-field">
            <label class="field-label">Modo</label>
            <select id="conc-mode" class="field-select">
              <option value="point" ${mod.mode === 'point' ? 'selected' : ''}>Punto (Atracción)</option>
              <option value="void" ${mod.mode === 'void' ? 'selected' : ''}>Vacío (Repulsión)</option>
            </select>
          </div>
          <div class="property-field">
            <label class="field-label">Fuerza</label>
            <div class="dual-input">
              <input type="range" id="conc-power" min="10" max="100" value="${mod.power || 65}">
              <input type="number" id="conc-power-num" class="mini-num" min="10" max="100" value="${mod.power || 65}">
            </div>
          </div>
        </div>
      `;
      content.querySelector('#conc-mode').addEventListener('change', e => { mod.mode = e.target.value; this.notifyChange(); });
      this.bindRangeNum(content, '#conc-power', '#conc-power-num', val => { mod.power = parseFloat(val); this.notifyChange(); });
    });

    // Espacio Isométrico 3D
    this.createModifierAccordion(modBlock, 'Espacio Isométrico 3D', layer.space, (content, mod) => {
      content.innerHTML = `
        <div class="property-grid">
          <div class="property-field">
            <label class="field-label">Profundidad Extrusión</label>
            <div class="dual-input">
              <input type="range" id="space-depth" min="5" max="80" value="${mod.depth || 25}">
              <input type="number" id="space-depth-num" class="mini-num" min="5" max="80" value="${mod.depth || 25}">
            </div>
          </div>
          <div class="property-field">
            <label class="field-label">Ángulo Proyección</label>
            <div class="dual-input">
              <input type="range" id="space-angle" min="-60" max="60" value="${mod.angle || 30}">
              <input type="number" id="space-angle-num" class="mini-num" min="-60" max="60" value="${mod.angle || 30}">
            </div>
          </div>
        </div>
      `;
      this.bindRangeNum(content, '#space-depth', '#space-depth-num', val => { mod.depth = parseFloat(val); this.notifyChange(); });
      this.bindRangeNum(content, '#space-angle', '#space-angle-num', val => { mod.angle = parseFloat(val); this.notifyChange(); });
    });

    // 4. TEXTURA ANALÓGICA & ESCULPIDO DIRECTO
    const textureBlock = document.createElement('div').attachTo(container, 'inspector-block');
    textureBlock.innerHTML = `
      <div class="block-title">Textura & Esculpido Manual</div>
      
      <div class="property-field mb-3">
        <label class="field-label">Micro-corrugado / Jitter (Papel Washi)</label>
        <div class="dual-input">
          <input type="range" id="input-layer-jitter" min="0" max="6" step="0.2" value="${layer.jitter || 0}">
          <input type="number" id="num-layer-jitter" class="mini-num" min="0" max="6" step="0.2" value="${layer.jitter || 0}">
        </div>
      </div>

      <div class="sculpt-tools-card">
        <div class="flex items-center justify-between mb-2">
          <span class="field-label font-bold">Pincel de Esculpido</span>
          <button id="toggle-brush-btn" class="btn-brush-toggle ${state.brushActive ? 'active' : ''}">
            ${state.brushActive ? 'Pincel Activo' : 'Activar Pincel'}
          </button>
        </div>

        <div class="brush-modes-grid mb-2">
          <button class="brush-mode-btn ${state.brush.mode === 'peak' ? 'active' : ''}" data-mode="peak" title="Cresta afilada">▲ Pico</button>
          <button class="brush-mode-btn ${state.brush.mode === 'smooth' ? 'active' : ''}" data-mode="smooth" title="Colina suave">∩ Suave</button>
          <button class="brush-mode-btn ${state.brush.mode === 'twist' ? 'active' : ''}" data-mode="twist" title="Vórtice">🌀 Giro</button>
        </div>

        <div class="property-grid mb-2">
          <div class="property-field">
            <label class="field-label">Radio Pincel</label>
            <input type="range" id="brush-radius" min="30" max="180" value="${state.brush.radius || 75}">
          </div>
          <div class="property-field">
            <label class="field-label">Fuerza</label>
            <input type="range" id="brush-strength" min="10" max="100" value="${state.brush.strength || 60}">
          </div>
        </div>

        <div class="flex gap-2">
          <button id="btn-undo-sculpt" class="btn-sub flex-1">↶ Deshacer</button>
          <button id="btn-clear-sculpt" class="btn-sub flex-1">🗑 Limpiar</button>
        </div>
      </div>
    `;

    this.bindRangeNum(textureBlock, '#input-layer-jitter', '#num-layer-jitter', val => {
      layer.jitter = parseFloat(val);
      this.notifyChange();
    });

    const brushToggle = textureBlock.querySelector('#toggle-brush-btn');
    brushToggle.addEventListener('click', () => {
      state.brushActive = !state.brushActive;
      brushToggle.classList.toggle('active', state.brushActive);
      brushToggle.textContent = state.brushActive ? 'Pincel Activo' : 'Activar Pincel';
      this.notifyChange();
    });

    textureBlock.querySelectorAll('.brush-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        textureBlock.querySelectorAll('.brush-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.brush.mode = btn.dataset.mode;
        this.notifyChange();
      });
    });

    textureBlock.querySelector('#brush-radius').addEventListener('input', e => {
      state.brush.radius = parseFloat(e.target.value);
    });
    textureBlock.querySelector('#brush-strength').addEventListener('input', e => {
      state.brush.strength = parseFloat(e.target.value);
    });

    textureBlock.querySelector('#btn-undo-sculpt').addEventListener('click', () => {
      if (this.onUndoDeformation) this.onUndoDeformation();
    });
    textureBlock.querySelector('#btn-clear-sculpt').addEventListener('click', () => {
      if (this.onClearDeformations) this.onClearDeformations();
    });

    this.inspectorContainer.appendChild(container);
  }

  renderCartesianControls(container, layer) {
    if (!layer.cartesian) layer.cartesian = { gridType: 'basic', cols: 6, rows: 6 };
    const cart = layer.cartesian;

    container.innerHTML = `
      <div class="property-grid">
        <div class="property-field">
          <label class="field-label">Tipo de Retícula</label>
          <select id="cart-grid-type" class="field-select">
            <option value="basic" ${cart.gridType === 'basic' ? 'selected' : ''}>Básica (Ortogonal)</option>
            <option value="sliding" ${cart.gridType === 'sliding' ? 'selected' : ''}>Deslizante</option>
            <option value="sheared" ${cart.gridType === 'sheared' ? 'selected' : ''}>Cizallada</option>
            <option value="zigzag" ${cart.gridType === 'zigzag' ? 'selected' : ''}>Zigzag</option>
            <option value="curved" ${cart.gridType === 'curved' ? 'selected' : ''}>Curva Armónica</option>
          </select>
        </div>

        <div class="property-field">
          <label class="field-label">Columnas</label>
          <div class="dual-input">
            <input type="range" id="cart-cols" min="1" max="24" value="${cart.cols || 6}">
            <input type="number" id="cart-cols-num" class="mini-num" min="1" max="24" value="${cart.cols || 6}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Filas</label>
          <div class="dual-input">
            <input type="range" id="cart-rows" min="1" max="24" value="${cart.rows || 6}">
            <input type="number" id="cart-rows-num" class="mini-num" min="1" max="24" value="${cart.rows || 6}">
          </div>
        </div>
      </div>
    `;

    container.querySelector('#cart-grid-type').addEventListener('change', e => {
      cart.gridType = e.target.value;
      this.notifyChange();
    });

    this.bindRangeNum(container, '#cart-cols', '#cart-cols-num', val => {
      cart.cols = parseInt(val, 10);
      this.notifyChange();
    });
    this.bindRangeNum(container, '#cart-rows', '#cart-rows-num', val => {
      cart.rows = parseInt(val, 10);
      this.notifyChange();
    });
  }

  renderPolarControls(container, layer) {
    if (!layer.polar) layer.polar = { scheme: 'centrifugal', rays: 36, rings: 5, radius: 0.42, spiralTwist: 0 };
    const polar = layer.polar;

    container.innerHTML = `
      <div class="property-grid">
        <div class="property-field">
          <label class="field-label">Esquema Polar</label>
          <select id="polar-scheme" class="field-select">
            <option value="centrifugal" ${polar.scheme === 'centrifugal' ? 'selected' : ''}>Centrífugo (Rayos)</option>
            <option value="concentric" ${polar.scheme === 'concentric' ? 'selected' : ''}>Concéntrico (Anillos)</option>
            <option value="spiral" ${polar.scheme === 'spiral' ? 'selected' : ''}>Espiral Dinámica</option>
          </select>
        </div>

        <div class="property-field">
          <label class="field-label">Número de Rayos (Frecuencia)</label>
          <div class="dual-input">
            <input type="range" id="polar-rays" min="4" max="96" value="${polar.rays || 36}">
            <input type="number" id="polar-rays-num" class="mini-num" min="4" max="96" value="${polar.rays || 36}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Anillos Radiales</label>
          <div class="dual-input">
            <input type="range" id="polar-rings" min="1" max="18" value="${polar.rings || 5}">
            <input type="number" id="polar-rings-num" class="mini-num" min="1" max="18" value="${polar.rings || 5}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Radio Cobertura</label>
          <div class="dual-input">
            <input type="range" id="polar-radius" min="0.1" max="0.55" step="0.01" value="${polar.radius || 0.42}">
            <input type="number" id="polar-radius-num" class="mini-num" min="0.1" max="0.55" step="0.01" value="${polar.radius || 0.42}">
          </div>
        </div>
      </div>
    `;

    container.querySelector('#polar-scheme').addEventListener('change', e => {
      polar.scheme = e.target.value;
      this.notifyChange();
    });

    this.bindRangeNum(container, '#polar-rays', '#polar-rays-num', val => {
      polar.rays = parseInt(val, 10);
      this.notifyChange();
    });
    this.bindRangeNum(container, '#polar-rings', '#polar-rings-num', val => {
      polar.rings = parseInt(val, 10);
      this.notifyChange();
    });
    this.bindRangeNum(container, '#polar-radius', '#polar-radius-num', val => {
      polar.radius = parseFloat(val);
      this.notifyChange();
    });
  }

  renderLinearControls(container, layer) {
    if (!layer.linear) layer.linear = { copies: 36, angle: 0, waviness: 0 };
    const lin = layer.linear;

    container.innerHTML = `
      <div class="property-grid">
        <div class="property-field">
          <label class="field-label">Copias de Líneas</label>
          <div class="dual-input">
            <input type="range" id="lin-copies" min="2" max="120" value="${lin.copies || 36}">
            <input type="number" id="lin-copies-num" class="mini-num" min="2" max="120" value="${lin.copies || 36}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Ángulo de Inclinación (°)</label>
          <div class="dual-input">
            <input type="range" id="lin-angle" min="0" max="180" value="${lin.angle || 0}">
            <input type="number" id="lin-angle-num" class="mini-num" min="0" max="180" value="${lin.angle || 0}">
          </div>
        </div>

        <div class="property-field col-span-2">
          <label class="field-label">Ondulación Armónica</label>
          <div class="dual-input">
            <input type="range" id="lin-wave" min="0" max="25" step="0.5" value="${lin.waviness || 0}">
            <input type="number" id="lin-wave-num" class="mini-num" min="0" max="25" step="0.5" value="${lin.waviness || 0}">
          </div>
        </div>
      </div>
    `;

    this.bindRangeNum(container, '#lin-copies', '#lin-copies-num', val => {
      lin.copies = parseInt(val, 10);
      this.notifyChange();
    });
    this.bindRangeNum(container, '#lin-angle', '#lin-angle-num', val => {
      lin.angle = parseFloat(val);
      this.notifyChange();
    });
    this.bindRangeNum(container, '#lin-wave', '#lin-wave-num', val => {
      lin.waviness = parseFloat(val);
      this.notifyChange();
    });
  }

  /**
   * Propiedades de Capa de Elemento / Acento
   */
  renderElementProperties(layer, state) {
    const container = document.createElement('div');
    container.className = 'inspector-sections-stack';

    const block = document.createElement('div').attachTo(container, 'inspector-block');
    block.innerHTML = `
      <div class="block-title">Elemento de Foco</div>
      
      <div class="shape-picker-grid mb-3" id="accent-shape-picker"></div>

      <div class="property-grid">
        <div class="property-field">
          <label class="field-label">Tamaño</label>
          <div class="dual-input">
            <input type="range" id="elem-size" min="20" max="600" value="${layer.size || 200}">
            <input type="number" id="elem-size-num" class="mini-num" min="20" max="600" value="${layer.size || 200}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Rotación (°)</label>
          <div class="dual-input">
            <input type="range" id="elem-rot" min="0" max="360" value="${layer.rotation || 0}">
            <input type="number" id="elem-rot-num" class="mini-num" min="0" max="360" value="${layer.rotation || 0}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Posición X (%)</label>
          <div class="dual-input">
            <input type="range" id="elem-pos-x" min="0" max="100" value="${layer.posX ?? 50}">
            <input type="number" id="elem-pos-x-num" class="mini-num" min="0" max="100" value="${layer.posX ?? 50}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Posición Y (%)</label>
          <div class="dual-input">
            <input type="range" id="elem-pos-y" min="0" max="100" value="${layer.posY ?? 50}">
            <input type="number" id="elem-pos-y-num" class="mini-num" min="0" max="100" value="${layer.posY ?? 50}">
          </div>
        </div>

        <div class="property-field">
          <label class="field-label">Color</label>
          <input type="color" id="elem-color" class="color-picker-input" value="${layer.color || '#ef4444'}">
        </div>

        <div class="property-field">
          <label class="field-label">Modo Relleno</label>
          <div class="segmented-control">
            <button class="seg-btn ${layer.fillMode === 'fill' ? 'active' : ''}" data-fill="fill">Relleno</button>
            <button class="seg-btn ${layer.fillMode !== 'fill' ? 'active' : ''}" data-fill="stroke">Trazo</button>
          </div>
        </div>
      </div>
    `;

    const shapeGrid = block.querySelector('#accent-shape-picker');
    SHAPE_KEYS.forEach(key => {
      const s = Shapes[key];
      const btn = document.createElement('button');
      btn.className = `shape-btn ${layer.shape === key ? 'active' : ''}`;
      btn.innerHTML = s.iconSvg;
      btn.title = s.name;
      btn.addEventListener('click', () => {
        layer.shape = key;
        shapeGrid.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderLayersPanel(state);
        this.notifyChange();
      });
      shapeGrid.appendChild(btn);
    });

    this.bindRangeNum(block, '#elem-size', '#elem-size-num', val => { layer.size = parseFloat(val); this.notifyChange(); });
    this.bindRangeNum(block, '#elem-rot', '#elem-rot-num', val => { layer.rotation = parseFloat(val); this.notifyChange(); });
    this.bindRangeNum(block, '#elem-pos-x', '#elem-pos-x-num', val => { layer.posX = parseFloat(val); this.notifyChange(); });
    this.bindRangeNum(block, '#elem-pos-y', '#elem-pos-y-num', val => { layer.posY = parseFloat(val); this.notifyChange(); });

    block.querySelector('#elem-color').addEventListener('input', e => {
      layer.color = e.target.value;
      this.notifyChange();
    });

    block.querySelectorAll('.segmented-control .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        block.querySelectorAll('.segmented-control .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        layer.fillMode = btn.dataset.fill;
        this.notifyChange();
      });
    });

    this.inspectorContainer.appendChild(container);
  }

  createModifierAccordion(parent, title, modObj, renderContentFn) {
    if (!modObj) return;
    const item = document.createElement('div');
    item.className = 'mod-accordion';

    const head = document.createElement('div');
    head.className = 'mod-accordion-header';
    head.innerHTML = `
      <div class="flex items-center gap-2">
        <input type="checkbox" id="mod-toggle" class="mod-checkbox" ${modObj.enabled ? 'checked' : ''}>
        <span class="mod-title">${title}</span>
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="accordion-arrow"><polyline points="6 9 12 15 18 9"/></svg>
    `;

    const body = document.createElement('div');
    body.className = `mod-accordion-body ${modObj.enabled ? 'expanded' : ''}`;

    renderContentFn(body, modObj);

    head.querySelector('#mod-toggle').addEventListener('change', (e) => {
      modObj.enabled = e.target.checked;
      body.classList.toggle('expanded', modObj.enabled);
      this.notifyChange();
    });

    head.addEventListener('click', (e) => {
      if (e.target.id === 'mod-toggle') return;
      body.classList.toggle('expanded');
    });

    item.appendChild(head);
    item.appendChild(body);
    parent.appendChild(item);
  }

  bindRangeNum(parent, rangeSelector, numSelector, callback) {
    const range = parent.querySelector(rangeSelector);
    const num = parent.querySelector(numSelector);
    if (!range || !num) return;

    range.addEventListener('input', () => {
      num.value = range.value;
      callback(range.value);
    });

    num.addEventListener('input', () => {
      range.value = num.value;
      callback(num.value);
    });
  }

  static showToast(message) {
    let toast = document.getElementById('studio-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'studio-toast';
      toast.className = 'studio-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
}

// Helper para adjuntar elemento y clase
HTMLElement.prototype.attachTo = function(parent, className) {
  this.className = className;
  parent.appendChild(this);
  return this;
};
