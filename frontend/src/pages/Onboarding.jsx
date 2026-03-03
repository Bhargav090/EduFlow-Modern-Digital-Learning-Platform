import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    BookOpen, Code, Database, Globe, Layers, Layout, Shield, 
    Smartphone, Terminal, Cpu, Zap, Settings, Truck, Home, 
    FlaskConical, Microscope, Binary, Atom, Search, X 
} from 'lucide-react';

const categories = [
    // CS & IT
    { name: 'Web Development', icon: Globe, sub: 'CS/IT' },
    { name: 'Mobile Apps', icon: Smartphone, sub: 'CS/IT' },
    { name: 'Data Science', icon: Database, sub: 'CS/IT' },
    { name: 'Machine Learning', icon: Cpu, sub: 'CS/IT' },
    { name: 'Cybersecurity', icon: Shield, sub: 'CS/IT' },
    { name: 'Cloud Computing', icon: Layers, sub: 'CS/IT' },
    { name: 'DevOps', icon: Terminal, sub: 'CS/IT' },
    { name: 'Algorithms', icon: Code, sub: 'CS/IT' },
    
    // Engineering Branches
    { name: 'Electronics (ECE)', icon: Zap, sub: 'Engineering' },
    { name: 'Electrical (EEE)', icon: Settings, sub: 'Engineering' },
    { name: 'Mechanical (ME)', icon: Settings, sub: 'Engineering' },
    { name: 'Civil Engineering', icon: Home, sub: 'Engineering' },
    { name: 'Robotics', icon: Cpu, sub: 'Engineering' },
    { name: 'Automobile', icon: Truck, sub: 'Engineering' },
    { name: 'Chemical Eng', icon: FlaskConical, sub: 'Engineering' },
    { name: 'Biotechnology', icon: Microscope, sub: 'Engineering' },
    
    // Others
    { name: 'UI/UX Design', icon: Layout, sub: 'Design' },
    { name: 'Business', icon: BookOpen, sub: 'Business' },
    { name: 'Mathematics', icon: Binary, sub: 'Science' },
    { name: 'Physics', icon: Atom, sub: 'Science' }
];

const Onboarding = () => {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const toggleInterest = (name) => {
        if (!selectedInterests.includes(name) && selectedInterests.length >= 6) {
            toast.error('You can select up to 6 interests only.');
            return;
        }
        setSelectedInterests(prev => 
            prev.includes(name) 
                ? prev.filter(i => i !== name) 
                : [...prev, name]
        );
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.sub.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async () => {
        if (selectedInterests.length < 3) {
            toast.error('Please select at least 3 interests!');
            return;
        }

        try {
            const { data } = await api.put('/auth/onboarding', { interests: selectedInterests });
            // Update local user state immediately
            const updatedUser = { ...user, ...data, onboardingCompleted: true };
            setUser(updatedUser);
            
            toast.success('Welcome! Your dashboard is ready.');
            
            // Force navigate to dashboard
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 100);
        } catch (error) {
            console.error('Onboarding Error:', error);
            toast.error(error.response?.data?.message || 'Failed to save interests');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 overflow-hidden"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Personalize Your Journey</h1>
                    <p className="text-slate-600 text-lg">
                        Select 3 to 6 topics to help us recommend the best courses for you.
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
                            <span>{selectedInterests.length} / 6 Selected</span>
                            {selectedInterests.length >= 3 && <Zap className="w-4 h-4 fill-indigo-700" />}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md mx-auto mb-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search for ECE, Mechanical, Web Dev..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10 max-h-[40vh] overflow-y-auto p-2 custom-scrollbar">
                    <AnimatePresence>
                        {filteredCategories.map((category) => {
                            const Icon = category.icon;
                            const isSelected = selectedInterests.includes(category.name);
                            return (
                                <motion.button
                                    key={category.name}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleInterest(category.name)}
                                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all relative ${
                                        isSelected 
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' 
                                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                    }`}
                                >
                                    <Icon className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-bold text-center uppercase tracking-tighter opacity-50 mb-1">{category.sub}</span>
                                    <span className="text-sm font-bold text-center leading-tight">{category.name}</span>
                                    {isSelected && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center border-2 border-white"
                                        >
                                            <Zap className="w-3 h-3 fill-white" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                    {filteredCategories.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-slate-500 font-medium">No topics found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-4 border-t border-slate-100">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedInterests.length < 3}
                        className={`px-12 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
                            selectedInterests.length >= 3
                                ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {selectedInterests.length >= 3 ? 'Start Exploring' : 'Select at least 3'}
                        <BookOpen className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
