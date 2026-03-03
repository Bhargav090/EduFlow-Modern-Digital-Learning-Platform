import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, ArrowRight, MoreVertical, LogOut } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CourseCard = ({ course, isEnrolled, progress: initialProgress, onEnroll, onUnenroll }) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState(initialProgress);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUnenroll = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to unenroll from this course? All your progress will be lost.')) return;
        
        try {
            await api.delete(`/courses/${course._id}/unenroll`);
            toast.success('Unenrolled from course');
            if (onUnenroll) onUnenroll(course._id);
        } catch (error) {
            toast.error('Failed to unenroll');
        }
    };

    useEffect(() => {
        const fetchProgress = async () => {
            if (isEnrolled && initialProgress === undefined) {
                try {
                    const { data } = await api.get(`/progress/${course._id}`);
                    setProgress(data.completionPercentage);
                } catch (error) {
                    console.error("Failed to fetch progress", error);
                    setProgress(0);
                }
            }
        };
        
        fetchProgress();
    }, [course._id, isEnrolled, initialProgress]);

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (onEnroll) {
            setEnrollLoading(true);
            await onEnroll(course._id);
            setEnrollLoading(false);
        }
    };

    return (
        <motion.div 
            initial="initial"
            whileHover="hover"
            variants={{
                initial: { y: 0, scale: 1 },
                hover: { y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }
            }}
            className="glass-card rounded-xl overflow-hidden flex flex-col h-full transition-shadow duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 group"
        >
            <div className="h-40 bg-gradient-to-br from-indigo-500 to-violet-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                <motion.div 
                    variants={{
                        initial: { scale: 1 },
                        hover: { scale: 1.1, transition: { duration: 0.5 } }
                    }}
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" 
                />
                <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs text-white font-medium border border-white/20 shadow-sm">
                        {course.content?.length || 0} Lessons
                    </span>
                    
                    {isEnrolled && user?.role === 'student' && (
                        <div className="relative" ref={optionsRef}>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowOptions(!showOptions);
                                }}
                                className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/40 transition-colors border border-white/20"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            {showOptions && (
                                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 overflow-hidden">
                                    <button 
                                        onClick={handleUnenroll}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Unenroll Course
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                    {course.description}
                </p>
                
                <div className="flex items-center text-xs text-slate-400 mb-4 space-x-4">
                    <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {course.instructor?.name || 'Instructor'}
                    </div>
                </div>

                {user?.role === 'student' && isEnrolled && progress !== undefined && progress !== null && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 font-medium">Progress</span>
                            <span className="text-indigo-600 font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-primary h-full rounded-full"
                            />
                        </div>
                    </div>
                )}

                <div
                    className="mt-4 lg:mt-0 lg:h-0 lg:opacity-0 lg:group-hover:h-auto lg:group-hover:opacity-100 lg:group-hover:mt-4 transition-all duration-300 overflow-hidden"
                >
                    {onEnroll && !isEnrolled ? (
                        <button
                            onClick={handleEnroll}
                            disabled={enrollLoading}
                            className="w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {enrollLoading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                            )}
                            {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                    ) : (
                        <Link 
                            to={`/course/${course._id}`}
                            className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${
                                isEnrolled 
                                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-indigo-500/20'
                            }`}
                        >
                            {isEnrolled ? (user?.role === 'instructor' ? 'View Content' : 'Continue Learning') : 'View Course'}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CourseCard;
