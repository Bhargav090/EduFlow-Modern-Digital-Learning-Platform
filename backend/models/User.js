const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'instructor'],
        default: 'student'
    },
    instructorProfile: {
        type: String
    },
    idCardFront: {
        type: String
    },
    idCardBack: {
        type: String
    },
    isInstructorApproved: {
        type: Boolean,
        default: false
    },
    isInstructorBlocked: {
        type: Boolean,
        default: false
    },
    isWhitelisted: {
        type: Boolean,
        default: false // For special instructors or early access
    },
    college: {
        type: String, // e.g., 'srmap.edu.in'
        required: false
    },
    interests: [{
        type: String // For AI recommendations
    }],
    onboardingCompleted: {
        type: Boolean,
        default: false
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    createdCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
