/**
 * ShapeCraft 2D - Canvas Manager & Direct Manipulation Engine
 * Handles rendering loop, grid styles, hit-testing, resizing, rotating,
 * snapping, pan/zoom, undo/redo history, and layering.
 */

class CanvasManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');

    // Shapes array (bottom to top)
    this.shapes = [];
    this.selectedShape = null;
    this.hoveredShape = null;

    // Viewport transform
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;

    // Snapping & Grid
    this.snapToGrid = false;
    this.gridSize = 20;

    // Theme: 'light' or 'dark'
    this.isDarkTheme = false;

    // History for Undo / Redo
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 40;

    // Interaction State
    this.isInteracting = false;
    this.interactionType = null; // 'drag', 'resize', 'rotate', 'pan'
    this.activeHandle = null; // 'tl', 'tr', 'br', 'bl', etc.
    this.dragStart = { x: 0, y: 0 };
    this.shapeInitialState = null;
    this.isSpacePressed = false;

    // Floating bar element
    this.floatingBar = document.getElementById('floatingSelectionBar');

    // Setup
    this.resizeCanvas();
    this.bindEvents();
    this.saveState();
    this.startRenderLoop();
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    this.width = parent.clientWidth;
    this.height = parent.clientHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.requestRender();
  }

  setTheme(isDark) {
    this.isDarkTheme = isDark;
    this.requestRender();
  }

  setSnapToGrid(enabled) {
    this.snapToGrid = enabled;
    if (enabled) {
      this.alignStructureToCenter();
    }
  }

  alignStructureToCenter() {
    if (this.shapes.length === 0) return;

    // 1. Calculate bounding box of all shapes
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of this.shapes) {
      const hw = Math.abs(s.width) / 2;
      const hh = Math.abs(s.height) / 2;
      minX = Math.min(minX, s.x - hw);
      maxX = Math.max(maxX, s.x + hw);
      minY = Math.min(minY, s.y - hh);
      maxY = Math.max(maxY, s.y + hh);
    }

    const structureCenterX = (minX + maxX) / 2;
    const structureCenterY = (minY + maxY) / 2;

    // 2. Center of canvas in world coordinates
    const canvasCenter = this.screenToWorld(this.width / 2, this.height / 2);

    let dx = canvasCenter.x - structureCenterX;
    let dy = canvasCenter.y - structureCenterY;

    // 3. Shift all shapes to align with canvas center and snap to grid
    for (const s of this.shapes) {
      s.x += dx;
      s.y += dy;
      if (this.snapToGrid) {
        s.x = Math.round(s.x / this.gridSize) * this.gridSize;
        s.y = Math.round(s.y / this.gridSize) * this.gridSize;
      }
    }

    this.saveState();
    this.requestRender();

    // Particle burst and feedback
    if (window.particleSystem) {
      window.particleSystem.burst(canvasCenter.x, canvasCenter.y, '#10b981', 22, 'sparkle');
    }
    if (window.soundEngine) {
      window.soundEngine.playPop();
    }
    if (window.app && window.app.showToast) {
      window.app.showToast('Structure centered & aligned to grid!');
    }
  }

  // --- Coordinate conversions ---
  screenToWorld(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (screenX - rect.left - this.panX) / this.zoom;
    const y = (screenY - rect.top - this.panY) / this.zoom;
    return { x, y };
  }

  worldToScreen(worldX, worldY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = worldX * this.zoom + this.panX + rect.left;
    const y = worldY * this.zoom + this.panY + rect.top;
    return { x, y };
  }

  // --- Rendering Loop ---
  startRenderLoop() {
    const render = () => {
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  requestRender() {
    // Flag if needed, loop runs via rAF
  }

  draw() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.save();
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Canvas Background & Grid
    this.drawBackground();

    // 2. Apply Pan & Zoom Transform for Shapes & Particles
    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // 3. Draw All Shapes (back to front)
    if (this.shapes.length === 0) {
      this.drawEmptyStatePrompt();
    } else {
      for (const shape of this.shapes) {
        shape.draw(this.ctx);
      }
    }

    // 4. Draw Selection Box & Handles for Selected Shape
    if (this.selectedShape) {
      this.selectedShape.drawSelection(this.ctx, this.isDarkTheme);
    }

    // 5. Update & Draw Particle System
    if (window.particleSystem) {
      window.particleSystem.update();
      window.particleSystem.render(this.ctx);
    }

    this.ctx.restore();
    this.ctx.restore();

    this.updateFloatingBarPosition();
  }

  drawBackground() {
    // Fill background
    this.ctx.fillStyle = this.isDarkTheme ? '#0f172a' : '#f8fafc';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Grid rendering with parallax
    const effectiveGrid = this.gridSize * this.zoom;
    if (effectiveGrid < 8) return; // don't draw if too small

    const startX = (this.panX % effectiveGrid);
    const startY = (this.panY % effectiveGrid);

    this.ctx.save();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.isDarkTheme ? 'rgba(51, 65, 85, 0.35)' : 'rgba(203, 213, 225, 0.5)';

    this.ctx.beginPath();
    for (let x = startX; x < this.width; x += effectiveGrid) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let y = startY; y < this.height; y += effectiveGrid) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();

    // Subtle center origin crosshair
    const originX = this.panX;
    const originY = this.panY;
    if (originX >= 0 && originX <= this.width && originY >= 0 && originY <= this.height) {
      this.ctx.strokeStyle = this.isDarkTheme ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(originX - 12, originY);
      this.ctx.lineTo(originX + 12, originY);
      this.ctx.moveTo(originX, originY - 12);
      this.ctx.lineTo(originX, originY + 12);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawEmptyStatePrompt() {
    const center = this.screenToWorld(this.width / 2, this.height / 2);
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.font = '600 15px Inter, sans-serif';
    this.ctx.fillStyle = this.isDarkTheme ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.5)';
    this.ctx.fillText('Canvas is ready for your creation', center.x, center.y - 12);

    this.ctx.font = '400 12px Inter, sans-serif';
    this.ctx.fillStyle = this.isDarkTheme ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.38)';
    this.ctx.fillText('Drag or click shapes from the left palette to build your 2D structure', center.x, center.y + 14);

    this.ctx.restore();
  }

  // --- Hit Testing & Selection ---
  findShapeAt(worldX, worldY) {
    // Iterate from top to bottom (reverse of drawing order)
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.shapes[i].containsPoint(worldX, worldY)) {
        return this.shapes[i];
      }
    }
    return null;
  }

  findHandleAt(worldX, worldY) {
    if (!this.selectedShape) return null;
    const handles = this.selectedShape.getHandles();
    const handleThreshold = 10 / this.zoom;

    // Check rotation handle first
    const distRot = Math.hypot(handles.rot.x - worldX, handles.rot.y - worldY);
    if (distRot <= handleThreshold + 3) return 'rot';

    // Check scale handles
    const keys = ['tl', 'tr', 'br', 'bl', 'tc', 'bc', 'ml', 'mr'];
    for (const key of keys) {
      const h = handles[key];
      const dist = Math.hypot(h.x - worldX, h.y - worldY);
      if (dist <= handleThreshold) {
        return key;
      }
    }
    return null;
  }

  selectShape(shape) {
    if (this.selectedShape) {
      this.selectedShape.isSelected = false;
    }
    this.selectedShape = shape;
    if (shape) {
      shape.isSelected = true;
      if (window.soundEngine) window.soundEngine.playClick();
      if (this.onShapeSelected) this.onShapeSelected(shape);
      this.showFloatingBar();
    } else {
      if (this.onShapeSelected) this.onShapeSelected(null);
      this.hideFloatingBar();
    }
    this.updateStats();
  }

  // --- Event Handling ---
  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // Pan with mouse wheel or zoom with Ctrl+wheel / wheel
    this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // Drag-over & Drop from Shape Dock
    const viewport = this.canvas.parentElement;
    viewport.addEventListener('dragover', (e) => e.preventDefault());
    viewport.addEventListener('drop', (e) => this.onDrop(e));

    // Double-click to edit text box
    this.canvas.addEventListener('dblclick', (e) => {
      const world = this.screenToWorld(e.clientX, e.clientY);
      const clickedShape = this.findShapeAt(world.x, world.y);
      if (clickedShape && clickedShape.type === 'text') {
        this.selectShape(clickedShape);
        this.startInlineTextEdit(clickedShape);
      }
    });
  }

  startInlineTextEdit(shape) {
    if (!shape || shape.type !== 'text') return;

    // Check if editor already exists
    let editor = document.getElementById('canvasInlineTextEditor');
    if (editor) editor.remove();

    editor = document.createElement('textarea');
    editor.id = 'canvasInlineTextEditor';
    editor.className = 'canvas-inline-editor';
    editor.value = shape.text;

    // Position over shape in screen coordinates
    const screenPos = this.worldToScreen(shape.x, shape.y);
    const boxW = Math.max(160, shape.width * this.zoom + 24);
    const boxH = Math.max(48, shape.height * this.zoom + 16);

    editor.style.position = 'absolute';
    editor.style.left = `${screenPos.x - boxW / 2}px`;
    editor.style.top = `${screenPos.y - boxH / 2}px`;
    editor.style.width = `${boxW}px`;
    editor.style.height = `${boxH}px`;
    editor.style.fontSize = `${Math.max(14, shape.fontSize * this.zoom)}px`;
    editor.style.fontFamily = shape.fontFamily;
    editor.style.fontWeight = shape.fontWeight;
    editor.style.fontStyle = shape.fontStyle;
    editor.style.textAlign = shape.textAlign;
    editor.style.color = shape.fillColor;

    this.canvas.parentElement.appendChild(editor);
    editor.focus();
    editor.select();

    const commit = () => {
      if (editor.parentElement) {
        shape.text = editor.value || 'Text';
        editor.remove();
        this.saveState();
        this.requestRender();
        if (window.app && window.app.colorStudio) {
          window.app.colorStudio.syncWithShape(shape);
        }
        if (window.app && window.app.syncTextControls) {
          window.app.syncTextControls(shape);
        }
      }
    };

    editor.addEventListener('input', () => {
      shape.text = editor.value;
      this.requestRender();
      if (window.app && window.app.syncTextControls) {
        window.app.syncTextControls(shape);
      }
    });

    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        editor.remove();
        this.requestRender();
      }
    });

    editor.addEventListener('blur', () => {
      commit();
    });
  }

  onMouseDown(e) {
    const world = this.screenToWorld(e.clientX, e.clientY);
    this.dragStart = { x: world.x, y: world.y };

    // Pan canvas with Middle Mouse or if Spacebar is held
    if (e.button === 1 || this.isSpacePressed) {
      this.isInteracting = true;
      this.interactionType = 'pan';
      this.panStart = { x: e.clientX - this.panX, y: e.clientY - this.panY };
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    if (e.button !== 0) return; // only left click below

    // 1. Check if clicking on an interactive handle of currently selected shape
    const handle = this.findHandleAt(world.x, world.y);
    if (handle) {
      this.isInteracting = true;
      this.interactionType = handle === 'rot' ? 'rotate' : 'resize';
      this.activeHandle = handle;
      this.shapeInitialState = {
        x: this.selectedShape.x,
        y: this.selectedShape.y,
        width: this.selectedShape.width,
        height: this.selectedShape.height,
        rotation: this.selectedShape.rotation
      };
      return;
    }

    // 2. Check if clicking directly on a shape
    const clickedShape = this.findShapeAt(world.x, world.y);
    if (clickedShape) {
      this.selectShape(clickedShape);
      this.isInteracting = true;
      this.interactionType = 'drag';
      this.shapeInitialState = {
        x: clickedShape.x,
        y: clickedShape.y
      };
      this.dragOffset = {
        x: world.x - clickedShape.x,
        y: world.y - clickedShape.y
      };
    } else {
      // Clicked on empty canvas -> deselect
      this.selectShape(null);
    }
  }

  onMouseMove(e) {
    const world = this.screenToWorld(e.clientX, e.clientY);

    // Active Interaction
    if (this.isInteracting) {
      if (this.interactionType === 'pan') {
        this.panX = e.clientX - this.panStart.x;
        this.panY = e.clientY - this.panStart.y;
      } else if (this.interactionType === 'drag' && this.selectedShape) {
        let newX = world.x - this.dragOffset.x;
        let newY = world.y - this.dragOffset.y;

        if (this.snapToGrid) {
          newX = Math.round(newX / this.gridSize) * this.gridSize;
          newY = Math.round(newY / this.gridSize) * this.gridSize;
        }

        this.selectedShape.x = newX;
        this.selectedShape.y = newY;
      } else if (this.interactionType === 'rotate' && this.selectedShape) {
        const dx = world.x - this.selectedShape.x;
        const dy = world.y - this.selectedShape.y;
        let angle = Math.atan2(dy, dx) + Math.PI / 2;

        // Snap to 15 degrees if Shift is pressed
        if (e.shiftKey) {
          const step = Math.PI / 12;
          angle = Math.round(angle / step) * step;
        }

        this.selectedShape.rotation = angle;
      } else if (this.interactionType === 'resize' && this.selectedShape) {
        this.handleResize(world.x, world.y, e.shiftKey);
      }
      return;
    }

    // Hover State & Cursor management
    if (this.isSpacePressed) {
      this.canvas.style.cursor = 'grab';
      return;
    }

    const handle = this.findHandleAt(world.x, world.y);
    if (handle) {
      this.canvas.style.cursor = this.getCursorForHandle(handle);
      return;
    }

    const hovered = this.findShapeAt(world.x, world.y);
    if (hovered !== this.hoveredShape) {
      if (this.hoveredShape) this.hoveredShape.isHovered = false;
      this.hoveredShape = hovered;
      if (this.hoveredShape) this.hoveredShape.isHovered = true;
    }

    this.canvas.style.cursor = hovered ? 'move' : 'default';
  }

  onMouseUp() {
    if (this.isInteracting) {
      // Check if shape was altered and save state for undo
      if (this.interactionType === 'drag' || this.interactionType === 'resize' || this.interactionType === 'rotate') {
        this.saveState();
      }
      this.isInteracting = false;
      this.interactionType = null;
      this.activeHandle = null;
      this.canvas.style.cursor = 'default';
    }
  }

  handleResize(worldX, worldY, preserveAspect) {
    const s = this.selectedShape;
    const init = this.shapeInitialState;
    if (!s || !init) return;

    // Convert mouse position to shape's initial local coordinate system
    const cos = Math.cos(-init.rotation);
    const sin = Math.sin(-init.rotation);
    const dx = worldX - init.x;
    const dy = worldY - init.y;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    let newW = init.width;
    let newH = init.height;
    let centerShiftX = 0;
    let centerShiftY = 0;

    const minSize = 15;

    switch (this.activeHandle) {
      case 'br':
        newW = Math.max(minSize, localX + init.width / 2);
        newH = Math.max(minSize, localY + init.height / 2);
        centerShiftX = (newW - init.width) / 2;
        centerShiftY = (newH - init.height) / 2;
        break;
      case 'bl':
        newW = Math.max(minSize, init.width / 2 - localX);
        newH = Math.max(minSize, localY + init.height / 2);
        centerShiftX = -(newW - init.width) / 2;
        centerShiftY = (newH - init.height) / 2;
        break;
      case 'tr':
        newW = Math.max(minSize, localX + init.width / 2);
        newH = Math.max(minSize, init.height / 2 - localY);
        centerShiftX = (newW - init.width) / 2;
        centerShiftY = -(newH - init.height) / 2;
        break;
      case 'tl':
        newW = Math.max(minSize, init.width / 2 - localX);
        newH = Math.max(minSize, init.height / 2 - localY);
        centerShiftX = -(newW - init.width) / 2;
        centerShiftY = -(newH - init.height) / 2;
        break;
      case 'mr':
        newW = Math.max(minSize, localX + init.width / 2);
        centerShiftX = (newW - init.width) / 2;
        break;
      case 'ml':
        newW = Math.max(minSize, init.width / 2 - localX);
        centerShiftX = -(newW - init.width) / 2;
        break;
      case 'bc':
        newH = Math.max(minSize, localY + init.height / 2);
        centerShiftY = (newH - init.height) / 2;
        break;
      case 'tc':
        newH = Math.max(minSize, init.height / 2 - localY);
        centerShiftY = -(newH - init.height) / 2;
        break;
    }

    if (preserveAspect && ['tl', 'tr', 'br', 'bl'].includes(this.activeHandle)) {
      const aspect = init.width / init.height;
      if (newW / newH > aspect) {
        newW = newH * aspect;
      } else {
        newH = newW / aspect;
      }
    }

    // Apply transformed center shift back to world coordinates
    const worldCos = Math.cos(init.rotation);
    const worldSin = Math.sin(init.rotation);
    s.x = init.x + (centerShiftX * worldCos - centerShiftY * worldSin);
    s.y = init.y + (centerShiftX * worldSin + centerShiftY * worldCos);
    s.width = Math.round(newW);
    s.height = Math.round(newH);
  }

  getCursorForHandle(handle) {
    if (handle === 'rot') return 'crosshair';
    const angleMap = {
      tl: 315, tr: 45, br: 135, bl: 225,
      tc: 0, bc: 180, ml: 270, mr: 90
    };
    let deg = (angleMap[handle] + (this.selectedShape.rotation * 180) / Math.PI) % 360;
    if (deg < 0) deg += 360;

    if ((deg >= 337.5 || deg < 22.5) || (deg >= 157.5 && deg < 202.5)) return 'ns-resize';
    if ((deg >= 22.5 && deg < 67.5) || (deg >= 202.5 && deg < 247.5)) return 'nesw-resize';
    if ((deg >= 67.5 && deg < 112.5) || (deg >= 247.5 && deg < 292.5)) return 'ew-resize';
    return 'nwse-resize';
  }

  onWheel(e) {
    e.preventDefault();
    const zoomFactor = 1.1;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldZoom = this.zoom;
    let newZoom = e.deltaY < 0 ? oldZoom * zoomFactor : oldZoom / zoomFactor;
    newZoom = Math.min(Math.max(newZoom, 0.2), 4.0);

    // Zoom centered around cursor
    this.panX = mouseX - (mouseX - this.panX) * (newZoom / oldZoom);
    this.panY = mouseY - (mouseY - this.panY) * (newZoom / oldZoom);
    this.zoom = newZoom;

    this.updateZoomDisplay();
  }

  updateZoomDisplay() {
    const el = document.getElementById('zoomLevelLabel');
    if (el) el.textContent = `${Math.round(this.zoom * 100)}%`;
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 4.0);
    this.updateZoomDisplay();
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.2);
    this.updateZoomDisplay();
  }

  resetZoom() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.updateZoomDisplay();
  }

  // --- Drag and Drop from Shape Library ---
  onDrop(e) {
    e.preventDefault();
    const shapeType = e.dataTransfer.getData('shapeType');
    if (!shapeType) return;

    const world = this.screenToWorld(e.clientX, e.clientY);
    this.addShape(shapeType, world.x, world.y);
  }

  addShape(type, x, y, options = {}) {
    let w = 110, h = 110;
    if (type === 'text') {
      w = 200; h = 50;
    } else if (['capsule', 'rectangle'].includes(type)) {
      w = 140; h = 80;
    } else if (['arch', 'trapezoid'].includes(type)) {
      w = 100; h = 120;
    }

    if (x === undefined) {
      // Place near center of canvas in world coordinates
      const center = this.screenToWorld(this.width / 2, this.height / 2);
      x = center.x + (Math.random() - 0.5) * 40;
      y = center.y + (Math.random() - 0.5) * 40;
    }

    if (this.snapToGrid) {
      x = Math.round(x / this.gridSize) * this.gridSize;
      y = Math.round(y / this.gridSize) * this.gridSize;
    }

    const activeColor = (window.app && window.app.colorStudio && window.app.colorStudio.currentColor) || (this.isDarkTheme ? '#818cf8' : '#6366f1');
    const defaultColor = options.fillColor || activeColor;
    const defaultStroke = options.strokeColor || (this.isDarkTheme ? '#4f46e5' : '#312e81');

    const shape = new Shape({
      type: type,
      x: x,
      y: y,
      width: options.width || w,
      height: options.height || h,
      fillColor: defaultColor,
      strokeColor: defaultStroke,
      strokeWidth: options.strokeWidth !== undefined ? options.strokeWidth : (type === 'text' ? 0 : 2),
      ...options
    });

    this.shapes.push(shape);
    this.selectShape(shape);
    this.saveState();

    // Sound and particle burst
    if (window.soundEngine) window.soundEngine.playPop();
    if (window.particleSystem) window.particleSystem.burst(x, y, defaultColor, 18, 'sparkle');

    this.updateStats();
  }

  // --- Shape Operations ---
  duplicateSelected() {
    if (!this.selectedShape) return;
    const clone = this.selectedShape.clone(30);
    this.shapes.push(clone);
    this.selectShape(clone);
    this.saveState();

    if (window.soundEngine) window.soundEngine.playDuplicate();
    if (window.particleSystem) window.particleSystem.burst(clone.x, clone.y, clone.fillColor, 12, 'confetti');
    this.updateStats();
  }

  deleteSelected() {
    if (!this.selectedShape) return;
    const idx = this.shapes.indexOf(this.selectedShape);
    if (idx !== -1) {
      const removed = this.shapes.splice(idx, 1)[0];
      if (window.particleSystem) {
        window.particleSystem.poof(removed.x, removed.y, removed.fillColor, 16);
      }
      if (window.soundEngine) window.soundEngine.playDelete();
      this.selectShape(null);
      this.saveState();
      this.updateStats();
    }
  }

  bringToFront() {
    if (!this.selectedShape) return;
    const idx = this.shapes.indexOf(this.selectedShape);
    if (idx !== -1 && idx < this.shapes.length - 1) {
      this.shapes.splice(idx, 1);
      this.shapes.push(this.selectedShape);
      this.saveState();
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  sendToBack() {
    if (!this.selectedShape) return;
    const idx = this.shapes.indexOf(this.selectedShape);
    if (idx > 0) {
      this.shapes.splice(idx, 1);
      this.shapes.unshift(this.selectedShape);
      this.saveState();
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  flipHorizontal() {
    if (!this.selectedShape) return;
    this.selectedShape.flipX = !this.selectedShape.flipX;
    this.saveState();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  flipVertical() {
    if (!this.selectedShape) return;
    this.selectedShape.flipY = !this.selectedShape.flipY;
    this.saveState();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  clearCanvas() {
    if (this.shapes.length === 0) return;
    this.shapes = [];
    this.selectShape(null);
    this.saveState();
    if (window.soundEngine) window.soundEngine.playClear();
    this.updateStats();
  }

  loadTemplate(templateKey) {
    const data = window.TEMPLATES[templateKey];
    if (!data) return;

    this.shapes = [];
    this.selectShape(null);

    // Calculate bounding box of template to center it automatically
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const item of data.shapes) {
      minX = Math.min(minX, item.x - Math.abs(item.width) / 2);
      maxX = Math.max(maxX, item.x + Math.abs(item.width) / 2);
      minY = Math.min(minY, item.y - Math.abs(item.height) / 2);
      maxY = Math.max(maxY, item.y + Math.abs(item.height) / 2);
    }

    const tWidth = maxX - minX;
    const tHeight = maxY - minY;
    const tCenterX = minX + tWidth / 2;
    const tCenterY = minY + tHeight / 2;

    const canvasCenter = this.screenToWorld(this.width / 2, this.height / 2);
    const offsetX = canvasCenter.x - tCenterX;
    const offsetY = canvasCenter.y - tCenterY;

    data.shapes.forEach((item) => {
      this.shapes.push(new Shape({
        ...item,
        x: item.x + offsetX,
        y: item.y + offsetY
      }));
    });

    this.saveState();
    if (window.soundEngine) window.soundEngine.playWhoosh();
    this.updateStats();
  }

  updateSelectedShapeProperty(prop, value) {
    if (!this.selectedShape) return;
    this.selectedShape[prop] = value;
    this.requestRender();
  }

  // --- Floating Bar Position ---
  showFloatingBar() {
    if (this.floatingBar) {
      this.floatingBar.classList.add('active');
    }
  }

  hideFloatingBar() {
    if (this.floatingBar) {
      this.floatingBar.classList.remove('active');
    }
  }

  updateFloatingBarPosition() {
    if (!this.selectedShape || !this.floatingBar) return;
    // Keep it pinned cleanly near top center of the canvas viewport
  }

  // --- History & Undo / Redo ---
  saveState() {
    // Truncate future states if we were in the middle of history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    const snapshot = this.shapes.map(s => ({
      id: s.id,
      type: s.type,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
      rotation: s.rotation,
      flipX: s.flipX,
      flipY: s.flipY,
      fillColor: s.fillColor,
      strokeColor: s.strokeColor,
      strokeWidth: s.strokeWidth,
      strokeStyle: s.strokeStyle,
      opacity: s.opacity,
      shadowBlur: s.shadowBlur,
      shadowColor: s.shadowColor,
      text: s.text,
      fontSize: s.fontSize,
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight,
      fontStyle: s.fontStyle,
      textAlign: s.textAlign
    }));

    this.history.push(JSON.stringify(snapshot));
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;

    this.updateUndoRedoButtons();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromSnapshot(this.history[this.historyIndex]);
      if (window.soundEngine) window.soundEngine.playClick();
      this.updateUndoRedoButtons();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromSnapshot(this.history[this.historyIndex]);
      if (window.soundEngine) window.soundEngine.playClick();
      this.updateUndoRedoButtons();
    }
  }

  restoreFromSnapshot(jsonString) {
    const data = JSON.parse(jsonString);
    this.shapes = data.map(item => new Shape(item));
    this.selectShape(null);
    this.updateStats();
    this.requestRender();
  }

  updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
  }

  updateStats() {
    const countEl = document.getElementById('shapeCountLabel');
    const selectEl = document.getElementById('selectedShapeInfoLabel');
    if (countEl) countEl.textContent = `${this.shapes.length} shape${this.shapes.length === 1 ? '' : 's'}`;
    if (selectEl) {
      if (this.selectedShape) {
        selectEl.textContent = `Selected: ${this.selectedShape.type.toUpperCase()} (${Math.round(this.selectedShape.width)}×${Math.round(this.selectedShape.height)})`;
      } else {
        selectEl.textContent = 'No shape selected';
      }
    }
  }

  // --- Export / Import ---
  exportPNG() {
    // Render clean image without selection box or background grids
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = this.width;
    exportCanvas.height = this.height;
    const expCtx = exportCanvas.getContext('2d');

    // Fill background according to theme
    expCtx.fillStyle = this.isDarkTheme ? '#0f172a' : '#ffffff';
    expCtx.fillRect(0, 0, this.width, this.height);

    // Apply zoom & pan
    expCtx.save();
    expCtx.translate(this.panX, this.panY);
    expCtx.scale(this.zoom, this.zoom);

    for (const shape of this.shapes) {
      shape.draw(expCtx);
    }
    expCtx.restore();

    // Trigger download
    const link = document.createElement('a');
    link.download = `shapecraft-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();

    if (window.soundEngine) window.soundEngine.playPop();
  }

  exportJSON() {
    const data = {
      version: '1.0',
      timestamp: Date.now(),
      isDarkTheme: this.isDarkTheme,
      shapes: this.shapes.map(s => ({
        type: s.type,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        rotation: s.rotation,
        flipX: s.flipX,
        flipY: s.flipY,
        fillColor: s.fillColor,
        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        strokeStyle: s.strokeStyle,
        opacity: s.opacity,
        shadowBlur: s.shadowBlur,
        shadowColor: s.shadowColor,
        text: s.text,
        fontSize: s.fontSize,
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
        textAlign: s.textAlign
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `shapecraft-project-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.shapes && Array.isArray(data.shapes)) {
          this.shapes = data.shapes.map(s => new Shape(s));
          if (data.isDarkTheme !== undefined && window.app) {
            window.app.setTheme(data.isDarkTheme);
          }
          this.selectShape(null);
          this.saveState();
          this.updateStats();
          if (window.soundEngine) window.soundEngine.playWhoosh();
        }
      } catch (err) {
        alert('Invalid ShapeCraft project JSON file.');
      }
    };
    reader.readAsText(file);
  }
}

window.CanvasManager = CanvasManager;
