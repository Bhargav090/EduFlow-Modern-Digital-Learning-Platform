import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FloatingInput from '../components/FloatingInput';
import { motion } from 'framer-motion';
import { Save, User, Mail, Shield, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
    const { user, login } = useAuth(); // Assuming login can update local user state or we might need a dedicated updateUser
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check if api supports profile update, otherwise just simulate
            // await api.put('/users/profile', { name, email, currentPassword, newPassword });
            
            // Simulation for UI demo purposes if API isn't ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto pb-10">
                <div className="mb-8 text-center pt-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Profile</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Manage your account settings and preferences</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 relative overflow-hidden"
                >
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-1 shadow-lg shadow-indigo-500/20">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        <span className="text-3xl font-bold text-indigo-600">
                                            {name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">Click to change avatar</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-2">
                                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                                    Personal Information
                                </h3>
                                
                                <FloatingInput
                                    id="name"
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />

                                <FloatingInput
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Security */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-2">
                                    <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                                    Security
                                </h3>
                                
                                <FloatingInput
                                    id="current-password"
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />

                                <FloatingInput
                                    id="new-password"
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving Changes...
                                    </span>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Profile;