import { SidebarProvider } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"

export function AppShell({ children, variant = 'header' }) {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar_state')
            return saved !== 'false'
        }
        return true
    })

    const handleOpenChange = (open) => {
        setIsOpen(open)
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar_state', String(open))
        }
    }

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen flex-col">
                {children}
            </div>
        )
    }

    return (
        <SidebarProvider defaultOpen={isOpen} onOpenChange={handleOpenChange}>
            {children}
        </SidebarProvider>
    )
}
