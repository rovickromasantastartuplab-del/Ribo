import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'custom';

export interface ThemeSettings {
    appearance: Appearance;
    themeColor: ThemeColor;
    customColor: string;
}

const DEFAULT_THEME: ThemeSettings = {
    appearance: 'light',  // Changed from 'system' to force light mode
    themeColor: 'green',
    customColor: '#3b82f6', // Default blue color
};

// Preset theme colors
export const THEME_COLORS = {
    blue: '#3b82f6',
    green: '#10b77f',
    purple: '#8b5cf6',
    orange: '#f97316',
    red: '#ef4444',
};

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (settings: ThemeSettings) => {
    const { appearance, themeColor, customColor } = settings;
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    // Apply dark mode class
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);

    // Force remove dark if light mode
    if (appearance === 'light') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    }

    // Apply theme color
    const color = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor];
    document.documentElement.style.setProperty('--theme-color', color);

    // Also update CSS variables that depend on theme color
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--chart-1', color);
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const themeSettings = getThemeSettings();
    applyTheme(themeSettings);
};

const getThemeSettings = (): ThemeSettings => {
    // Get from localStorage
    try {
        const savedTheme = localStorage.getItem('themeSettings');
        if (savedTheme) {
            return JSON.parse(savedTheme);
        }
    } catch (error) {
        // Fall through to default
    }

    return DEFAULT_THEME;
};

export function initializeTheme() {
    const themeSettings = getThemeSettings();
    applyTheme(themeSettings);

    // Add the event listener for system theme changes
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME);

    const updateAppearance = useCallback((mode: Appearance) => {
        setThemeSettings(prev => {
            const newSettings = { ...prev, appearance: mode };
            applyTheme(newSettings);
            localStorage.setItem('themeSettings', JSON.stringify(newSettings));
            return newSettings;
        });
    }, []);

    const updateThemeColor = useCallback((color: ThemeColor) => {
        setThemeSettings(prev => {
            const newSettings = { ...prev, themeColor: color };
            applyTheme(newSettings);
            localStorage.setItem('themeSettings', JSON.stringify(newSettings));
            return newSettings;
        });
    }, []);

    const updateCustomColor = useCallback((hexColor: string, setAsActive = false) => {
        setThemeSettings(prev => {
            const newSettings = {
                ...prev,
                customColor: hexColor,
                ...(setAsActive && { themeColor: 'custom' })
            };
            applyTheme(newSettings);
            localStorage.setItem('themeSettings', JSON.stringify(newSettings));
            return newSettings;
        });
    }, []);

    useEffect(() => {
        const savedSettings = getThemeSettings();
        setThemeSettings(savedSettings);
        applyTheme(savedSettings);

        return () => mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return {
        appearance: themeSettings.appearance,
        themeColor: themeSettings.themeColor,
        customColor: themeSettings.customColor,
        updateAppearance,
        updateThemeColor,
        updateCustomColor,
    } as const;
}
