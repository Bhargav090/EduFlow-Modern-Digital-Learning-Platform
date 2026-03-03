import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, FileText, Video, File, X, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import FloatingInput from '../components/FloatingInput';

const CreateCourse = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [isPlaylist, setIsPlaylist] = useState(false);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const navigate = useNavigate();

    // Category search states
    const [availableCategories, setAvailableCategories] = useState([]);
    const [categorySearch, setCategorySearch] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/courses/categories');
                setAvailableCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCategoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCategories = availableCategories.filter(cat => 
        cat.toLowerCase().includes(categorySearch.toLowerCase())
    );

    const handleSelectCategory = (cat) => {
        setCategory(cat);
        setCategorySearch(cat);
        setShowCategoryDropdown(false);
    };

    const handleAddNewCategory = () => {
        if (!categorySearch.trim()) return;
        setCategory(categorySearch.trim());
        setAvailableCategories(prev => [...new Set([...prev, categorySearch.trim()])]);
        setShowCategoryDropdown(false);
        toast.success(`New category "${categorySearch}" added!`);
    };

    // New lesson state
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: '', type: 'text', text: '', url: '' });
    const [videoFile, setVideoFile] = useState(null);

    const handleVideoUpload = async (file, lessonTitle) => {
        setUploadingVideo(true);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', lessonTitle);

        try {
            // We need a temporary course ID or handle it after course creation
            // For now, let's assume we can upload videos to a "temp" or just 
            // handle the upload during the final submit if we want.
            // But usually, we upload video first and get URL.
            // Since we need a course ID for the folder, let's just 
            // implement a general upload or wait until course is created.
            // Let's go with: create course first, then upload videos.
            // OR: Upload to a general folder.
            
            // For better UX, let's do:
            // 1. Create course (metadata only)
            // 2. Upload videos one by one
            
            return null; // Will handle in handleSubmit or specific upload
        } catch (error) {
            toast.error('Video upload failed');
            return null;
        } finally {
            setUploadingVideo(false);
        }
    };

    const handleAddLesson = () => {
        if (!newLesson.title) return;
        
        if (newLesson.type === 'video' && videoFile) {
            // We'll mark it as "needs upload"
            setContent([...content, { ...newLesson, videoFile, _id: Date.now().toString(), needsUpload: true }]);
        } else {
            setContent([...content, { ...newLesson, _id: Date.now().toString() }]);
        }
        
        setNewLesson({ title: '', type: 'text', text: '', url: '' });
        setVideoFile(null);
        setIsAddingLesson(false);
    };

    const removeLesson = (index) => {
        const newContent = [...content];
        newContent.splice(index, 1);
        setContent(newContent);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Final check for category
        const finalCategory = category || categorySearch;
        if (!finalCategory) {
            toast.error('Please select or add a category');
            return;
        }

        setLoading(true);
        try {
            // 1. Create course metadata
            const courseData = { 
                title, 
                description, 
                price, 
                category: finalCategory, 
                tags: tags.split(',').map(t => t.trim()), 
                isPublic, 
                isPlaylist,
                content: content.filter(l => !l.needsUpload) // Initially add non-video content
            };
            
            const { data: createdCourse } = await api.post('/courses', courseData);
            
            // 2. Upload pending videos
            const pendingVideos = content.filter(l => l.needsUpload);
            if (pendingVideos.length > 0) {
                toast.loading('Uploading videos...', { id: 'upload' });
                for (const lesson of pendingVideos) {
                    const formData = new FormData();
                    formData.append('video', lesson.videoFile);
                    formData.append('title', lesson.title);
                    await api.post(`/courses/${createdCourse._id}/videos`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }
                toast.success('All videos uploaded!', { id: 'upload' });
            }

            toast.success('Course published successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to publish course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto pb-10">
                <div className="mb-8 text-center pt-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Create a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">New Course</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Share your knowledge with the world</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Course Details */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Course Details</h2>
                            
                            <FloatingInput
                                id="course-title"
                                label="Course Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FloatingInput
                                    id="course-price"
                                    label="Price ($)"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    required
                                />

                                <div className="relative" ref={dropdownRef}>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="text"
                                            value={categorySearch}
                                            onChange={(e) => {
                                                setCategorySearch(e.target.value);
                                                setShowCategoryDropdown(true);
                                                if (!e.target.value) setCategory('');
                                            }}
                                            onFocus={() => setShowCategoryDropdown(true)}
                                            placeholder="Search or add category..."
                                            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {showCategoryDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar"
                                            >
                                                {filteredCategories.length > 0 ? (
                                                    <div className="p-2 space-y-1">
                                                        {filteredCategories.map((cat) => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => handleSelectCategory(cat)}
                                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                                    category === cat 
                                                                        ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                                                        : 'text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 text-center">
                                                        <p className="text-sm text-slate-500 mb-2">No category found</p>
                                                        <button
                                                            type="button"
                                                            onClick={handleAddNewCategory}
                                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Add "{categorySearch}"?
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <label className="absolute -top-2 left-3 px-1 bg-white text-xs font-medium text-indigo-600">
                                        Category
                                    </label>
                                </div>
                            </div>

                            <FloatingInput
                                id="course-tags"
                                label="Tags (comma separated)"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="react, frontend, javascript"
                            />

                            <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is-public"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is-public" className="text-sm font-medium text-slate-700">
                                        Public (Visible to all students)
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is-playlist"
                                        checked={isPlaylist}
                                        onChange={(e) => setIsPlaylist(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is-playlist" className="text-sm font-medium text-slate-700">
                                        Is Playlist / Bundle
                                    </label>
                                </div>
                            </div>

                            <div className="relative mt-2">
                                <textarea
                                    id="course-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="Briefly describe what this course covers..."
                                    className="peer w-full px-4 pt-6 pb-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder-transparent focus:placeholder-slate-400 text-slate-900"
                                />
                                <label 
                                    htmlFor="course-desc"
                                    className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-600 font-medium pointer-events-none"
                                >
                                    Description
                                </label>
                                <style>{`
                                    #course-desc:not(:placeholder-shown) + label {
                                        top: 0.375rem;
                                        font-size: 0.75rem;
                                        color: #4f46e5;
                                    }
                                `}</style>
                            </div>
                        </div>

                        {/* Course Content */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h2 className="text-xl font-bold text-slate-800">Course Content</h2>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingLesson(true)}
                                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Lesson
                                </button>
                            </div>

                            {/* Lesson List */}
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {content.map((lesson, index) => (
                                        <motion.div
                                            key={lesson._id || index}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center justify-between p-4 bg-white/50 border border-slate-200 rounded-xl"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    {lesson.type === 'video' ? <Video className="w-5 h-5" /> : 
                                                     lesson.type === 'pdf' ? <File className="w-5 h-5" /> : 
                                                     <FileText className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-900">{lesson.title}</h4>
                                                    <p className="text-xs text-slate-500 capitalize">{lesson.type} Content</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeLesson(index)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {content.length === 0 && !isAddingLesson && (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                        <p className="text-slate-500">No lessons added yet. Click "Add Lesson" to start.</p>
                                    </div>
                                )}
                            </div>

                            {/* Add Lesson Form */}
                            <AnimatePresence>
                                {isAddingLesson && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-slate-800">New Lesson</h3>
                                            <button 
                                                type="button" 
                                                onClick={() => setIsAddingLesson(false)}
                                                className="text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div>
                                            <FloatingInput
                                                id="lesson-title"
                                                label="Lesson Title"
                                                value={newLesson.title}
                                                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <select
                                                    id="content-type"
                                                    value={newLesson.type}
                                                    onChange={(e) => setNewLesson({ ...newLesson, type: e.target.value })}
                                                    className="peer w-full px-4 pt-6 pb-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                                >
                                                    <option value="text">Text / Article</option>
                                                    <option value="video">Video URL</option>
                                                    <option value="pdf">PDF Document</option>
                                                </select>
                                                <label 
                                                    htmlFor="content-type"
                                                    className="absolute left-4 top-1.5 text-xs text-indigo-600 font-medium pointer-events-none"
                                                >
                                                    Content Type
                                                </label>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>
                                            
                                            {newLesson.type === 'video' ? (
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs text-slate-500 font-medium ml-1">Upload Video</label>
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => setVideoFile(e.target.files[0])}
                                                        className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    />
                                                </div>
                                            ) : newLesson.type === 'pdf' ? (
                                                <FloatingInput
                                                    id="resource-url"
                                                    label="Resource URL"
                                                    value={newLesson.url}
                                                    onChange={(e) => setNewLesson({ ...newLesson, url: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                            ) : null}
                                        </div>

                                        {newLesson.type === 'text' && (
                                            <div className="relative mt-2">
                                                <textarea
                                                    id="lesson-content"
                                                    value={newLesson.text}
                                                    onChange={(e) => setNewLesson({ ...newLesson, text: e.target.value })}
                                                    rows={4}
                                                    placeholder="Enter the lesson content here..."
                                                    className="peer w-full px-4 pt-6 pb-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder-transparent focus:placeholder-slate-400 text-slate-900"
                                                />
                                                <label 
                                                    htmlFor="lesson-content"
                                                    className="absolute left-4 top-4 text-slate-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-600 font-medium pointer-events-none"
                                                >
                                                    Lesson Content
                                                </label>
                                                <style>{`
                                                    #lesson-content:not(:placeholder-shown) + label {
                                                        top: 0.375rem;
                                                        font-size: 0.75rem;
                                                        color: #4f46e5;
                                                    }
                                                `}</style>
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="button"
                                                onClick={handleAddLesson}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                                            >
                                                Add Lesson
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Course...
                                    </span>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Publish Course
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

export default CreateCourse;