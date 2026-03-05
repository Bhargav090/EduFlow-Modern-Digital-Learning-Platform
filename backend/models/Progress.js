const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    completedLectures: [{
        lectureId: mongoose.Schema.Types.ObjectId,
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastWatched: {
        lectureId: mongoose.Schema.Types.ObjectId,
        timestamp: {
            type: Number, // in seconds
            default: 0
        }
    }
}, {
    timestamps: true
});

// Ensure a user can only have one progress document per course
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
