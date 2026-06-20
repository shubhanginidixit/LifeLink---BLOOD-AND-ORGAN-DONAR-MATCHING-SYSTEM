import { useRef, useEffect } from 'react';
import './PaperBackground.css';

export default function PaperBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Base background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      const blobs = [
        { cx: 0.2, cy: 0.3, r: 0.35, color: [226, 232, 240], speed: 0.0007, phase: 0 },
        { cx: 0.8, cy: 0.2, r: 0.3, color: [241, 245, 249], speed: 0.0009, phase: 1.5 },
        { cx: 0.5, cy: 0.7, r: 0.4, color: [248, 250, 252], speed: 0.0006, phase: 3.0 },
        { cx: 0.15, cy: 0.8, r: 0.25, color: [252, 231, 234], speed: 0.0008, phase: 2.0 },
        { cx: 0.7, cy: 0.6, r: 0.3, color: [241, 245, 249], speed: 0.001, phase: 4.0 },
        { cx: 0.4, cy: 0.15, r: 0.28, color: [226, 232, 240], speed: 0.0005, phase: 0.8 },
        { cx: 0.85, cy: 0.85, r: 0.25, color: [254, 242, 242], speed: 0.0007, phase: 5.0 },
      ];

      for (const b of blobs) {
        const x = (b.cx + Math.sin(time * b.speed * 60 + b.phase) * 0.08) * w;
        const y = (b.cy + Math.cos(time * b.speed * 50 + b.phase * 1.3) * 0.06) * h;
        const r = b.r * Math.min(w, h);

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0.8)`);
        grad.addColorStop(0.5, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0.4)`);
        grad.addColorStop(1, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Subtle noise/grain overlay
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * 3;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);

      time += 1;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="paper-bg">
      <canvas ref={canvasRef} />
    </div>
  );
}
