'use client'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
}

export default function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div
      className={`futuristic-card relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(6, 0, 16, 0.9), rgba(13, 26, 45, 0.85))',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(51, 230, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 0 30px rgba(0, 217, 255, 0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Esquinas decorativas */}
      <div
        className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl-2xl pointer-events-none"
        style={{ borderColor: 'rgba(51, 230, 255, 0.8)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br-2xl pointer-events-none"
        style={{ borderColor: 'rgba(51, 230, 255, 0.8)' }}
      />

      {/* Header opcional */}
      {title && (
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#00f3ff', boxShadow: '0 0 8px #00f3ff' }}
            />
            <span
              className="text-xs font-bold tracking-wider uppercase"
              style={{
                color: '#33e6ff',
                textShadow: '0 0 5px rgba(51, 230, 255, 0.5)',
                fontFamily: 'Orbitron, sans-serif',
              }}
            >
              {title}
            </span>
          </div>
          {subtitle && (
            <span className="text-[9px] text-white/40 uppercase tracking-wider">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Efecto de líneas de circuito en el fondo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `
            linear-gradient(90deg, transparent 0%, rgba(51, 230, 255, 0.05) 50%, transparent 100%),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(51, 230, 255, 0.02) 2px, rgba(51, 230, 255, 0.02) 4px)
          `,
        }}
      />

      <style jsx>{`
        .futuristic-card:hover {
          border-color: rgba(51, 230, 255, 0.5) !important;
          box-shadow: 0 0 40px rgba(0, 217, 255, 0.2), 0 8px 32px rgba(0, 217, 255, 0.15) !important;
        }
      `}</style>
    </div>
  )
}
