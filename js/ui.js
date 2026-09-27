/**
 * Módulo UI: Generador dinámico de controles a partir del esquema de parámetros del patrón
 */

export class UIManager {
  constructor({ containerId, onParamChange, onPresetSelect }) {
    this.container = document.getElementById(containerId);
    this.onParamChange = onParamChange;
    this.onPresetSelect = onPresetSelect;
    this.currentValues = {};
  }

  /**
   * Renderiza el panel de controles completo para un patrón
   */
  renderPatternControls(pattern) {
    if (!this.container) return;
    this.container.innerHTML = '';

    // 1. Sección de Presets rápidos
    if (pattern.presets && pattern.presets.length > 0) {
      const presetsSection = document.createElement('div');
      presetsSection.className = 'control-group';
      presetsSection.innerHTML = `
        <span class="section-label">Presets Botánicos</span>
        <div class="presets-wrap" id="presets-container"></div>
      `;
      const presetsWrap = presetsSection.querySelector('#presets-container');
      
      pattern.presets.forEach(preset => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'preset-chip';
        chip.textContent = preset.name;
        chip.addEventListener('click', () => {
          this.applyPreset(preset.values, pattern);
        });
        presetsWrap.appendChild(chip);
      });

      this.container.appendChild(presetsSection);
    }

    // 2. Renderizar cada parámetro según su tipo
    const schema = pattern.parameters;
    this.currentValues = {};

    for (const [key, param] of Object.entries(schema)) {
      this.currentValues[key] = param.default;

      if (param.type === 'slider') {
        this.renderSlider(key, param);
      } else if (param.type === 'segmented') {
        this.renderSegmented(key, param);
      } else if (param.type === 'palette') {
        this.renderPalette(key, param);
      }
    }
  }

  /**
   * Renderiza un control tipo slider
   */
  renderSlider(key, param) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const header = document.createElement('div');
    header.className = 'control-header';
    header.innerHTML = `
      <span class="control-label">${param.label}</span>
      <span class="control-value" id="val-${key}">${param.default}${param.unit || ''}</span>
    `;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = param.min;
    input.max = param.max;
    input.step = param.step || 1;
    input.value = param.default;
    input.id = `input-${key}`;

    input.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.currentValues[key] = val;
      const displayVal = group.querySelector(`#val-${key}`);
      if (displayVal) {
        displayVal.textContent = `${val}${param.unit || ''}`;
      }
      this.notifyChange();
    });

    group.appendChild(header);
    group.appendChild(input);
    this.container.appendChild(group);
  }

  /**
   * Renderiza un control de botones segmentados
   */
  renderSegmented(key, param) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const label = document.createElement('span');
    label.className = 'section-label';
    label.textContent = param.label;
    group.appendChild(label);

    const control = document.createElement('div');
    control.className = 'segmented-control';

    param.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `segmented-btn ${opt.value === param.default ? 'active' : ''}`;
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;

      btn.addEventListener('click', () => {
        control.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentValues[key] = opt.value;
        this.notifyChange();
      });

      control.appendChild(btn);
    });

    group.appendChild(control);
    this.container.appendChild(group);
  }

  /**
   * Renderiza el selector de paletas de color con muestras
   */
  renderPalette(key, param) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const label = document.createElement('span');
    label.className = 'section-label';
    label.textContent = param.label;
    group.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'palette-grid';

    for (const [palKey, palDef] of Object.entries(param.palettes)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `palette-btn ${palKey === param.default ? 'active' : ''}`;
      btn.dataset.palette = palKey;

      const swatches = palDef.colors.map(c => `<span style="background-color: ${c}"></span>`).join('');
      btn.innerHTML = `
        <div class="palette-colors">${swatches}</div>
        <span class="palette-name">${palDef.name}</span>
      `;

      btn.addEventListener('click', () => {
        grid.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentValues[key] = palKey;
        this.notifyChange();
      });

      grid.appendChild(btn);
    }

    group.appendChild(grid);
    this.container.appendChild(group);
  }

  /**
   * Aplica un preset completo y actualiza todos los controles visuales
   */
  applyPreset(values, pattern) {
    Object.assign(this.currentValues, values);

    for (const [key, val] of Object.entries(values)) {
      const slider = document.getElementById(`input-${key}`);
      const valLabel = document.getElementById(`val-${key}`);
      if (slider && valLabel) {
        slider.value = val;
        const schema = pattern.parameters[key];
        valLabel.textContent = `${val}${schema?.unit || ''}`;
      }

      // Segmented
      const segmentedGroup = this.container.querySelectorAll(`.segmented-btn[data-value="${val}"]`);
      segmentedGroup.forEach(btn => {
        const parent = btn.parentElement;
        parent.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });

      // Palette
      const paletteBtn = this.container.querySelector(`.palette-btn[data-palette="${val}"]`);
      if (paletteBtn) {
        const parent = paletteBtn.parentElement;
        parent.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        paletteBtn.classList.add('active');
      }
    }

    if (this.onPresetSelect) {
      this.onPresetSelect(this.currentValues);
    }
  }

  notifyChange() {
    if (this.onParamChange) {
      this.onParamChange({ ...this.currentValues });
    }
  }

  getValues() {
    return { ...this.currentValues };
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
