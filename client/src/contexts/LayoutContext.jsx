import { createContext, useContext } from 'react';

const LayoutContext = createContext({
    position: 'left',
    effectivePosition: 'left',
});

export function LayoutProvider({ children, position = 'left' }) {
    const value = {
        position,
        effectivePosition: position, // No RTL support for now
    };

    return (
        <LayoutContext.Provider value={value}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within LayoutProvider');
    }
    return context;
}
