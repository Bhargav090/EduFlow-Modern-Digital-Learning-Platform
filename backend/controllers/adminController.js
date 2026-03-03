const Admin = require('../models/Admin');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }

    if (!(await admin.matchPassword(password))) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }

    res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id)
    });
};

const getAdmins = async (req, res) => {
    const admins = await Admin.find().select('-password');
    res.json(admins);
};

const getPendingInstructors = async (req, res) => {
    const instructors = await User.find({
        role: 'instructor',
        isInstructorApproved: false
    }).select('-password');
    res.json(instructors);
};

const getAllInstructors = async (req, res) => {
    const instructors = await User.find({
        role: 'instructor'
    }).select('-password');
    res.json(instructors);
};

const approveInstructor = async (req, res) => {
    const { id } = req.params;

    const instructor = await User.findOne({
        _id: id,
        role: 'instructor'
    });

    if (!instructor) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
    }

    instructor.isInstructorApproved = true;
    await instructor.save();

    res.json({ message: 'Instructor approved successfully' });
};

const blockInstructor = async (req, res) => {
    const { id } = req.params;

    const instructor = await User.findOne({
        _id: id,
        role: 'instructor'
    });

    if (!instructor) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
    }

    instructor.isInstructorBlocked = true;
    await instructor.save();

    res.json({ message: 'Instructor blocked successfully' });
};

const unblockInstructor = async (req, res) => {
    const { id } = req.params;

    const instructor = await User.findOne({
        _id: id,
        role: 'instructor'
    });

    if (!instructor) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
    }

    instructor.isInstructorBlocked = false;
    await instructor.save();

    res.json({ message: 'Instructor unblocked successfully' });
};

const whitelistInstructor = async (req, res) => {
    const { id } = req.params;
    const instructor = await User.findOne({ _id: id, role: 'instructor' });
    if (!instructor) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
    }
    instructor.isWhitelisted = true;
    await instructor.save();
    res.json({ message: 'Instructor whitelisted successfully' });
};

const unwhitelistInstructor = async (req, res) => {
    const { id } = req.params;
    const instructor = await User.findOne({ _id: id, role: 'instructor' });
    if (!instructor) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
    }
    instructor.isWhitelisted = false;
    await instructor.save();
    res.json({ message: 'Instructor removed from whitelist' });
};

module.exports = {
    adminLogin,
    getAdmins,
    getPendingInstructors,
    getAllInstructors,
    approveInstructor,
    blockInstructor,
    unblockInstructor,
    whitelistInstructor,
    unwhitelistInstructor
};
