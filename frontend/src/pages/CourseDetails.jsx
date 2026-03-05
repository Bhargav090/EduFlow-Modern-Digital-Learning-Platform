import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { PlayCircle, CheckCircle, ChevronRight, ArrowLeft, Menu } from 'lucide-react';
import ReactPlayer from 'react-player';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const playerRef = useRef(null);

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            try {
                const courseRes = await api.get(`/courses/${id}`);
                setCourse(courseRes.data);
                const lecturesData = courseRes.data.lectures && courseRes.data.lectures.length > 0
                    ? courseRes.data.lectures
                    : (courseRes.data.content || []).filter((c) => c.type === 'video');
                const demoLectures = lecturesData.length === 0 ? [
                    { _id: null, title: 'Intro to React', url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0' },
                    { _id: null, title: 'JavaScript Basics', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' },
                    { _id: null, title: 'CSS Crash Course', url: 'https://www.youtube.com/watch?v=yfoY53QXEnI' }
                ] : [];
                const effectiveLectures = lecturesData.length > 0 ? lecturesData : demoLectures;

                if (user?.role === 'student') {
                    const progressRes = await api.get(`/progress/${id}`);
                    setProgress(progressRes.data);
                    
                    const lastWatchedId = progressRes.data.lastWatched?.lectureId;
                    if (lastWatchedId) {
                        const lastWatchedLecture = effectiveLectures.find(l => l._id === lastWatchedId);
                        setActiveLecture(lastWatchedLecture || effectiveLectures[0]);
                    } else {
                        setActiveLecture(effectiveLectures[0]);
                    }
                } else {
                    setActiveLecture(effectiveLectures[0]);
                }

            } catch (error) {
                console.error("Failed to fetch course data", error);
                navigate('/dashboard');
            }
        };

        fetchCourseAndProgress();
    }, [id, user, navigate]);

    const handleProgress = async (playedSeconds) => {
        if (user?.role !== 'student') return;
        if (!activeLecture?._id || typeof activeLecture._id !== 'string' || activeLecture._id.length !== 24) return;
        try {
            await api.put(`/progress/${id}`, { 
                lectureId: activeLecture._id, 
                timestamp: playedSeconds 
            });
        } catch (error) {
            console.error('Failed to update progress', error);
        }
    };

    const handleLectureEnd = async () => {
        if (user?.role !== 'student') return;
        if (!activeLecture?._id || typeof activeLecture._id !== 'string' || activeLecture._id.length !== 24) return;
        try {
            const { data } = await api.put(`/progress/${id}`, { 
                lectureId: activeLecture._id, 
                completed: true 
            });
            setProgress(data);
            const lectureList = (course.lectures && course.lectures.length > 0)
                ? course.lectures
                : (course.content || []).filter((c) => c.type === 'video');
            const currentIndex = lectureList.findIndex(l => l._id === activeLecture._id);
            if (currentIndex < lectureList.length - 1) {
                setActiveLecture(lectureList[currentIndex + 1]);
            }
        } catch (error) {
            console.error('Failed to mark as complete', error);
        }
    };

    if (!course || !activeLecture) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    const isStudent = user?.role === 'student';
    const isEnrolled = isStudent && (
        (user?.enrolledCourses?.includes?.(id)) ||
        (Array.isArray(course.enrolledStudents) &&
            course.enrolledStudents.some(s => (s?._id || s) === user?._id))
    );
    const handleEnrollCourse = async () => {
        try {
            await api.post(`/courses/${id}/enroll`);
            const updated = {
                ...course,
                enrolledStudents: [...(course.enrolledStudents || []), user._id]
            };
            setCourse(updated);
            setUser(prev => ({
                ...prev,
                enrolledCourses: [...(prev.enrolledCourses || []), id]
            }));
        } catch (error) {
            console.error('Enroll failed', error);
        }
    };

    const lectureList = (course.lectures && course.lectures.length > 0)
        ? course.lectures
        : (course.content || []).filter((c) => c.type === 'video').length > 0
            ? (course.content || []).filter((c) => c.type === 'video')
            : [
                { _id: null, title: 'Intro to React', url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0' },
                { _id: null, title: 'JavaScript Basics', url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' },
                { _id: null, title: 'CSS Crash Course', url: 'https://www.youtube.com/watch?v=yfoY53QXEnI' }
            ];
    const isCompleted = (lectureId) => progress?.completedLectures?.some(l => l.lectureId === lectureId);
    const completedCount = Array.isArray(progress?.completedLectures) ? progress.completedLectures.length : 0;
    const completionPercentage = progress ? (completedCount / Math.max(lectureList.length, 1)) * 100 : 0;

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 pb-10">
                <div className="relative bg-slate-900 text-white overflow-hidden">
                    {/* ... (Hero section remains mostly the same) ... */}
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Video Player & Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 mb-6">
                            <div className="aspect-video">
                                {isStudent && !isEnrolled ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900/60 text-white">
                                        <div className="text-center space-y-3">
                                            <h4 className="text-lg font-bold">Enroll to play this video</h4>
                                            <p className="text-sm text-slate-300">You can browse the lectures on the right. Click enroll to start learning.</p>
                                            <button
                                                onClick={handleEnrollCourse}
                                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium shadow-md active:scale-95 transition"
                                            >
                                                Enroll Now
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <ReactPlayer
                                        ref={playerRef}
                                        src={activeLecture.url}
                                        width="100%"
                                        height="100%"
                                        controls
                                        playing
                                        onProgress={({ playedSeconds }) => handleProgress(playedSeconds)}
                                        onEnded={handleLectureEnd}
                                        config={{
                                            youtube: {
                                                playerVars: { 
                                                    showinfo: 0, 
                                                    modestbranding: 1,
                                                    start: progress?.lastWatched?.lectureId === activeLecture._id ? Math.floor(progress.lastWatched.timestamp) : 0
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{activeLecture.title}</h2>
                        <p className="text-slate-500">From the course: {course.title}</p>
                    </div>

                    {/* Right Column: Lecture List */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl overflow-hidden sticky top-24 border border-white/20 shadow-xl shadow-indigo-500/10">
                            <div className="p-4 bg-white/50 backdrop-blur-sm border-b border-white/20">
                                <h3 className="font-bold text-slate-800 flex items-center">
                                    <Menu className="w-5 h-5 mr-2 text-indigo-600" />
                                    Course Lectures
                                </h3>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-white/30 backdrop-blur-md">
                                {lectureList.length === 0 ? (
                                    <div className="p-4 text-sm text-slate-600">No video content available.</div>
                                ) : lectureList.map((lecture, idx) => {
                                    const isActive = activeLecture._id === lecture._id;
                                    const completed = isCompleted(lecture._id);
                                    return (
                                        <button
                                            key={lecture._id || `demo-${idx}`}
                                            onClick={() => setActiveLecture(lecture)}
                                            className={`w-full text-left p-4 border-b border-white/10 last:border-0 transition-all hover:bg-white/60 group relative ${
                                                isActive ? 'bg-indigo-50/80' : 'bg-transparent'
                                            }`}
                                        >
                                            {isActive && <motion.div layoutId="activeIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
                                            <div className="flex items-center space-x-3">
                                                <div className={`transition-colors ${
                                                    completed ? 'text-green-500' : isActive ? 'text-indigo-600' : 'text-slate-400'
                                                }`}>
                                                    {completed ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                                </div>
                                                <span className={`text-sm font-medium ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {lecture.title}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CourseDetails;
