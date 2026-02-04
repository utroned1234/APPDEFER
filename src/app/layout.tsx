import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { ThemeProvider } from '@/context/ThemeContext'
import CircuitBackground from '@/components/ui/CircuitBackground'
import LogoutButton from '@/components/ui/LogoutButton'

export const metadata: Metadata = {
  title: 'TecnolaApp',
  description: 'Plataforma TecnolaApp Premium - Sistema Futurista',
  icons: {
    icon: [
      {
        url: 'https://i.ibb.co/35y8M1HR/vecteezy-online-store-with-smartphone-shop-concept-illustration-for-8480599.png',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: 'https://i.ibb.co/35y8M1HR/vecteezy-online-store-with-smartphone-shop-concept-illustration-for-8480599.png',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#020409',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TecnolaApp',
  },
}

// Iniciar cron jobs solo si esta habilitado por entorno
if (typeof window === 'undefined' && process.env.ENABLE_INTERNAL_CRON === 'true') {
  import('@/lib/cron').then(({ startDailyProfitCron }) => {
    startDailyProfitCron()
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-inter bg-dark-bg text-text-primary antialiased">
        <ToastProvider>
          <ThemeProvider>
            {/* Fondo de circuito animado */}
            <CircuitBackground />

            <div className="min-h-screen relative z-10">
              <header className="sticky top-0 z-40 bg-transparent backdrop-blur-md">
                <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
                  <div className="w-16" />
                  <span className="text-sm font-bold tracking-[0.35em] text-gold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    TECNOLAPP
                  </span>
                  <LogoutButton />
                </div>
              </header>
              {children}
            </div>
          </ThemeProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

