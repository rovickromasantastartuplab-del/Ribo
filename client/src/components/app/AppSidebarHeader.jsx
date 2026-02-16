import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import ProfileMenu from "./ProfileMenu"

export default function AppSidebarHeader({ breadcrumbs = [] }) {

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 rounded-md bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                    <span>English 🇬🇧</span>
                </button>
                <ProfileMenu />
            </div>
        </header>
    )

}
