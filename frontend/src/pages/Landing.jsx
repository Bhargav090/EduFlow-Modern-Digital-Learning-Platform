import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Play, Shield, Users, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (user) return <Navigate to="/dashboard" />;

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden relative selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">Eduflow</span>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-slate-600 font-medium hover:text-indigo-600 transition-colors hidden sm:block">
                        Sign In
                    </Link>
                    <Link 
                        to="/register" 
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-20 pb-32 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-indigo-100 shadow-sm mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
                        <span className="text-sm font-medium text-indigo-900">Reimagining Online Education</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 leading-tight">
                        Master New Skills with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">
                            Immersive Learning
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        A premium learning experience designed for the modern era. 
                        Interactive courses, real-time progress tracking, and a community that grows with you.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link 
                            to="/register" 
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 transition-all flex items-center justify-center"
                        >
                            Start Learning Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link 
                            to="/courses" 
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center"
                        >
                            <Play className="mr-2 w-5 h-5 fill-slate-700" />
                            Watch Demo
                        </Link>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Shield, title: "Verified Certificates", desc: "Earn recognized credentials upon completion." },
                        { icon: Users, title: "Expert Instructors", desc: "Learn from industry leaders and professionals." },
                        { icon: Zap, title: "Interactive Learning", desc: "Hands-on projects and real-time feedback." }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="glass-card p-8 rounded-3xl border border-white/50 hover:border-indigo-500/20 transition-all group hover:shadow-2xl hover:shadow-indigo-500/10"
                        >
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feature.icon className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 p-1 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-cyan-500/20 rounded-3xl"
                >
                    <div className="bg-white/80 backdrop-blur-xl rounded-[22px] p-12 md:p-20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                            {[
                                { label: "Active Students", value: "10k+" },
                                { label: "Courses", value: "250+" },
                                { label: "Instructors", value: "50+" },
                                { label: "Satisfaction", value: "4.9/5" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600 mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm relative z-10">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-slate-500 text-sm">© 2026 Eduflow. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Privacy</a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Terms</a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
