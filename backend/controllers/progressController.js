const Progress = require('../models/Progress');
const Course = require('../models/Course');

// @desc    Get or create user progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
const getProgress = async (req, res) => {
    try {
        let progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });

        if (!progress) {
            // If no progress, create one
            progress = await Progress.create({ user: req.user._id, course: req.params.courseId });
        }

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user progress (e.g., last watched video)
// @route   PUT /api/progress/:courseId
// @access  Private
const updateProgress = async (req, res) => {
    const { lectureId, timestamp, completed } = req.body;

    try {
        const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });

        if (!progress) {
            return res.status(404).json({ message: 'Progress not found' });
        }

        // Update last watched video and timestamp
        if (lectureId && timestamp !== undefined) {
            progress.lastWatched = { lectureId, timestamp };
        }

        // Mark a lecture as completed
        if (completed && lectureId) {
            const isCompleted = progress.completedLectures.some(l => l.lectureId.toString() === lectureId);
            if (!isCompleted) {
                progress.completedLectures.push({ lectureId });
            }
        }

        await progress.save();
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getProgress, updateProgress };
