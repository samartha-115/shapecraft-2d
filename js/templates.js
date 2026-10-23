/**
 * ShapeCraft 2D - Reference Blueprints Catalog & Image Generator
 * 5 distinct 2D structures designed as visual reference images for users to build.
 */

window.BLUEPRINTS = {
  cottage: {
    id: 'cottage',
    name: 'Cozy Cottage & Garden',
    icon: '🏡',
    description: 'A charming countryside house with chimney, arch door, attic window, sun, and garden tree.',
    difficulty: 'Easy',
    shapeCount: '18 shapes',
    shapes: [
      // Ground / Lawn
      { type: 'rectangle', x: 450, y: 550, width: 800, height: 70, fillColor: '#22c55e', strokeColor: '#15803d', strokeWidth: 2, rotation: 0 },
      // Sun
      { type: 'circle', x: 750, y: 130, width: 90, height: 90, fillColor: '#facc15', strokeColor: '#eab308', strokeWidth: 3, rotation: 0 },
      // Sun sparkle
      { type: 'star-4', x: 670, y: 90, width: 35, height: 35, fillColor: '#fef08a', strokeColor: '#facc15', strokeWidth: 1, rotation: 0.3 },
      // Clouds
      { type: 'cloud', x: 200, y: 130, width: 140, height: 80, fillColor: '#e2e8f0', strokeColor: '#cbd5e1', strokeWidth: 2, rotation: 0 },
      { type: 'cloud', x: 480, y: 100, width: 120, height: 70, fillColor: '#f1f5f9', strokeColor: '#cbd5e1', strokeWidth: 2, rotation: 0 },
      // Chimney
      { type: 'rectangle', x: 500, y: 240, width: 40, height: 90, fillColor: '#b91c1c', strokeColor: '#7f1d1d', strokeWidth: 2, rotation: 0 },
      // Smoke
      { type: 'cloud', x: 520, y: 175, width: 50, height: 35, fillColor: '#94a3b8', strokeColor: '#64748b', strokeWidth: 1.5, opacity: 0.7, rotation: 0.2 },
      // House Body
      { type: 'rectangle', x: 420, y: 390, width: 260, height: 230, fillColor: '#fed7aa', strokeColor: '#c2410c', strokeWidth: 3, rotation: 0 },
      // Roof
      { type: 'triangle', x: 420, y: 215, width: 320, height: 160, fillColor: '#ea580c', strokeColor: '#9a3412', strokeWidth: 3, rotation: 0 },
      // Attic Round Window
      { type: 'circle', x: 420, y: 220, width: 44, height: 44, fillColor: '#bae6fd', strokeColor: '#0284c7', strokeWidth: 2, rotation: 0 },
      // Door
      { type: 'arch', x: 420, y: 440, width: 64, height: 110, fillColor: '#78350f', strokeColor: '#451a03', strokeWidth: 2.5, rotation: 0 },
      // Door Knob
      { type: 'circle', x: 440, y: 445, width: 8, height: 8, fillColor: '#facc15', strokeColor: '#ca8a04', strokeWidth: 1, rotation: 0 },
      // Left Window
      { type: 'rounded-rect', x: 335, y: 360, width: 54, height: 64, fillColor: '#bae6fd', strokeColor: '#0284c7', strokeWidth: 2.5, rotation: 0 },
      // Right Window
      { type: 'rounded-rect', x: 505, y: 360, width: 54, height: 64, fillColor: '#bae6fd', strokeColor: '#0284c7', strokeWidth: 2.5, rotation: 0 },
      // Tree Trunk
      { type: 'rectangle', x: 190, y: 440, width: 32, height: 150, fillColor: '#854d0e', strokeColor: '#582c06', strokeWidth: 2, rotation: 0 },
      // Tree Leaves
      { type: 'circle', x: 190, y: 330, width: 140, height: 140, fillColor: '#15803d', strokeColor: '#166534', strokeWidth: 3, rotation: 0 },
      { type: 'circle', x: 170, y: 300, width: 100, height: 100, fillColor: '#16a34a', strokeColor: '#15803d', strokeWidth: 2, rotation: 0 },
      // Flower Bush
      { type: 'heart', x: 260, y: 505, width: 30, height: 30, fillColor: '#ec4899', strokeColor: '#be185d', strokeWidth: 1.5, rotation: 0 }
    ]
  },

  rocket: {
    id: 'rocket',
    name: 'Cosmic Rocket & Galaxy',
    icon: '🚀',
    description: 'An adventurous spacecraft blasting through space with thruster flames, porthole, and celestial stars.',
    difficulty: 'Medium',
    shapeCount: '17 shapes',
    shapes: [
      // Space Background Elements
      { type: 'crescent', x: 680, y: 150, width: 80, height: 80, fillColor: '#fef08a', strokeColor: '#eab308', strokeWidth: 2, rotation: -0.3 },
      { type: 'star', x: 220, y: 130, width: 36, height: 36, fillColor: '#38bdf8', strokeColor: '#0284c7', strokeWidth: 1.5, rotation: 0.2 },
      { type: 'star', x: 340, y: 220, width: 24, height: 24, fillColor: '#c084fc', strokeColor: '#9333ea', strokeWidth: 1, rotation: 0.5 },
      { type: 'star-4', x: 620, y: 280, width: 40, height: 40, fillColor: '#f472b6', strokeColor: '#db2777', strokeWidth: 1.5, rotation: 0 },
      { type: 'star-4', x: 190, y: 430, width: 30, height: 30, fillColor: '#fbbf24', strokeColor: '#d97706', strokeWidth: 1, rotation: 0.4 },
      // Planet
      { type: 'circle', x: 160, y: 280, width: 90, height: 90, fillColor: '#818cf8', strokeColor: '#4f46e5', strokeWidth: 3, rotation: 0 },
      { type: 'ellipse', x: 160, y: 280, width: 140, height: 26, fillColor: 'transparent', strokeColor: '#c7d2fe', strokeWidth: 4, rotation: -0.35 },
      // Exhaust Flames
      { type: 'triangle', x: 450, y: 520, width: 70, height: 110, fillColor: '#f97316', strokeColor: '#c2410c', strokeWidth: 2, rotation: Math.PI },
      { type: 'triangle', x: 450, y: 505, width: 44, height: 75, fillColor: '#fde047', strokeColor: '#eab308', strokeWidth: 1.5, rotation: Math.PI },
      // Thruster Nozzle
      { type: 'trapezoid', x: 450, y: 450, width: 75, height: 35, fillColor: '#475569', strokeColor: '#1e293b', strokeWidth: 2, rotation: Math.PI },
      // Fins
      { type: 'right-triangle', x: 380, y: 410, width: 65, height: 90, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 2.5, rotation: 0 },
      { type: 'right-triangle', x: 520, y: 410, width: 65, height: 90, flipX: true, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 2.5, rotation: 0 },
      // Rocket Main Fuselage
      { type: 'capsule', x: 450, y: 320, width: 100, height: 210, fillColor: '#f8fafc', strokeColor: '#64748b', strokeWidth: 3, rotation: 0 },
      // Nose Cone
      { type: 'triangle', x: 450, y: 180, width: 100, height: 110, fillColor: '#dc2626', strokeColor: '#991b1b', strokeWidth: 3, rotation: 0 },
      // Porthole Window
      { type: 'circle', x: 450, y: 285, width: 50, height: 50, fillColor: '#38bdf8', strokeColor: '#0284c7', strokeWidth: 4, rotation: 0 },
      { type: 'circle', x: 450, y: 285, width: 34, height: 34, fillColor: '#0284c7', strokeColor: 'transparent', strokeWidth: 0, opacity: 0.6, rotation: 0 },
      // Stripe
      { type: 'rectangle', x: 450, y: 360, width: 100, height: 16, fillColor: '#dc2626', strokeColor: '#991b1b', strokeWidth: 1.5, rotation: 0 }
    ]
  },

  robot: {
    id: 'robot',
    name: 'Friendly Robo-Pal',
    icon: '🤖',
    description: 'An adorable futuristic robot with antenna, glowing eyes, chest dial, mechanical claws, and power heart.',
    difficulty: 'Medium',
    shapeCount: '23 shapes',
    shapes: [
      // Antennas
      { type: 'rectangle', x: 450, y: 135, width: 8, height: 45, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2, rotation: 0 },
      { type: 'circle', x: 450, y: 110, width: 24, height: 24, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 2, rotation: 0 },
      // Ears / Bolts
      { type: 'trapezoid', x: 345, y: 200, width: 24, height: 28, fillColor: '#64748b', strokeColor: '#334155', strokeWidth: 2, rotation: Math.PI / 2 },
      { type: 'trapezoid', x: 555, y: 200, width: 24, height: 28, fillColor: '#64748b', strokeColor: '#334155', strokeWidth: 2, rotation: -Math.PI / 2 },
      // Head
      { type: 'rounded-rect', x: 450, y: 200, width: 180, height: 110, fillColor: '#60a5fa', strokeColor: '#2563eb', strokeWidth: 3, rotation: 0 },
      // Eyes
      { type: 'circle', x: 405, y: 190, width: 36, height: 36, fillColor: '#fef08a', strokeColor: '#ca8a04', strokeWidth: 2.5, rotation: 0 },
      { type: 'circle', x: 495, y: 190, width: 36, height: 36, fillColor: '#fef08a', strokeColor: '#ca8a04', strokeWidth: 2.5, rotation: 0 },
      { type: 'circle', x: 405, y: 190, width: 14, height: 14, fillColor: '#0f172a', strokeColor: 'transparent', strokeWidth: 0, rotation: 0 },
      { type: 'circle', x: 495, y: 190, width: 14, height: 14, fillColor: '#0f172a', strokeColor: 'transparent', strokeWidth: 0, rotation: 0 },
      // Smile / Mouth
      { type: 'capsule', x: 450, y: 232, width: 70, height: 18, fillColor: '#1e293b', strokeColor: '#0f172a', strokeWidth: 2, rotation: 0 },
      // Neck
      { type: 'rectangle', x: 450, y: 270, width: 44, height: 30, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2, rotation: 0 },
      // Body / Torso
      { type: 'rounded-rect', x: 450, y: 375, width: 200, height: 170, fillColor: '#3b82f6', strokeColor: '#1d4ed8', strokeWidth: 3.5, rotation: 0 },
      // Chest Screen
      { type: 'rounded-rect', x: 450, y: 355, width: 130, height: 75, fillColor: '#0f172a', strokeColor: '#1e293b', strokeWidth: 2, rotation: 0 },
      // Power Heart on screen
      { type: 'heart', x: 450, y: 355, width: 42, height: 42, fillColor: '#ec4899', strokeColor: '#f43f5e', strokeWidth: 2, rotation: 0 },
      // Power Buttons
      { type: 'circle', x: 410, y: 425, width: 20, height: 20, fillColor: '#10b981', strokeColor: '#047857', strokeWidth: 2, rotation: 0 },
      { type: 'circle', x: 450, y: 425, width: 20, height: 20, fillColor: '#f59e0b', strokeColor: '#b45309', strokeWidth: 2, rotation: 0 },
      { type: 'circle', x: 490, y: 425, width: 20, height: 20, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 2, rotation: 0 },
      // Arms
      { type: 'capsule', x: 315, y: 360, width: 40, height: 110, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2.5, rotation: 0.3 },
      { type: 'capsule', x: 585, y: 360, width: 40, height: 110, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2.5, rotation: -0.3 },
      // Claws
      { type: 'semi-circle', x: 295, y: 425, width: 35, height: 35, fillColor: '#f59e0b', strokeColor: '#b45309', strokeWidth: 2, rotation: Math.PI / 2 },
      { type: 'semi-circle', x: 605, y: 425, width: 35, height: 35, fillColor: '#f59e0b', strokeColor: '#b45309', strokeWidth: 2, rotation: -Math.PI / 2 },
      // Legs
      { type: 'rectangle', x: 400, y: 495, width: 36, height: 75, fillColor: '#64748b', strokeColor: '#334155', strokeWidth: 2.5, rotation: 0 },
      { type: 'rectangle', x: 500, y: 495, width: 36, height: 75, fillColor: '#64748b', strokeColor: '#334155', strokeWidth: 2.5, rotation: 0 },
      // Shoes
      { type: 'capsule', x: 395, y: 535, width: 65, height: 26, fillColor: '#1e293b', strokeColor: '#0f172a', strokeWidth: 2, rotation: 0 },
      { type: 'capsule', x: 505, y: 535, width: 65, height: 26, fillColor: '#1e293b', strokeColor: '#0f172a', strokeWidth: 2, rotation: 0 }
    ]
  },

  castle: {
    id: 'castle',
    name: 'Royal Fortress',
    icon: '🏰',
    description: 'A grand medieval castle with twin defense towers, flags, wall battlements, and portcullis gate.',
    difficulty: 'Hard',
    shapeCount: '21 shapes',
    shapes: [
      // Hill / Ground
      { type: 'semi-circle', x: 450, y: 640, width: 900, height: 300, fillColor: '#15803d', strokeColor: '#166534', strokeWidth: 3, rotation: 0 },
      // Main Center Wall
      { type: 'rectangle', x: 450, y: 400, width: 260, height: 150, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 3, rotation: 0 },
      // Wall Battlements
      { type: 'square', x: 350, y: 310, width: 30, height: 30, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2, rotation: 0 },
      { type: 'square', x: 400, y: 310, width: 30, height: 30, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2, rotation: 0 },
      { type: 'square', x: 450, y: 310, width: 30, height: 30, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2, rotation: 0 },
      { type: 'square', x: 500, y: 310, width: 30, height: 30, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2, rotation: 0 },
      { type: 'square', x: 550, y: 310, width: 30, height: 30, fillColor: '#94a3b8', strokeColor: '#475569', strokeWidth: 2, rotation: 0 },
      // Left Tower
      { type: 'rectangle', x: 290, y: 350, width: 90, height: 230, fillColor: '#64748b', strokeColor: '#334155', strokeWidth: 3, rotation: 0 },
      // Left Roof
      { type: 'triangle', x: 290, y: 190, width: 120, height: 120, fillColor: '#3b82f6', strokeColor: '#1d4ed8', strokeWidth: 3, rotation: 0 },
      // Left Flagpole & Flag
      { type: 'rectangle', x: 290, y: 110, width: 5, height: 50, fillColor: '#f1f5f9', strokeColor: '#cbd5e1', strokeWidth: 1, rotation: 0 },
      { type: 'right-triangle', x: 310, y: 95, width: 35, height: 24, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 1.5, rotation: 0 },
      // Right Tower
      { type: 'rectangle', x: 610, y: 350, width: 90, height: 230, fillColor: '#64748b', strokeColor: '#334155', strokeWidth: 3, rotation: 0 },
      // Right Roof
      { type: 'triangle', x: 610, y: 190, width: 120, height: 120, fillColor: '#3b82f6', strokeColor: '#1d4ed8', strokeWidth: 3, rotation: 0 },
      // Right Flagpole & Flag
      { type: 'rectangle', x: 610, y: 110, width: 5, height: 50, fillColor: '#f1f5f9', strokeColor: '#cbd5e1', strokeWidth: 1, rotation: 0 },
      { type: 'right-triangle', x: 630, y: 95, width: 35, height: 24, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 1.5, rotation: 0 },
      // Central High Keep Tower
      { type: 'rectangle', x: 450, y: 260, width: 110, height: 130, fillColor: '#cbd5e1', strokeColor: '#64748b', strokeWidth: 3, rotation: 0 },
      { type: 'triangle', x: 450, y: 140, width: 140, height: 130, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 3, rotation: 0 },
      // Gate Archway
      { type: 'arch', x: 450, y: 425, width: 75, height: 110, fillColor: '#334155', strokeColor: '#0f172a', strokeWidth: 3, rotation: 0 },
      // Gate Portcullis Grate / Door
      { type: 'rectangle', x: 450, y: 440, width: 60, height: 65, fillColor: '#78350f', strokeColor: '#451a03', strokeWidth: 2, strokeStyle: 'dashed', rotation: 0 },
      // Tower Windows
      { type: 'arch', x: 290, y: 320, width: 24, height: 40, fillColor: '#fef08a', strokeColor: '#ca8a04', strokeWidth: 2, rotation: 0 },
      { type: 'arch', x: 610, y: 320, width: 24, height: 40, fillColor: '#fef08a', strokeColor: '#ca8a04', strokeWidth: 2, rotation: 0 },
      { type: 'arch', x: 450, y: 250, width: 28, height: 45, fillColor: '#fef08a', strokeColor: '#ca8a04', strokeWidth: 2, rotation: 0 }
    ]
  },

  car: {
    id: 'car',
    name: 'Speedy Cruiser',
    icon: '🚗',
    description: 'A sleek sports car cruising on asphalt with rims, headlights, racing spoiler, and speed puffs.',
    difficulty: 'Medium',
    shapeCount: '15 shapes',
    shapes: [
      // Ground / Road
      { type: 'rectangle', x: 450, y: 530, width: 800, height: 40, fillColor: '#334155', strokeColor: '#1e293b', strokeWidth: 2, rotation: 0 },
      // Road Stripes
      { type: 'rectangle', x: 450, y: 530, width: 800, height: 5, fillColor: '#facc15', strokeColor: 'transparent', strokeWidth: 0, strokeStyle: 'dashed', rotation: 0 },
      // Car Body Base
      { type: 'rounded-rect', x: 450, y: 440, width: 340, height: 75, fillColor: '#ef4444', strokeColor: '#b91c1c', strokeWidth: 3, rotation: 0 },
      // Car Cabin / Roof
      { type: 'trapezoid', x: 435, y: 365, width: 190, height: 75, fillColor: '#dc2626', strokeColor: '#991b1b', strokeWidth: 3, rotation: 0 },
      // Cabin Windows
      { type: 'trapezoid', x: 435, y: 365, width: 160, height: 55, fillColor: '#bae6fd', strokeColor: '#0284c7', strokeWidth: 2, rotation: 0 },
      // Center Window Divider
      { type: 'rectangle', x: 435, y: 365, width: 6, height: 55, fillColor: '#dc2626', strokeColor: '#991b1b', strokeWidth: 1, rotation: 0 },
      // Left Wheel (Rear)
      { type: 'circle', x: 350, y: 485, width: 80, height: 80, fillColor: '#1e293b', strokeColor: '#0f172a', strokeWidth: 3, rotation: 0 },
      { type: 'circle', x: 350, y: 485, width: 36, height: 36, fillColor: '#cbd5e1', strokeColor: '#64748b', strokeWidth: 2, rotation: 0 },
      // Right Wheel (Front)
      { type: 'circle', x: 550, y: 485, width: 80, height: 80, fillColor: '#1e293b', strokeColor: '#0f172a', strokeWidth: 3, rotation: 0 },
      { type: 'circle', x: 550, y: 485, width: 36, height: 36, fillColor: '#cbd5e1', strokeColor: '#64748b', strokeWidth: 2, rotation: 0 },
      // Front Headlight
      { type: 'semi-circle', x: 620, y: 435, width: 28, height: 34, fillColor: '#fef08a', strokeColor: '#eab308', strokeWidth: 2, rotation: Math.PI / 2 },
      // Rear Taillight
      { type: 'rectangle', x: 280, y: 435, width: 12, height: 26, fillColor: '#f97316', strokeColor: '#c2410c', strokeWidth: 2, rotation: 0 },
      // Rear Spoiler Mount & Wing
      { type: 'rectangle', x: 300, y: 395, width: 6, height: 26, fillColor: '#991b1b', strokeColor: '#7f1d1d', strokeWidth: 1.5, rotation: 0 },
      { type: 'rectangle', x: 295, y: 380, width: 44, height: 10, fillColor: '#991b1b', strokeColor: '#7f1d1d', strokeWidth: 2, rotation: 0 },
      // Exhaust Smoke Puff
      { type: 'cloud', x: 235, y: 470, width: 45, height: 26, fillColor: '#94a3b8', strokeColor: '#64748b', strokeWidth: 1.5, opacity: 0.65, rotation: 0.1 }
    ]
  }
};

