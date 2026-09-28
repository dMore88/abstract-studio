/**
 * Orquestador Principal de Abstract Studio (Arte Abstracto por Capas)
 */

import { AbstractEngine } from './engine.js';
import { UIManager } from './ui.js';
import { Exporter } from './exporter.js';
import { PRESETS } from './presets.js';

class App {
  constructor() {
    this.canvasContainer = document.getElementById('svg-canvas-container');
    this.currentSvgString = '';
    this.zoomLevel = 1;
    this.isSculpting = false;
    this.lastSculptPos = null;

    this.engine = new AbstractEngine();

    // Estado inicial: Estilo Carbón y Tiza (Charcoal & Chalk)
    this.state = {
      canvas: {
        aspectRatio: '1:1',
        bgColor: '#101012'
      },
      pattern: {
        shape: 'line',
        polygonSides: 4,
        distribution: 'linear',
        posX: 50,
        posY: 50,
        sizeX: 500,
        sizeY: 380,
        size: 180,
        copies: 38,
        angle: 0,
        stepX: 0,
        stepY: 35,
        scaleStep: 1.0,
        rotateStep: 0,
        moveX: 0,
        moveY: 0,
        anchor: 'center',
        jitter: 1.2,
        skipChance: 0,
        lineSwappiness: 0,
        waviness: 0,
        strokeWidth: 1.2,
        opacity: 0.9,
        color: '#f4f4f5'
      },
      brush: {
        mode: 'peak',
        radius: 75,
        strength: 55
      },
      differenceLayers: []
    };
    this.engine.setDeformations([]);

    this.initUI();
    this.setupEvents();
    this.render();
  }

  initUI() {
    this.uiManager = new UIManager({
      containerId: 'dynamic-controls',
      onStateChange: () => this.render(),
      onUndo: () => {
        this.engine.undoDeformation();
        this.render();
        UIManager.showToast('↶ Último trazo deshecho');
      },
      onClearDeformations: () => {
        this.engine.clearDeformations();
        this.render();
        UIManager.showToast('🗑️ Trama restablecida');
      }
    });

    this.uiManager.render(this.state, this.engine);
  }

  render() {
    window.requestAnimationFrame(() => {
      this.currentSvgString = this.engine.renderSVG(this.state);
      this.canvasContainer.innerHTML = this.currentSvgString;
      this.applyZoom();
    });
  }

  applyZoom() {
    const svgEl = this.canvasContainer.querySelector('svg');
    if (svgEl) {
      svgEl.style.transform = `scale(${this.zoomLevel})`;
      svgEl.style.transformOrigin = 'center center';
    }
  }

  getCanvasCoords(e) {
    const svgEl = this.canvasContainer.querySelector('svg');
    if (!svgEl) return null;
    const rect = svgEl.getBoundingClientRect();
    const bounds = this.engine.getBounds(this.state.canvas.aspectRatio);

    const x = ((e.clientX - rect.left) / rect.width) * bounds.width;
    const y = ((e.clientY - rect.top) / rect.height) * bounds.height;
    return { x: Math.round(x), y: Math.round(y) };
  }

  setupEvents() {
    // 1. Esculpido Directo sobre el Lienzo SVG con el ratón
    this.canvasContainer.addEventListener('pointerdown', (e) => {
      const coords = this.getCanvasCoords(e);
      if (!coords) return;
      this.isSculpting = true;
      this.lastSculptPos = coords;
      this.engine.addDeformation(coords.x, coords.y, this.state.brush);
      this.render();
    });

    this.canvasContainer.addEventListener('pointermove', (e) => {
      const coords = this.getCanvasCoords(e);
      if (!coords) return;

      this.engine.cursorPreview = {
        cx: coords.x,
        cy: coords.y,
        r: parseFloat(this.state.brush.radius)
      };

      if (this.isSculpting && this.lastSculptPos) {
        const dx = coords.x - this.lastSculptPos.x;
        const dy = coords.y - this.lastSculptPos.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 16) {
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

    this.canvasContainer.addEventListener('pointerleave', () => {
      this.engine.cursorPreview = null;
      this.render();
    });

    // 2. Descargar SVG
    const btnDownload = document.getElementById('btn-download-svg');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const ratio = this.state.canvas.aspectRatio.replace(':', 'x');
        const filename = `abstract-art-${ratio}-${Date.now().toString().slice(-5)}.svg`;
        Exporter.downloadSVG(this.currentSvgString, filename);
        UIManager.showToast('✅ Archivo SVG vectorial descargado');
      });
    }

    // 3. Copiar SVG
    const btnCopySvg = document.getElementById('btn-copy-svg');
    if (btnCopySvg) {
      btnCopySvg.addEventListener('click', async () => {
        await Exporter.copySVGToClipboard(this.currentSvgString);
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
        const code = this.engine.toCode(this.state);
        codeSnippetEl.textContent = code;
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
        UIManager.showToast('💻 Código copiado al portapapeles');
      });
    }

    // 5. Botón Mutar
    const btnMutate = document.getElementById('btn-mutate');
    if (btnMutate) {
      btnMutate.addEventListener('click', () => {
        if (this.state.pattern.archetype === 'lines') {
          this.state.pattern.baseWaviness = Math.round(Math.random() * 8);
          this.state.pattern.angle = (this.state.pattern.angle + (Math.random() > 0.5 ? 5 : -5) + 180) % 180;
        } else {
          this.state.pattern.rotateStep = +(parseFloat(this.state.pattern.rotateStep || 8) + (Math.random() - 0.5) * 1.2).toFixed(2);
          if (this.state.pattern.scaleStep) {
            this.state.pattern.scaleStep = +(parseFloat(this.state.pattern.scaleStep) + (Math.random() - 0.5) * 0.006).toFixed(4);
          }
        }
        this.render();
        this.uiManager.render(this.state, this.engine);
        UIManager.showToast('✨ Mutación armónica aplicada');
      });
    }

    // 6. Controles de Zoom
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
        this.zoomLevel = Math.max(0.5, this.zoomLevel - 0.15);
        this.applyZoom();
      });
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener('click', () => {
        this.zoomLevel = 1;
        this.applyZoom();
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
