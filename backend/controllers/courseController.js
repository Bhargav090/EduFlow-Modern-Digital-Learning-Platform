const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { 
    upsertCourseEmbedding, 
    deleteCourseEmbedding, 
    searchSimilarCourses 
} = require('../utils/vectorDB');

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = async (req, res) => {
    const { title, description, isPublic, category, tags, isPlaylist, content } = req.body;

    const course = new Course({
        title,
        description,
        isPublic,
        category,
        tags,
        isPlaylist,
        content,
        instructor: req.user._id,
        college: req.user.college
    });

    const createdCourse = await course.save();
    
    // Add to instructor's created courses
    const user = await User.findById(req.user._id);
    user.createdCourses.push(createdCourse._id);
    await user.save();

    // AI: Upsert embedding to Vector DB
    const textForEmbedding = `${title} ${description} ${category} ${tags ? tags.join(' ') : ''}`;
    await upsertCourseEmbedding(createdCourse._id, {
        title,
        category,
        college: req.user.college,
        isPublic
    }, textForEmbedding);

    res.status(201).json(createdCourse);
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
    // If user is logged in, filter based on college if course is private
    // If course is public, everyone can see it
    let query = { isPublic: true };

    if (req.user) {
        query = {
            $or: [
                { isPublic: true },
                { isPublic: false, college: req.user.college }
            ]
        };
    }

    const courses = await Course.find(query).populate('instructor', 'name email');
    res.json(courses);
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');

    if (course) {
        res.json(course);
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = async (req, res) => {
    const { title, description, content, category, tags, isPublic } = req.body;

    const course = await Course.findById(req.params.id);

    if (course) {
        if (course.instructor.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized to update this course' });
            return;
        }

        course.title = title || course.title;
        course.description = description || course.description;
        course.content = content || course.content;
        course.category = category || course.category;
        course.tags = tags || course.tags;
        if (typeof isPublic === 'boolean') {
            course.isPublic = isPublic;
        }

        const updatedCourse = await course.save();

        // AI: Update embedding in Vector DB
        const textForEmbedding = `${updatedCourse.title} ${updatedCourse.description} ${updatedCourse.category} ${updatedCourse.tags ? updatedCourse.tags.join(' ') : ''}`;
        await upsertCourseEmbedding(updatedCourse._id, {
            title: updatedCourse.title,
            category: updatedCourse.category,
            college: updatedCourse.college,
            isPublic: updatedCourse.isPublic
        }, textForEmbedding);

        res.json(updatedCourse);
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
const deleteCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (course) {
        if (course.instructor.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized to delete this course' });
            return;
        }

        const courseId = course._id;
        await course.deleteOne();

        // AI: Delete embedding from Vector DB
        await deleteCourseEmbedding(courseId);

        res.json({ message: 'Course removed' });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
const enrollCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (course && user) {
        // Check if already enrolled
        if (user.enrolledCourses.includes(course._id)) {
            res.status(400).json({ message: 'Already enrolled in this course' });
            return;
        }

        // Access control: if private, must be same college
        if (!course.isPublic && course.college !== user.college) {
            res.status(403).json({ message: `This course is private to ${course.college} students only.` });
            return;
        }

        user.enrolledCourses.push(course._id);
        course.enrolledStudents.push(user._id);

        await user.save();
        await course.save();

        // Create initial progress
        await Progress.create({
            user: user._id,
            course: course._id,
            completedContent: []
        });

        res.status(201).json({ message: 'Enrolled successfully' });
    } else {
        res.status(404).json({ message: 'Course or User not found' });
    }
};

// @desc    Unenroll from a course
// @route   DELETE /api/courses/:id/unenroll
// @access  Private/Student
const unenrollCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (course && user) {
        // Remove course from user's enrolledCourses
        user.enrolledCourses = user.enrolledCourses.filter(
            (id) => id.toString() !== course._id.toString()
        );
        
        // Remove user from course's enrolledStudents
        course.enrolledStudents = course.enrolledStudents.filter(
            (id) => id.toString() !== user._id.toString()
        );

        await user.save();
        await course.save();

        // Delete user's progress for this course
        await Progress.findOneAndDelete({ user: user._id, course: course._id });

        res.json({ message: 'Unenrolled successfully' });
    } else {
        res.status(404).json({ message: 'Course or User not found' });
    }
};

// @desc    Upload course video to Cloudinary
// @route   POST /api/courses/:id/videos
// @access  Private/Instructor
const uploadCourseVideo = async (req, res) => {
    const { title } = req.body;
    const courseId = req.params.id;

    if (!req.file) {
        res.status(400).json({ message: 'No video file uploaded' });
        return;
    }

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized to upload to this course' });
            return;
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: `eduflow/courses/${courseId}`,
            public_id: `${Date.now()}-${title.replace(/\s+/g, '_')}`
        });

        // Add to course content
        course.content.push({
            title,
            type: 'video',
            url: result.secure_url
        });

        await course.save();

        // Clean up local file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(201).json({
            message: 'Video uploaded successfully',
            url: result.secure_url,
            course
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Clean up local file if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Video upload failed', error: error.message });
    }
};

