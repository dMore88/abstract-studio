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
    this.currentSvgString = '';
    this.zoomLevel = 1;

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

    // Botón Mutar / Aleatorizar sutilmente
    const btnMutate = document.getElementById('btn-mutate');
    if (btnMutate) {
      btnMutate.addEventListener('click', () => {
        const pattern = registry.getActive();
        const values = this.uiManager.getValues();
        
        // Mutación armónica de ángulo (desviación pequeña alrededor de patrones áureos o resonantes)
        const angleJitter = (Math.random() - 0.5) * 0.4;
        values.angle = +(parseFloat(values.angle) + angleJitter).toFixed(3);
        
        this.uiManager.applyPreset(values, pattern);
        this.renderCurrentPattern(values);
        UIManager.showToast(`✨ Mutación aplicada: ${values.angle}°`);
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
