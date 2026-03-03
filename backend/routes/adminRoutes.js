const express = require('express');
const router = express.Router();
const {
    adminLogin,
    getAdmins,
    getPendingInstructors,
    getAllInstructors,
    approveInstructor,
    blockInstructor,
    unblockInstructor,
    whitelistInstructor,
    unwhitelistInstructor
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminMiddleware');

router.post('/login', adminLogin);
router.get('/admins', adminProtect, getAdmins);
router.get('/instructors/pending', adminProtect, getPendingInstructors);
router.patch('/instructors/:id/approve', adminProtect, approveInstructor);

router.get('/instructors', adminProtect, getAllInstructors);
router.patch('/instructors/:id/block', adminProtect, blockInstructor);
router.patch('/instructors/:id/unblock', adminProtect, unblockInstructor);
router.patch('/instructors/:id/whitelist', adminProtect, whitelistInstructor);
router.patch('/instructors/:id/unwhitelist', adminProtect, unwhitelistInstructor);

module.exports = router;
