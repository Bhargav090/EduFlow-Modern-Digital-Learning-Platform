const Progress = require('../models/Progress');
const Course = require('../models/Course');

// @desc    Get course progress
// @route   GET /api/progress/:courseId
// @access  Private/Student
const getProgress = async (req, res) => {
    const progress = await Progress.findOne({
        user: req.user._id,
        course: req.params.courseId
    });

    if (progress) {
        res.json(progress);
    } else {
        res.status(404).json({ message: 'Progress not found' });
    }
};

// @desc    Update course progress
// @route   PUT /api/progress/:courseId
// @access  Private/Student
const updateProgress = async (req, res) => {
    const { contentId } = req.body;
    const progress = await Progress.findOne({
        user: req.user._id,
        course: req.params.courseId
    });

    if (progress) {
        if (!progress.completedContent.includes(contentId)) {
            progress.completedContent.push(contentId);
            
            // Calculate percentage
            const course = await Course.findById(req.params.courseId);
            if (course && course.content.length > 0) {
                progress.completionPercentage = (progress.completedContent.length / course.content.length) * 100;
            }
            
            await progress.save();
        }
        res.json(progress);
    } else {
        res.status(404).json({ message: 'Progress not found' });
    }
};

module.exports = { getProgress, updateProgress };
