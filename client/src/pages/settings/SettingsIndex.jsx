import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTemplate } from '@/components/page-template';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Settings,
    Palette,
    DollarSign,
    Mail,
    Bell,
    CreditCard,
    Shield,
    Save
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
    {
        title: "General",
        id: "general",
        icon: Settings,
    },
    {
        title: "Appearance",
        id: "appearance",
        icon: Palette,
    },
    {
        title: "Currency",
        id: "currency",
        icon: DollarSign,
    },
    {
        title: "Email",
        id: "email",
        icon: Mail,
    },
    {
        title: "Notifications",
        id: "notifications",
        icon: Bell,
    },
    {
        title: "Payment",
        id: "payment",
        icon: CreditCard,
    },
    {
        title: "Security",
        id: "security",
        icon: Shield,
    },
];

export default function SettingsIndex() {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState("general");

    return (
        <PageTemplate
            title={t("Settings")}
            url="/settings"
            breadcrumbs={[
                { title: t('Dashboard'), href: '/' },
                { title: t('Settings') }
            ]}
        >
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {sidebarNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${activeSection === item.id ? "bg-accent text-accent-foreground" : "transparent"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {t(item.title)}
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight capitalize">{t(`${activeSection}`)}</h2>
                        <p className="text-muted-foreground">
                            {t(`Manage your ${activeSection} preferences and settings.`)}
                        </p>
                    </div>
                    <Separator className="my-6" />

                    {activeSection === "general" && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("Company Information")}</CardTitle>
                                    <CardDescription>{t("Update your company details.")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t("Company Name")}</label>
                                        <Input defaultValue="Ribo Labs" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{t("Contact Email")}</label>
                                        <Input defaultValue="admin@ribo.com" />
                                    </div>
                                    <Button className="w-full md:w-auto">
                                        <Save className="mr-2 h-4 w-4" />
                                        {t("Save Changes")}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeSection === "appearance" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("Appearance")}</CardTitle>
                                <CardDescription>{t("Customize how the application looks for your company.")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t("Logo URL")}</label>
                                    <Input defaultValue="/logo.svg" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t("Primary Color")}</label>
                                    <div className="flex gap-2">
                                        <div className="h-10 w-10 rounded bg-primary border"></div>
                                        <Input defaultValue="#3b82f6" className="w-32" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeSection === "currency" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("Currency Settings")}</CardTitle>
                                <CardDescription>{t("Set default currency and formatting.")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t("Default Currency")}</label>
                                    <Input defaultValue="USD" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {['email', 'notifications', 'payment', 'security'].includes(activeSection) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="capitalize tracking-tight">{t(`${activeSection}`)} {t("Settings")}</CardTitle>
                                <CardDescription>{t("Configure your")} {t(activeSection)} {t("preferences.")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    {t("Placeholder for")} {t(activeSection)} {t("settings")}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PageTemplate>
    );
}
