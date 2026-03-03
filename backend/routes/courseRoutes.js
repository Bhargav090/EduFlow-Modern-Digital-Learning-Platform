const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
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
} = require('../controllers/courseController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.get('/recommendations', protect, getRecommendations);
router.get('/categories', getCategories);
router.get('/search', optionalProtect, searchCourses);

router.route('/')
    .get(optionalProtect, getCourses)
    .post(protect, authorize('instructor'), createCourse);

router.route('/:id/videos')
    .post(protect, authorize('instructor'), upload.single('video'), uploadCourseVideo);

router.route('/:id')
    .get(getCourseById)
    .put(protect, authorize('instructor'), updateCourse)
    .delete(protect, authorize('instructor'), deleteCourse);

router.route('/:id/enroll').post(protect, authorize('student'), enrollCourse);
router.route('/:id/unenroll').delete(protect, authorize('student'), unenrollCourse);

module.exports = router;