// @desc    Get recommended courses based on user interests
// @route   GET /api/courses/recommendations
// @access  Private/Student
const getRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // 1. Try Vector-based AI recommendation
        if (user.interests && user.interests.length > 0) {
            const interestText = user.interests.join(' ');
            const filter = {
                $or: [
                    { isPublic: true },
                    { college: user.college }
                ]
            };
            
            const vectorCourseIds = await searchSimilarCourses(interestText, 10, filter);
            
            if (vectorCourseIds.length > 0) {
                const recommendations = await Course.find({
                    _id: { 
                        $in: vectorCourseIds,
                        $nin: user.enrolledCourses 
                    }
                }).populate('instructor', 'name email');
                
                // Sort to match vector similarity order if needed, but Mongoose $in doesn't preserve order
                const sortedRecommendations = vectorCourseIds
                    .map(id => recommendations.find(r => r._id.toString() === id))
                    .filter(Boolean);

                return res.json(sortedRecommendations);
            }
        }

        // 2. Fallback to basic logic if vector DB is not ready or no interests
        const recommendations = await Course.find({
            _id: { $nin: user.enrolledCourses },
            $or: [
                { category: { $in: user.interests } },
                { tags: { $in: user.interests } },
                { college: user.college }
            ]
        })
        .limit(10)
        .populate('instructor', 'name email');

        res.json(recommendations);
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
};

// @desc    Semantic search courses
// @route   GET /api/courses/search
// @access  Public
const searchCourses = async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const filter = {};
        if (req.user) {
            filter.$or = [
                { isPublic: true },
                { college: req.user.college }
            ];
        } else {
            filter.isPublic = true;
        }

        const vectorCourseIds = await searchSimilarCourses(q, 20, filter);
        
        if (vectorCourseIds.length > 0) {
            const courses = await Course.find({
                _id: { $in: vectorCourseIds }
            }).populate('instructor', 'name email');

            // Preserve vector search order
            const sortedCourses = vectorCourseIds
                .map(id => courses.find(c => c._id.toString() === id))
                .filter(Boolean);

            return res.json(sortedCourses);
        }

        // Fallback to basic text search if vector search returns nothing
        const courses = await Course.find({
            $and: [
                {
                    $or: [
                        { title: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } },
                        { category: { $regex: q, $options: 'i' } },
                        { tags: { $in: [new RegExp(q, 'i')] } }
                    ]
                },
                req.user ? {
                    $or: [
                        { isPublic: true },
                        { isPublic: false, college: req.user.college }
                    ]
                } : { isPublic: true }
            ]
        }).populate('instructor', 'name email');

        res.json(courses);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};

// @desc    Get all unique categories
// @route   GET /api/courses/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Course.distinct('category');
        // If no courses yet, return some defaults
        const defaultCategories = [
            'Web Development', 'Mobile Apps', 'Data Science', 'Machine Learning', 
            'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design', 
            'Algorithms', 'Business'
        ];
        
        // Merge and remove duplicates
        const allCategories = [...new Set([...defaultCategories, ...categories])];
        res.json(allCategories);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    enrollCourse,
    unenrollCourse,
    uploadCourseVideo,
    getRecommendations,
    getCategories,
    searchCourses
};
