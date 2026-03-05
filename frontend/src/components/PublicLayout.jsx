import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const PublicLayout = ({ children }) => {
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
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">Eduflow</span>
                </Link>
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

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm relative z-10 mt-32">
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

export default PublicLayout;
