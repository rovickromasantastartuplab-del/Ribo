import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { THEME_COLORS, type ThemeColor } from '@/hooks/use-appearance';

export interface BrandSettings {
    themeColor: ThemeColor;
    customColor: string;
    logoLight: string;
    logoDark: string;
    favicon: string;
}

interface BrandContextType extends BrandSettings {
    updateBrandSettings: (settings: Partial<BrandSettings>) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
    themeColor: 'green',
    customColor: '#3b82f6',
    logoLight: '',
    logoDark: '',
    favicon: '',
};

const getBrandSettings = (): BrandSettings => {
    // Get from localStorage
    try {
        const savedSettings = localStorage.getItem('brandSettings');
        if (savedSettings) {
            return { ...DEFAULT_BRAND_SETTINGS, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error('Error loading brand settings from localStorage', error);
    }

    return DEFAULT_BRAND_SETTINGS;
};

export function BrandProvider({ children }: { children: ReactNode }) {
    const [brandSettings, setBrandSettings] = useState<BrandSettings>(() =>
        getBrandSettings()
    );

    useEffect(() => {
        const settings = getBrandSettings();
        setBrandSettings(settings);

        // Apply theme color globally
        const color = settings.themeColor === 'custom' ? settings.customColor : THEME_COLORS[settings.themeColor];
        document.documentElement.style.setProperty('--theme-color', color);
        document.documentElement.style.setProperty('--primary', color);
    }, []);

    const updateBrandSettings = (newSettings: Partial<BrandSettings>) => {
        setBrandSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('brandSettings', JSON.stringify(updated));

            // Apply theme color if changed
            if (newSettings.themeColor || newSettings.customColor) {
                const color = updated.themeColor === 'custom' ? updated.customColor : THEME_COLORS[updated.themeColor];
                document.documentElement.style.setProperty('--theme-color', color);
                document.documentElement.style.setProperty('--primary', color);
            }

            return updated;
        });
    };

    return (
        <BrandContext.Provider value={{ ...brandSettings, updateBrandSettings }}>
            {children}
        </BrandContext.Provider>
    );
}

export function useBrand() {
    const context = useContext(BrandContext);
    if (context === undefined) {
        throw new Error('useBrand must be used within a BrandProvider');
    }
    return context;
}
