'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import BottomNav from '@/components/ui/BottomNav';
import Card from '@/components/ui/Card';

interface Prize {
  text: string;
  color: string;
  glow: string;
  blocked: boolean;
  value: number;
}

const PRIZES: Prize[] = [
  { text: "5 Bs", color: "#00ffff", glow: "#00ffff", blocked: false, value: 5 },
  { text: "20 Bs", color: "#ff00ff", glow: "#ff00ff", blocked: false, value: 20 },
  { text: "50 Bs", color: "#00ff88", glow: "#00ff88", blocked: false, value: 50 },
  { text: "100 Bs", color: "#ffff00", glow: "#ffff00", blocked: false, value: 100 },
  { text: "80 Bs", color: "#00ffff", glow: "#00ffff", blocked: false, value: 80 },
  { text: "200 Bs", color: "#ff00ff", glow: "#ff00ff", blocked: false, value: 200 },
  { text: "300 Bs", color: "#ffd700", glow: "#ffd700", blocked: false, value: 300 },
  { text: "500 Bs", color: "#00ff88", glow: "#00ff88", blocked: true, value: 500 },
  { text: "1000 Bs", color: "#ffff00", glow: "#ffff00", blocked: true, value: 1000 },
];

interface RouletteHistory {
  id: string;
  package_name: string;
  investment_bs: number;
  won_bs: number;
  spun_at: string;
}

interface RouletteData {
  can_spin: boolean;
  spins_available: number;
  eligible_purchases: Array<{
    id: string;
    package_name: string;
    investment_bs: number;
  }>;
  history: RouletteHistory[];
  total_winnings: number;
  min_investment: number;
}

