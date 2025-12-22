import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Enter your credentials to access your account"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-textSecondary group-focus-within:text-theme-primary transition-colors">
                            <Mail size={20} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-theme-background border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all duration-200"
                            placeholder="Email address"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-textSecondary group-focus-within:text-theme-primary transition-colors">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-theme-background border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all duration-200"
                            placeholder="Password"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 text-theme-textSecondary hover:text-theme-text cursor-pointer">
                        <input type="checkbox" className="rounded border-theme-border text-theme-primary focus:ring-theme-primary" />
                        <span>Remember me</span>
                    </label>
                    <a href="#" className="text-theme-primary hover:text-theme-primaryHover transition-colors font-medium">
                        Forgot password?
                    </a>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-theme-primary hover:bg-theme-primaryHover text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-theme-primary/30"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-theme-textSecondary text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-theme-primary hover:text-theme-primaryHover font-medium hover:underline transition-colors">
                    Create one now
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
