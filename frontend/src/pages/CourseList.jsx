import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Search, Filter, BookOpen, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import CourseCard from '../components/CourseCard';
import SkeletonCard from '../components/SkeletonCard';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [filter, setFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const fetchSearchData = async () => {
            if (!debouncedSearchTerm) {
                const { data } = await api.get('/courses');
                setCourses(data);
                return;
            }

            setIsSearching(true);
            try {
                const { data } = await api.get(`/courses/search?q=${debouncedSearchTerm}`);
                setCourses(data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        };

        if (debouncedSearchTerm !== undefined) {
            fetchSearchData();
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoriesRes = await api.get('/courses/categories');
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchInitialData();
    }, []);

    const enroll = async (courseId) => {
        try {
            await api.post(`/courses/${courseId}/enroll`);
            toast.success('Enrolled successfully!');
            
            // Update local state to show enrolled
            setCourses(prev => prev.map(c => 
                c._id === courseId ? { ...c, enrolledStudents: [...(c.enrolledStudents || []), user._id] } : c
            ));
            
            // Update AuthContext user state to keep everything in sync
            setUser(prev => ({
                ...prev,
                enrolledCourses: [...(prev.enrolledCourses || []), courseId]
            }));
            
        } catch (error) {
            toast.error(error.response?.data?.message || 'Enrollment failed');
        }
    };

    const filteredCourses = courses.filter(course => {
        const isEnrolled = user.enrolledCourses.includes(course._id) || (course.enrolledStudents && course.enrolledStudents.some(id => (id._id || id) === user._id));

        const matchesEnrollFilter = filter === 'all' || 
            (filter === 'enrolled' && isEnrolled) || 
            (filter === 'not_enrolled' && !isEnrolled);

        const matchesCategoryFilter = categoryFilter === 'all' || course.category === categoryFilter;

        return matchesEnrollFilter && matchesCategoryFilter;
    });

    return (
        <Layout>
            <div className="space-y-8">
                <div className="text-center max-w-2xl mx-auto pt-8 pb-4">
                    <h1 className="text-4xl font-heading font-bold text-slate-900 mb-4">
                        Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Courses</span>
                    </h1>
                    <p className="text-lg text-slate-500">
                        Discover new skills and knowledge from expert instructors. 
                        Start your learning journey today.
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col lg:flex-row gap-4 max-w-5xl mx-auto z-20 relative">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title, description, category or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
                        />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Status Filter */}
                        <div className="relative min-w-[160px]">
                            <button 
                                onClick={() => { setIsFilterOpen(!isFilterOpen); setIsCategoryOpen(false); }}
                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between shadow-sm transition-colors"
                            >
                                <span className="flex items-center">
                                    <Filter className="w-4 h-4 mr-2 text-slate-400" />
                                    {filter === 'all' ? 'All Status' : filter === 'enrolled' ? 'Enrolled' : 'Not Enrolled'}
                                </span>
                                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {['all', 'enrolled', 'not_enrolled'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => { setFilter(f); setIsFilterOpen(false); }}
                                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm ${filter === f ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-700'}`}
                                        >
                                            {f === 'all' ? 'All Status' : f === 'enrolled' ? 'Enrolled' : 'Not Enrolled'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="relative min-w-[180px]">
                            <button 
                                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsFilterOpen(false); }}
                                className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between shadow-sm transition-colors"
                            >
                                <span className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                                    {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                                </span>
                                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isCategoryOpen && (
                                <div className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => { setCategoryFilter('all'); setIsCategoryOpen(false); }}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm ${categoryFilter === 'all' ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-700'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => { setCategoryFilter(cat); setIsCategoryOpen(false); }}
                                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm ${categoryFilter === cat ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                {loading || isSearching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <SkeletonCard key={n} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => {
                            const isEnrolled = user.enrolledCourses.includes(course._id) || course.enrolledStudents.includes(user._id);
                            
                            return (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    isEnrolled={isEnrolled}
                                    onEnroll={!isEnrolled ? enroll : undefined}
                                    onUnenroll={(id) => {
                                        // Update local state to show not enrolled
                                        setCourses(prev => prev.map(c => 
                                            c._id === id ? { ...c, enrolledStudents: (c.enrolledStudents || []).filter(uid => (uid._id || uid) !== user._id) } : c
                                        ));
                                        
                                        // Update AuthContext user state
                                        setUser(prev => ({
                                            ...prev,
                                            enrolledCourses: (prev.enrolledCourses || []).filter(cid => cid !== id)
                                        }));
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CourseList;
