/**
 * ShapeCraft 2D - Full Spectrum Color Studio
 * Provides 16.7 million colors (all colors that exist) via HSL, Hex, RGB, Alpha,
 * Eyedropper, curated themed palettes, and dynamic recent history.
 * Supports dedicated and independent selection for both Fill and Border / Outline colors.
 */

class ColorStudio {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.target = 'fill'; // 'fill' or 'stroke'

    this.currentFillColor = '#6366f1';
    this.currentStrokeColor = '#312e81';

    this.recentColors = [
      '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'
    ];

    // Current HSL state
    this.hue = 240;
    this.saturation = 80;
    this.lightness = 60;
    this.alpha = 1;

    this.curatedPalettes = {
      vibrant: ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#84cc16', '#e11d48', '#6366f1', '#a855f7', '#d946ef'],
      pastel: ['#fecdd3', '#fed7aa', '#fef08a', '#bbf7d0', '#bae6fd', '#c7d2fe', '#e9d5ff', '#fbcfe8', '#ccfbf1', '#d9f99d', '#ffe4e6', '#ddd6fe', '#fae8ff', '#f5d0fe'],
      cyberpunk: ['#ff0055', '#00ffff', '#ffe600', '#00ff66', '#7928ca', '#ff0080', '#0070f3', '#50e3c2', '#f5a623', '#bd10e0', '#4a90e2', '#9013fe', '#b8e986', '#ff2d55'],
      nature: ['#166534', '#15803d', '#22c55e', '#84cc16', '#854d0e', '#78350f', '#451a03', '#0369a1', '#0284c7', '#38bdf8', '#713f12', '#a16207', '#ca8a04', '#eab308'],
      monochrome: ['#000000', '#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc', '#ffffff', '#78716c', '#d6d3d1']
    };

