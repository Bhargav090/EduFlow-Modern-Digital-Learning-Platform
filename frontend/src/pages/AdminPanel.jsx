import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: '/api/admin',
    headers: {
        'Content-Type': 'application/json'
    }
});

const AdminPanel = () => {
    const [email, setEmail] = useState('bhargav@gmail.com');
    const [password, setPassword] = useState('admin');
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [pendingInstructors, setPendingInstructors] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetchData(token);
    }, [token]);

    const fetchData = async (authToken) => {
        setLoadingData(true);
        try {
            const [adminsRes, pendingRes, instructorsRes] = await Promise.all([
                api.get('/admins', {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                api.get('/instructors/pending', {
                    headers: { Authorization: `Bearer ${authToken}` }
                }),
                api.get('/instructors', {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);
            setAdmins(adminsRes.data);
            setPendingInstructors(pendingRes.data);
            setInstructors(instructorsRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to load admin data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const { data } = await api.post('/login', { email, password });
            localStorage.setItem('adminToken', data.token);
            setToken(data.token);
            toast.success('Admin logged in');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Admin login failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const approveInstructor = async (id) => {
        if (!token) return;
        try {
            await api.patch(
                `/instructors/${id}/approve`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Instructor approved');
            setPendingInstructors((prev) => prev.filter((i) => i._id !== id));
            setInstructors((prev) =>
                prev.map((inst) =>
                    inst._id === id ? { ...inst, isInstructorApproved: true } : inst
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve instructor');
        }
    };

    const toggleBlockInstructor = async (id, shouldBlock) => {
        if (!token) return;
        try {
            const path = shouldBlock ? `/instructors/${id}/block` : `/instructors/${id}/unblock`;
            await api.patch(path, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(shouldBlock ? 'Instructor blocked' : 'Instructor unblocked');
            setInstructors((prev) =>
                prev.map((inst) =>
                    inst._id === id ? { ...inst, isInstructorBlocked: shouldBlock } : inst
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update instructor status');
        }
    };

    const toggleWhitelistInstructor = async (id, shouldWhitelist) => {
        if (!token) return;
        try {
            const path = shouldWhitelist ? `/instructors/${id}/whitelist` : `/instructors/${id}/unwhitelist`;
            await api.patch(path, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(shouldWhitelist ? 'Instructor whitelisted' : 'Instructor removed from whitelist');
            setInstructors((prev) =>
                prev.map((inst) =>
                    inst._id === id ? { ...inst, isWhitelisted: shouldWhitelist } : inst
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update whitelist status');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md p-8 glass-card rounded-2xl"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary text-white mb-4 shadow-lg shadow-indigo-500/30">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-heading font-bold text-slate-900">Admin Login</h2>
                        <p className="text-slate-500 mt-2">Sign in to access the admin panel</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-3 px-4 bg-gradient-primary text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                        >
                            {isLoggingIn ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In as Admin
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-7 h-7 text-indigo-600" />
                            Admin Panel
                        </h1>
                        <p className="text-slate-500 mt-1">Manage admins and verify instructors</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('adminToken');
                            setToken('');
                        }}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Logout
                    </button>
                </div>

                {loadingData ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">Available Admins</h2>
                            {admins.length === 0 ? (
                                <p className="text-slate-500 text-sm">No admins found.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {admins.map((admin) => (
                                        <li
                                            key={admin._id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{admin.name}</p>
                                                <p className="text-xs text-slate-500">{admin.email}</p>
                                            </div>
                                            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Active
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">Instructor Verification</h2>
                            {pendingInstructors.length === 0 ? (
                                <p className="text-slate-500 text-sm">No pending instructor applications.</p>
                            ) : (
                                <ul className="space-y-4">
                                    {pendingInstructors.map((inst) => (
                                        <li
                                            key={inst._id}
                                            className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{inst.name}</p>
                                                    <p className="text-xs text-slate-500">{inst.email}</p>
                                                </div>
                                            </div>
                                            {inst.instructorProfile && (
                                                <p className="text-xs text-slate-600 mb-3">
                                                    {inst.instructorProfile}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                {inst.idCardFront && (
                                                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                        <img
                                                            src={inst.idCardFront}
                                                            alt="ID Card Front"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                {inst.idCardBack && (
                                                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                        <img
                                                            src={inst.idCardBack}
                                                            alt="ID Card Back"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => approveInstructor(inst._id)}
                                                className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Approve Instructor
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">All Instructors</h2>
                            {instructors.length === 0 ? (
                                <p className="text-slate-500 text-sm">No instructors found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {instructors.map((inst) => (
                                        <div
                                            key={inst._id}
                                            className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {inst.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {inst.email}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full border"
                                                    style={{
                                                        backgroundColor: inst.isInstructorApproved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(249, 115, 22, 0.08)',
                                                        borderColor: inst.isInstructorApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                                                        color: inst.isInstructorApproved ? '#047857' : '#c2410c'
                                                    }}
                                                >
                                                    {inst.isInstructorApproved ? 'Approved' : 'Pending'}
                                                </span>
                                                <span className="inline-flex items-center text-xs px-2 py-1 rounded-full border"
                                                    style={{
                                                        backgroundColor: inst.isInstructorBlocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                                        borderColor: inst.isInstructorBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                        color: inst.isInstructorBlocked ? '#b91c1c' : '#1d4ed8'
                                                    }}
                                                >
                                                    {inst.isInstructorBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleBlockInstructor(inst._id, !inst.isInstructorBlocked)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                        inst.isInstructorBlocked 
                                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    }`}
                                                >
                                                    {inst.isInstructorBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleWhitelistInstructor(inst._id, !inst.isWhitelisted)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                                        inst.isWhitelisted 
                                                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                                                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                    }`}
                                                >
                                                    {inst.isWhitelisted ? 'Remove Whitelist' : 'Whitelist'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
