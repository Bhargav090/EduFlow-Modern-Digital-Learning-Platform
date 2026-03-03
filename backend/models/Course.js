const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    college: {
        type: String, // Which college this course belongs to
        required: false
    },
    isPublic: {
        type: Boolean,
        default: true // true: all students, false: only same college
    },
    category: {
        type: String, // For AI recommendation grouping
        required: true
    },
    tags: [{
        type: String // For vector DB / Search
    }],
    isPlaylist: {
        type: Boolean,
        default: false
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    content: [{
        title: String,
        type: {
            type: String,
            enum: ['video', 'pdf', 'text'],
            default: 'text'
        },
        url: String, // For video/pdf
        text: String // For text content
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