    this.initElements();
    this.bindEvents();
    this.renderPalettes();
    this.renderRecentColors();
    this.updateTargetCards();
  }

  initElements() {
    this.targetFillBtn = document.getElementById('targetFillBtn');
    this.targetStrokeBtn = document.getElementById('targetStrokeBtn');
    this.fillColorSwatch = document.getElementById('fillColorSwatch');
    this.strokeColorSwatch = document.getElementById('strokeColorSwatch');
    this.fillHexLabel = document.getElementById('fillHexLabel');
    this.strokeHexLabel = document.getElementById('strokeHexLabel');

    this.colorPreview = document.getElementById('currentColorPreview');
    this.nativeColorInput = document.getElementById('nativeColorInput');
    this.hexInput = document.getElementById('hexInput');
    this.eyedropperBtn = document.getElementById('eyedropperBtn');

    this.hueSlider = document.getElementById('hueSlider');
    this.saturationSlider = document.getElementById('saturationSlider');
    this.lightnessSlider = document.getElementById('lightnessSlider');
    this.opacitySlider = document.getElementById('opacitySlider');

    this.hueVal = document.getElementById('hueVal');
    this.satVal = document.getElementById('satVal');
    this.lightVal = document.getElementById('lightVal');
    this.opacityVal = document.getElementById('opacityVal');

    // Dedicated Border & Glow controls
    this.borderColorDirectInput = document.getElementById('borderColorDirectInput');
    this.borderHexDirectInput = document.getElementById('borderHexDirectInput');
    this.strokeWidthInput = document.getElementById('strokeWidthInput');
    this.strokeStyleSelect = document.getElementById('strokeStyleSelect');
    this.shadowBlurInput = document.getElementById('shadowBlurInput');
    this.shadowColorInput = document.getElementById('shadowColorInput');

    this.paletteSelect = document.getElementById('paletteSelect');
    this.swatchGrid = document.getElementById('swatchGrid');
    this.recentColorsGrid = document.getElementById('recentColorsGrid');
  }

  bindEvents() {
    // Fill vs Stroke target cards
    if (this.targetFillBtn) this.targetFillBtn.addEventListener('click', () => this.setTarget('fill'));
    if (this.targetStrokeBtn) this.targetStrokeBtn.addEventListener('click', () => this.setTarget('stroke'));

    // Native Color Input
    this.nativeColorInput.addEventListener('input', (e) => {
      this.setColorFromHex(e.target.value, true);
    });

    this.colorPreview.addEventListener('click', () => {
      this.nativeColorInput.click();
    });

    // Hex Input
    this.hexInput.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/i.test(val) || /^#[0-9A-Fa-f]{3}$/i.test(val)) {
        this.setColorFromHex(val, true);
      }
    });

    // Continuous Sliders
    this.hueSlider.addEventListener('input', () => this.updateFromSliders());
    this.saturationSlider.addEventListener('input', () => this.updateFromSliders());
    this.lightnessSlider.addEventListener('input', () => this.updateFromSliders());
    this.opacitySlider.addEventListener('input', () => this.updateFromSliders());

    // EyeDropper API
    if (window.EyeDropper && this.eyedropperBtn) {
      this.eyedropperBtn.addEventListener('click', async () => {
        try {
          const eyeDropper = new window.EyeDropper();
          const result = await eyeDropper.open();
          if (result && result.sRGBHex) {
            this.setColorFromHex(result.sRGBHex, true);
          }
        } catch (e) {
          console.log('Eyedropper cancelled or failed', e);
        }
      });
    } else if (this.eyedropperBtn) {
      this.eyedropperBtn.style.display = 'none';
    }

    // Direct Border Color Picker in Border Properties Section
    if (this.borderColorDirectInput) {
      this.borderColorDirectInput.addEventListener('input', (e) => {
        const hex = e.target.value;
        this.currentStrokeColor = hex;
        if (this.borderHexDirectInput) this.borderHexDirectInput.value = hex.toUpperCase();
        this.setTarget('stroke');
        this.setColorFromHex(hex, true);
      });
    }

    if (this.borderHexDirectInput) {
      this.borderHexDirectInput.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
          this.currentStrokeColor = val;
          if (this.borderColorDirectInput) this.borderColorDirectInput.value = val;
          this.setTarget('stroke');
          this.setColorFromHex(val, true);
        }
      });
    }

    // Palette Category Change
    this.paletteSelect.addEventListener('change', () => {
      this.renderPalettes();
    });

    // Properties: Stroke Width
    this.strokeWidthInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 0;
      this.canvasManager.updateSelectedShapeProperty('strokeWidth', val);
    });

    // Properties: Stroke Style
    this.strokeStyleSelect.addEventListener('change', (e) => {
      this.canvasManager.updateSelectedShapeProperty('strokeStyle', e.target.value);
    });

    // Properties: Shadow / Glow
    this.shadowBlurInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 0;
      this.canvasManager.updateSelectedShapeProperty('shadowBlur', val);
    });

    this.shadowColorInput.addEventListener('input', (e) => {
      this.canvasManager.updateSelectedShapeProperty('shadowColor', e.target.value);
    });
  }

  setTarget(target) {
    this.target = target;
    this.updateTargetCards();

    // Sync spectrum slider to target's current color
    const shape = this.canvasManager.selectedShape;
    let color;
    if (shape) {
      color = target === 'fill' ? shape.fillColor : shape.strokeColor;
    } else {
      color = target === 'fill' ? this.currentFillColor : this.currentStrokeColor;
    }
    this.setColorFromHex(color, false);
  }

  updateTargetCards() {
    const isText = this.canvasManager && this.canvasManager.selectedShape && this.canvasManager.selectedShape.type === 'text';

    const fillLabel = this.targetFillBtn ? this.targetFillBtn.querySelector('.target-card-label') : null;
    const strokeLabel = this.targetStrokeBtn ? this.targetStrokeBtn.querySelector('.target-card-label') : null;

    if (fillLabel) fillLabel.textContent = isText ? 'Text Color' : 'Fill Paint';
    if (strokeLabel) strokeLabel.textContent = isText ? 'Text Outline' : 'Border Color';

    if (this.targetFillBtn && this.targetStrokeBtn) {
      if (this.target === 'fill') {
        this.targetFillBtn.classList.add('active');
        this.targetStrokeBtn.classList.remove('active');
      } else {
        this.targetStrokeBtn.classList.add('active');
        this.targetFillBtn.classList.remove('active');
      }
    }

    if (this.fillColorSwatch) this.fillColorSwatch.style.backgroundColor = this.currentFillColor;
    if (this.strokeColorSwatch) this.strokeColorSwatch.style.borderColor = this.currentStrokeColor;
    if (this.fillHexLabel) this.fillHexLabel.textContent = this.currentFillColor.toUpperCase();
    if (this.strokeHexLabel) this.strokeHexLabel.textContent = this.currentStrokeColor.toUpperCase();

    if (this.borderColorDirectInput) this.borderColorDirectInput.value = this.currentStrokeColor;
    if (this.borderHexDirectInput) this.borderHexDirectInput.value = this.currentStrokeColor.toUpperCase();
  }

  /**
   * Called when spectrum sliders are adjusted
   */
  updateFromSliders() {
    this.hue = parseInt(this.hueSlider.value, 10);
    this.saturation = parseInt(this.saturationSlider.value, 10);
    this.lightness = parseInt(this.lightnessSlider.value, 10);
    this.alpha = parseFloat(this.opacitySlider.value);

    this.hueVal.textContent = `${this.hue}°`;
    this.satVal.textContent = `${this.saturation}%`;
    this.lightVal.textContent = `${this.lightness}%`;
    this.opacityVal.textContent = `${Math.round(this.alpha * 100)}%`;

    const hex = this.hslToHex(this.hue, this.saturation, this.lightness);
    this.updateUI(hex);
    this.applyColorToSelectedShape(hex, this.alpha, false);
  }

  /**
   * Set color from a Hex string (#RRGGBB)
   */
  setColorFromHex(hex, applyToShape = true) {
    if (!hex || hex === 'transparent') hex = '#6366f1';
    const hsl = this.hexToHsl(hex);
    this.hue = Math.round(hsl.h);
    this.saturation = Math.round(hsl.s);
    this.lightness = Math.round(hsl.l);

    this.hueSlider.value = this.hue;
    this.saturationSlider.value = this.saturation;
    this.lightnessSlider.value = this.lightness;

    this.hueVal.textContent = `${this.hue}°`;
    this.satVal.textContent = `${this.saturation}%`;
    this.lightVal.textContent = `${this.lightness}%`;

    this.updateUI(hex);

    if (applyToShape) {
      this.applyColorToSelectedShape(hex, this.alpha, true);
    }
  }

  updateUI(hex) {
    if (this.target === 'fill') {
      this.currentFillColor = hex;
    } else {
      this.currentStrokeColor = hex;
    }

    this.hexInput.value = hex.replace('#', '').toUpperCase();
    this.nativeColorInput.value = hex;

    const rgba = this.hexToRgba(hex, this.alpha);
    this.colorPreview.style.backgroundColor = rgba;

    // Update target preview cards
    this.updateTargetCards();

    // Update slider background gradients dynamically
    this.saturationSlider.style.background = `linear-gradient(to right, 
      hsl(${this.hue}, 0%, ${this.lightness}%), 
      hsl(${this.hue}, 100%, ${this.lightness}%))`;

    this.lightnessSlider.style.background = `linear-gradient(to right, 
      #000000, 
      hsl(${this.hue}, ${this.saturation}%, 50%), 
      #ffffff)`;
  }

  /**
   * Apply selected color to active shape
   */
  applyColorToSelectedShape(color, alpha = 1, recordHistory = true) {
    const shape = this.canvasManager.selectedShape;
    if (!shape) return;

    if (this.target === 'fill') {
      shape.fillColor = color;
      shape.opacity = alpha;
      this.currentFillColor = color;
    } else {
      shape.strokeColor = color;
      if (shape.strokeWidth === 0) {
        shape.strokeWidth = shape.type === 'text' ? 1.5 : 2;
        if (this.strokeWidthInput) this.strokeWidthInput.value = shape.strokeWidth;
      }
      this.currentStrokeColor = color;
    }

    this.updateTargetCards();

    if (recordHistory) {
      this.addToRecent(color);
      this.canvasManager.saveState();
      
      // Visual particle sparkles & audio chime
      if (window.particleSystem) {
        window.particleSystem.burst(shape.x, shape.y, color, 14, 'sparkle');
      }
      if (window.soundEngine) {
        window.soundEngine.playColorSparkle();
      }
    }

    this.canvasManager.requestRender();
  }

  addToRecent(color) {
    if (!color || color === 'transparent') return;
    const norm = color.toLowerCase();
    this.recentColors = [norm, ...this.recentColors.filter(c => c.toLowerCase() !== norm)].slice(0, 14);
    this.renderRecentColors();
  }

  renderPalettes() {
    const key = this.paletteSelect.value;
    const colors = this.curatedPalettes[key] || this.curatedPalettes.vibrant;
    this.swatchGrid.innerHTML = '';

    colors.forEach(col => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = col;
      swatch.title = col;
      swatch.addEventListener('click', () => {
        this.setColorFromHex(col, true);
      });
      this.swatchGrid.appendChild(swatch);
    });
  }

  renderRecentColors() {
    this.recentColorsGrid.innerHTML = '';
    this.recentColors.forEach(col => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = col;
      swatch.title = col;
      swatch.addEventListener('click', () => {
        this.setColorFromHex(col, true);
      });
      this.recentColorsGrid.appendChild(swatch);
    });
  }

  /**
   * Sync the panel inputs with the selected shape
   */
  syncWithShape(shape) {
    if (!shape) return;
    this.currentFillColor = shape.fillColor || '#6366f1';
    this.currentStrokeColor = shape.strokeColor || '#312e81';

    const color = this.target === 'fill' ? this.currentFillColor : this.currentStrokeColor;
    this.alpha = shape.opacity !== undefined ? shape.opacity : 1;
    this.opacitySlider.value = this.alpha;
    this.opacityVal.textContent = `${Math.round(this.alpha * 100)}%`;

    if (this.strokeWidthInput) this.strokeWidthInput.value = shape.strokeWidth;
    if (this.strokeStyleSelect) this.strokeStyleSelect.value = shape.strokeStyle;
    if (this.shadowBlurInput) this.shadowBlurInput.value = shape.shadowBlur;
    if (this.shadowColorInput) this.shadowColorInput.value = shape.shadowColor;

    this.updateTargetCards();
    this.setColorFromHex(color, false);
  }

  // Color Math Utilities
  hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  hexToHsl(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length >= 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  hexToRgba(hex, alpha = 1) {
    let r = 0, g = 0, b = 0;
    if (hex.length >= 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

window.ColorStudio = ColorStudio;
