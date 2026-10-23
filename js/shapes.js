/**
 * ShapeCraft 2D - Shape Definitions & Rendering Engine
 * Contains all geometric primitives, path generators, and precise hit-testing.
 */

class Shape {
  static hitCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  static hitCtx = Shape.hitCanvas ? Shape.hitCanvas.getContext('2d') : null;

  constructor(options = {}) {
    this.id = options.id || 'shape_' + Math.random().toString(36).substr(2, 9);
    this.type = options.type || 'rectangle';
    
    // Position (Center based)
    this.x = options.x !== undefined ? options.x : 200;
    this.y = options.y !== undefined ? options.y : 200;
    this.width = Math.abs(options.width !== undefined ? options.width : 120);
    this.height = Math.abs(options.height !== undefined ? options.height : 120);
    this.rotation = options.rotation || 0; // in radians

    // Flips
    this.flipX = options.flipX || (options.width < 0);
    this.flipY = options.flipY || (options.height < 0);

    // Styling
    this.fillColor = options.fillColor || '#6366f1';
    this.strokeColor = options.strokeColor || '#312e81';
    this.strokeWidth = options.strokeWidth !== undefined ? options.strokeWidth : 2;
    this.strokeStyle = options.strokeStyle || 'solid'; // 'solid' | 'dashed'
    this.opacity = options.opacity !== undefined ? options.opacity : 1;
    
    // Effects
    this.shadowBlur = options.shadowBlur || 0;
    this.shadowColor = options.shadowColor || 'rgba(0,0,0,0.3)';

    // Text specific properties
    this.text = options.text !== undefined ? options.text : (this.type === 'text' ? 'Double Click to Edit' : '');
    this.fontSize = options.fontSize || 32;
    this.fontFamily = options.fontFamily || 'Inter, sans-serif';
    this.fontWeight = options.fontWeight || '700'; // 'normal', 'bold', '700', '800'
    this.fontStyle = options.fontStyle || 'normal'; // 'normal', 'italic'
    this.textAlign = options.textAlign || 'center'; // 'left', 'center', 'right'

    // State
    this.isHovered = false;
    this.isSelected = false;
  }

  clone(offset = 25) {
    return new Shape({
      type: this.type,
      x: this.x + offset,
      y: this.y + offset,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      flipX: this.flipX,
      flipY: this.flipY,
      fillColor: this.fillColor,
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokeStyle: this.strokeStyle,
      opacity: this.opacity,
      shadowBlur: this.shadowBlur,
      shadowColor: this.shadowColor,
      text: this.text,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      textAlign: this.textAlign
    });
  }

  /**
   * Convert world point to local shape coordinate space
   */
  toLocal(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    let lx = dx * cos - dy * sin;
    let ly = dx * sin + dy * cos;
    if (this.flipX) lx = -lx;
    if (this.flipY) ly = -ly;
    return { x: lx, y: ly };
  }

  /**
   * Convert local point to world coordinate space
   */
  toWorld(lx, ly) {
    if (this.flipX) lx = -lx;
    if (this.flipY) ly = -ly;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    return {
      x: this.x + (lx * cos - ly * sin),
      y: this.y + (lx * sin + ly * cos)
    };
  }

  /**
   * Precise hit test in local coordinate space
   */
  containsPoint(worldX, worldY) {
    const local = this.toLocal(worldX, worldY);
    const lx = local.x;
    const ly = local.y;
    const hw = this.width / 2;
    const hh = this.height / 2;

    // Quick bounding box check
    const margin = Math.max(6, (this.strokeWidth || 0) / 2);
    if (Math.abs(lx) > hw + margin || Math.abs(ly) > hh + margin) {
      return false;
    }

    if (['rectangle', 'square', 'text'].includes(this.type)) {
      return Math.abs(lx) <= hw && Math.abs(ly) <= hh;
    }

    if (['circle', 'ellipse'].includes(this.type)) {
      return (lx * lx) / (hw * hw) + (ly * ly) / (hh * hh) <= 1;
    }

    if (Shape.hitCtx) {
      Shape.hitCtx.beginPath();
      this.createPath(Shape.hitCtx);
      return Shape.hitCtx.isPointInPath(lx, ly);
    }

    return Math.abs(lx) <= hw && Math.abs(ly) <= hh;
  }

