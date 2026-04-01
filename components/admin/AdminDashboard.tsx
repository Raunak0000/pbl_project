import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ThemeToggle';
import { RefreshCw, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface AdminDashboardProps {
    onGoHome: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoHome }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await adminApi.getUsers();
            setUsers(data);
        } catch (e: any) {
            setError('Failed to load users. Make sure the backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: string, username: string) => {
        if (!confirm(`Are you sure you want to delete "${username}"? This cannot be undone.`)) return;
        setDeletingId(userId);
        try {
            await adminApi.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Failed to delete user.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
            {/* Header */}
            <nav className="bg-[#161B22] border-b border-[#30363D] px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3FB950] rounded flex items-center justify-center text-[#0D1117] font-bold text-sm">S</div>
                        <span className="font-bold text-[#E6EDF3]">syncSpace</span>
                        <span className="text-[#30363D]">/</span>
                        <span className="text-[#8B949E] text-sm">Admin Panel</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={onGoHome}
                            className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                        >
                            Exit Admin
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                        <div className="text-[#8B949E] text-xs font-medium uppercase tracking-wider mb-1">Total users</div>
                        <div className="text-2xl font-bold text-[#E6EDF3]">{users.length}</div>
                    </div>
                    <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-4">
                        <div className="text-[#8B949E] text-xs font-medium uppercase tracking-wider mb-1">Admins</div>
                        <div className="text-2xl font-bold text-[#3FB950]">
                            {users.filter(u => u.role === 'ADMIN').length}
                        </div>
                    </div>
                </div>

                {/* User table */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#30363D] flex justify-between items-center">
                        <h2 className="font-semibold text-[#E6EDF3]">User Management</h2>
                        <button
                            onClick={loadUsers}
                            className="flex items-center gap-2 text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                        >
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="px-6 py-4 bg-[#3D0F0F] border-b border-[#5C1A1A] text-[#F85149] text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-10 bg-[#21262D] rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#21262D]">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-[#8B949E] uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-xs font-medium text-[#8B949E] uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-xs font-medium text-[#8B949E] uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-xs font-medium text-[#8B949E] uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-xs font-medium text-[#8B949E] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#21262D]">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-[#21262D]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#21262D] border border-[#30363D] flex items-center justify-center text-xs font-bold text-[#3FB950]">
                                                        {user.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-[#E6EDF3] flex items-center gap-1.5">
                                                            {user.username}
                                                            {user.id === currentUser?.id && (
                                                                <span className="text-[10px] bg-[#1F3D20] text-[#3FB950] border border-[#3FB950]/30 px-1.5 py-0.5 rounded-full">you</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#8B949E]">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                        ? 'bg-[#2D1F63] text-[#A78BFA] border border-[#4C3D7A]'
                                                        : 'bg-[#0F3D20] text-[#3FB950] border border-[#1A5C2E]'
                                                    }`}>
                                                    {user.role === 'ADMIN' ? <Shield size={10} /> : <UserIcon size={10} />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-[#484F58] truncate max-w-[120px]">
                                                {user.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.id !== currentUser?.id ? (
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.username)}
                                                        disabled={deletingId === user.id}
                                                        className="flex items-center gap-1.5 text-sm text-[#F85149] hover:text-[#FF6B6B] disabled:opacity-50 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                        {deletingId === user.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-[#484F58]">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && !error && (
                                <div className="p-10 text-center text-[#8B949E] text-sm">
                                    No users found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;