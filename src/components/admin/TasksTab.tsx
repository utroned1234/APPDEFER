'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Image from 'next/image'

interface Task {
  id: number
  position: number
  image_url: string
  is_active: boolean
}

interface TasksTabProps {
  token: string
}

export default function TasksTab({ token }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Refs for file inputs
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setTasks(data.tasks || [])
      }
    } catch (err) {
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = (position: number) => {
    // Trigger file input click
    fileInputRefs.current[position]?.click()
  }

  const handleFileChange = async (position: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(position)
    setError(null)
    setSuccess(null)

    try {
      // First upload the file
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!uploadRes.ok) {
        const errData = await uploadRes.json()
        throw new Error(errData.error || 'Error al subir imagen')
      }

      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url

      // Then save the task
      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ position, image_url: imageUrl }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al guardar tarea')
      }

      setSuccess(`Imagen ${position} actualizada`)
      fetchTasks()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Error al subir imagen')
    } finally {
      setUploading(null)
      // Reset the input so the same file can be selected again
      if (fileInputRefs.current[position]) {
        fileInputRefs.current[position]!.value = ''
      }
    }
  }

  const handleDelete = async (position: number) => {
    if (!confirm('¿Eliminar esta imagen de tarea?')) return

    try {
      const res = await fetch(`/api/admin/tasks?position=${position}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setSuccess(`Imagen ${position} eliminada`)
        fetchTasks()
      } else {
        setError('Error al eliminar')
      }
    } catch (err) {
      setError('Error al eliminar')
    }
  }

  const getTaskByPosition = (position: number) => {
    return tasks.find(t => t.position === position)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gold mb-2">Tareas Diarias</h2>
        <p className="text-text-secondary text-sm">
          Sube 4 imágenes que los usuarios deben calificar y comentar para activar sus ganancias diarias
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-center">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(position => {
          const task = getTaskByPosition(position)
          return (
            <Card key={position} className="p-4">
              <div className="text-center mb-3">
                <span className="text-gold font-bold">Imagen {position}</span>
              </div>

              {/* Hidden file input */}
              <input
                ref={(el) => { fileInputRefs.current[position] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(position, e)}
                disabled={uploading !== null}
              />

              {task ? (
                <div className="space-y-3">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-dark-lighter">
                    <img
                      src={task.image_url}
                      alt={`Tarea ${position}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1 text-xs"
                      onClick={() => handleButtonClick(position)}
                      disabled={uploading !== null}
                    >
                      {uploading === position ? 'Subiendo...' : 'Cambiar'}
                    </Button>
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg disabled:opacity-50"
                      onClick={() => handleDelete(position)}
                      disabled={uploading !== null}
                    >
                      X
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="aspect-square rounded-lg bg-dark-lighter flex items-center justify-center border-2 border-dashed border-gray-600">
                    <span className="text-4xl text-gray-500">📷</span>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full text-xs"
                    onClick={() => handleButtonClick(position)}
                    disabled={uploading !== null}
                  >
                    {uploading === position ? 'Subiendo...' : 'Subir Imagen'}
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="p-4 bg-dark-lighter">
        <p className="text-xs text-text-secondary text-center">
          Los usuarios deben calificar (1-5 estrellas) y comentar las 4 imágenes antes de poder activar sus ganancias diarias.
        </p>
      </Card>
    </div>
  )
}
