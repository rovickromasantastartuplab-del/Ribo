import { SidebarInset } from "@/components/ui/sidebar"

export default function AppContent({ children, variant = 'header' }) {
    if (variant === 'header') {
        return (
            <main className="flex-1">
                {children}
            </main>
        )
    }

    return (
        <SidebarInset>
            {children}
        </SidebarInset>
    )
}
