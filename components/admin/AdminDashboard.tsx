
import React, { useEffect, useState } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { User } from '../../types';
import ThemeToggle from '../ThemeToggle';

interface AdminDashboardProps {
    onGoHome: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoHome }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const data = await mockBackend.getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await mockBackend.deleteUser(userId);
            loadUsers();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-slate-100">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .skeleton-shimmer {
                    background-image: linear-gradient(110deg, rgba(203, 213, 225, 0.4) 0%, rgba(226, 232, 240, 0.9) 45%, rgba(203, 213, 225, 0.4) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s ease-in-out infinite;
                }
                .dark .skeleton-shimmer {
                    background-image: linear-gradient(110deg, rgba(51, 65, 85, 0.35) 0%, rgba(71, 85, 105, 0.7) 45%, rgba(51, 65, 85, 0.35) 100%);
                }
            `}</style>
            <nav className="bg-slate-900 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                        <span className="bg-slate-700 text-xs px-2 py-1 rounded">Backend Active</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />
                        <button onClick={onGoHome} className="text-sm hover:text-slate-300">Exit Admin</button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-6">
                <div className="bg-white dark:bg-[#161B22] rounded-lg shadow border border-slate-200 dark:border-[#30363D] overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-[#30363D] flex justify-between items-center">
                        <h2 className="text-xl font-semibold">User Management</h2>
                        <button onClick={loadUsers} className="text-blue-600 hover:text-blue-500 text-sm">Refresh List</button>
                    </div>
                    
                    {isLoading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="grid grid-cols-5 gap-4 items-center">
                                        <div className="h-3 rounded skeleton-shimmer"></div>
                                        <div className="h-3 rounded skeleton-shimmer"></div>
                                        <div className="h-3 rounded skeleton-shimmer"></div>
                                        <div className="h-3 w-16 rounded-full skeleton-shimmer"></div>
                                        <div className="h-3 w-12 rounded skeleton-shimmer"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-[#21262D]">
                                    <tr>
                                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">ID</th>
                                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Username</th>
                                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Email</th>
                                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Role</th>
                                        <th className="p-4 font-medium text-sm text-slate-500 dark:text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-[#30363D]">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-[#21262D]/50">
                                            <td className="p-4 text-sm font-mono text-slate-500">{user.id}</td>
                                            <td className="p-4 font-medium">{user.username}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-800 dark:hover:text-red-400 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="p-8 text-center text-slate-500">No users found.</div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
