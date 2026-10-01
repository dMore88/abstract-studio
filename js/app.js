/**
 * Abstract Studio - Orquestador Principal de la Creative Suite
 * Conecta el motor gráfico Dual Canvas/SVG con el Panel de Capas e Inspector Figma.
 */

import { AbstractEngine, ASPECT_RATIOS } from './engine.js';
import { UIManager } from './ui.js';
import { Exporter } from './exporter.js';
import { PRESETS } from './presets.js';
import { PALETTES } from './palettes.js';

class App {
  constructor() {
    this.canvas = document.getElementById('studio-canvas');
    this.canvasWrapper = document.querySelector('.canvas-wrapper');
    this.zoomLevel = 1.0;
    this.isSculpting = false;
    this.lastSculptPos = null;

    this.engine = new AbstractEngine();

    // Estado inicial: Efecto Moiré Radial Dual por defecto
    const defaultPreset = PRESETS[0];
    this.state = JSON.parse(JSON.stringify(defaultPreset.state));
    this.state.activeLayerId = this.state.layers[1]?.id || this.state.layers[0]?.id;

    this.initUI();
    this.setupEvents();
    this.setupToolbar();
    this.render();
  }

  initUI() {
    this.uiManager = new UIManager({
      layersContainerId: 'layers-sidebar',
      inspectorContainerId: 'inspector-sidebar',
      onStateChange: () => this.render(),
      onLayerSelect: (layerId) => {
        this.state.activeLayerId = layerId;
        this.render();
      },
      onUndoDeformation: () => {
        this.engine.undoDeformation();
        this.render();
        UIManager.showToast('↶ Última deformación deshecha');
      },
      onClearDeformations: () => {
        this.engine.clearDeformations();
        this.render();
        UIManager.showToast('🗑️ Deformaciones limpiadas');
      }
    });

    this.uiManager.render(this.state);
  }

  render() {
    window.requestAnimationFrame(() => {
      this.engine.renderCanvas(this.canvas, this.state);
      this.updateResolutionDisplay();
    });
  }

  updateResolutionDisplay() {
    const resEl = document.getElementById('studio-resolution-text');
    if (resEl) {
      const bounds = this.engine.getBounds(this.state.canvas.aspectRatio);
      const activeCount = this.state.layers.filter(l => l.visible).length;
      resEl.textContent = `${bounds.width} × ${bounds.height} PX • ${activeCount} CAPAS • RETINA HiDPI`;
    }
  }

  applyZoom() {
    if (this.canvas) {
      this.canvas.style.transform = `scale(${this.zoomLevel})`;
      this.canvas.style.transformOrigin = 'center center';
    }
  }

  getCanvasCoords(e) {
    if (!this.canvas) return null;
    const rect = this.canvas.getBoundingClientRect();
    const bounds = this.engine.getBounds(this.state.canvas.aspectRatio);
    const x = ((e.clientX - rect.left) / rect.width) * bounds.width;
    const y = ((e.clientY - rect.top) / rect.height) * bounds.height;
    return { x: Math.round(x), y: Math.round(y) };
  }

