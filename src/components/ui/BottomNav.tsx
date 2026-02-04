'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/home',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      )
    },
    {
      href: '/paks',
      label: 'Paks',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
        </svg>
      )
    },
    {
      href: '/ruleta',
      label: 'Ruleta',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 6v2M12 16v2M6 12h2M16 12h2M7.76 7.76l1.41 1.41M14.83 14.83l1.41 1.41M7.76 16.24l1.41-1.41M14.83 9.17l1.41-1.41"/>
        </svg>
      )
    },
    {
      href: '/tables',
      label: 'Tabla',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
        </svg>
      )
    },
    {
      href: '/withdrawals',
      label: 'Billetera',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      )
    },
  ]

  return (
    <nav
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      style={{ fontFamily: 'Orbitron, sans-serif' }}
    >
      <div
        className="flex items-end gap-5 px-6 py-2 rounded-2xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 0, 16, 0.95), rgba(13, 26, 45, 0.9))',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '2px solid rgba(51, 230, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 217, 255, 0.3), 0 0 60px rgba(0, 217, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 217, 255, 0.4), 0 0 80px rgba(0, 217, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          e.currentTarget.style.borderColor = 'rgba(51, 230, 255, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.3), 0 0 60px rgba(0, 217, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(51, 230, 255, 0.4)'
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative group"
            >
              {/* Label flotante */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 0, 16, 0.98), rgba(13, 26, 45, 0.95))',
                  border: '2px solid rgba(51, 230, 255, 0.6)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 6px 20px rgba(0, 217, 255, 0.4), 0 0 30px rgba(0, 217, 255, 0.2)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  transform: 'translateX(-50%) translateY(10px) scale(0.8)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(-50%) translateY(0) scale(1)'
                }}
              >
                {item.label}
                {/* Flecha */}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid rgba(51, 230, 255, 0.6)',
                  }}
                />
              </div>

              {/* Dock Item */}
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-[400ms] relative overflow-hidden"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(51, 230, 255, 0.3), rgba(0, 180, 255, 0.2))'
                    : 'linear-gradient(135deg, rgba(51, 230, 255, 0.15), rgba(0, 150, 200, 0.1))',
                  border: `2px solid ${isActive ? 'rgba(51, 230, 255, 1)' : 'rgba(51, 230, 255, 0.5)'}`,
                  boxShadow: isActive
                    ? '0 8px 32px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    : '0 4px 16px rgba(0, 217, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transform: isActive ? 'translateY(-12px) scale(1.2)' : 'translateY(0) scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.2)'
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(51, 230, 255, 0.3), rgba(0, 180, 255, 0.2))'
                    e.currentTarget.style.borderColor = 'rgba(51, 230, 255, 1)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(51, 230, 255, 0.15), rgba(0, 150, 200, 0.1))'
                    e.currentTarget.style.borderColor = 'rgba(51, 230, 255, 0.5)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 217, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 group-hover:animate-[shine_0.5s_ease] pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transform: 'translateX(-100%)',
                  }}
                />

                {/* Icon */}
                <div
                  className="relative z-10 w-5 h-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    color: isActive ? '#00ffff' : '#33e6ff',
                    filter: isActive
                      ? 'drop-shadow(0 0 12px rgba(0, 255, 255, 1)) drop-shadow(0 0 20px rgba(0, 217, 255, 0.6))'
                      : 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.8))',
                  }}
                >
                  {item.icon}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Reflejo del dock */}
      <div
        className="absolute top-full left-0 right-0 h-5 pointer-events-none opacity-50 rounded-b-3xl"
        style={{
          background: 'linear-gradient(to bottom, rgba(51, 230, 255, 0.1), transparent)',
        }}
      />
    </nav>
  )
}
