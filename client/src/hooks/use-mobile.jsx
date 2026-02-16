import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    // Initialize with undefined or a sensible default
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        // Add event listener
        mql.addEventListener('change', onChange);

        // Initial check
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

        // Cleanup
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return !!isMobile;
}