  setupToolbar() {
    // 1. Selector de Aspect Ratio
    const aspectSelect = document.getElementById('canvas-aspect-ratio');
    if (aspectSelect) {
      aspectSelect.value = this.state.canvas.aspectRatio || '1:1';
      aspectSelect.addEventListener('change', (e) => {
        this.state.canvas.aspectRatio = e.target.value;
        this.render();
      });
    }

    // 2. Toggle Safe Bounds
    const boundsToggle = document.getElementById('studio-bounds-toggle');
    if (boundsToggle) {
      boundsToggle.addEventListener('click', () => {
        this.state.canvas.showSafeBounds = !this.state.canvas.showSafeBounds;
        boundsToggle.classList.toggle('active', this.state.canvas.showSafeBounds);
        this.render();
        UIManager.showToast(this.state.canvas.showSafeBounds ? '📐 Guías de corte activadas' : '📐 Guías ocultas');
      });
    }

    // 3. Toggle Invertir Figura/Fondo
    const invertToggle = document.getElementById('studio-invert-toggle');
    if (invertToggle) {
      invertToggle.addEventListener('click', () => {
        this.state.canvas.invertFigureGround = !this.state.canvas.invertFigureGround;
        invertToggle.classList.toggle('active', this.state.canvas.invertFigureGround);
        this.render();
        UIManager.showToast('🌗 Figura / Fondo invertido');
      });
    }

    // 4. Zoom
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomReset = document.getElementById('btn-zoom-reset');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        this.zoomLevel = Math.min(2.5, this.zoomLevel + 0.15);
        this.applyZoom();
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        this.zoomLevel = Math.max(0.4, this.zoomLevel - 0.15);
        this.applyZoom();
      });
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', () => {
        this.zoomLevel = 1.0;
        this.applyZoom();
      });
    }
  }

  setupEvents() {
    // 1. Esculpido Directo sobre Canvas con Ratón
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.state.brushActive) return;
      const coords = this.getCanvasCoords(e);
      if (!coords) return;
      this.isSculpting = true;
      this.lastSculptPos = coords;
      this.engine.addDeformation(coords.x, coords.y, this.state.brush);
      this.render();
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const coords = this.getCanvasCoords(e);
      if (!coords) return;

      if (this.state.brushActive) {
        this.engine.cursorPreview = {
          cx: coords.x,
          cy: coords.y,
          r: parseFloat(this.state.brush.radius)
        };
      }

      if (this.isSculpting && this.lastSculptPos && this.state.brushActive) {
        const dx = coords.x - this.lastSculptPos.x;
        const dy = coords.y - this.lastSculptPos.y;
        if (Math.hypot(dx, dy) > 16) {
          this.lastSculptPos = coords;
          this.engine.addDeformation(coords.x, coords.y, this.state.brush);
        }
      }
      this.render();
    });

    const stopSculpting = () => {
      this.isSculpting = false;
    };
    window.addEventListener('pointerup', stopSculpting);
    window.addEventListener('pointercancel', stopSculpting);

    this.canvas.addEventListener('pointerleave', () => {
      this.engine.cursorPreview = null;
      this.render();
    });

    // 2. Descargar SVG Vectorial
    const btnDownload = document.getElementById('btn-download-svg');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const svgMarkup = this.engine.renderSVG(this.state);
        const ratio = this.state.canvas.aspectRatio.replace(':', 'x');
        const filename = `abstract-studio-${ratio}-${Date.now().toString().slice(-4)}.svg`;
        Exporter.downloadSVG(svgMarkup, filename);
        UIManager.showToast('✅ SVG vectorial puro descargado');
      });
    }

    // 3. Copiar SVG
    const btnCopySvg = document.getElementById('btn-copy-svg');
    if (btnCopySvg) {
      btnCopySvg.addEventListener('click', async () => {
        const svgMarkup = this.engine.renderSVG(this.state);
        await Exporter.copySVGToClipboard(svgMarkup);
        UIManager.showToast('📋 SVG copiado al portapapeles');
      });
    }

    // 4. Modal de Código
    const btnViewCode = document.getElementById('btn-view-code');
    const modalCode = document.getElementById('modal-code');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCopyCodeModal = document.getElementById('btn-copy-code-modal');
    const codeSnippetEl = document.getElementById('code-snippet');

    if (btnViewCode && modalCode) {
      btnViewCode.addEventListener('click', () => {
        const jsonExport = JSON.stringify(this.state, null, 2);
        codeSnippetEl.textContent = jsonExport;
        modalCode.classList.add('active');
      });

      btnCloseModal.addEventListener('click', () => {
        modalCode.classList.remove('active');
      });

      modalCode.addEventListener('click', (e) => {
        if (e.target === modalCode) modalCode.classList.remove('active');
      });

      btnCopyCodeModal.addEventListener('click', async () => {
        await Exporter.copyText(codeSnippetEl.textContent);
        UIManager.showToast('💻 Configuración copiada al portapapeles');
      });
    }

    // 5. Botón Mutar (Evolución armónica de Moiré / parámetros de capa activa)
    const btnMutate = document.getElementById('btn-mutate');
    if (btnMutate) {
      btnMutate.addEventListener('click', () => {
        const activeLayer = this.state.layers.find(l => l.id === this.state.activeLayerId);
        if (activeLayer) {
          if (activeLayer.distribution === 'polar') {
            activeLayer.rotation = +(activeLayer.rotation + (Math.random() > 0.5 ? 0.75 : -0.75)).toFixed(2);
            if (activeLayer.rotation < 0) activeLayer.rotation += 360;
          } else if (activeLayer.distribution === 'linear') {
            if (activeLayer.linear) {
              activeLayer.linear.waviness = +(Math.random() * 6).toFixed(1);
            }
          } else {
            activeLayer.rotation = +(activeLayer.rotation + (Math.random() > 0.5 ? 15 : -15)).toFixed(1);
          }
        }
        this.render();
        this.uiManager.render(this.state);
        UIManager.showToast('✨ Mutación armónica aplicada');
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
