'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import BottomNav from '@/components/ui/BottomNav'

interface VipPackage {
  id: number
  level: number
  name: string
  investment_bs: number
  daily_profit_bs: number
}

interface BonusRule {
  id: number
  level: number
  percentage: number
}

export default function TablesPage() {
  const [packages, setPackages] = useState<VipPackage[]>([])
  const [bonusRules, setBonusRules] = useState<BonusRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usar cache: 'no-store' para obtener siempre datos frescos
        const [pkgRes, bonusRes] = await Promise.all([
          fetch('/api/packages', { cache: 'no-store' }),
          fetch('/api/bonus-rules', { cache: 'no-store' })
        ])

        if (pkgRes.ok) {
          const data = await pkgRes.json()
          setPackages(data)
        }

        if (bonusRes.ok) {
          const bonusData = await bonusRes.json()
          setBonusRules(bonusData)
        }
      } catch (error) {
        console.error('Error fetching tables:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const calculateMonthly = (profit: number) => {
    return (profit * 30).toFixed(2)
  }

  const calculateYearly = (profit: number) => {
    return (profit * 365).toFixed(2)
  }

  const calculateTwoYears = (profit: number) => {
    return (profit * 730).toFixed(2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <p className="text-gold text-xl">Cargando tablas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto p-3 space-y-3">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gold gold-glow">Tabla de Ganancias</h1>
          <p className="mt-1 text-text-secondary uppercase tracking-wider text-[10px] font-light">
            Resumen de paquetes y bonos
          </p>
        </div>

        <Card className="overflow-x-auto !p-3">
          <h2 className="text-sm font-bold text-gold mb-1">Tabla de Paquetes</h2>
          <p className="text-[9px] text-text-secondary mb-2">
            Proyección de ganancias diarias, mensuales, anuales y bienales.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b border-gold border-opacity-30">
                  <th className="text-left py-1 px-1 text-gold uppercase text-[8px]">Paquete</th>
                  <th className="text-right py-1 px-1 text-gold uppercase text-[8px]">Inversión</th>
                  <th className="text-right py-1 px-1 text-gold uppercase text-[8px]">Diario</th>
                  <th className="text-right py-1 px-1 text-gold uppercase text-[8px]">Mensual</th>
                  <th className="text-right py-1 px-1 text-gold uppercase text-[8px]">1 Año</th>
                  <th className="text-right py-1 px-1 text-gold uppercase text-[8px]">2 Años</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={`table-${pkg.id}`} className="border-b border-gold border-opacity-10">
                    <td className="py-1 px-1 text-text-primary font-medium text-[9px]">{pkg.name}</td>
                    <td className="py-1 px-1 text-text-secondary text-right">Bs {pkg.investment_bs.toFixed(0)}</td>
                    <td className="py-1 px-1 text-text-secondary text-right">Bs {pkg.daily_profit_bs.toFixed(2)}</td>
                    <td className="py-1 px-1 text-green-400 text-right font-medium">
                      Bs {calculateMonthly(pkg.daily_profit_bs)}
                    </td>
                    <td className="py-1 px-1 text-gold text-right font-bold">
                      Bs {calculateYearly(pkg.daily_profit_bs)}
                    </td>
                    <td className="py-1 px-1 text-gold-bright text-right font-bold">
                      Bs {calculateTwoYears(pkg.daily_profit_bs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-x-auto !p-3">
          <h2 className="text-sm font-bold text-gold mb-1">Bono de Patrocinio</h2>
          <p className="text-[9px] text-text-secondary mb-2">
            Bonos por niveles. Ejemplo: con 5 personas por nivel.
          </p>

          {/* Tabla de porcentajes por nivel */}
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b border-gold border-opacity-30">
                  <th className="text-left py-1 px-1 text-gold uppercase text-[8px]">Nivel</th>
                  <th className="text-center py-1 px-1 text-gold uppercase text-[8px]">% Bono</th>
                  {packages.map((pkg) => (
                    <th key={`bonus-head-${pkg.id}`} className="text-right py-1 px-1 text-gold uppercase text-[8px]">
                      {pkg.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bonusRules.map((rule) => (
                  <tr key={`bonus-${rule.id}`} className="border-b border-gold border-opacity-10">
                    <td className="py-1 px-1 text-text-primary font-medium">Nivel {rule.level}</td>
                    <td className="py-1 px-1 text-center text-green-400 font-bold">{rule.percentage}%</td>
                    {packages.map((pkg) => (
                      <td key={`bonus-${rule.id}-${pkg.id}`} className="py-1 px-1 text-text-secondary text-right">
                        Bs {((pkg.investment_bs * rule.percentage) / 100).toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ejemplo con 5 personas por nivel */}
          <div className="mt-3 p-2 bg-dark-card bg-opacity-50 rounded-lg border border-gold/20">
            <h3 className="text-[10px] font-bold text-gold mb-1">Ejemplo: 5 personas por nivel</h3>
            <p className="text-[8px] text-text-secondary mb-2">
              Si tienes 5 personas en cada nivel con diferentes paquetes:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-[9px]">
                <thead>
                  <tr className="border-b border-gold border-opacity-30">
                    <th className="text-left py-1 px-1 text-gold uppercase text-[8px]">Nivel</th>
                    {packages.map((pkg) => (
                      <th key={`example-head-${pkg.id}`} className="text-right py-1 px-1 text-gold uppercase text-[8px]">
                        {pkg.name}
                      </th>
                    ))}
                    <th className="text-right py-1 px-1 text-gold-bright uppercase text-[8px] font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusRules.map((rule) => {
                    const totalByLevel = packages.reduce((sum, pkg) =>
                      sum + ((pkg.investment_bs * rule.percentage) / 100) * 5, 0
                    )
                    return (
                      <tr key={`example-${rule.id}`} className="border-b border-gold border-opacity-10">
                        <td className="py-1 px-1 text-text-primary font-medium">
                          Nivel {rule.level}
                          <span className="text-[8px] text-text-secondary ml-1">(5 pers.)</span>
                        </td>
                        {packages.map((pkg) => (
                          <td key={`example-${rule.id}-${pkg.id}`} className="py-1 px-1 text-green-400 text-right">
                            Bs {(((pkg.investment_bs * rule.percentage) / 100) * 5).toFixed(2)}
                          </td>
                        ))}
                        <td className="py-1 px-1 text-gold-bright text-right font-bold">
                          Bs {totalByLevel.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                  {/* Total general */}
                  <tr className="border-t-2 border-gold border-opacity-50 bg-gold/5">
                    <td className="py-1 px-1 text-gold font-bold uppercase text-[9px]">
                      Total General
                    </td>
                    {packages.map((pkg) => {
                      const totalByPackage = bonusRules.reduce((sum, rule) =>
                        sum + ((pkg.investment_bs * rule.percentage) / 100) * 5, 0
                      )
                      return (
                        <td key={`total-pkg-${pkg.id}`} className="py-1 px-1 text-gold text-right font-bold">
                          Bs {totalByPackage.toFixed(2)}
                        </td>
                      )
                    })}
                    <td className="py-1 px-1 text-gold-bright text-right font-bold text-[10px]">
                      Bs {bonusRules.reduce((sum, rule) =>
                        sum + packages.reduce((pkgSum, pkg) =>
                          pkgSum + ((pkg.investment_bs * rule.percentage) / 100) * 5, 0
                        ), 0
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[8px] text-text-secondary mt-2 italic">
              * Los bonos se pagan una sola vez cuando tus referidos activan su paquete VIP.
            </p>
          </div>
        </Card>
      </div>

      <p className="mt-6 text-xs text-text-secondary text-center">
        © 2026 TeknolaApp. Todos los derechos reservados.
      </p>

      <BottomNav />
    </div>
  )
}
