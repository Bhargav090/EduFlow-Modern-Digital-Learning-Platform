import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PlayCircle, 
    FileText, 
    File, 
    CheckCircle, 
    ChevronRight, 
    ChevronLeft,
    Menu,
    X,
    ArrowLeft
} from 'lucide-react';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [activeContent, setActiveContent] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true); // For mobile responsive sidebar

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${id}`);
                setCourse(data);
                if (data.content && data.content.length > 0) {
                    setActiveContent(data.content[0]);
                }
            } catch (error) {
                console.error("Failed to fetch course", error);
                // navigate('/dashboard'); // Optional: redirect on error
            }
        };

        const fetchProgress = async () => {
            if (user?.role === 'student') {
                try {
                    const { data } = await api.get(`/progress/${id}`);
                    setProgress(data);
                } catch (error) {
                    console.error("Failed to fetch progress or not started yet", error);
                }
            }
        };

        fetchCourse();
        fetchProgress();
    }, [id, user.role]);

    const markComplete = async (contentId) => {
        try {
            const { data } = await api.put(`/progress/${id}`, { contentId });
            setProgress(data);
        } catch (error) {
            console.error("Failed to update progress", error);
        }
    };

    if (!course) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    const isCompleted = (contentId) => progress?.completedContent.includes(contentId);
    
    // Find next lesson index
    const currentIndex = course.content.findIndex(c => c._id === activeContent?._id);
    const hasNext = currentIndex < course.content.length - 1;
    const hasPrev = currentIndex > 0;

    const handleNext = () => {
        if (hasNext) setActiveContent(course.content[currentIndex + 1]);
    };

    const handlePrev = () => {
        if (hasPrev) setActiveContent(course.content[currentIndex - 1]);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 pb-10">
                {/* Immersive Hero Section */}
                <div className="relative bg-slate-900 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-violet-900/90 z-10" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80')] bg-cover bg-center opacity-30" />
                    
                    <div className="relative z-20 max-w-7xl mx-auto px-6 py-12 md:py-16">
                        <button 
                            onClick={() => navigate(-1)}
                            className="mb-6 flex items-center text-slate-300 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Courses</span>
                        </button>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl"
                        >
                            <div className="flex items-center space-x-2 text-indigo-300 mb-4 font-medium tracking-wide text-sm uppercase">
                                <span className="bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30">Course</span>
                                <ChevronRight className="w-4 h-4" />
                                <span>{course.instructor?.name || 'Instructor'}</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                                {course.title}
                            </h1>
                            
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
                                {course.description}
                            </p>

                            {user.role === 'student' && progress && (
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-xl">
                                    <div className="flex items-end justify-between mb-2">
                                        <div>
                                            <p className="text-sm text-indigo-200 font-medium mb-1">Your Progress</p>
                                            <p className="text-3xl font-bold">{Math.round(progress.completionPercentage)}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-300">
                                                {progress.completedContent.length} of {course.content.length} lessons completed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress.completionPercentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-400 to-violet-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Content List (Accordion Style) */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card rounded-2xl overflow-hidden sticky top-24 border border-white/20 shadow-xl shadow-indigo-500/10">
                                <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-white/20 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 flex items-center">
                                        <Menu className="w-5 h-5 mr-2 text-indigo-600" />
                                        Course Content
                                    </h3>
                                    <span className="text-xs font-medium text-slate-500 bg-white/50 px-2 py-1 rounded-full border border-white/20">
                                        {course.content.length} Lessons
                                    </span>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto custom-scrollbar bg-white/30 backdrop-blur-md">
                                    {course.content.map((item, index) => {
                                        const isActive = activeContent?._id === item._id;
                                        const completed = isCompleted(item._id);
                                        
                                        return (
                                            <button
                                                key={item._id}
                                                onClick={() => {
                                                    setActiveContent(item);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={`w-full text-left p-4 border-b border-white/10 last:border-0 transition-all hover:bg-white/60 group relative ${
                                                    isActive ? 'bg-indigo-50/80' : 'bg-transparent'
                                                }`}
                                            >
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="activeIndicator"
                                                        className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r"
                                                    />
                                                )}
                                                <div className="flex items-start space-x-3">
                                                    <div className={`mt-1 flex-shrink-0 transition-colors ${
                                                        completed ? 'text-green-500' : isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                                                    }`}>
                                                        {completed ? <CheckCircle className="w-5 h-5 fill-green-100" /> : 
                                                         item.type === 'video' ? <PlayCircle className="w-5 h-5" /> :
                                                         item.type === 'pdf' ? <File className="w-5 h-5" /> :
                                                         <FileText className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-medium transition-colors ${
                                                            isActive ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'
                                                        }`}>
                                                            {item.title}
                                                        </p>
                                                        <div className="flex items-center mt-1.5 space-x-2">
                                                            <span className="text-xs text-slate-500 bg-white/50 px-1.5 py-0.5 rounded capitalize">
                                                                {item.type}
                                                            </span>
                                                            {isActive && (
                                                                <span className="text-xs text-indigo-600 font-medium animate-pulse">
                                                                    Now Playing
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Content Viewer */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                {activeContent ? (
                                    <motion.div
                                        key={activeContent._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        {/* Content Viewer Card */}
                                        <div className="glass-card rounded-2xl shadow-xl shadow-indigo-500/10 border border-white/20 overflow-hidden ring-1 ring-slate-900/5">
                                            {/* Header inside viewer */}
                                            <div className="p-6 border-b border-white/10 bg-white/50 backdrop-blur-sm">
                                                <h2 className="text-2xl font-bold text-slate-900">{activeContent.title}</h2>
                                            </div>

                                            {activeContent.type === 'video' ? (
                                                <div className="aspect-video bg-black relative group">
                                                    {activeContent.url ? (
                                                        <iframe 
                                                            src={activeContent.url.replace('watch?v=', 'embed/')} 
                                                            className="w-full h-full" 
                                                            title={activeContent.title}
                                                            frameBorder="0" 
                                                            allowFullScreen
                                                        ></iframe>
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500">
                                                            <div className="text-center">
                                                                <PlayCircle className="w-20 h-20 mx-auto mb-4 opacity-30" />
                                                                <p>Video Source Not Available</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : activeContent.type === 'pdf' ? (
                                                <div className="h-[600px] bg-slate-50 flex items-center justify-center border-y border-slate-100">
                                                    <div className="text-center p-8 glass-panel rounded-2xl">
                                                        <File className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                                                        <h3 className="text-lg font-medium text-slate-900 mb-2">PDF Document</h3>
                                                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                                            This content is available as a downloadable PDF file.
                                                        </p>
                                                        <a 
                                                            href={activeContent.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                                                        >
                                                            <File className="w-5 h-5 mr-2" />
                                                            Open PDF
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-8 md:p-10 prose prose-indigo max-w-none">
                                                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                                                        {activeContent.text}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Action Bar */}
                                            <div className="bg-slate-50 p-4 md:p-6 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                                                <button 
                                                    onClick={handlePrev}
                                                    disabled={!hasPrev}
                                                    className="flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                                >
                                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                                    Previous Lesson
                                                </button>

                                                {user.role === 'student' && (
                                                    <button 
                                                        onClick={() => markComplete(activeContent._id)}
                                                        disabled={isCompleted(activeContent._id)}
                                                        className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all transform active:scale-95 ${
                                                            isCompleted(activeContent._id)
                                                                ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                                                                : 'bg-gradient-primary text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1'
                                                        }`}
                                                    >
                                                        {isCompleted(activeContent._id) ? (
                                                            <>
                                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                                Completed
                                                            </>
                                                        ) : (
                                                            <>
                                                                Mark as Complete
                                                                <CheckCircle className="w-5 h-5 ml-2" />
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={handleNext}
                                                    disabled={!hasNext}
                                                    className="flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                                >
                                                    Next Lesson
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[500px] glass-card rounded-2xl text-slate-400">
                                        <PlayCircle className="w-20 h-20 mb-6 text-indigo-200" />
                                        <h3 className="text-xl font-medium text-slate-600">Select a lesson to start learning</h3>
                                        <p className="text-slate-400 mt-2">Choose from the list on the left</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CourseDetails;