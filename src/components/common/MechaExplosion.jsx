import React, { useEffect, useRef } from 'react';

// Generador de sonido sintetizado realista de mecha de tejo (sin archivos externos)
function reproducirSonidoMecha() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 1. Ruido blanco para la explosión / pólvora (crack)
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filtro pasa-banda para dar resonancia de estallido seco
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 1.2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    // 2. Golpe de baja frecuencia (el "pum" metálico del impacto en el bocín)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);

    oscGain.gain.setValueAtTime(0.8, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.38);
  } catch (err) {
    console.debug('Efecto de audio atenuado por política del navegador:', err);
  }
}

export default function MechaExplosion({
  title = '¡¡MECHAAAAA!!',
  subtitle = '¡Punto anotado y confirmado!',
  badgeText = '¡JUGADA PERFECTA!',
  onClose,
  duration = 2600
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    reproducirSonidoMecha();

    // Animación de partículas de pólvora y chispas de tejo en Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const centerX = width / 2;
    const centerY = height / 2 - 20;

    const particles = [];
    const colors = [
      '#ffeb3b', // Amarillo fuego
      '#ff9800', // Naranja pólvora
      '#ff5722', // Rojo tejo
      '#ffffff', // Destello blanco
      '#ff1744', // Chispa roja
      '#ffd54f'  // Oro
    ];

    // Crear 90 chispas con física realista
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 4),
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.014 + Math.random() * 0.018,
        gravity: 0.22,
        sparkle: Math.random() > 0.4
      });
    }

    let start = Date.now();
    function animate() {
      const elapsed = Date.now() - start;
      ctx.clearRect(0, 0, width, height);

      // Onda de choque circular
      const shockwaveRadius = Math.min(width, height) * (elapsed / 450);
      if (elapsed < 450) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(1, 8 * (1 - elapsed / 450));
        ctx.strokeStyle = `rgba(255, 152, 0, ${1 - elapsed / 450})`;
        ctx.shadowColor = '#ff5722';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();
      }

      // Dibujar partículas
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.96;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sparkle && Math.random() > 0.5 ? p.size * 1.5 : p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animate();

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(30, 10, 5, 0.88) 0%, rgba(10, 10, 16, 0.94) 85%)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        animation: 'mechaFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        userSelect: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Contenedor central de la celebración */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '480px',
          padding: '28px 36px',
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(35, 25, 25, 0.92), rgba(20, 18, 28, 0.96))',
          border: '2px solid rgba(255, 110, 64, 0.55)',
          boxShadow: '0 20px 60px -10px rgba(255, 87, 34, 0.5), 0 0 50px rgba(255, 152, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
          animation: 'mechaPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Gráfico SVG de la Mecha y Bocín Colombiano */}
        <div style={{ position: 'relative', width: '130px', height: '110px', margin: '0 auto 16px' }}>
          {/* Anillo de bocín metálico */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '110px',
              height: '38px',
              borderRadius: '50%',
              border: '6px solid #8d99ae',
              boxShadow: '0 0 15px rgba(255,255,255,0.4), inset 0 2px 4px rgba(0,0,0,0.6)',
              background: 'radial-gradient(ellipse at center, #2b2d42 40%, #1a1a24 100%)',
            }}
          />

          {/* Triángulo de la Mecha con pólvora */}
          <svg
            viewBox="0 0 100 90"
            style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '84px',
              height: '75px',
              filter: 'drop-shadow(0 0 14px #ff5722)',
              animation: 'mechaShake 0.4s ease-in-out infinite alternate',
            }}
          >
            <polygon points="50,10 88,78 12,78" fill="#d32f2f" />
            <polygon points="50,14 84,75 16,75" fill="#ffffff" />
            <circle cx="50" cy="50" r="14" fill="#212121" />
            <circle cx="50" cy="50" r="10" fill="#f57c00" opacity="0.9" />
            <circle cx="50" cy="50" r="5" fill="#ffeb3b" />
            <line x1="50" y1="2" x2="50" y2="10" stroke="#ffeb3b" strokeWidth="3" strokeLinecap="round" />
            <line x1="42" y1="4" x2="46" y2="11" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="4" x2="54" y2="11" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" />
          </svg>

          {/* Destellos de fuego */}
          <span
            style={{
              position: 'absolute',
              top: '-10px',
              left: '42%',
              fontSize: '2rem',
              animation: 'mechaFlicker 0.25s infinite alternate',
            }}
          >
            
          </span>
        </div>

        {/* Badge superior */}
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #ff5722, #f59e0b)',
            color: 'var(--text-main)',
            fontWeight: 800,
            fontSize: '0.78rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '10px',
            boxShadow: '0 2px 10px rgba(255, 87, 34, 0.4)',
          }}
        >
          {badgeText}
        </div>

        {/* Título de impacto */}
        <h2
          style={{
            margin: '0 0 8px',
            fontSize: '2.1rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: 'var(--text-main)',
            textShadow: '0 2px 12px rgba(255, 87, 34, 0.8), 0 0 25px rgba(255, 152, 0, 0.6)',
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>

        {/* Subtítulo descriptivo */}
        <p
          style={{
            margin: 0,
            color: '#e0e0f0',
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>

        {/* Indicador de toque para cerrar */}
        <div style={{ marginTop: '16px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.6)',
              borderBottom: '1px dotted rgba(255,255,255,0.4)',
              paddingBottom: '2px',
            }}
          >
            Toca en cualquier parte para continuar
          </span>
        </div>
      </div>

      <style>{`
        @keyframes mechaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mechaPop {
          0% { transform: scale(0.65) translateY(20px); opacity: 0; }
          65% { transform: scale(1.06) translateY(-5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes mechaShake {
          0% { transform: translateX(-50%) rotate(-4deg); }
          100% { transform: translateX(-50%) rotate(4deg); }
        }
        @keyframes mechaFlicker {
          0% { transform: scale(0.9) rotate(-10deg); opacity: 0.8; }
          100% { transform: scale(1.3) rotate(15deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}