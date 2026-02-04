'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()
    const pathname = usePathname()

    // No mostrar el botón en páginas públicas
    const publicPages = ['/', '/login', '/signup']
    if (publicPages.includes(pathname)) {
        return <div className="w-8 md:w-10" /> // Spacer para mantener el layout
    }

    const handleLogout = () => {
        document.cookie = 'auth_token=; path=/; max-age=0'
        router.push('/login')
    }

    return (
        <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-text-secondary border border-text-secondary/30 rounded-full hover:border-red-400 hover:text-red-400 hover:scale-105 transition-all duration-300"
        >
            Salir
        </button>
    )
}
