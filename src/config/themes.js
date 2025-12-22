export const themes = {
    dark: {
        name: 'Dark',
        colors: {
            background: '#0f172a',      // slate-950
            surface: '#1e293b',         // slate-900
            surfaceLight: '#334155',    // slate-800
            border: '#475569',          // slate-700
            text: '#f1f5f9',           // slate-100
            textSecondary: '#94a3b8',  // slate-400
            primary: '#8b5cf6',        // violet-600
            primaryHover: '#7c3aed',   // violet-700
        }
    },
    light: {
        name: 'Light',
        colors: {
            background: '#f8fafc',      // slate-50
            surface: '#ffffff',         // white
            surfaceLight: '#f1f5f9',    // slate-100
            border: '#e2e8f0',          // slate-200
            text: '#0f172a',           // slate-950
            textSecondary: '#64748b',  // slate-500
            primary: '#8b5cf6',        // violet-600
            primaryHover: '#7c3aed',   // violet-700
        }
    },
    midnight: {
        name: 'Midnight Blue',
        colors: {
            background: '#0a0e27',
            surface: '#151a3d',
            surfaceLight: '#1e2749',
            border: '#2d3561',
            text: '#e0e7ff',
            textSecondary: '#a5b4fc',
            primary: '#6366f1',        // indigo-500
            primaryHover: '#4f46e5',   // indigo-600
        }
    },
    forest: {
        name: 'Forest Green',
        colors: {
            background: '#0a1612',
            surface: '#1a2c23',
            surfaceLight: '#234034',
            border: '#2d5446',
            text: '#d1fae5',
            textSecondary: '#6ee7b7',
            primary: '#10b981',        // emerald-500
            primaryHover: '#059669',   // emerald-600
        }
    },
    sunset: {
        name: 'Sunset Orange',
        colors: {
            background: '#1c0f0a',
            surface: '#2d1810',
            surfaceLight: '#3d2318',
            border: '#4d2e20',
            text: '#fed7aa',
            textSecondary: '#fdba74',
            primary: '#f97316',        // orange-500
            primaryHover: '#ea580c',   // orange-600
        }
    },
    ocean: {
        name: 'Ocean Blue',
        colors: {
            background: '#0a1929',
            surface: '#132f4c',
            surfaceLight: '#1e4976',
            border: '#2d5f8d',
            text: '#dbeafe',
            textSecondary: '#93c5fd',
            primary: '#3b82f6',        // blue-500
            primaryHover: '#2563eb',   // blue-600
        }
    },
    rose: {
        name: 'Rose Pink',
        colors: {
            background: '#1f0a14',
            surface: '#331525',
            surfaceLight: '#4c1d34',
            border: '#5e2942',
            text: '#fce7f3',
            textSecondary: '#f9a8d4',
            primary: '#ec4899',        // pink-500
            primaryHover: '#db2777',   // pink-600
        }
    }
};

export const getThemeColors = (themeName) => {
    return themes[themeName] || themes.dark;
};

export const themeNames = Object.keys(themes);
