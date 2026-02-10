
import React, { useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { useAuth } from '../../contexts/AuthContext';

interface LoginPageProps {
    onRegisterClick: () => void;
    onSuccess: () => void;
    onCancel: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onRegisterClick, onSuccess, onCancel }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await mockBackend.login(username, password);
            login(response);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0D1117] p-4">
             <div className="w-full max-w-md bg-white dark:bg-[#161B22] rounded-lg shadow-xl border border-slate-200 dark:border-[#30363D] overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">Sign in to access your workspace</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1117] border border-slate-300 dark:border-[#30363D] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1117] border border-slate-300 dark:border-[#30363D] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-[#161B22] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <button onClick={onRegisterClick} className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none">
                                Register here
                            </button>
                        </p>
                        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none">
                            Go back home
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default LoginPage;
