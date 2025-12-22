import React from 'react';
import Logo from '../assets/Logo';

const AuthLayout = ({ title, subtitle, children }) => {
    return (
        <div className="min-h-screen w-full flex bg-theme-background text-theme">
            {/* Left Side - Brand / Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-theme-surfaceLight overflow-hidden items-center justify-center">
                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/20 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-theme-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-theme-primary/5 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <div className="w-48 h-48 mb-8 text-theme-primary animate-fade-in-up">
                        <Logo />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-theme-primary to-theme-primaryHover">
                        Connect & Collaborate
                    </h1>
                    <p className="text-lg text-theme-textSecondary max-w-md">
                        Join our community to connect with friends and colleagues in real-time.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-theme-background">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="text-center">
                        {/* Mobile Logo (visible only on small screens) */}
                        <div className="lg:hidden mx-auto w-16 h-16 mb-4 text-theme-primary">
                            <Logo />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-theme-text">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-2 text-sm text-theme-textSecondary">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="bg-theme-surface p-8 rounded-2xl shadow-xl border border-theme-border/50">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
