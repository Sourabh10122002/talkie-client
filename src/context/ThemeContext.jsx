import { createContext, useContext, useEffect, useState } from 'react';
import { getThemeColors, themeNames } from '../config/themes';

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'dark'
    );

    useEffect(() => {
        const root = window.document.documentElement;
        const themeData = getThemeColors(theme);

        // Apply CSS custom properties for the theme
        Object.entries(themeData.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Keep the dark class for Tailwind's dark: variant (for backward compatibility)
        root.classList.remove('light', 'dark');
        if (theme === 'light') {
            root.classList.add('light');
        } else {
            root.classList.add('dark');
        }

        // Save to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const changeTheme = (newTheme) => {
        if (themeNames.includes(newTheme)) {
            setTheme(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: changeTheme, availableThemes: themeNames }}>
            {children}
        </ThemeContext.Provider>
    );
};
