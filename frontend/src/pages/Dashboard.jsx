import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import SkeletonCard from '../components/SkeletonCard';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Users, Activity } from 'lucide-react';

const Dashboard = () => {
    const { user, setUser } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                if (user.role === 'instructor') {
                    const myCourses = data.filter(c => c.instructor._id === user._id || c.instructor === user._id);
                    setCourses(myCourses);
                } else {
                    const myCourses = data.filter(c => c.enrolledStudents.includes(user._id));
                    setCourses(myCourses);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user]);

    // Calculate real stats for instructor
    const totalEnrollments = courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0);
    const avgClassSize = courses.length ? Math.round(totalEnrollments / courses.length) : 0;

    const stats = [
        { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Total Enrollments', value: totalEnrollments, icon: Users, color: 'text-violet-600', bg: 'bg-violet-100' },
        { label: 'Avg. Class Size', value: avgClassSize, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <Layout>
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{user.name}</span>
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {user.role === 'instructor' 
                                ? 'Here is what’s happening with your courses today.' 
                                : 'Ready to continue your learning journey?'}
                        </p>
                    </div>
                    {user.role === 'instructor' && (
                        <Link 
                            to="/create-course" 
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-primary text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-105 transition-all font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Course
                        </Link>
                    )}
                </div>

                {/* Instructor Stats */}
                {user.role === 'instructor' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className="glass-card p-6 rounded-xl flex items-center space-x-4 relative overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
                            >
                                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500`}>
                                    <stat.icon className="w-24 h-24" />
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} relative z-10`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Course Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            {user.role === 'instructor' ? 'Your Courses' : 'My Enrolled Courses'}
                        </h2>
                        {user.role === 'student' && (
                            <Link to="/courses" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
                                Browse all courses
                            </Link>
                        )}
                    </div>

                    {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <SkeletonCard key={n} />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                        <div className="text-center py-20 glass-panel rounded-2xl border-dashed border-2 border-slate-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                <BookOpen className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                                {user.role === 'instructor' 
                                    ? "You haven't created any courses yet. Start sharing your knowledge!" 
                                    : "You aren't enrolled in any courses yet. Browse our catalog to get started."}
                            </p>
                            <div className="mt-6">
                                <Link 
                                    to={user.role === 'instructor' ? "/create-course" : "/courses"}
                                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    {user.role === 'instructor' ? 'Create Course' : 'Browse Courses'}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course, index) => (
                                <CourseCard 
                                    key={course._id} 
                                    course={course} 
                                    isEnrolled={true} 
                                    onUnenroll={(id) => {
                                        setCourses(courses.filter(c => c._id !== id));
                                        setUser(prev => ({
                                            ...prev,
                                            enrolledCourses: (prev.enrolledCourses || []).filter(cid => cid !== id)
                                        }));
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
