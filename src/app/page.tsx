import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-6">
          {/* Logo SVG de TECNOLAPP */}
          <svg width="120" height="120" viewBox="0 0 100 120" className="mx-auto">
            <defs>
              <linearGradient id="logoGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#33e6ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#00d9ff', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <g transform="translate(0, 10)">
              <path
                d="M 10 10 L 90 10 L 80 25 L 60 25 L 60 35 L 40 35 L 40 25 L 20 25 Z"
                fill="url(#logoGradMain)"
              />
              <path
                d="M 35 40 H 65 L 60 85 L 50 95 L 40 85 Z"
                fill="url(#logoGradMain)"
              />
              <rect x="42" y="50" width="16" height="25" fill="#000" opacity="0.3" />
            </g>
          </svg>

          <h1 className="text-5xl font-bold text-gold uppercase tracking-widest text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            TECNOLAPP
          </h1>
          <p className="text-sm text-text-secondary font-light tracking-wider">
            Sistema Futurista de Inversiones
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full text-lg uppercase tracking-wider">
              Iniciar Sesión
            </Button>
          </Link>

          <Link href="/signup" className="block">
            <Button variant="outline" className="w-full text-lg uppercase tracking-wider">
              Registrarse
            </Button>
          </Link>
        </div>

        <p className="text-sm text-text-secondary pt-4 uppercase tracking-widest">
          Tu camino hacia el éxito financiero
        </p>
      </div>
      <p className="mt-8 text-xs text-text-secondary">© 2026 TecnolaApp. Todos los derechos reservados.</p>
    </div>
  )
}
