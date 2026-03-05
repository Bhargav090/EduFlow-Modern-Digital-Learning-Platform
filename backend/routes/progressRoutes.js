const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:courseId')
    .get(protect, getProgress)
    .put(protect, updateProgress);

module.exports = router;
