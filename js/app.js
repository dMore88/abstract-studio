/**
 * Abstract Studio - Application Orchestrator
 * Connects the dual Canvas/SVG rendering engine with the Figma-style Popover UI.
 * Fully translated to English.
 */

import { AbstractEngine, ASPECT_RATIOS } from './engine.js';
import { UIManager } from './ui.js';
import { Exporter } from './exporter.js';
import { PRESETS } from './presets.js';
import { PALETTES } from './palettes.js';

class App {
  constructor() {
    this.canvas = document.getElementById('studio-canvas');
    this.artboardCard = document.querySelector('.canvas-artboard-card');
    this.zoomLevel = 1.0;
    this.isSculpting = false;
    this.lastSculptPos = null;

    this.engine = new AbstractEngine();

    // Default state: Dual Radial Moiré with white canvas
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
      popoverContainerId: 'popover-inspector',
      toolRailId: 'tool-rail',
      onStateChange: () => this.render(),
      onLayerSelect: (layerId) => {
        this.state.activeLayerId = layerId;
        this.render();
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
      resEl.textContent = `${bounds.width} × ${bounds.height} PX • ${activeCount} LAYERS • RETINA HiDPI`;
    }
  }

  applyZoom() {
    const target = this.artboardCard || this.canvas;
    if (target) {
      target.style.transform = `scale(${this.zoomLevel})`;
      target.style.transformOrigin = 'center center';
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
    // 1. Aspect Ratio dropdown
    const aspectSelect = document.getElementById('canvas-aspect-ratio');
    if (aspectSelect) {
      aspectSelect.value = this.state.canvas.aspectRatio || '1:1';
      aspectSelect.addEventListener('change', (e) => {
        this.state.canvas.aspectRatio = e.target.value;
        this.render();
      });
    }

    // 2. Safe Bounds toggle
    const boundsToggle = document.getElementById('studio-bounds-toggle');
    if (boundsToggle) {
      boundsToggle.addEventListener('click', () => {
        this.state.canvas.showSafeBounds = !this.state.canvas.showSafeBounds;
        boundsToggle.classList.toggle('active', this.state.canvas.showSafeBounds);
        this.render();
        UIManager.showToast(this.state.canvas.showSafeBounds ? '📐 Bounds guides visible' : '📐 Guides hidden');
      });
    }

    // 3. Invert Figure / Ground
    const invertToggle = document.getElementById('studio-invert-toggle');
    if (invertToggle) {
      invertToggle.addEventListener('click', () => {
        this.state.canvas.invertFigureGround = !this.state.canvas.invertFigureGround;
        invertToggle.classList.toggle('active', this.state.canvas.invertFigureGround);
        this.render();
        UIManager.showToast('🌗 Inverted figure / ground');
      });
    }

    // 4. Zoom buttons
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomReset = document.getElementById('btn-zoom-reset');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        this.zoomLevel = Math.min(2.5, +(this.zoomLevel + 0.15).toFixed(2));
        this.applyZoom();
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        this.zoomLevel = Math.max(0.4, +(this.zoomLevel - 0.15).toFixed(2));
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
    // 1. Interactive Canvas pointer events (when brush / sculpting is active)
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

    // 2. Download SVG File
    const btnDownload = document.getElementById('btn-download-svg');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const svgMarkup = this.engine.renderSVG(this.state);
        const ratio = this.state.canvas.aspectRatio.replace(':', 'x');
        const filename = `abstract-studio-${ratio}-${Date.now().toString().slice(-4)}.svg`;
        Exporter.downloadSVG(svgMarkup, filename);
        UIManager.showToast('✅ Pure vector SVG downloaded');
      });
    }

    // 3. Copy SVG to Clipboard
    const btnCopySvg = document.getElementById('btn-copy-svg');
    if (btnCopySvg) {
      btnCopySvg.addEventListener('click', async () => {
        const svgMarkup = this.engine.renderSVG(this.state);
        await Exporter.copySVGToClipboard(svgMarkup);
        UIManager.showToast('📋 SVG copied to clipboard');
      });
    }

    // 4. View JSON Configuration Modal
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
        UIManager.showToast('💻 Configuration copied to clipboard');
      });
    }

    // 5. Random / Harmonic Mutation button
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
              activeLayer.linear.waviness = +(Math.random() * 5).toFixed(1);
            }
          } else {
            activeLayer.rotation = +(activeLayer.rotation + (Math.random() > 0.5 ? 15 : -15)).toFixed(1);
          }
        }
        this.render();
        this.uiManager.render(this.state);
        UIManager.showToast('✨ Harmonic mutation applied');
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
