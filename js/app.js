/**
 * ShapeCraft 2D - Main Application Coordinator
 * Binds UI controls, Theme Switcher, Keyboard shortcuts, File I/O,
 * and Interactive Blueprint Reference Viewer.
 */

class App {
  constructor() {
    this.isDarkTheme = false;
    this.activeBlueprintKey = 'cottage';

    this.initCanvas();
    this.initColorStudio();
    this.bindShapeDock();
    this.bindFloatingBar();
    this.bindHeaderControls();
    this.bindKeyboardShortcuts();
    this.bindModals();
    this.initTextControls();
    this.initBlueprintReferenceViewer();

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme(true);
    } else {
      this.setTheme(false);
    }

    // Canvas is intentionally kept EMPTY with just the grid
    // for the user to build on their own!
  }

  initCanvas() {
    const canvasEl = document.getElementById('mainCanvas');
    this.canvasManager = new CanvasManager(canvasEl);

    this.canvasManager.onShapeSelected = (shape) => {
      if (this.colorStudio) {
        this.colorStudio.syncWithShape(shape);
      }
      this.syncTextControls(shape);
    };
  }

  initColorStudio() {
    this.colorStudio = new ColorStudio(this.canvasManager);
  }

  setTheme(isDark) {
    this.isDarkTheme = isDark;
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    this.canvasManager.setTheme(isDark);

    // Refresh active blueprint reference image to match theme
    this.updateBlueprintReferenceView();
  }

  toggleTheme() {
    this.setTheme(!this.isDarkTheme);
    if (window.soundEngine) window.soundEngine.playClick();
  }

  bindShapeDock() {
    const shapeCards = document.querySelectorAll('.shape-card');
    shapeCards.forEach(card => {
      const shapeType = card.dataset.shape;

      // Click to spawn near center
      card.addEventListener('click', () => {
        this.canvasManager.addShape(shapeType);
      });

      // Drag to canvas
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('shapeType', shapeType);
      });
    });
  }

  bindFloatingBar() {
    document.getElementById('floatDupBtn').addEventListener('click', () => this.canvasManager.duplicateSelected());
    document.getElementById('floatDelBtn').addEventListener('click', () => this.canvasManager.deleteSelected());
    document.getElementById('floatFrontBtn').addEventListener('click', () => this.canvasManager.bringToFront());
    document.getElementById('floatBackBtn').addEventListener('click', () => this.canvasManager.sendToBack());
    document.getElementById('floatFlipHBtn').addEventListener('click', () => this.canvasManager.flipHorizontal());
    document.getElementById('floatFlipVBtn').addEventListener('click', () => this.canvasManager.flipVertical());

    const floatEditBtn = document.getElementById('floatEditBtn');
    if (floatEditBtn) {
      floatEditBtn.addEventListener('click', () => {
        if (this.canvasManager.selectedShape && this.canvasManager.selectedShape.type === 'text') {
          this.canvasManager.startInlineTextEdit(this.canvasManager.selectedShape);
        }
      });
    }
  }

  bindHeaderControls() {
    // Add Text Box
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
      addTextBtn.addEventListener('click', () => {
        this.canvasManager.addShape('text');
        if (window.soundEngine) window.soundEngine.playPop();
      });
    }
    // Theme toggle
    document.getElementById('themeToggleBtn').addEventListener('click', () => this.toggleTheme());

    // Undo / Redo
    document.getElementById('undoBtn').addEventListener('click', () => this.canvasManager.undo());
    document.getElementById('redoBtn').addEventListener('click', () => this.canvasManager.redo());

    // Zoom Controls
    document.getElementById('zoomInBtn').addEventListener('click', () => this.canvasManager.zoomIn());
    document.getElementById('zoomOutBtn').addEventListener('click', () => this.canvasManager.zoomOut());
    document.getElementById('zoomResetBtn').addEventListener('click', () => this.canvasManager.resetZoom());

    // Snap to Grid & Auto Center
    const snapBtn = document.getElementById('snapGridBtn');
    snapBtn.addEventListener('click', () => {
      const active = snapBtn.classList.toggle('primary');
      this.canvasManager.setSnapToGrid(active);
      if (window.soundEngine) window.soundEngine.playClick();
    });

    // Sound mute toggle
    const muteBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    muteBtn.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      muteBtn.classList.toggle('danger', isMuted);
      soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Clear Canvas
    document.getElementById('clearCanvasBtn').addEventListener('click', () => {
      this.openModal('clearConfirmModal');
    });
    document.getElementById('confirmClearBtn').addEventListener('click', () => {
      this.canvasManager.clearCanvas();
      this.closeModal('clearConfirmModal');
    });

    // Reference Blueprints Menu & Toggles
    const toggleBpBtn = document.getElementById('toggleBlueprintRefBtn');
    if (toggleBpBtn) {
      toggleBpBtn.addEventListener('click', () => {
        this.toggleBlueprintReferenceViewer();
      });
    }

    const galleryBtn = document.getElementById('openGalleryBtn');
    if (galleryBtn) {
      galleryBtn.addEventListener('click', () => {
        this.renderBlueprintGallery();
        this.openModal('blueprintGalleryModal');
      });
    }

    // File / Export Dropdown
    const projectDropdown = document.getElementById('projectDropdown');
    const projectBtn = document.getElementById('projectBtn');
    projectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      projectDropdown.classList.toggle('open');
    });

    document.getElementById('exportPngBtn').addEventListener('click', () => {
      this.canvasManager.exportPNG();
      projectDropdown.classList.remove('open');
    });

    document.getElementById('exportJsonBtn').addEventListener('click', () => {
      this.canvasManager.exportJSON();
      projectDropdown.classList.remove('open');
    });

    const fileInput = document.getElementById('projectFileInput');
    document.getElementById('importJsonBtn').addEventListener('click', () => {
      fileInput.click();
      projectDropdown.classList.remove('open');
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.canvasManager.importJSON(e.target.files[0]);
        e.target.value = '';
      }
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', () => {
      projectDropdown.classList.remove('open');
    });
  }

  // --- Interactive Blueprint Reference Window ---
  initBlueprintReferenceViewer() {
    this.bpWindow = document.getElementById('blueprintRefCard');
    this.bpSelect = document.getElementById('blueprintSelect');
    this.bpImage = document.getElementById('blueprintRefImg');
    this.bpInfo = document.getElementById('blueprintRefInfo');
    this.bpCloseBtn = document.getElementById('closeBlueprintRefBtn');
    this.bpMinBtn = document.getElementById('minimizeBlueprintRefBtn');

    if (this.bpSelect) {
      this.bpSelect.addEventListener('change', (e) => {
        this.activeBlueprintKey = e.target.value;
        this.updateBlueprintReferenceView();
      });
    }

    if (this.bpCloseBtn) {
      this.bpCloseBtn.addEventListener('click', () => {
        this.bpWindow.style.display = 'none';
      });
    }

    if (this.bpMinBtn) {
      this.bpMinBtn.addEventListener('click', () => {
        this.bpWindow.classList.toggle('minimized');
        this.bpMinBtn.textContent = this.bpWindow.classList.contains('minimized') ? '▲' : '−';
      });
    }

    // Make Reference Card Draggable by Header
    this.makeDraggable(this.bpWindow, document.getElementById('blueprintRefCardHeader'));

    // Populate initial image
    this.updateBlueprintReferenceView();
  }

  toggleBlueprintReferenceViewer() {
    if (!this.bpWindow) return;
    const isHidden = this.bpWindow.style.display === 'none' || !this.bpWindow.style.display;
    this.bpWindow.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      this.updateBlueprintReferenceView();
      if (window.soundEngine) window.soundEngine.playPop();
    }
  }

  updateBlueprintReferenceView() {
    if (!this.bpImage || !window.renderBlueprintToDataURL) return;
    const bp = window.BLUEPRINTS[this.activeBlueprintKey];
    if (!bp) return;

    // Render crisp reference image
    const dataUrl = window.renderBlueprintToDataURL(this.activeBlueprintKey, 480, 320, this.isDarkTheme);
    this.bpImage.src = dataUrl;
    this.bpImage.alt = bp.name;

    if (this.bpInfo) {
      this.bpInfo.innerHTML = `
        <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
          ${bp.icon} ${bp.name}
        </div>
        <div style="font-size: 0.73rem; color: var(--text-muted); line-height: 1.35;">
          ${bp.description}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 6px; font-size: 0.7rem;">
          <span class="badge-tag">${bp.difficulty}</span>
          <span class="badge-tag" style="background: rgba(16, 185, 129, 0.12); color: var(--success);">${bp.shapeCount}</span>
        </div>
      `;
    }

    if (this.bpSelect) {
      this.bpSelect.value = this.activeBlueprintKey;
    }
  }

  renderBlueprintGallery() {
    const grid = document.getElementById('blueprintGalleryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(window.BLUEPRINTS).forEach(key => {
      const bp = window.BLUEPRINTS[key];
      const card = document.createElement('div');
      card.className = 'blueprint-gallery-card';

      const imgUrl = window.renderBlueprintToDataURL(key, 360, 240, this.isDarkTheme);

      card.innerHTML = `
        <div class="gallery-card-img-wrap">
          <img src="${imgUrl}" alt="${bp.name}" class="gallery-card-img">
          <span class="gallery-difficulty-badge">${bp.difficulty}</span>
        </div>
        <div class="gallery-card-content">
          <div class="gallery-card-title">${bp.icon} ${bp.name}</div>
          <div class="gallery-card-desc">${bp.description}</div>
          <div class="gallery-card-footer">
            <span style="font-size: 0.72rem; color: var(--text-muted);">${bp.shapeCount}</span>
            <button class="tool-btn primary gallery-select-btn" data-key="${key}">Set as Reference</button>
          </div>
        </div>
      `;

      card.querySelector('.gallery-select-btn').addEventListener('click', () => {
        this.activeBlueprintKey = key;
        this.updateBlueprintReferenceView();
        if (this.bpWindow) this.bpWindow.style.display = 'flex';
        this.closeModal('blueprintGalleryModal');
        this.showToast(`Reference set to: ${bp.name}`);
        if (window.soundEngine) window.soundEngine.playPop();
      });

      grid.appendChild(card);
    });
  }

  // --- Text Typography Controls ---
  initTextControls() {
    this.textSection = document.getElementById('textPropertiesSection');
    this.textContentInput = document.getElementById('textContentInput');
    this.fontFamilySelect = document.getElementById('fontFamilySelect');
    this.fontSizeSlider = document.getElementById('fontSizeSlider');
    this.fontSizeInput = document.getElementById('fontSizeInput');
    this.textBoldBtn = document.getElementById('textBoldBtn');
    this.textItalicBtn = document.getElementById('textItalicBtn');
    this.textAlignLeftBtn = document.getElementById('textAlignLeftBtn');
    this.textAlignCenterBtn = document.getElementById('textAlignCenterBtn');
    this.textAlignRightBtn = document.getElementById('textAlignRightBtn');

    if (this.textContentInput) {
      this.textContentInput.addEventListener('input', (e) => {
        const shape = this.canvasManager.selectedShape;
        if (shape && shape.type === 'text') {
          shape.text = e.target.value;
          this.canvasManager.requestRender();
        }
      });
      this.textContentInput.addEventListener('change', () => {
        this.canvasManager.saveState();
      });
    }

    if (this.fontFamilySelect) {
      this.fontFamilySelect.addEventListener('change', (e) => {
        const shape = this.canvasManager.selectedShape;
        if (shape && shape.type === 'text') {
          shape.fontFamily = e.target.value;
          this.canvasManager.saveState();
          this.canvasManager.requestRender();
        }
      });
    }

    if (this.fontSizeSlider && this.fontSizeInput) {
      const updateSize = (val) => {
        const size = Math.max(10, Math.min(140, parseInt(val, 10) || 32));
        this.fontSizeSlider.value = size;
        this.fontSizeInput.value = size;
        const shape = this.canvasManager.selectedShape;
        if (shape && shape.type === 'text') {
          shape.fontSize = size;
          this.canvasManager.requestRender();
        }
      };

      this.fontSizeSlider.addEventListener('input', (e) => updateSize(e.target.value));
      this.fontSizeInput.addEventListener('input', (e) => updateSize(e.target.value));
      this.fontSizeSlider.addEventListener('change', () => this.canvasManager.saveState());
      this.fontSizeInput.addEventListener('change', () => this.canvasManager.saveState());
    }

    if (this.textBoldBtn) {
      this.textBoldBtn.addEventListener('click', () => {
        const shape = this.canvasManager.selectedShape;
        if (shape && shape.type === 'text') {
          const isBold = shape.fontWeight === 'bold' || shape.fontWeight === '700';
          shape.fontWeight = isBold ? 'normal' : '700';
          this.textBoldBtn.classList.toggle('active', !isBold);
          this.canvasManager.saveState();
          this.canvasManager.requestRender();
        }
      });
    }

    if (this.textItalicBtn) {
      this.textItalicBtn.addEventListener('click', () => {
        const shape = this.canvasManager.selectedShape;
        if (shape && shape.type === 'text') {
          const isItalic = shape.fontStyle === 'italic';
          shape.fontStyle = isItalic ? 'normal' : 'italic';
          this.textItalicBtn.classList.toggle('active', !isItalic);
          this.canvasManager.saveState();
          this.canvasManager.requestRender();
        }
      });
    }

    const setAlign = (align) => {
      const shape = this.canvasManager.selectedShape;
      if (shape && shape.type === 'text') {
        shape.textAlign = align;
        this.updateAlignButtons(align);
        this.canvasManager.saveState();
        this.canvasManager.requestRender();
      }
    };

    if (this.textAlignLeftBtn) this.textAlignLeftBtn.addEventListener('click', () => setAlign('left'));
    if (this.textAlignCenterBtn) this.textAlignCenterBtn.addEventListener('click', () => setAlign('center'));
    if (this.textAlignRightBtn) this.textAlignRightBtn.addEventListener('click', () => setAlign('right'));
  }

  updateAlignButtons(align) {
    if (this.textAlignLeftBtn) this.textAlignLeftBtn.classList.toggle('active', align === 'left');
    if (this.textAlignCenterBtn) this.textAlignCenterBtn.classList.toggle('active', align === 'center');
    if (this.textAlignRightBtn) this.textAlignRightBtn.classList.toggle('active', align === 'right');
  }

  syncTextControls(shape) {
    const floatEditBtn = document.getElementById('floatEditBtn');
    if (!shape || shape.type !== 'text') {
      if (this.textSection) this.textSection.classList.add('inactive');
      if (floatEditBtn) floatEditBtn.style.display = 'none';
      return;
    }

    if (this.textSection) this.textSection.classList.remove('inactive');
    if (floatEditBtn) floatEditBtn.style.display = 'flex';

    if (this.textContentInput) this.textContentInput.value = shape.text || '';
    if (this.fontFamilySelect) this.fontFamilySelect.value = shape.fontFamily || 'Inter, sans-serif';
    if (this.fontSizeSlider) this.fontSizeSlider.value = shape.fontSize || 32;
    if (this.fontSizeInput) this.fontSizeInput.value = shape.fontSize || 32;

    if (this.textBoldBtn) {
      const isBold = shape.fontWeight === 'bold' || shape.fontWeight === '700';
      this.textBoldBtn.classList.toggle('active', isBold);
    }
    if (this.textItalicBtn) {
      this.textItalicBtn.classList.toggle('active', shape.fontStyle === 'italic');
    }
    this.updateAlignButtons(shape.textAlign || 'center');
  }

  makeDraggable(el, handle) {
    if (!el || !handle) return;
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (['BUTTON', 'SELECT'].includes(e.target.tagName)) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      el.style.right = 'auto';
      el.style.left = `${startLeft}px`;
      el.style.top = `${startTop}px`;
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.style.left = `${Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, startLeft + dx))}px`;
      el.style.top = `${Math.max(65, Math.min(window.innerHeight - el.offsetHeight - 10, startTop + dy))}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
      }
    });
  }

  showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.code === 'Space' && !this.canvasManager.isSpacePressed) {
        this.canvasManager.isSpacePressed = true;
        this.canvasManager.canvas.style.cursor = 'grab';
        e.preventDefault();
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.canvasManager.selectedShape) {
          this.canvasManager.deleteSelected();
          e.preventDefault();
        }
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.canvasManager.duplicateSelected();
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.canvasManager.undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        this.canvasManager.redo();
      }

      // Layer ordering: [ and ]
      if (e.key === '[') {
        if (e.shiftKey) this.canvasManager.sendToBack();
        else this.canvasManager.selectedShape && this.canvasManager.saveState();
      }
      if (e.key === ']') {
        if (e.shiftKey) this.canvasManager.bringToFront();
        else this.canvasManager.selectedShape && this.canvasManager.saveState();
      }

      // Arrow keys to nudge selected shape
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && this.canvasManager.selectedShape) {
        e.preventDefault();
        const dist = e.shiftKey ? 10 : 1;
        const s = this.canvasManager.selectedShape;
        if (e.key === 'ArrowUp') s.y -= dist;
        if (e.key === 'ArrowDown') s.y += dist;
        if (e.key === 'ArrowLeft') s.x -= dist;
        if (e.key === 'ArrowRight') s.x += dist;
        this.canvasManager.requestRender();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.canvasManager.isSpacePressed = false;
        this.canvasManager.canvas.style.cursor = 'default';
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && this.canvasManager.selectedShape) {
        this.canvasManager.saveState();
      }
    });
  }

  bindModals() {
    document.getElementById('shortcutsBtn').addEventListener('click', () => {
      this.openModal('shortcutsModal');
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    });
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }
}

// Start application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
