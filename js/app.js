/**
 * Orquestador Principal de Nature Gen Art
 */

import { registry } from './patterns/registry.js';
import { UIManager } from './ui.js';
import { Exporter } from './exporter.js';

class App {
  constructor() {
    this.canvasContainer = document.getElementById('svg-canvas-container');
    this.patternSelect = document.getElementById('pattern-select');
    this.patternDesc = document.getElementById('pattern-description');
    this.naturalOriginEl = document.getElementById('natural-origin');
    this.canvasHintEl = document.getElementById('canvas-hint');
    this.currentSvgString = '';
    this.zoomLevel = 1;
    this.isSculpting = false;
    this.lastSculptPos = null;

    this.initUI();
    this.setupEvents();
    this.loadPattern(registry.getActive().id);
  }

  initUI() {
    // Poblar selector de patrones
    this.patternSelect.innerHTML = '';
    registry.getAll().forEach(pattern => {
      const option = document.createElement('option');
      option.value = pattern.id;
      option.textContent = pattern.name;
      this.patternSelect.appendChild(option);
    });

    this.uiManager = new UIManager({
      containerId: 'dynamic-controls',
      onParamChange: (values) => this.renderCurrentPattern(values),
      onPresetSelect: (values) => this.renderCurrentPattern(values)
    });
  }

  loadPattern(patternId) {
    const pattern = registry.setActive(patternId);
    this.patternSelect.value = pattern.id;
    this.patternDesc.textContent = pattern.description;
    if (this.naturalOriginEl) {
      this.naturalOriginEl.textContent = pattern.naturalOrigin || '🌿 Patrón inspirado en la naturaleza';
    }

    if (this.canvasHintEl) {
      if (pattern.id === 'sculpt-terrain') {
        this.canvasHintEl.classList.remove('hidden');
      } else {
        this.canvasHintEl.classList.add('hidden');
      }
    }

    this.uiManager.renderPatternControls(pattern);
    this.renderCurrentPattern(this.uiManager.getValues());
  }

  renderCurrentPattern(values) {
    const pattern = registry.getActive();
    if (!pattern) return;

    window.requestAnimationFrame(() => {
      this.currentSvgString = pattern.generateSVG(values, { width: 800, height: 800 });
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

  setupEvents() {
    // Cambio de patrón
    this.patternSelect.addEventListener('change', (e) => {
      this.loadPattern(e.target.value);
    });

    // Botón Descargar SVG
    const btnDownload = document.getElementById('btn-download-svg');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const pattern = registry.getActive();
        const dateStr = new Date().toISOString().slice(0, 10);
        Exporter.downloadSVG(this.currentSvgString, `${pattern.id}-${dateStr}.svg`);
        UIManager.showToast('✅ Archivo SVG descargado');
      });
    }

    // Botón Copiar SVG
    const btnCopySvg = document.getElementById('btn-copy-svg');
    if (btnCopySvg) {
      btnCopySvg.addEventListener('click', async () => {
        await Exporter.copySVGToClipboard(this.currentSvgString);
        UIManager.showToast('📋 SVG copiado al portapapeles');
      });
    }

    // Botón Ver Código / Modal
    const btnViewCode = document.getElementById('btn-view-code');
    const modalCode = document.getElementById('modal-code');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCopyCodeModal = document.getElementById('btn-copy-code-modal');
    const codeSnippetEl = document.getElementById('code-snippet');

    if (btnViewCode && modalCode) {
      btnViewCode.addEventListener('click', () => {
        const pattern = registry.getActive();
        const code = pattern.toCode(this.uiManager.getValues());
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

    // Interacción de esculpido manual con el ratón
    const getCoords = (e) => {
      const svgEl = this.canvasContainer.querySelector('svg');
      if (!svgEl) return null;
      const rect = svgEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 800;
      const y = ((e.clientY - rect.top) / rect.height) * 800;
      return { x: Math.round(x), y: Math.round(y) };
    };

    this.canvasContainer.addEventListener('pointerdown', (e) => {
      const pattern = registry.getActive();
      if (pattern.addDeformation) {
        const coords = getCoords(e);
        if (!coords) return;
        this.isSculpting = true;
        this.lastSculptPos = coords;
        const values = this.uiManager.getValues();
        pattern.addDeformation(coords.x, coords.y, values);
        this.renderCurrentPattern(values);
      }
    });

    this.canvasContainer.addEventListener('pointermove', (e) => {
      const pattern = registry.getActive();
      if (pattern.addDeformation) {
        const coords = getCoords(e);
        if (!coords) return;
        const values = this.uiManager.getValues();
        pattern.cursorPreview = { cx: coords.x, cy: coords.y, r: parseFloat(values.brushRadius) };

        if (this.isSculpting && this.lastSculptPos) {
          const dx = coords.x - this.lastSculptPos.x;
          const dy = coords.y - this.lastSculptPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 18) {
            this.lastSculptPos = coords;
            pattern.addDeformation(coords.x, coords.y, values);
          }
        }
        this.renderCurrentPattern(values);
      }
    });

    const stopSculpting = () => {
      this.isSculpting = false;
    };
    window.addEventListener('pointerup', stopSculpting);
    window.addEventListener('pointercancel', stopSculpting);

    this.canvasContainer.addEventListener('pointerleave', () => {
      const pattern = registry.getActive();
      if (pattern.cursorPreview) {
        pattern.cursorPreview = null;
        this.renderCurrentPattern(this.uiManager.getValues());
      }
    });

    // Botón Mutar / Aleatorizar sutilmente
    const btnMutate = document.getElementById('btn-mutate');
    if (btnMutate) {
      btnMutate.addEventListener('click', () => {
        const pattern = registry.getActive();
        const values = this.uiManager.getValues();
        let message = '✨ Mutación aplicada';
        
        if (pattern.id === 'phyllotaxis') {
          const angleJitter = (Math.random() - 0.5) * 0.4;
          values.angle = +(parseFloat(values.angle) + angleJitter).toFixed(3);
          message = `✨ Ángulo mutado: ${values.angle}°`;
        } else if (pattern.id === 'branching-tree') {
          values.branchAngle = Math.round(parseFloat(values.branchAngle) + (Math.random() - 0.5) * 8);
          values.asymmetry = Math.round(parseFloat(values.asymmetry) + (Math.random() - 0.5) * 6);
          message = `✨ Ramas mutadas: ${values.branchAngle}°`;
        } else if (pattern.id === 'flow-field') {
          values.curl = +(parseFloat(values.curl) + (Math.random() - 0.5) * 0.5).toFixed(1);
          values.noiseScale = +(Math.max(0.001, parseFloat(values.noiseScale) + (Math.random() - 0.5) * 0.0015)).toFixed(4);
          message = `✨ Turbulencia mutada: ${values.curl}x`;
        } else if (pattern.id === 'sculpt-terrain') {
          values.baseWaviness = Math.round(Math.random() * 8);
          message = `✨ Ondulación base mutada: ${values.baseWaviness}px`;
        }
        
        this.uiManager.applyPreset(values, pattern);
        this.renderCurrentPattern(values);
        UIManager.showToast(message);
      });
    }

    // Zoom Controls
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

// Inicializar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
