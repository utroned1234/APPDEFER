'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Prize {
  text: string;
  color: string;
  glow: string;
  blocked: boolean;
}

const PRIZES: Prize[] = [
  { text: "5 Bs", color: "#00ffff", glow: "#00ffff", blocked: false },
  { text: "20 Bs", color: "#ff00ff", glow: "#ff00ff", blocked: false },
  { text: "50 Bs", color: "#00ff88", glow: "#00ff88", blocked: false },
  { text: "100 Bs", color: "#ffff00", glow: "#ffff00", blocked: false },
  { text: "80 Bs", color: "#00ffff", glow: "#00ffff", blocked: false },
  { text: "200 Bs", color: "#ff00ff", glow: "#ff00ff", blocked: false },
  { text: "300 Bs", color: "#ffd700", glow: "#ffd700", blocked: false },
  { text: "500 Bs", color: "#00ff88", glow: "#00ff88", blocked: true },
  { text: "1000 Bs", color: "#ffff00", glow: "#ffff00", blocked: true },
];

interface RouletteData {
  can_spin: boolean;
  spins_available: number;
  eligible_purchases: Array<{
    id: string;
    package_name: string;
    investment_bs: number;
  }>;
  history: Array<{
    id: string;
    package_name: string;
    investment_bs: number;
    won_bs: number;
    spun_at: string;
  }>;
  total_winnings: number;
  min_investment: number;
}