  /**
   * Generates the path in local coordinate space (0,0 centered)
   */
  createPath(ctx) {
    const w = this.width;
    const h = this.height;
    const hw = w / 2;
    const hh = h / 2;

    switch (this.type) {
      case 'rectangle':
      case 'square':
      case 'text':
        ctx.rect(-hw, -hh, w, h);
        break;

      case 'rounded-rect': {
        const r = Math.min(hw, hh, 18);
        ctx.beginPath();
        ctx.moveTo(-hw + r, -hh);
        ctx.lineTo(hw - r, -hh);
        ctx.quadraticCurveTo(hw, -hh, hw, -hh + r);
        ctx.lineTo(hw, hh - r);
        ctx.quadraticCurveTo(hw, hh, hw - r, hh);
        ctx.lineTo(-hw + r, hh);
        ctx.quadraticCurveTo(-hw, hh, -hw, hh - r);
        ctx.lineTo(-hw, -hh + r);
        ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
        ctx.closePath();
        break;
      }

      case 'circle':
      case 'ellipse':
        ctx.ellipse(0, 0, Math.max(1, hw), Math.max(1, hh), 0, 0, Math.PI * 2);
        break;

      case 'semi-circle':
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1, hw), Math.max(1, hh), 0, Math.PI, 0, false);
        ctx.closePath();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
        break;

      case 'right-triangle':
        ctx.beginPath();
        ctx.moveTo(-hw, -hh);
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(hw, 0);
        ctx.lineTo(0, hh);
        ctx.lineTo(-hw, 0);
        ctx.closePath();
        break;

      case 'trapezoid':
        ctx.beginPath();
        ctx.moveTo(-hw * 0.55, -hh);
        ctx.lineTo(hw * 0.55, -hh);
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
        break;

      case 'parallelogram':
        ctx.beginPath();
        ctx.moveTo(-hw * 0.5, -hh);
        ctx.lineTo(hw, -hh);
        ctx.lineTo(hw * 0.5, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
        break;

      case 'arch':
        ctx.beginPath();
        ctx.moveTo(-hw, hh);
        ctx.lineTo(-hw, 0);
        ctx.ellipse(0, 0, Math.max(1, hw), Math.max(1, hh), 0, Math.PI, 0, false);
        ctx.lineTo(hw, hh);
        ctx.closePath();
        break;

      case 'hexagon': {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const x = hw * Math.cos(angle);
          const y = hh * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }

      case 'octagon': {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i - Math.PI / 8;
          const x = hw * Math.cos(angle);
          const y = hh * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }

      case 'star': {
        // 5-pointed star
        ctx.beginPath();
        const points = 5;
        const outerR = Math.min(hw, hh);
        const innerR = outerR * 0.45;
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / points) * i - Math.PI / 2;
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }

