'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/ui/BottomNav'
import ScreenshotProtection from '@/components/ui/ScreenshotProtection'

interface VipPackage {
  id: number
  level: number
  name: string
  investment_bs: number
  daily_profit_bs: number
  is_enabled: boolean
}

export default function PaksPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<VipPackage[]>([])
  const [purchasedPackages, setPurchasedPackages] = useState<{ id: number; status: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (token) {
        const purchasesRes = await fetch('/api/purchases/my', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (purchasesRes.ok) {
          const purchases = await purchasesRes.json()
          const paks = purchases
            .map((purchase: { vip_package_id: number; status: string }) => ({
              id: purchase.vip_package_id,
              status: purchase.status,
            }))
            .filter((p: { id: number }) => typeof p.id === 'number')
          setPurchasedPackages(paks)
        }
      }

      const res = await fetch('/api/packages', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (res.ok) {
        const data = await res.json()
        setPackages(data)
      }

    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePercentage = (profit: number, investment: number) => {
    if (!investment || investment <= 0) return '0.00'
    return ((profit / investment) * 100).toFixed(2)
  }

  const calculateMonthly = (profit: number) => {
    return (profit * 30).toFixed(2)
  }

  const getPackageIcon = (level: number) => {
    const icons = [
      <path key="1" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />, // Lightning
      <path key="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, // Shield
      <circle key="3" cx="12" cy="12" r="10" />, // Circle
      <path key="4" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />, // Star
      <path key="5" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />, // Hexagon
      <path key="6" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />, // Zap
      <path key="7" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />, // Layers
    ]
    return icons[(level - 1) % icons.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-cyan-primary text-xl" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          <div className="inline-block animate-pulse">Cargando Paquetes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20" style={{ fontFamily: 'Orbitron, sans-serif' }}>
      <ScreenshotProtection />
      <div className="max-w-screen-xl mx-auto p-6 space-y-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold gold-glow uppercase tracking-wider mb-2">
            Paquetes VIP
          </h1>
          <p className="text-text-secondary text-sm uppercase tracking-widest">
            Elige tu nivel de inversión
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {packages.map((pkg) => {
            const purchasedData = purchasedPackages.find(p => p.id === pkg.id)
            const isPurchased = !!purchasedData
            const isDisabled = !pkg.is_enabled || isPurchased

            return (
              <div
                key={pkg.id}
                className="relative group"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 0, 16, 0.9), rgba(13, 26, 45, 0.85))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(51, 230, 255, 0.4)',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0, 217, 255, 0.15)',
                }}
                onClick={() => !isDisabled && router.push(`/paks/${pkg.id}/buy`)}
              >
                <div className="relative z-10 space-y-2">
                  {/* Icon + Title */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(51, 230, 255, 0.2), rgba(0, 180, 255, 0.1))',
                        border: '1px solid rgba(51, 230, 255, 0.5)',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#33e6ff"
                        strokeWidth="2"
                        className="w-4 h-4"
                      >
                        {getPackageIcon(pkg.level)}
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-cyan-primary uppercase">
                        {pkg.name}
                      </h2>
                      <p className="text-[10px] text-text-secondary">
                        Nivel {pkg.level}
                      </p>
                    </div>
                  </div>

                  {/* Stats compactos */}
                  <div className="space-y-1 text-[10px] border-t border-cyan-primary/20 pt-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Inversión:</span>
                      <span className="font-bold text-white">Bs {pkg.investment_bs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Diario:</span>
                      <span className="font-bold text-cyan-primary">Bs {pkg.daily_profit_bs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Mensual:</span>
                      <span className="font-bold text-cyan-primary">Bs {calculateMonthly(pkg.daily_profit_bs)}</span>
                    </div>
                  </div>

                  {/* Porcentaje grande */}
                  <div className="text-center py-1">
                    <span className="text-lg font-bold text-cyan-primary">
                      {calculatePercentage(pkg.daily_profit_bs, pkg.investment_bs)}%
                    </span>
                  </div>

                  {/* Button pequeño */}
                  <button
                    disabled={isDisabled}
                    className="w-full py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
                    style={{
                      background: isDisabled
                        ? 'rgba(51, 230, 255, 0.1)'
                        : 'linear-gradient(135deg, rgba(51, 230, 255, 0.15), rgba(0, 150, 200, 0.1))',
                      border: `1px solid ${isDisabled ? 'rgba(51, 230, 255, 0.2)' : 'rgba(51, 230, 255, 0.5)'}`,
                      color: isDisabled ? 'rgba(51, 230, 255, 0.4)' : '#33e6ff',
                    }}
                  >
                    {isPurchased ? '✓ Comprado' : pkg.is_enabled ? 'Comprar' : 'No Disponible'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      <p className="mt-8 text-xs text-text-secondary text-center uppercase tracking-wider">
        © 2026 TeknolaApp. Todos los derechos reservados.
      </p>

      <BottomNav />
    </div>
  )
}

