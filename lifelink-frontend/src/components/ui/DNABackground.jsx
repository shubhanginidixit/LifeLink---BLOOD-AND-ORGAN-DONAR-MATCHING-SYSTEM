import { useRef, useEffect } from 'react';
import './DNABackground.css';

export default function DNABackground() {
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const amplitude = 180;
      const spacing = 32;
      const nodes = Math.ceil(canvas.height / spacing) + 4;
      const speed = 0.015;

      const pairs = [];
      for (let i = 0; i < nodes; i++) {
        const y = i * spacing - (canvas.height % spacing) / 2;
        const phase = time + i * 0.35;
        const x1 = cx + Math.sin(phase) * amplitude;
        const x2 = cx + Math.sin(phase + Math.PI) * amplitude;
        pairs.push({ y, x1, x2, phase });
      }

      // Draw rungs (back)
      for (let i = 0; i < pairs.length - 1; i++) {
        const p = pairs[i];
        const rungCount = 3;
        for (let r = 1; r <= rungCount; r++) {
          const t = r / (rungCount + 1);
          const yRung = p.y + t * spacing;
          const phaseRung = time + (i + t) * 0.35;
          const xR = cx + Math.sin(phaseRung) * amplitude;
          const xL = cx + Math.sin(phaseRung + Math.PI) * amplitude;

          const depth = Math.cos(phaseRung);
          const alpha = 0.15 + Math.abs(depth) * 0.2;

          ctx.beginPath();
          ctx.moveTo(xR, yRung);
          ctx.lineTo(xL, yRung);
          ctx.strokeStyle = `rgba(225, 29, 72, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw strands
      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath();
        for (let i = 0; i < pairs.length; i++) {
          const p = pairs[i];
          const x = strand === 0 ? p.x1 : p.x2;
          if (i === 0) ctx.moveTo(x, p.y);
          else {
            const prev = pairs[i - 1];
            const prevX = strand === 0 ? prev.x1 : prev.x2;
            const midY = (prev.y + p.y) / 2;
            ctx.quadraticCurveTo(prevX, midY, x, p.y);
          }
        }
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw nodes
      for (const p of pairs) {
        const depth1 = Math.cos(p.phase);
        const depth2 = Math.cos(p.phase + Math.PI);

        // Node 1
        const r1 = 4 + Math.abs(depth1) * 3;
        const a1 = 0.35 + Math.abs(depth1) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x1, p.y, r1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 29, 72, ${a1})`;
        ctx.fill();

        // Node 2
        const r2 = 4 + Math.abs(depth2) * 3;
        const a2 = 0.35 + Math.abs(depth2) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x2, p.y, r2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 29, 72, ${a2})`;
        ctx.fill();
      }

      time += speed;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="dna-bg">
      <canvas ref={canvasRef} />
    </div>
  );
}
