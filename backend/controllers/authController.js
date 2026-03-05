const User = require('../models/User');
const EmailAlias = require('../models/EmailAlias');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, instructorProfile, idCardFront, idCardBack } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // Enforce EDU emails or mapped aliases
    const domain = (email.split('@')[1] || '').toLowerCase();
    let college = domain;
    if (!domain.includes('edu')) {
        const alias = await EmailAlias.findOne({ personalEmail: email.toLowerCase() });
        if (!alias) {
            res.status(400).json({ message: 'Only institutional .edu emails are allowed to register' });
            return;
        }
        // Use alias mapping
        college = alias.collegeDomain.toLowerCase();
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        college,
        instructorProfile: role === 'instructor' ? instructorProfile : undefined,
        idCardFront: role === 'instructor' ? idCardFront : undefined,
        idCardBack: role === 'instructor' ? idCardBack : undefined,
        isInstructorApproved: role === 'instructor' ? false : true
    });

    if (!user) {
        res.status(400).json({ message: 'Invalid user data' });
        return;
    }

    if (user.role === 'instructor') {
        res.status(201).json({
            role: user.role,
            message: 'Your instructor application has been submitted. Once an admin approves it, you will be able to log in as an instructor.'
        });
        return;
    }

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    // If logging in with personal email, try alias map to find edu account
    if (!user) {
        const alias = await EmailAlias.findOne({ personalEmail: email.toLowerCase() });
        if (alias) {
            user = await User.findOne({ email: alias.eduEmail.toLowerCase() });
        }
    }

    if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }

    if (user.role === 'instructor') {
        if (user.isInstructorBlocked) {
            res.status(403).json({ message: 'Instructor account has been blocked. Please contact support.' });
            return;
        }
        if (!user.isInstructorApproved) {
            res.status(403).json({ message: 'Instructor account pending approval' });
            return;
        }
    }

    if (await user.matchPassword(password)) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            interests: user.interests,
            onboardingCompleted: user.onboardingCompleted,
            enrolledCourses: user.enrolledCourses,
            createdCourses: user.createdCourses
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Complete onboarding
// @route   PUT /api/auth/onboarding
// @access  Private
const completeOnboarding = async (req, res) => {
    const { interests } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        user.interests = interests;
        user.onboardingCompleted = true;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            interests: updatedUser.interests,
            onboardingCompleted: updatedUser.onboardingCompleted
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { registerUser, authUser, getUserProfile, completeOnboarding };
