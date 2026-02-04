'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import BottomNav from '@/components/ui/BottomNav'
import { useToast } from '@/components/ui/Toast'
import ScreenshotProtection from '@/components/ui/ScreenshotProtection'

interface Withdrawal {
  id: string
  amount_bs: number
  status: string
  created_at: string
  receipt_url?: string | null
}

export default function WithdrawalsPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [payoutMethod, setPayoutMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [balance, setBalance] = useState(0)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/withdrawals', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance)
        setWithdrawals(data.withdrawals)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const amountNum = parseFloat(amount)
    const allowedAmounts = [50, 300, 700, 1500, 2500, 5000]
    if (isNaN(amountNum) || !allowedAmounts.includes(amountNum)) {
      setError('Solo se permiten retiros de Bs 50, 300, 700, 1.500, 2.500 o 5.000')
      return
    }

    if (amountNum > balance) {
      setError('Saldo insuficiente')
      return
    }

    if (!bankName || !qrFile || !payoutMethod || !phoneNumber) {
      setError('Completa todos los campos y sube tu QR')
      return
    }

    setLoading(true)

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (!token) {
        router.push('/login')
        return
      }

      // First upload the QR image
      const formData = new FormData()
      formData.append('file', qrFile)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Error al subir la imagen QR')
      }

      const { url: qrImageUrl } = await uploadRes.json()

      // Create withdrawal with QR image URL
      const withdrawalRes = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount_bs: amountNum,
          bank_name: bankName,
          qr_image_url: qrImageUrl,
          payout_method: payoutMethod,
          phone_number: phoneNumber,
        }),
      })

      if (!withdrawalRes.ok) {
        const data = await withdrawalRes.json()
        throw new Error(data.error || 'Error al solicitar retiro')
      }

      showToast('Solicitud exitosa. Tu pago se abonara en 24 a 72 horas.', 'success')
      setAmount('')
      setBankName('')
      setQrFile(null)
      setQrPreview(null)
      setPayoutMethod('')
      setPhoneNumber('')
      fetchData()
    } catch (err: any) {
      setError(err.message || 'Error al procesar retiro')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-500'
      case 'PAID':
        return 'text-green-500'
      case 'REJECTED':
        return 'text-red-500'
      default:
        return 'text-text-secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente'
      case 'PAID':
        return 'Pagado'
      case 'REJECTED':
        return 'Rechazado'
      default:
        return status
    }
  }

  const allowedAmounts = [
    { amount: 50, color: 'from-cyan-500 to-blue-500' },
    { amount: 300, color: 'from-purple-500 to-pink-500' },
    { amount: 700, color: 'from-green-500 to-emerald-500' },
    { amount: 1500, color: 'from-orange-500 to-red-500' },
    { amount: 2500, color: 'from-yellow-500 to-amber-500' },
    { amount: 5000, color: 'from-indigo-500 to-purple-500' },
  ]

  const calculateFinalAmount = (amount: number) => {
    const discount = amount * 0.15
    return amount - discount
  }

  return (
    <div className="min-h-screen pb-20">
      <ScreenshotProtection />
      <div className="max-w-screen-xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-sm font-bold text-gold gold-glow">Retiros</h1>
          <p className="mt-2 text-text-secondary uppercase tracking-wider text-sm font-light">
            Solicita tu retiro
          </p>
          <p className="mt-2 text-[10px] text-text-secondary">
            Retiros desde Bs 50. Pagos de lunes a viernes. Se acreditan de 24 a 72 horas
            despues de la solicitud.
          </p>
          <p className="mt-2 text-[10px] text-red-400 font-semibold">
            Se aplicara un 15% de descuento a toda la solicitud de pago.
          </p>
        </div>

        <Card glassEffect>
          <p className="text-xs font-semibold text-gold text-center mb-4 uppercase tracking-wider">
            💰 Montos Disponibles para Retiro
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {allowedAmounts.map(({ amount: mont, color }) => {
              const finalAmount = calculateFinalAmount(mont)
              const isSelected = amount === mont.toString()

              return (
                <button
                  key={mont}
                  onClick={() => setAmount(mont.toString())}
                  className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform hover:scale-105 ${isSelected
                      ? 'ring-2 ring-gold shadow-lg shadow-gold/50'
                      : 'hover:shadow-xl'
                    }`}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${color.split(' ')[0].replace('from-', '#')}, ${color.split(' ')[2].replace('to-', '#')})`
                      : 'rgba(26, 26, 46, 0.6)',
                    border: isSelected ? '2px solid #ffd700' : '2px solid rgba(255, 215, 0, 0.2)'
                  }}
                >
                  <div className="relative z-10">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-black text-white">
                        {mont >= 1000 ? `${(mont / 1000).toFixed(1)}K` : mont}
                      </div>
                      <div className="text-xs text-white/80 font-medium">
                        Bs {mont.toLocaleString('es-ES')}
                      </div>
                      <div className="h-px bg-white/30 my-2"></div>
                      <div className="text-xs text-white/90 font-semibold">
                        Recibes:
                      </div>
                      <div className="text-lg font-bold text-white">
                        Bs {finalAmount.toFixed(0)}
                      </div>
                      <div className="text-[10px] text-white/70">
                        (-15% desc.)
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="text-center mb-6">
            <p className="text-sm text-text-secondary uppercase tracking-wider font-light mb-2">
              Saldo disponible
            </p>
            <p className="text-sm font-bold text-gold gold-glow">
              Bs {balance.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Monto a retirar"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />

            <div>
              <Input
                label="Nombre del banco"
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ej: Banco Union"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-text-secondary font-medium ml-1">
                Imagen QR para recibir pago <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrFileChange}
                className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-dark-bg hover:file:bg-gold/80"
                required
              />
              {qrPreview && (
                <div className="mt-2">
                  <p className="text-xs text-green-400 mb-2">Vista previa de tu QR:</p>
                  <img
                    src={qrPreview}
                    alt="Vista previa QR"
                    className="w-32 h-32 object-contain rounded-lg border border-gold/30"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-medium ml-1">Metodo de retiro</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                required
              >
                <option value="" disabled>Selecciona un metodo</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="QR Simple">QR Simple</option>
                <option value="Tigo Money">Tigo Money</option>
                <option value="USDT">USDT (Cripto)</option>
              </select>
            </div>

            <Input
              label="Numero de telefono"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ej: 7XXXXXXX"
              required
            />

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-btn">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Procesando...' : 'Solicitar Retiro'}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gold">Historial de Retiros</h2>
          {withdrawals.length === 0 ? (
            <Card>
              <p className="text-center text-text-secondary">
                No tienes retiros registrados
              </p>
            </Card>
          ) : (
            withdrawals.map((w) => (
              <Card key={w.id}>
                <div className="flex gap-3">
                  {/* Miniatura del comprobante */}
                  {w.status === 'PAID' && w.receipt_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={w.receipt_url}
                        alt="Comprobante"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gold/30 select-none"
                      />
                    </div>
                  )}

                  {/* Informacion del retiro */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-text-primary">
                          Bs {w.amount_bs.toFixed(2)}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {new Date(w.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <span className={`font-medium ${getStatusColor(w.status)}`}>
                        {getStatusText(w.status)}
                      </span>
                    </div>
                    {w.status === 'PAID' && w.receipt_url && (
                      <p className="text-xs text-green-400">
                        Comprobante adjunto
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <p className="mt-6 text-xs text-text-secondary text-center">
        © 2026 TeknolaApp. Todos los derechos reservados.
      </p>

      <BottomNav />
    </div>
  )
}