export default function RouletteWheel() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [rouletteData, setRouletteData] = useState<RouletteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const prizes = useMemo(() => PRIZES, []);

  // Cargar datos de elegibilidad
  useEffect(() => {
    const fetchRouletteData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/user/roulette', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Error al cargar datos de ruleta');
        }

        const data = await response.json();
        setRouletteData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchRouletteData();
  }, [router]);

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    const segmentAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    prizes.forEach((prize, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Fill with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(1, `${prize.color}40`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke
      ctx.strokeStyle = prize.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = prize.color;
      ctx.font = "bold 28px Arial";
      ctx.shadowColor = prize.glow;
      ctx.shadowBlur = 10;
      ctx.fillText(prize.text, radius - 50, 0);
      ctx.restore();
    });

    ctx.shadowBlur = 0;

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, 2 * Math.PI);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [prizes]);

  // Spin function
  const spin = useCallback(async () => {
    if (isSpinning || !rouletteData?.can_spin) return;

    setIsSpinning(true);
    setResult('');
    setError('');

    try {
      // Seleccionar premio aleatorio de los disponibles
      const available = PRIZES
        .map((prize, index) => ({ prize, index }))
        .filter((item) => !item.prize.blocked);

      const selected = available[Math.floor(Math.random() * available.length)];
      const targetIndex = selected.index;

      const segmentAngle = 360 / PRIZES.length;
      const targetAngle = targetIndex * segmentAngle;

      const minSpins = 6;
      const maxSpins = 10;
      const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;

      setRotation((currentRotation) => {
        const currentNormalized = ((currentRotation % 360) + 360) % 360;
        const targetRotation = spins * 360 + (360 - targetAngle) + segmentAngle / 2;
        return currentRotation + (targetRotation - currentNormalized);
      });

      // Esperar a que termine la animación
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Enviar resultado al backend
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/roulette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          purchase_id: rouletteData?.eligible_purchases[0]?.id,
          prize_index: targetIndex
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el giro');
      }

      const data = await response.json();

      setResult(`🎉 ¡GANASTE ${data.prize_amount} Bs! 🎉`);

      // Actualizar datos de ruleta
      const updatedResponse = await fetch('/api/user/roulette', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setRouletteData(updatedData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el giro');
      setResult('❌ Error al procesar el giro');
    } finally {
      setIsSpinning(false);
    }
  }, [isSpinning, rouletteData]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && rouletteData?.can_spin) {
        e.preventDefault();
        spin();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, spin, rouletteData]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#00ffff',
        fontSize: '24px',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        Cargando ruleta...
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Orbitron', 'Segoe UI', sans-serif;
          background: #0a0a0f;
          overflow-x: hidden;
        }

        .page {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          position: relative;
          padding: 20px;
        }

        .page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(255, 0, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          z-index: 0;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .container {
          text-align: center;
          position: relative;
          z-index: 10;
          max-width: 600px;
          width: 100%;
        }

        .info-badge {
          display: inline-block;
          margin-bottom: 20px;
          padding: 12px 24px;
          background: rgba(26, 26, 46, 0.8);
          border: 2px solid rgba(0, 255, 255, 0.3);
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .spins-text {
          color: #00ffff;
          font-size: 16px;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .spins-count {
          color: #fff;
          font-size: 32px;
          font-weight: 900;
          margin: 0 8px;
          background: linear-gradient(45deg, #00ffff, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .error-message {
          color: #ff4444;
          font-size: 14px;
          margin-bottom: 20px;
          padding: 12px 20px;
          background: rgba(255, 68, 68, 0.1);
          border: 2px solid #ff4444;
          border-radius: 10px;
        }

        .no-spins-message {
          color: #ffaa00;
          font-size: 14px;
          margin-bottom: 20px;
          padding: 12px 20px;
          background: rgba(255, 170, 0, 0.1);
          border: 2px solid #ffaa00;
          border-radius: 10px;
        }

        .wheel-container {
          position: relative;
          width: 100%;
          max-width: 500px;
          aspect-ratio: 1;
          margin: 0 auto;
          filter: drop-shadow(0 0 40px rgba(0, 255, 255, 0.4));
        }

        .outer-ring {
          position: absolute;
          width: 105%;
          height: 105%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 3px solid transparent;
          background: linear-gradient(#0a0a0f, #0a0a0f) padding-box,
                     linear-gradient(45deg, #00ffff, #ff00ff, #00ff88, #00ffff) border-box;
          animation: rotateBorder 4s linear infinite;
        }

        @keyframes rotateBorder {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        .particle-ring {
          position: absolute;
          width: 110%;
          height: 110%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          margin: -4px 0 0 -4px;
        }

        @keyframes ledBlink {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        .glow-ring {
          position: absolute;
          width: 102%;
          height: 102%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, transparent 40%, rgba(0, 255, 255, 0.15) 50%, transparent 60%);
          animation: pulse 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.03);
          }
        }

        .wheel {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          background: #1a1a2e;
          box-shadow: inset 0 0 60px rgba(0, 255, 255, 0.2), 0 0 80px rgba(0, 255, 255, 0.15);
          border: 2px solid rgba(0, 255, 255, 0.3);
          will-change: transform;
          transition: transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99);
        }

        .pointer {
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 70px;
          z-index: 50;
          pointer-events: none;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
        }

        .pointer::before {
          content: '';
          position: absolute;
          width: 40px;
          height: 60px;
          background: linear-gradient(180deg, #c0c0c0 0%, #808080 50%, #606060 100%);
          border-radius: 20px 20px 8px 8px;
          left: 5px;
          box-shadow: inset 0 2px 8px rgba(255, 255, 255, 0.3);
        }

        .pointer::after {
          content: '';
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-top: 25px solid #606060;
        }

        .center-button {
          position: absolute;
          width: 120px;
          height: 120px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffff, #0088ff);
          border: 4px solid #00ffff;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.3);
          z-index: 100;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s ease;
          animation: buttonPulse 2s ease-in-out infinite;
        }

        @keyframes buttonPulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.9), inset 0 0 35px rgba(255, 255, 255, 0.5);
          }
        }

        .center-button:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.08);
          background: linear-gradient(135deg, #00ffff, #00ff88);
          box-shadow: 0 0 60px rgba(0, 255, 255, 1), inset 0 0 35px rgba(255, 255, 255, 0.5);
        }

        .center-button:active:not(:disabled) {
          transform: translate(-50%, -50%) scale(0.95);
        }

        .center-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          animation: none;
          background: linear-gradient(135deg, #666, #444);
          border-color: #666;
        }

        .result {
          margin-top: 30px;
          font-size: 28px;
          font-weight: 900;
          min-height: 50px;
          background: linear-gradient(45deg, #00ffff, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 2px;
        }

        @media (max-width: 768px) {
          .wheel-container {
            max-width: 90vw;
          }
          
          .center-button {
            width: 90px;
            height: 90px;
            font-size: 16px;
          }
          
          .result {
            font-size: 20px;
            margin-top: 20px;
          }

          .spins-count {
            font-size: 24px;
          }

          .info-badge {
            padding: 10px 20px;
          }
        }
      `}</style>

      <div className="page">
        <div className="container">
          {rouletteData && (
            <div className="info-badge">
              <span className="spins-text">
                Giros disponibles:
                <span className="spins-count">{rouletteData.spins_available}</span>
              </span>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {rouletteData && !rouletteData.can_spin && !error && (
            <div className="no-spins-message">
              Necesitas un paquete VIP activo de Bs {rouletteData.min_investment} o más para girar
            </div>
          )}

          <div className="wheel-container">
            <div className="particle-ring">
              {Array.from({ length: 40 }).map((_, i) => {
                const angle = (i / 40) * 2 * Math.PI;
                const distance = 55; // Porcentaje del radio
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                const colors = ["#00ffff", "#ff00ff", "#00ff88", "#ffff00"];
                const color = colors[i % colors.length];

                return (
                  <div
                    key={i}
                    className="particle"
                    style={{
                      transform: `translate(${x}%, ${y}%)`,
                      background: color,
                      boxShadow: `0 0 8px ${color}`,
                      animation: `ledBlink ${0.5 + Math.random()}s ease-in-out infinite`,
                      animationDelay: `${i * 0.02}s`,
                    }}
                  />
                );
              })}
            </div>
            <div className="outer-ring" />
            <div className="glow-ring" />
            <div className="pointer" />
            <div
              ref={wheelRef}
              className="wheel"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            >
              <canvas
                ref={canvasRef}
                width="500"
                height="500"
                style={{ borderRadius: '50%', width: '100%', height: '100%' }}
              />
            </div>
            <button
              className="center-button"
              onClick={spin}
              disabled={isSpinning || !rouletteData?.can_spin}
            >
              <span>{isSpinning ? '...' : 'SPIN'}</span>
            </button>
          </div>
          <div className="result">{result}</div>
        </div>
      </div>
    </>
  );
}
