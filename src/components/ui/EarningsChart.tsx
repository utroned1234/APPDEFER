'use client'

import { useEffect, useState } from 'react'

interface EarningsData {
  date: string
  amount: number
  day: string
}

interface EarningsChartProps {
  dailyProfit: number
  totalEarnings: number
  earningsHistory: EarningsData[]
}

export default function EarningsChart({ dailyProfit, totalEarnings, earningsHistory }: EarningsChartProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Calcular el máximo para escalar el gráfico
  const maxAmount = Math.max(...earningsHistory.map(e => e.amount), dailyProfit, 1)
  const chartHeight = 160
  const chartWidth = 500
  const padding = { top: 20, bottom: 30, left: 10, right: 10 }
  const graphWidth = chartWidth - padding.left - padding.right
  const graphHeight = chartHeight - padding.top - padding.bottom

  // Generar puntos para el gráfico
  const points = earningsHistory.map((entry, index) => {
    const x = padding.left + (index / Math.max(earningsHistory.length - 1, 1)) * graphWidth
    const y = padding.top + graphHeight - (entry.amount / maxAmount) * graphHeight
    return { x, y, ...entry }
  })

  // Crear el path de la línea
  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''

  // Crear el path del área (para el relleno)
  const areaPath = points.length > 0
    ? `M ${padding.left} ${padding.top + graphHeight} ` +
      points.map(p => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${padding.left + graphWidth} ${padding.top + graphHeight} Z`
    : ''

  // Calcular total de la semana
  const weekTotal = earningsHistory.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(6, 0, 16, 0.9), rgba(13, 26, 45, 0.85))',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(51, 230, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 0 30px rgba(0, 217, 255, 0.1)',
      }}
    >
      {/* Esquinas decorativas */}
      <div
        className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl-2xl"
        style={{ borderColor: 'rgba(51, 230, 255, 0.8)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br-2xl"
        style={{ borderColor: 'rgba(51, 230, 255, 0.8)' }}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#00f3ff', boxShadow: '0 0 8px #00f3ff' }}
          />
          <span
            className="text-xs font-bold tracking-wider"
            style={{
              color: '#33e6ff',
              textShadow: '0 0 5px rgba(51, 230, 255, 0.5)',
              fontFamily: 'Orbitron, sans-serif',
            }}
          >
            HISTORIAL DE GANANCIAS
          </span>
        </div>
        <span className="text-[9px] text-white/40 uppercase tracking-wider">
          Últimos 7 días
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(188, 19, 254, 0.1)', border: '1px solid rgba(188, 19, 254, 0.3)' }}>
          <p className="text-[8px] text-white/50 uppercase tracking-wider mb-1">Hoy</p>
          <p className="text-sm font-bold" style={{ color: '#bc13fe', textShadow: '0 0 10px rgba(188, 19, 254, 0.5)' }}>
            Bs {dailyProfit.toFixed(2)}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(51, 230, 255, 0.1)', border: '1px solid rgba(51, 230, 255, 0.3)' }}>
          <p className="text-[8px] text-white/50 uppercase tracking-wider mb-1">Esta Semana</p>
          <p className="text-sm font-bold" style={{ color: '#33e6ff', textShadow: '0 0 10px rgba(51, 230, 255, 0.5)' }}>
            Bs {weekTotal.toFixed(2)}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
          <p className="text-[8px] text-white/50 uppercase tracking-wider mb-1">Total</p>
          <p className="text-sm font-bold" style={{ color: '#00ff88', textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}>
            Bs {totalEarnings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full overflow-hidden" style={{ height: chartHeight }}>
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#bc13fe" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#bc13fe" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines horizontales */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={padding.top + graphHeight * ratio}
              x2={chartWidth - padding.right}
              y2={padding.top + graphHeight * ratio}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}

          {/* Grid lines verticales */}
          {points.map((point, i) => (
            <line
              key={`v-${i}`}
              x1={point.x}
              y1={padding.top}
              x2={point.x}
              y2={padding.top + graphHeight}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#gradientArea)"
              className={`transition-opacity duration-1000 ${isVisible ? 'opacity-60' : 'opacity-0'}`}
              style={{ animation: isVisible ? 'pulseArea 4s infinite alternate' : 'none' }}
            />
          )}

          {/* Main line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#bc13fe"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: isVisible ? 0 : 1000,
                transition: 'stroke-dashoffset 2s ease-out',
              }}
            />
          )}

          {/* Data points */}
          {points.map((point, i) => (
            <g key={i}>
              {/* Línea vertical al punto */}
              <line
                x1={point.x}
                y1={point.y}
                x2={point.x}
                y2={padding.top + graphHeight}
                stroke="rgba(188, 19, 254, 0.2)"
                strokeWidth="1"
                strokeDasharray="3,3"
                className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
              />
              {/* Círculo exterior */}
              <circle
                cx={point.x}
                cy={point.y}
                r={point.amount > 0 ? 6 : 4}
                fill="rgba(188, 19, 254, 0.3)"
                className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
              />
              {/* Círculo principal */}
              <circle
                cx={point.x}
                cy={point.y}
                r={point.amount > 0 ? 4 : 3}
                fill={point.amount > 0 ? '#bc13fe' : 'rgba(255,255,255,0.3)'}
                className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  transitionDelay: `${0.3 + i * 0.1}s`,
                  filter: point.amount > 0 ? 'drop-shadow(0 0 6px #bc13fe)' : 'none',
                }}
              />
              {/* Punto blanco interior */}
              <circle
                cx={point.x}
                cy={point.y}
                r="2"
                fill="#fff"
                className={`transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
              />
              {/* Monto sobre el punto */}
              {point.amount > 0 && (
                <text
                  x={point.x}
                  y={point.y - 12}
                  textAnchor="middle"
                  fill="#bc13fe"
                  fontSize="8"
                  fontFamily="Orbitron, sans-serif"
                  fontWeight="bold"
                  className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${0.5 + i * 0.1}s` }}
                >
                  {point.amount.toFixed(0)}
                </text>
              )}
            </g>
          ))}

          {/* X-axis labels (días) */}
          {points.map((point, i) => (
            <text
              key={`label-${i}`}
              x={point.x}
              y={chartHeight - 5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="9"
              fontFamily="Orbitron, sans-serif"
            >
              {point.day}
            </text>
          ))}
        </svg>

        {/* Scanning line effect */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(51, 230, 255, 0.1), transparent)',
            animation: 'scanLine 3s infinite linear',
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#bc13fe', boxShadow: '0 0 4px #bc13fe' }} />
          <span className="text-[8px] text-white/50 uppercase">Ganancia Diaria</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <span className="text-[8px] text-white/50 uppercase">Sin Ganancia</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseArea {
          from { opacity: 0.4; }
          to { opacity: 0.7; }
        }
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
