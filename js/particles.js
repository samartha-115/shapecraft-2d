/**
 * ShapeCraft 2D - Interactive Particle System
 * Produces confetti, sparkles, bursts, and poofs on user interactions.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Spawn a burst of sparkling particles (e.g. when colored or spawned)
   */
  burst(x, y, color = '#6366f1', count = 16, type = 'sparkle') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 4 + 2;
      const size = Math.random() * 5 + 3;
      const life = Math.random() * 20 + 25; // frames

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: size,
        alpha: 1,
        life: life,
        maxLife: life,
        type: type, // 'sparkle', 'confetti', 'smoke'
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  /**
   * Spawn a poof/smoke effect (e.g. upon shape deletion)
   */
  poof(x, y, color = '#94a3b8', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      const size = Math.random() * 8 + 4;
      const life = Math.random() * 15 + 20;

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: size,
        alpha: 0.8,
        life: life,
        maxLife: life,
        type: 'smoke',
        rotation: 0,
        rotSpeed: 0
      });
    }
  }

  /**
   * Update particle positions and decay
   */
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;

      if (p.type === 'confetti') {
        p.vy += 0.12; // gravity
        p.rotation += p.rotSpeed;
      }

      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles onto the given canvas context
   */
  render(ctx) {
    if (this.particles.length === 0) return;

    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'sparkle') {
        // Draw 4-pointed sparkle star
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const r = p.size;
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();
      } else if (p.type === 'confetti') {
        // Draw rectangular confetti
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        // Draw soft expanding circle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * (1 + (1 - p.alpha) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }
}

window.particleSystem = new ParticleSystem();
