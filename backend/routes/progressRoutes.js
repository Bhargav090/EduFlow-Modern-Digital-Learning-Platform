const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/progressController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/:courseId')
    .get(protect, authorize('student'), getProgress)
    .put(protect, authorize('student'), updateProgress);

module.exports = router;
