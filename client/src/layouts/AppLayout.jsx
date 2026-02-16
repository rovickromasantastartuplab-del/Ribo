import { Outlet } from "react-router-dom"
import AppSidebarLayout from "./AppSidebarLayout"
import { LayoutProvider } from "@/contexts/LayoutContext"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function AppLayout() {
    return (
        <LayoutProvider>
            <AppSidebarLayout>
                <Suspense fallback={
                    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                }>
                    <Outlet />
                </Suspense>
            </AppSidebarLayout>
        </LayoutProvider>
    )
}
