import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const Signup = () => {
    const [username, setUsername] = useState('');
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
            const response = await api.post('/auth/register', { username, email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join us and start collaborating today"
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
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-theme-background border border-theme-border rounded-lg text-theme-text placeholder-theme-textSecondary focus:outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-all duration-200"
                            placeholder="Username"
                            required
                        />
                    </div>

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
                            placeholder="Create password"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-theme-primary hover:bg-theme-primaryHover text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-theme-primary/30"
                    >
                        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-theme-textSecondary text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-theme-primary hover:text-theme-primaryHover font-medium hover:underline transition-colors">
                    Sign in here
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Signup;