export default function RouletteWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiContainerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');

  // Estados para la lógica del backend
  const [rouletteData, setRouletteData] = useState<RouletteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const prizes = useMemo(() => PRIZES, []);

  // Obtener token
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') ||
      document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
  };

  // Cargar datos de elegibilidad
  useEffect(() => {
    const fetchRouletteData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user/roulette', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setLoading(false);
            return;
          }
          throw new Error('Error al cargar datos');
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
  }, []);

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

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, prize.color + '40');
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = prize.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = prize.glow;
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = prize.color;
      ctx.font = 'bold 24px Arial';
      ctx.shadowColor = prize.glow;
      ctx.shadowBlur = 15;
      ctx.fillText(prize.text, radius - 30, 0);
      ctx.restore();
    });

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0f';
    ctx.fill();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.stroke();
  }, [prizes]);

  // Create particles
  const particles = useMemo(() => {
    const particleElements = [];
    const numParticles = 40;
    const colors = ['#00ffff', '#ff00ff', '#00ff88', '#ffff00'];

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * 2 * Math.PI;
      const x = Math.cos(angle) * 160;
      const y = Math.sin(angle) * 160;
      const color = colors[i % colors.length];

      particleElements.push(
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(${x}px, ${y}px)`,
            background: color,
            boxShadow: `0 0 10px ${color}`,
            animation: `ledBlink ${0.5 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${i * 0.02}s`,
          }}
        />
      );
    }
    return particleElements;
  }, []);

  // Celebration function
  const celebrate = useCallback(() => {
    const confettiContainer = confettiContainerRef.current;
    if (!confettiContainer) return;

    const colors = ['#00ffff', '#ff00ff', '#00ff88', '#ffff00', '#ffd700'];
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confettiContainer.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }, i * 20);
    }
  }, []);

  // Spin function con lógica de backend
  const spin = useCallback(async () => {
    if (isSpinning) return;
    if (!rouletteData?.can_spin) return;

    setIsSpinning(true);
    setResult('');
    setError('');

    const available = PRIZES
      .map((prize, index) => ({ prize, index }))
      .filter((item) => !item.prize.blocked);

    const selected = available[Math.floor(Math.random() * available.length)];
    const targetIndex = selected.index;

    const numPrizes = PRIZES.length;
    const segmentAngle = 360 / numPrizes;

    const segmentCenter = targetIndex * segmentAngle + (segmentAngle / 2);
    const targetFinalAngle = 360 - segmentCenter;

    const minSpins = 6;
    const maxSpins = 10;
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;

    setRotation((currentRotation) => {
      const currentNormalized = ((currentRotation % 360) + 360) % 360;
      let additionalRotation = targetFinalAngle - currentNormalized;
      if (additionalRotation <= 0) {
        additionalRotation += 360;
      }
      const totalRotation = (spins * 360) + additionalRotation;
      return currentRotation + totalRotation;
    });

    // Esperar a que termine la animación
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Enviar resultado al backend
    try {
      const token = getToken();
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
      setResult(`+${data.prize_amount} Bs`);
      celebrate();

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
      setResult('');
    } finally {
      setIsSpinning(false);
    }
  }, [isSpinning, rouletteData, celebrate]);

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

  const canSpin = rouletteData?.can_spin && !isSpinning;

  return (
    <div className="min-h-screen pb-24">
      <style jsx global>{`
        @keyframes ledBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes rotateBorder {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }

        @keyframes buttonPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2); }
          50% { box-shadow: 0 0 50px rgba(0, 255, 255, 0.9), inset 0 0 30px rgba(255, 255, 255, 0.4); }
        }

        @keyframes pointerBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confettiFall 3s linear forwards;
          opacity: 0;
        }

        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(-100vh) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>

      {/* Confetti Container */}
      <div
        ref={confettiContainerRef}
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      />

      <div className="max-w-screen-xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold tracking-wider"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              background: 'linear-gradient(45deg, #00ffff, #ff00ff, #00ff88)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(0, 255, 255, 0.3)'
            }}
          >
            RULETA DE PREMIOS
          </h1>
          <p className="text-text-secondary text-xs mt-1">Gira y gana increíbles premios</p>
        </div>

        {/* Estado de giros */}
        {!loading && (
          <div className="text-center">
            {rouletteData?.can_spin ? (
              <div
                className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(51, 230, 255, 0.2))',
                  border: '2px solid rgba(0, 255, 136, 0.5)',
                  color: '#00ff88',
                }}
              >
                🎰 Giros disponibles: {rouletteData.spins_available}
              </div>
            ) : (
              <div
                className="inline-block px-4 py-3 rounded-xl text-xs"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.1), rgba(255, 136, 0, 0.1))',
                  border: '2px solid rgba(255, 170, 0, 0.4)',
                  color: '#ffaa00',
                }}
              >
                <p className="font-bold mb-1">🎉 ¡Gracias por participar!</p>
                <p>Compra un paquete superior para seguir participando</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-4">
            {error}
          </div>
        )}

        {/* Wheel Container - DISEÑO SIN CAMBIOS */}
        <Card glassEffect className="!p-6">
          <div className="relative w-full max-w-[340px] aspect-square mx-auto">
            {/* Particle Ring */}
            <div className="absolute inset-0">
              {particles}
            </div>

            {/* Outer Rotating Ring */}
            <div
              className="absolute w-[105%] h-[105%] top-1/2 left-1/2 rounded-full"
              style={{
                border: '3px solid transparent',
                background: 'linear-gradient(#0a0a0f, #0a0a0f) padding-box, linear-gradient(45deg, #00ffff, #ff00ff, #00ff88, #00ffff) border-box',
                animation: 'rotateBorder 4s linear infinite',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Glow Ring */}
            <div
              className="absolute w-[102%] h-[102%] top-1/2 left-1/2 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, transparent 40%, rgba(0, 255, 255, 0.15) 50%, transparent 60%)',
                animation: 'pulse-glow 2s ease-in-out infinite',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Pointer */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 text-3xl"
              style={{
                color: '#00ffff',
                filter: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.8))',
                animation: 'pointerBounce 1s ease-in-out infinite',
              }}
            >
              ▼
            </div>

            {/* Wheel */}
            <div
              className="absolute inset-[3%] rounded-full overflow-hidden"
              style={{
                boxShadow: 'inset 0 0 60px rgba(0, 255, 255, 0.2), 0 0 80px rgba(0, 255, 255, 0.15)',
                border: '2px solid rgba(0, 255, 255, 0.3)',
                transition: 'transform 6s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <canvas
                ref={canvasRef}
                width="400"
                height="400"
                className="w-full h-full"
              />
            </div>

            {/* Center Button */}
            <button
              onClick={spin}
              disabled={!canSpin}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full z-30 flex items-center justify-center font-bold text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-110 active:scale-95"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                background: 'linear-gradient(135deg, #00ffff, #0088ff)',
                border: '3px solid #00ffff',
                color: '#0a0a0f',
                animation: canSpin ? 'buttonPulse 2s ease-in-out infinite' : 'none',
              }}
            >
              {isSpinning ? '...' : 'SPIN'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div
              className="mt-6 text-center py-3 rounded-lg"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                background: 'rgba(0, 255, 136, 0.08)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
              }}
            >
              <p className="text-2xl font-bold" style={{ color: '#00ff88' }}>{result}</p>
              <p className="text-xs text-text-secondary mt-1">Agregado a tu billetera</p>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="!p-4">
          <div className="text-center space-y-2">
            <p className="text-xs text-text-secondary">
              Presiona <span className="text-gold font-bold">SPIN</span> o la tecla <span className="text-gold font-bold">ESPACIO</span> para girar
            </p>
            <div className="flex justify-center gap-4 text-[10px] text-text-secondary">
              <span>🍀 ¡Buena suerte!</span>
            </div>
          </div>
        </Card>

        {/* Historial de premios */}
        {!loading && rouletteData?.history && rouletteData.history.length > 0 && (
          <Card className="!p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: '#00ffff' }}>Historial de premios</h3>
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  color: '#00ff88',
                }}
              >
                Total: Bs {rouletteData.total_winnings}
              </span>
            </div>
            <div className="space-y-2">
              {rouletteData.history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div>
                    <p className="text-xs font-medium text-text-primary">{item.package_name}</p>
                    <p className="text-[10px] text-text-secondary">
                      {new Date(item.spun_at).toLocaleDateString('es-BO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#00ff88' }}>
                    +{item.won_bs} Bs
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
