'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import BottomNav from '@/components/ui/BottomNav'
import { useToast } from '@/components/ui/Toast'
import ScreenshotProtection from '@/components/ui/ScreenshotProtection'
import EarningsChart from '@/components/ui/EarningsChart'

interface DashboardData {
  user: {
    username: string
    full_name: string
    user_code: string
    profile_image_url?: string | null
  }
  daily_profit: number
  daily_profit_total: number
  active_vip_daily: number
  active_vip_name: string | null
  active_vip_status: string | null
  has_active_vip: boolean
  active_purchases: {
    daily_profit_bs: number
    vip_package: {
      name: string
      level: number
    }
  }[]
  referral_bonus: number
  referral_bonus_total: number
  referral_bonus_levels: {
    level: number
    amount_bs: number
  }[]
  adjustments: {
    items: Array<{
      amount: number
      type: 'ABONADO' | 'DESCUENTO'
      description: string
    }>
    total: number
  }
  total_earnings: number
  network_count: number
  direct_referrals: number
  banners_top: any[]
  banners_bottom: any[]
  announcements: {
    id: number
    title: string
    body: string
    created_at: string
  }[]
  effort_bonuses: {
    id: number
    title: string
    target_kpi: string
    level_description: string
    amount_bs: number
    requirement_description: string
  }[]
  earnings_history: {
    date: string
    amount: number
    day: string
  }[]
}

interface DailyTask {
  id: number
  position: number
  image_url: string
  completed: boolean
  rating: number | null
  comment: string | null
}

