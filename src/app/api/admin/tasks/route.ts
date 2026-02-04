import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/middleware'

// GET - Get all 4 task images
export async function GET(req: NextRequest) {
  const authResult = requireAdmin(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const tasks = await prisma.dailyTask.findMany({
      orderBy: { position: 'asc' },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ error: 'Error al obtener tareas' }, { status: 500 })
  }
}

// POST - Create or update a task image
export async function POST(req: NextRequest) {
  const authResult = requireAdmin(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { position, image_url } = await req.json()

    if (!position || position < 1 || position > 4) {
      return NextResponse.json({ error: 'Posición debe ser 1, 2, 3 o 4' }, { status: 400 })
    }

    if (!image_url) {
      return NextResponse.json({ error: 'URL de imagen requerida' }, { status: 400 })
    }

    // Upsert - create or update
    const task = await prisma.dailyTask.upsert({
      where: { position },
      update: { image_url, is_active: true },
      create: { position, image_url, is_active: true },
    })

    return NextResponse.json({ task, message: 'Tarea actualizada' })
  } catch (error) {
    console.error('Create/update task error:', error)
    return NextResponse.json({ error: 'Error al guardar tarea' }, { status: 500 })
  }
}

// DELETE - Delete a task image
export async function DELETE(req: NextRequest) {
  const authResult = requireAdmin(req)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const position = parseInt(searchParams.get('position') || '0')

    if (!position || position < 1 || position > 4) {
      return NextResponse.json({ error: 'Posición inválida' }, { status: 400 })
    }

    await prisma.dailyTask.deleteMany({
      where: { position },
    })

    return NextResponse.json({ message: 'Tarea eliminada' })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json({ error: 'Error al eliminar tarea' }, { status: 500 })
  }
}
