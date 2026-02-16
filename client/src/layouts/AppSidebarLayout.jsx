import { AppShell } from "@/components/app/AppShell"
import { AppSidebar } from "@/components/app/AppSidebar"
import AppContent from "@/components/app/AppContent"
import AppSidebarHeader from "@/components/app/AppSidebarHeader"

export default function AppSidebarLayout({ children, breadcrumbs = [] }) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    )
}