export default function HomePage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingToken, setMissingToken] = useState(false)
  const [showAnnouncements, setShowAnnouncements] = useState(false)
  const [showAboutUs, setShowAboutUs] = useState(false)
  const [activating, setActivating] = useState(false)
  const [canActivate, setCanActivate] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [allTasksCompleted, setAllTasksCompleted] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null)
  const [taskRating, setTaskRating] = useState(0)
  const [taskComment, setTaskComment] = useState('')
  const [submittingTask, setSubmittingTask] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    fetchDashboard()
    checkActivationStatus()
    fetchDailyTasks()
    fetchWhatsappNumber()
  }, [])

  const fetchWhatsappNumber = async () => {
    try {
      const res = await fetch('/api/public/whatsapp')
      if (res.ok) {
        const data = await res.json()
        setWhatsappNumber(data.whatsapp_number || '')
      }
    } catch (error) {
      console.error('Error fetching WhatsApp number:', error)
    }
  }

  const fetchDailyTasks = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      if (!token) return

      const res = await fetch('/api/user/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result = await res.json()
        setDailyTasks(result.tasks || [])
        setAllTasksCompleted(result.all_completed)
      }
    } catch (error) {
      console.error('Error fetching daily tasks:', error)
    }
  }

  const handleTaskClick = (task: DailyTask) => {
    if (task.completed) return
    setSelectedTask(task)
    setTaskRating(0)
    setTaskComment('')
    setShowTaskModal(true)
  }

  const submitTaskCompletion = async () => {
    if (!selectedTask || taskRating === 0 || taskComment.trim().length < 3) {
      showToast('Por favor califica y comenta la imagen', 'error')
      return
    }

    setSubmittingTask(true)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      if (!token) return

      const res = await fetch('/api/user/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          task_id: selectedTask.id,
          rating: taskRating,
          comment: taskComment.trim(),
        }),
      })

      const result = await res.json()

      if (res.ok) {
        showToast('Tarea completada', 'success')
        setShowTaskModal(false)
        setSelectedTask(null)
        fetchDailyTasks()
        if (result.all_completed) {
          setAllTasksCompleted(true)
        }
      } else {
        showToast(result.error || 'Error al completar tarea', 'error')
      }
    } catch (error) {
      showToast('Error al completar tarea', 'error')
    } finally {
      setSubmittingTask(false)
    }
  }

  const checkActivationStatus = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      if (!token) return

      const res = await fetch('/api/user/activate-daily-profit', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result = await res.json()
        setCanActivate(result.can_activate)
      }
    } catch (error) {
      console.error('Error checking activation status:', error)
    }
  }

  const playMoneySound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Helper para crear tonos
      const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3, type: OscillatorType = 'sine') => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = type

        gainNode.gain.setValueAtTime(volume, audioContext.currentTime + startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration)

        oscillator.start(audioContext.currentTime + startTime)
        oscillator.stop(audioContext.currentTime + startTime + duration)
      }

      // Sonido de caja registradora "Cha-ching"

      // "Cha" - Campana/Bell agudo
      playTone(1800, 0, 0.08, 0.4, 'sine')
      playTone(2200, 0.02, 0.08, 0.3, 'sine')

      // Click mecánico inicial
      playTone(150, 0.08, 0.03, 0.2, 'square')

      // "Ching" - Drawer opening (cajón abriéndose)
      playTone(600, 0.12, 0.15, 0.35, 'triangle')
      playTone(400, 0.14, 0.2, 0.3, 'sine')
      playTone(300, 0.16, 0.25, 0.25, 'sine')

      // Resonancia metálica
      playTone(1200, 0.15, 0.3, 0.15, 'sine')
      playTone(800, 0.18, 0.35, 0.12, 'sine')

      // Click mecánico final
      playTone(120, 0.35, 0.05, 0.18, 'square')
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  const activateDailyProfit = async () => {
    if (activating || !canActivate) return

    setActivating(true)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (!token) {
        showToast('Sesión expirada', 'error')
        setActivating(false)
        return
      }

      const res = await fetch('/api/user/activate-daily-profit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await res.json()

      if (res.status === 423) {
        // Bloqueado - ya activó, esperar nueva tarea
        showToast(result.message || '🎉 Felicitaciones, espera tu nueva tarea', 'success')
        setCanActivate(false)
      } else if (res.ok) {
        // Éxito - reproducir sonido
        playMoneySound()
        showToast(`¡Ganancias activadas! +Bs ${result.total_profit.toFixed(2)}`, 'success')
        setCanActivate(false)
        // Recargar dashboard y estado de activación
        setTimeout(() => {
          fetchDashboard()
          checkActivationStatus()
        }, 1000)
      } else {
        // Error - refrescar estado de activación para asegurar consistencia
        showToast(result.error || 'Error al activar ganancias', 'error')
        setTimeout(() => checkActivationStatus(), 500)
      }
    } catch (error) {
      console.error('Error activating profit:', error)
      showToast('Error al activar ganancias', 'error')
      // Refrescar estado en caso de error de red
      setTimeout(() => checkActivationStatus(), 500)
    } finally {
      setActivating(false)
    }
  }

  const fetchDashboard = async () => {
    setError(null)
    setMissingToken(false)
    setLoading(true)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (!token) {
        setMissingToken(true)
        setError('Tu sesión expiró. Inicia sesión nuevamente.')
        return
      }

      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401 || res.status === 403) {
        document.cookie = 'auth_token=; path=/; max-age=0'
        router.push('/login')
        return
      }

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null)
        const message = errorPayload?.error || 'No se pudo cargar el dashboard. Intenta nuevamente.'
        setError(message)
        return
      }

      const result = await res.json()
      setData(result)
      setShowAnnouncements(!!result?.announcements?.length)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setError('Ocurrió un error al cargar los datos.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen debe ser menor a 5MB', 'error')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfileImage = async () => {
    if (!selectedFile) {
      showToast('Por favor selecciona una imagen', 'error')
      return
    }

    setUploadingPhoto(true)
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (!token) {
        showToast('Sesión expirada', 'error')
        setUploadingPhoto(false)
        return
      }

      // Convertir imagen a base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)

      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1]

          // Subir imagen al servidor
          const uploadRes = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          })

          if (!uploadRes.ok) {
            showToast('Error al subir la imagen', 'error')
            setUploadingPhoto(false)
            return
          }

          const uploadData = await uploadRes.json()
          const imageUrl = uploadData.url

          if (!imageUrl) {
            showToast('Error al obtener URL de imagen', 'error')
            setUploadingPhoto(false)
            return
          }

          // Guardar URL en la base de datos
          const res = await fetch('/api/user/profile-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ image_url: imageUrl }),
          })

          if (res.ok) {
            showToast('Foto de perfil actualizada', 'success')
            setShowPhotoModal(false)
            setSelectedFile(null)
            setPreviewUrl(null)
            fetchDashboard()
          } else {
            showToast('Error al actualizar la foto', 'error')
          }
        } catch (err) {
          console.error('Error in upload:', err)
          showToast('Error al subir la imagen', 'error')
        }
        setUploadingPhoto(false)
      }
    } catch (error) {
      console.error('Error updating profile image:', error)
      showToast('Error al actualizar la foto', 'error')
      setUploadingPhoto(false)
    }
  }


  const referralLink = data
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${data.user.user_code}`
    : ''
  const referralCopyText = referralLink

  const copyReferralLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralCopyText)
        showToast('Link copiado', 'success')
        return
      }
    } catch (err) {
      // Fallback below
    }

    const textarea = document.createElement('textarea')
    textarea.value = referralCopyText
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast(ok ? 'Link copiado' : 'No se pudo copiar el link', ok ? 'success' : 'error')
  }

  if (loading) return <div className="p-8 text-center text-gold animate-pulse">Cargando datos...</div>

  if (!data) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-screen-xl mx-auto p-6 space-y-6">
          <Card glassEffect>
            <div className="space-y-4 text-center">
              <p className="text-text-secondary">
                {error || 'Cargando información del dashboard...'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="primary" onClick={fetchDashboard}>
                  Reintentar
                </Button>
                {missingToken && (
                  <Button variant="outline" onClick={() => router.push('/login')}>
                    Ir a Login
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <ScreenshotProtection />
      <div className="max-w-screen-xl mx-auto p-4 space-y-4">
        {/* Header con perfil */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPhotoModal(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center text-dark-bg font-bold shadow-md shadow-gold/30 border-2 border-dark-card overflow-hidden hover:scale-105 transition-transform duration-300 relative group"
          >
            {data.user.profile_image_url ? (
              <img
                src={data.user.profile_image_url}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">{data.user.username?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </button>
          <div>
            <p className="text-xs font-bold text-text-primary">{data.user.full_name}</p>
            <p className="text-[10px] text-gold">@{data.user.username}</p>
          </div>
        </div>

        {data.announcements.length > 0 && showAnnouncements && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
            <div className="max-w-xl w-full">
              <Card glassEffect>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gold text-center w-full">
                    {data.announcements[0]?.title || 'Noticia'}
                  </h2>
                  <button
                    onClick={() => setShowAnnouncements(false)}
                    className="text-text-secondary hover:text-gold transition-colors text-sm"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="space-y-3">
                  {data.announcements.map((item) => (
                    <div key={item.id} className="border-b border-gold border-opacity-20 pb-3 last:border-b-0 last:pb-0 text-center">
                      <p className="text-sm text-text-secondary">{item.body}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Gráfico de Ganancias */}
        <EarningsChart
          dailyProfit={data.daily_profit}
          totalEarnings={data.total_earnings}
          earningsHistory={data.earnings_history || []}
        />

        {/* Botones de navegación rápida */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/my-purchases')}
            className="relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(188, 19, 254, 0.15), rgba(51, 230, 255, 0.1))',
              border: '1px solid rgba(188, 19, 254, 0.4)',
              boxShadow: '0 4px 20px rgba(188, 19, 254, 0.15)',
            }}
          >
            <span className="text-lg">👑</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#bc13fe' }}>Mis Compras</span>
          </button>
          <button
            onClick={() => router.push('/network')}
            className="relative overflow-hidden flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(51, 230, 255, 0.15), rgba(0, 255, 136, 0.1))',
              border: '1px solid rgba(51, 230, 255, 0.4)',
              boxShadow: '0 4px 20px rgba(51, 230, 255, 0.15)',
            }}
          >
            <span className="text-lg">🌐</span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#33e6ff' }}>Mi Red</span>
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Ganancia Diaria" subtitle="VIP">
            <p className="text-2xl font-bold mb-2" style={{ color: '#bc13fe', textShadow: '0 0 15px rgba(188, 19, 254, 0.5)' }}>
              Bs {data.daily_profit.toFixed(2)}
            </p>
            {data.has_active_vip ? (
              <div className="mt-2">
                {data.active_purchases.map((purchase) => (
                  <div
                    key={`${purchase.vip_package.level}-${purchase.vip_package.name}`}
                    className="text-xs text-text-secondary flex justify-between gap-2"
                  >
                    <span>
                      ✓ {purchase.vip_package.name} ACTIVO
                    </span>
                    <span>
                      Bs {purchase.daily_profit_bs.toFixed(2)}/día
                    </span>
                  </div>
                ))}
                <p className="text-xs text-text-secondary">
                  Acumulado: Bs {data.daily_profit_total.toFixed(2)}
                </p>

                {/* Tareas Diarias */}
                {dailyTasks.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-text-secondary mb-2 text-center">
                      Completa las {dailyTasks.length} tareas para activar:
                    </p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {dailyTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => handleTaskClick(task)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${task.completed
                            ? 'border-green-500 opacity-60'
                            : 'border-gold hover:border-gold-bright hover:scale-105'
                            }`}
                          disabled={task.completed}
                        >
                          <img
                            src={task.image_url}
                            alt={`Tarea ${task.position}`}
                            className="w-full h-full object-cover"
                          />
                          {task.completed && (
                            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                              <span className="text-xl">✓</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón de activar ganancias - Solo si completó las tareas */}
                <Button
                  variant="primary"
                  className="w-full mt-3 bg-gradient-to-r from-gold to-gold-bright hover:from-gold-bright hover:to-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={activateDailyProfit}
                  disabled={activating || !canActivate || (dailyTasks.length > 0 && !allTasksCompleted)}
                >
                  <span className="flex items-center justify-center gap-2">
                    {activating ? (
                      <>🔄 Activando...</>
                    ) : dailyTasks.length > 0 && !allTasksCompleted ? (
                      <>📋 Completa las tareas primero</>
                    ) : canActivate ? (
                      <>💰 Activar mis ganancias diarias</>
                    ) : (
                      <>🎉 Felicitaciones, espera tu nueva tarea</>
                    )}
                  </span>
                </Button>
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-text-secondary">
                  {data.active_vip_name
                    ? `${data.active_vip_name} ${data.active_vip_status === 'PENDING' ? 'PENDIENTE' : 'INACTIVO'}`
                    : 'Sin VIP activo'}
                </p>
                <p className="text-xs text-text-secondary">
                  Acumulado: Bs {data.daily_profit_total.toFixed(2)}
                </p>
              </div>
            )}
          </Card>

          <Card title="Bonos Patrocinio" subtitle="Red">
            <p className="text-2xl font-bold mb-2" style={{ color: '#00ff88', textShadow: '0 0 15px rgba(0, 255, 136, 0.5)' }}>
              Bs {data.referral_bonus_total.toFixed(2)}
            </p>
            {data.referral_bonus_levels.length > 0 && (
              <div className="mt-2 space-y-1 text-xs text-text-secondary">
                {data.referral_bonus_levels.map((item) => (
                  <div key={item.level} className="flex justify-between">
                    <span>Nivel {item.level}</span>
                    <span>Bs {item.amount_bs.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Link de Referido */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <div className="text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Tu código</p>
                <p className="text-lg font-bold" style={{ color: '#33e6ff', textShadow: '0 0 10px rgba(51, 230, 255, 0.5)', fontFamily: 'Orbitron, sans-serif' }}>
                  {data.user.user_code}
                </p>
              </div>
              <div
                className="rounded-lg px-3 py-2 text-[10px] text-white/60 break-all"
                style={{
                  background: 'rgba(51, 230, 255, 0.05)',
                  border: '1px solid rgba(51, 230, 255, 0.2)',
                }}
              >
                {referralLink}
              </div>
              <button
                onClick={copyReferralLink}
                className="w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(188, 19, 254, 0.2), rgba(51, 230, 255, 0.2))',
                  border: '1px solid rgba(188, 19, 254, 0.5)',
                  color: '#bc13fe',
                  boxShadow: '0 4px 15px rgba(188, 19, 254, 0.2)',
                }}
              >
                📋 Copiar link de referido
              </button>
            </div>
          </Card>

          {/* Ajustes Manuales */}
          {data.adjustments && data.adjustments.items.length > 0 && (
            <Card className="md:col-span-2" title="Ajustes desde Panel" subtitle="Admin">
              <p className={`text-xl font-bold mb-2 ${data.adjustments.total >= 0 ? '' : ''}`} style={{ color: data.adjustments.total >= 0 ? '#00ff88' : '#ff4444', textShadow: `0 0 15px ${data.adjustments.total >= 0 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 68, 0.5)'}` }}>
                {data.adjustments.total >= 0 ? '+' : ''}Bs {data.adjustments.total.toFixed(2)}
              </p>
              <div className="mt-2 space-y-1">
                {data.adjustments.items.map((adj, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-dark-card bg-opacity-50 rounded px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${adj.type === 'ABONADO' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {adj.type}
                      </span>
                      <span className="text-xs text-text-secondary">{adj.description}</span>
                    </div>
                    <span className={`text-sm font-bold ${adj.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {adj.amount >= 0 ? '+' : ''}Bs {adj.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="md:col-span-2" title="Ganancias Totales" subtitle="Balance">
            <p className="text-3xl font-bold text-center" style={{ color: '#33e6ff', textShadow: '0 0 20px rgba(51, 230, 255, 0.5)' }}>
              Bs {data.total_earnings.toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Network & Referrals Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card title="Mi Red" subtitle="Total">
            <p className="text-3xl font-bold text-center" style={{ color: '#bc13fe', textShadow: '0 0 15px rgba(188, 19, 254, 0.5)' }}>
              {data.network_count}
            </p>
            <p className="text-[10px] text-white/40 text-center mt-1 uppercase">personas</p>
          </Card>

          <Card title="Directos" subtitle="Nivel 1">
            <p className="text-3xl font-bold text-center" style={{ color: '#00ff88', textShadow: '0 0 15px rgba(0, 255, 136, 0.5)' }}>
              {data.direct_referrals}
            </p>
            <p className="text-[10px] text-white/40 text-center mt-1 uppercase">referidos</p>
          </Card>
        </div>

        <Card title="Bono Red" subtitle="Metas">
          <p className="text-xs text-text-secondary text-balance text-center mb-4">
            Aquí podrás ver nuevos bonos y promociones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-text-secondary">
            {data.effort_bonuses && data.effort_bonuses.length > 0 ? (
              data.effort_bonuses.map((bonus) => (
                <div
                  key={bonus.id}
                  className="relative rounded-xl px-4 py-3 transition-all duration-300 hover:-translate-y-1 text-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(51, 230, 255, 0.1), rgba(0, 150, 200, 0.05))',
                    border: '1px solid rgba(51, 230, 255, 0.3)',
                    boxShadow: '0 4px 15px rgba(0, 217, 255, 0.1)',
                  }}
                >
                  <p className="text-xs uppercase tracking-wider font-bold" style={{ color: '#33e6ff' }}>{bonus.title}</p>
                  <p className="mt-1 font-semibold text-white">{bonus.target_kpi}</p>
                  <p className="text-[10px] text-white/50">{bonus.level_description}</p>
                  <p className="mt-2 text-lg font-bold" style={{ color: '#bc13fe', textShadow: '0 0 10px rgba(188, 19, 254, 0.5)' }}>
                    Bs {bonus.amount_bs}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    {bonus.requirement_description}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-4">
                <p className="text-xs text-white/40">Próximamente más metas.</p>
              </div>
            )}
          </div>

          <p className="text-[10px] text-white/30 mt-4 text-center italic border-t border-white/10 pt-3">
            "Tu esfuerzo construye el hogar de tus sueños."
          </p>
        </Card>
      </div >

      <p className="mt-6 text-xs text-text-secondary text-center">
        © 2026 SmartHogar. Todos los derechos reservados por SmartHogar.
      </p>

      {/* Botón flotante - WhatsApp */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-2 z-40 w-12 h-12 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-green-500/30"
          title="Contactar soporte vía WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}

      {/* Modal - Foto de Perfil */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-card p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-gold font-bold">Actualizar foto de perfil</h3>
              <button
                onClick={() => {
                  setShowPhotoModal(false)
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                className="text-text-secondary hover:text-gold"
              >
                ✕
              </button>
            </div>
            <p className="text-text-secondary text-xs">
              Selecciona una foto desde tu dispositivo (máx. 5MB)
            </p>

            {/* Preview de la imagen */}
            <div className="flex justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gold"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-dark-bg border-2 border-dashed border-gold/50 flex items-center justify-center">
                  <span className="text-text-secondary text-xs text-center px-2">Sin foto</span>
                </div>
              )}
            </div>

            {/* Input de archivo */}
            <label className="block w-full cursor-pointer">
              <div className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-btn text-center hover:border-gold transition-colors">
                <span className="text-gold text-sm">
                  {selectedFile ? selectedFile.name : 'Seleccionar imagen'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleUpdateProfileImage}
              disabled={uploadingPhoto || !selectedFile}
            >
              {uploadingPhoto ? 'Subiendo...' : 'Guardar foto'}
            </Button>
          </div>
        </div>
      )}

      {/* Modal - Sobre Nosotros */}
      {showAboutUs && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col">
          {/* Overlay para cerrar */}
          <div className="absolute inset-0" onClick={() => setShowAboutUs(false)} />

          {/* Contenedor del modal con scroll */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4">
            <div className="max-w-lg w-full mx-auto my-4">
              <Card glassEffect>
                <div className="space-y-5">
                  {/* Botón cerrar en esquina */}
                  <div className="flex justify-end sticky top-0 bg-dark-card z-10 -mt-2 -mr-2 pt-2 pr-2">
                    <button
                      onClick={() => setShowAboutUs(false)}
                      className="text-text-secondary hover:text-gold transition-colors text-base font-bold bg-dark-card rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>

                  {/* FOTO DEL FUNDADOR - PARTE SUPERIOR */}
                  <div className="flex flex-col items-center -mt-2">
                    <div className="w-32 h-32 rounded-full border-4 border-gold overflow-hidden shadow-lg shadow-gold/30">
                      <img
                        src="https://i.ibb.co/pBLTkVdb/Gemini-Generated-Image-cykwu6cykwu6cykw.png"
                        alt="Lawrence Miller - CEO SmartHogar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Lawrence+Miller&background=d4af37&color=1a1a2e&size=128&bold=true'
                        }}
                      />
                    </div>
                    <h3 className="text-gold font-bold text-base mt-3">Lawrence Miller</h3>
                    <p className="text-text-secondary text-sm">CEO & Fundador</p>
                  </div>

                  {/* Título de la empresa */}
                  <div className="text-center border-b border-gold/20 pb-4">
                    <h2 className="text-sm font-bold text-gold gold-glow">SmartHogar</h2>
                    <p className="text-xs text-text-secondary mt-1">Importadora y Distribuidora Internacional</p>
                    <p className="text-xs text-gold/70 mt-1">Constituida en Florida, Estados Unidos</p>
                  </div>

                  {/* Contenido */}
                  <div className="space-y-4">
                    <div className="bg-dark-card bg-opacity-50 rounded-lg p-4 border border-gold/20">
                      <h3 className="text-gold font-bold mb-2">¿Quiénes Somos?</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        SmartHogar es una empresa <span className="text-gold font-bold">legalmente constituida en el estado de Florida, Estados Unidos</span>,
                        dedicada a la importación y distribución de productos para el hogar en toda Latinoamérica.
                        Con más de <span className="text-gold font-bold">8 años de experiencia</span> en el mercado internacional,
                        trabajamos directamente con proveedores de Asia, Europa y Estados Unidos.
                      </p>
                    </div>

                    <div className="bg-dark-card bg-opacity-50 rounded-lg p-4 border border-gold/20">
                      <h3 className="text-gold font-bold mb-2">Nuestro Modelo de Negocio</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        Como empresa importadora registrada en EE.UU., compramos productos en grandes volúmenes
                        directamente de fábrica, obteniendo los mejores precios del mercado. Luego distribuimos
                        estos productos en toda Latinoamérica a través de nuestra red establecida.
                      </p>
                      <p className="text-text-secondary text-sm leading-relaxed mt-2">
                        Recientemente, abrimos una <span className="text-gold font-bold">oportunidad de participación</span> para
                        personas que desean invertir con nosotros. El capital aportado aumenta nuestra capacidad
                        de importación, y a cambio, compartimos un porcentaje de las ganancias generadas por
                        las ventas.
                      </p>
                    </div>

                    <div className="bg-dark-card bg-opacity-50 rounded-lg p-4 border border-gold/20">
                      <h3 className="text-gold font-bold mb-2">¿Por qué confiar en nosotros?</h3>
                      <ul className="text-text-secondary text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span>Empresa constituida legalmente en Florida, USA</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span>Más de 8 años de operación continua en el mercado</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span>Red de distribución en múltiples países de LATAM</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span>Tienda con productos disponibles para verificación</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gold">•</span>
                          <span>Pagos puntuales y transparencia total</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-dark-card bg-opacity-50 rounded-lg p-4 border border-gold/20">
                      <h3 className="text-gold font-bold mb-2">Misión</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        Facilitar el acceso a productos de calidad a precios competitivos, generando
                        oportunidades reales de crecimiento económico para quienes confían en nuestro proyecto.
                      </p>
                    </div>

                    <div className="bg-dark-card bg-opacity-50 rounded-lg p-4 border border-gold/20">
                      <h3 className="text-gold font-bold mb-2">Visión</h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        Ser la importadora de referencia en Latinoamérica, reconocida por la calidad
                        de nuestros productos y la seriedad de nuestras operaciones comerciales.
                      </p>
                    </div>

                    {/* Datos destacados */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="text-center bg-gold/10 rounded-lg p-3 border border-gold/30">
                        <p className="text-base font-bold text-gold">+8 años</p>
                        <p className="text-[10px] text-text-secondary uppercase">En el mercado</p>
                      </div>
                      <div className="text-center bg-gold/10 rounded-lg p-3 border border-gold/30">
                        <p className="text-base font-bold text-gold">USA</p>
                        <p className="text-[10px] text-text-secondary uppercase">Sede en Florida</p>
                      </div>
                      <div className="text-center bg-gold/10 rounded-lg p-3 border border-gold/30">
                        <p className="text-base font-bold text-gold">LATAM</p>
                        <p className="text-[10px] text-text-secondary uppercase">Distribución</p>
                      </div>
                      <div className="text-center bg-gold/10 rounded-lg p-3 border border-gold/30">
                        <p className="text-base font-bold text-gold">24/7</p>
                        <p className="text-[10px] text-text-secondary uppercase">Soporte</p>
                      </div>
                    </div>
                  </div>

                  {/* Botón cerrar */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowAboutUs(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calificación de Tarea */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-2xl max-w-[60%] w-full overflow-hidden">
            <div className="relative max-h-[40vh]">
              <img
                src={selectedTask.image_url}
                alt={`Tarea ${selectedTask.position}`}
                className="w-full h-full object-contain max-h-[40vh]"
              />
              <button
                onClick={() => setShowTaskModal(false)}
                className="absolute top-2 right-2 bg-black/50 rounded-full w-8 h-8 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <h3 className="text-center font-bold text-gold">Califica esta imagen</h3>

              {/* Estrellas */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setTaskRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${star <= taskRating ? 'text-gold' : 'text-gray-500'
                      }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Comentario */}
              <div>
                <textarea
                  value={taskComment}
                  onChange={(e) => setTaskComment(e.target.value)}
                  placeholder="Escribe tu comentario sobre la imagen..."
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-black placeholder-gray-400 focus:border-gold focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Botón enviar */}
              <Button
                variant="primary"
                className="w-full"
                onClick={submitTaskCompletion}
                disabled={submittingTask || taskRating === 0 || taskComment.trim().length < 3}
              >
                {submittingTask ? 'Enviando...' : 'Enviar Calificación'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div >
  )
}
