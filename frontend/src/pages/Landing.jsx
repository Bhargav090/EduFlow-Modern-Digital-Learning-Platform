import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Play, Shield, Users, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PublicLayout from '../components/PublicLayout';

const Landing = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (user) return <Navigate to="/dashboard" />;

    return (
        <PublicLayout>
            <div className="pt-20 pb-32 max-w-7xl mx-auto px-6 text-center">
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
                            to="/demo"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center"
                        >
                            <Play className="mr-2 w-5 h-5 fill-slate-700" />
                            Watch Demo
                        </Link>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            AI Recommendations
                        </span>
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                            Powered by Vector DB
                        </span>
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                            Smart Chat Assistant
                        </span>
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
            </div>
        </PublicLayout>
    );
};

export default Landing;
