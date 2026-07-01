import { useEffect, useRef } from "react";

/**
 * ThreeBackground - A high-performance interactive 3D particle constellation
 * rendered on a full-screen canvas. No external dependencies required.
 * Nodes move in 3D space and react to mouse movement.
 */
export default function ThreeBackground({ opacity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId;
    let mouse = { x: width / 2, y: height / 2 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // --- Node class ---
    class Node {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = (Math.random() - 0.5) * width * 1.5;
        this.y = (Math.random() - 0.5) * height * 1.5;
        this.z = Math.random() * 800 + 200;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = (Math.random() - 0.5) * 0.3;
        this.baseRadius = Math.random() * 2.5 + 0.8;
        this.color = Math.random() > 0.6
          ? `rgba(6,182,212,`   // cyan
          : Math.random() > 0.5
            ? `rgba(139,92,246,`  // purple
            : `rgba(59,130,246,`; // blue
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Subtle mouse attraction
        const cx = width / 2, cy = height / 2;
        const dx = (mouse.x - cx) * 0.0003;
        const dy = (mouse.y - cy) * 0.0003;
        this.x += dx;
        this.y += dy;

        // Boundary check — reset if too far out
        if (this.z < 50 || this.z > 1200) this.vz *= -1;
        if (Math.abs(this.x) > width || Math.abs(this.y) > height) this.reset();
      }
      project() {
        const fov = 600;
        const scale = fov / (fov + this.z);
        const px = this.x * scale + width / 2;
        const py = this.y * scale + height / 2;
        const radius = this.baseRadius * scale;
        const alpha = Math.max(0, Math.min(1, scale * 1.8));
        return { px, py, radius, alpha, scale };
      }
    }

    const COUNT = 120;
    const nodes = Array.from({ length: COUNT }, () => new Node());

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Project and sort by depth (painters algorithm)
      const projected = nodes.map((n, i) => {
        n.update();
        const p = n.project();
        return { ...p, color: n.color, idx: i };
      }).sort((a, b) => b.scale - a.scale);

      // Draw connections
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j];
          const dist = Math.hypot(a.px - b.px, a.py - b.py);
          const maxDist = 130;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * Math.min(a.alpha, b.alpha) * 0.5;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.strokeStyle = `rgba(59,130,246,${lineAlpha})`;
            ctx.lineWidth = lineAlpha * 1.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of projected) {
        if (p.radius < 0.2) continue;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Glow on larger nodes
        if (p.radius > 1.5) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * 0.1})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0,
        opacity,
        pointerEvents: "none"
      }}
    />
  );
}
