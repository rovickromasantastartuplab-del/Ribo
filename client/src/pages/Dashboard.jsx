import React, { useState } from 'react';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    // Check localStorage for preferred view, default to false (Company view) if not set
    // But for Super Admin user it should probably default to true. 
    // For now, consistent with strict porting user request:
    const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
        const savedMode = localStorage.getItem('dashboardViewMode');
        return savedMode !== 'company'; // Default to Super Admin
    });

    const handleViewToggle = (checked) => {
        setIsSuperAdmin(checked);
        localStorage.setItem('dashboardViewMode', checked ? 'superadmin' : 'company');
        window.dispatchEvent(new Event('dashboard-view-mode-changed'));
    };

    return (
        <div className="relative">
            {isSuperAdmin ? <SuperAdminDashboard /> : <CompanyDashboard />}
        </div>
    );
}