/**
 * Renders a Blueprint to a standalone Image Data URL
 * Perfect for reference viewing without touching user's canvas.
 */
window.renderBlueprintToDataURL = function(key, targetW = 600, targetH = 400, isDark = false) {
  const bp = window.BLUEPRINTS[key];
  if (!bp) return null;

  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext('2d');

  // Background
  ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
  ctx.fillRect(0, 0, targetW, targetH);

  // Subtle grid
  ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.5)';
  ctx.lineWidth = 1;
  const gridStep = 24;
  ctx.beginPath();
  for (let x = 0; x < targetW; x += gridStep) {
    ctx.moveTo(x, 0); ctx.lineTo(x, targetH);
  }
  for (let y = 0; y < targetH; y += gridStep) {
    ctx.moveTo(0, y); ctx.lineTo(targetW, y);
  }
  ctx.stroke();

  // Find bounding box of shapes
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of bp.shapes) {
    const hw = Math.abs(s.width || 100) / 2;
    const hh = Math.abs(s.height || 100) / 2;
    minX = Math.min(minX, s.x - hw);
    maxX = Math.max(maxX, s.x + hw);
    minY = Math.min(minY, s.y - hh);
    maxY = Math.max(maxY, s.y + hh);
  }

  const bW = maxX - minX;
  const bH = maxY - minY;
  const bCenterX = minX + bW / 2;
  const bCenterY = minY + bH / 2;

  // Scale to fit with padding
  const padding = 36;
  const scale = Math.min((targetW - padding * 2) / bW, (targetH - padding * 2) / bH);

  ctx.save();
  ctx.translate(targetW / 2, targetH / 2);
  ctx.scale(scale, scale);
  ctx.translate(-bCenterX, -bCenterY);

  for (const shapeData of bp.shapes) {
    const s = new Shape(shapeData);
    s.draw(ctx);
  }

  ctx.restore();

  // Blueprint watermark label
  ctx.save();
  ctx.font = '600 12px Inter, sans-serif';
  ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(100, 116, 139, 0.7)';
  ctx.fillText(`📐 REFERENCE BLUEPRINT: ${bp.name.toUpperCase()}`, 14, targetH - 14);
  ctx.restore();

  return offscreen.toDataURL('image/png');
};
