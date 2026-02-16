import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import NavMain from "./NavMain"
import { NavUser } from "./NavUser"

import { useState, useEffect } from "react"
import { mainNavItems, companyNavItems } from "@/config/navigation"

export function AppSidebar({ ...props }) {
    const [navItems, setNavItems] = useState(mainNavItems)

    useEffect(() => {
        const updateNav = () => {
            const mode = localStorage.getItem('dashboardViewMode')
            setNavItems(mode === 'company' ? companyNavItems : mainNavItems)
        }

        // Initial check
        updateNav()

        // Listen for custom event
        window.addEventListener('dashboard-view-mode-changed', updateNav)

        return () => window.removeEventListener('dashboard-view-mode-changed', updateNav)
    }, [])

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border/50">
                <div className="flex h-full items-center px-4">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                        {/* Logo for expanded sidebar */}
                        <div className="group-data-[collapsible=icon]:hidden">
                            <img
                                src="/logo.svg"
                                alt="Ribo"
                                className="h-8 w-auto"
                            />
                        </div>

                        {/* Icon for collapsed sidebar */}
                        <div className="hidden group-data-[collapsible=icon]:block">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <span className="text-lg font-bold">R</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
