import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const OPACITY_MAP = { faint: 0.18, subtle: 0.7, medium: 0.85, strong: 1 };
const BEAM_COUNT = 30;

function createBeam(width, height) {
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle: -35 + Math.random() * 10,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export default function BeamsBackground({ intensity = 'strong' }) {
  const canvasRef = useRef(null);
  const beamsRef = useRef([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      beamsRef.current = Array.from({ length: BEAM_COUNT }, () =>
        createBeam(window.innerWidth, window.innerHeight)
      );
    };

    resize();
    window.addEventListener('resize', resize);

    function resetBeam(beam, index) {
      const col = index % 3;
      const spacing = window.innerWidth / 3;
      beam.y = window.innerHeight + 100;
      beam.x = col * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 190 + (index * 70) / BEAM_COUNT;
      beam.opacity = 0.2 + Math.random() * 0.1;
    }

    function drawBeam(beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const pulseOp = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * OPACITY_MAP[intensity];
      const g = ctx.createLinearGradient(0, 0, 0, beam.length);
      g.addColorStop(0,   `hsla(${beam.hue},85%,65%,0)`);
      g.addColorStop(0.1, `hsla(${beam.hue},85%,65%,${pulseOp * 0.5})`);
      g.addColorStop(0.4, `hsla(${beam.hue},85%,65%,${pulseOp})`);
      g.addColorStop(0.6, `hsla(${beam.hue},85%,65%,${pulseOp})`);
      g.addColorStop(0.9, `hsla(${beam.hue},85%,65%,${pulseOp * 0.5})`);
      g.addColorStop(1,   `hsla(${beam.hue},85%,65%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'blur(35px)';
      beamsRef.current.forEach((beam, i) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, i);
        drawBeam(beam);
      });
      rafRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: 'blur(15px)' }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
        style={{ backdropFilter: 'blur(50px)' }}
      />
    </>
  );
}
