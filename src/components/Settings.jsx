import React from 'react';
import { createPortal } from 'react-dom';
import { X, LogOut, Palette, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors } from '../config/themes';
import { useNavigate } from 'react-router-dom';

const Settings = ({ isOpen, onClose }) => {
    const { theme, setTheme, availableThemes } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!isOpen) return null;

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    return createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
            <div className="bg-theme-surface rounded-xl shadow-2xl w-full max-w-2xl border border-theme max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-theme-surface border-b border-theme p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-theme">Settings</h2>
                    <button onClick={onClose} className="text-theme-secondary hover:text-theme transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {/* User Profile Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-theme">
                            <User size={20} />
                            <h3 className="text-lg font-semibold">Profile</h3>
                        </div>
                        <div className="bg-theme-surface-light rounded-lg p-4 border border-theme">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-theme-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {currentUser.username?.substring(0, 2).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-theme font-semibold text-lg">{currentUser.username}</p>
                                    <p className="text-theme-secondary text-sm">{currentUser.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-theme">
                            <Palette size={20} />
                            <h3 className="text-lg font-semibold">Appearance</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableThemes.map((themeName) => {
                                const themeData = getThemeColors(themeName);
                                return (
                                    <button
                                        key={themeName}
                                        onClick={() => setTheme(themeName)}
                                        className={`relative p-4 rounded-lg border-2 transition-all ${theme === themeName
                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                                            : 'border-theme hover:border-violet-300'
                                            }`}
                                    >
                                        <div className="text-sm font-semibold text-theme mb-2">
                                            {themeData.name}
                                        </div>
                                        <div className="flex space-x-1">
                                            <div className="w-6 h-6 rounded" style={{ backgroundColor: themeData.colors.background }}></div>
                                            <div className="w-6 h-6 rounded" style={{ backgroundColor: themeData.colors.surface }}></div>
                                            <div className="w-6 h-6 rounded" style={{ backgroundColor: themeData.colors.primary }}></div>
                                        </div>
                                        {theme === themeName && (
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-violet-500 text-white rounded-full p-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Logout Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-theme">
                            <LogOut size={20} />
                            <h3 className="text-lg font-semibold">Account</h3>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                        >
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Settings;