      case 'star-4': {
        // 4-pointed diamond star
        ctx.beginPath();
        const points = 4;
        const outerR = Math.min(hw, hh);
        const innerR = outerR * 0.32;
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / points) * i - Math.PI / 2;
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
      }

      case 'heart': {
        ctx.beginPath();
        const topCurveH = hh * 0.6;
        ctx.moveTo(0, topCurveH - hh);
        // Left lobe
        ctx.bezierCurveTo(
          -hw * 1.15, -hh * 0.6,
          -hw * 1.15, hh * 0.25,
          0, hh
        );
        // Right lobe
        ctx.bezierCurveTo(
          hw * 1.15, hh * 0.25,
          hw * 1.15, -hh * 0.6,
          0, topCurveH - hh
        );
        ctx.closePath();
        break;
      }

      case 'cloud': {
        ctx.beginPath();
        ctx.arc(-hw * 0.45, hh * 0.2, hw * 0.45, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(-hw * 0.15, -hh * 0.25, hw * 0.5, Math.PI * 1, Math.PI * 1.85);
        ctx.arc(hw * 0.35, -hh * 0.1, hw * 0.42, Math.PI * 1.5, Math.PI * 2.2);
        ctx.arc(hw * 0.45, hh * 0.2, hw * 0.38, Math.PI * 1.8, Math.PI * 0.5);
        ctx.closePath();
        break;
      }

      case 'crescent': {
        ctx.beginPath();
        ctx.arc(0, 0, hw, -Math.PI * 0.4, Math.PI * 0.75, false);
        ctx.bezierCurveTo(hw * 0.2, hh * 0.5, hw * 0.2, -hh * 0.5, 0, -hw);
        ctx.closePath();
        break;
      }

      case 'capsule': {
        ctx.beginPath();
        if (hw > hh) {
          ctx.arc(-hw + hh, 0, hh, Math.PI * 0.5, Math.PI * 1.5);
          ctx.arc(hw - hh, 0, hh, -Math.PI * 0.5, Math.PI * 0.5);
        } else {
          ctx.arc(0, -hh + hw, hw, Math.PI * 1, Math.PI * 2);
          ctx.arc(0, hh - hw, hw, 0, Math.PI);
        }
        ctx.closePath();
        break;
      }

      default:
        ctx.rect(-hw, -hh, w, h);
        break;
    }
  }

  /**
   * Render the shape on the canvas
   */
  draw(ctx) {
    ctx.save();

    // Position and rotation
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.flipX || this.flipY) {
      ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
    }

    // Global opacity
    ctx.globalAlpha = this.opacity;

    // Shadow & glow
    if (this.shadowBlur > 0) {
      ctx.shadowBlur = this.shadowBlur;
      ctx.shadowColor = this.shadowColor;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
    }

    // Special handling for text box
    if (this.type === 'text') {
      const fontStr = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
      ctx.font = fontStr;
      ctx.textAlign = this.textAlign;
      ctx.textBaseline = 'middle';

      const lines = (this.text || ' ').split('\n');
      const lineHeight = this.fontSize * 1.25;
      const totalH = lines.length * lineHeight;

      // Calculate width dynamically based on text
      let maxW = 40;
      for (const line of lines) {
        const m = ctx.measureText(line);
        if (m.width > maxW) maxW = m.width;
      }
      this.width = maxW + 24;
      this.height = Math.max(this.fontSize + 16, totalH + 16);

      const startY = -totalH / 2 + lineHeight / 2;

      for (let i = 0; i < lines.length; i++) {
        const lineY = startY + i * lineHeight;
        let lineX = 0;
        if (this.textAlign === 'left') lineX = -this.width / 2 + 12;
        else if (this.textAlign === 'right') lineX = this.width / 2 - 12;

        // Fill text with selected text colour
        ctx.fillStyle = this.fillColor;
        ctx.fillText(lines[i], lineX, lineY);

        // Stroke text if outline is active
        if (this.strokeWidth > 0 && this.strokeColor !== 'transparent') {
          ctx.lineWidth = this.strokeWidth;
          ctx.strokeStyle = this.strokeColor;
          ctx.strokeText(lines[i], lineX, lineY);
        }
      }

      // Hover halo effect
      if (this.isHovered && !this.isSelected) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
      }

      ctx.restore();
      return;
    }

    // Begin drawing the path
    ctx.beginPath();
    this.createPath(ctx);

    // Fill
    ctx.fillStyle = this.fillColor;
    ctx.fill();

    // Stroke
    if (this.strokeWidth > 0 && this.strokeColor !== 'transparent') {
      ctx.lineWidth = this.strokeWidth;
      ctx.strokeStyle = this.strokeColor;
      if (this.strokeStyle === 'dashed') {
        ctx.setLineDash([8, 6]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
    }

    // Hover halo effect
    if (this.isHovered && !this.isSelected) {
      ctx.shadowBlur = 0;
      ctx.lineWidth = Math.max(2, this.strokeWidth + 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Returns transformed bounding coordinates for selection box & handles
   */
  getHandles() {
    const hw = this.width / 2;
    const hh = this.height / 2;

    // 8 resize handles + 1 rotation handle
    return {
      tl: this.toWorld(-hw, -hh),
      tr: this.toWorld(hw, -hh),
      br: this.toWorld(hw, hh),
      bl: this.toWorld(-hw, hh),
      tc: this.toWorld(0, -hh),
      bc: this.toWorld(0, hh),
      ml: this.toWorld(-hw, 0),
      mr: this.toWorld(hw, 0),
      rot: this.toWorld(0, -hh - 28) // Rotation handle above top-center
    };
  }

  /**
   * Draw selection bounding box and interactive transform handles
   */
  drawSelection(ctx, isDarkTheme = false) {
    const handles = this.getHandles();
    ctx.save();

    // Bounding outline
    ctx.beginPath();
    ctx.moveTo(handles.tl.x, handles.tl.y);
    ctx.lineTo(handles.tr.x, handles.tr.y);
    ctx.lineTo(handles.br.x, handles.br.y);
    ctx.lineTo(handles.bl.x, handles.bl.y);
    ctx.closePath();

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();

    // Stem connecting top center handle to rotation handle
    ctx.beginPath();
    ctx.moveTo(handles.tc.x, handles.tc.y);
    ctx.lineTo(handles.rot.x, handles.rot.y);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.stroke();

    // Draw handles
    const handleRadius = 4.5;
    const handleKeys = ['tl', 'tr', 'br', 'bl', 'tc', 'bc', 'ml', 'mr'];

    for (const key of handleKeys) {
      const h = handles[key];
      ctx.fillStyle = isDarkTheme ? '#1e293b' : '#ffffff';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(h.x - handleRadius, h.y - handleRadius, handleRadius * 2, handleRadius * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Draw rotation handle (circle)
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(handles.rot.x, handles.rot.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

window.Shape = Shape;
