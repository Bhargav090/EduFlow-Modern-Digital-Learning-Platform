const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const courses = [
    {
        title: 'AI/ML Fundamentals',
        description: 'A comprehensive introduction to Artificial Intelligence and Machine Learning.',
        category: 'Artificial Intelligence',
        isPublic: true,
        tags: ['AI', 'ML', 'Python'],
        lectures: [
            { title: 'Introduction to AI/ML', url: 'https://youtu.be/1L420xXpDTg?si=9EVf0A2k0BFcpveN' },
            { title: 'Supervised Learning', url: 'https://youtu.be/Lb0JzFtTmBs?si=C0_fZB3SzZk2Qk9V' },
            { title: 'Unsupervised Learning', url: 'https://youtu.be/omGvjpmPDoY?si=E-JWRmzUN0pCvpqI' },
            { title: 'Neural Networks & Deep Learning', url: 'https://youtu.be/UFAHXZW2hU8?si=0Bmtupp5Re8ozjc4' }
        ]
    },
    {
        title: 'Quantum Computing Explained',
        description: 'Dive into the mind-bending world of quantum mechanics and its computational applications.',
        category: 'Quantum Computing',
        isPublic: true,
        tags: ['Quantum', 'Physics', 'Computation'],
        lectures: [
            { title: 'The Quantum Revolution', url: 'https://youtu.be/zm64o27eHYw?si=jbELfgPhw_iIyKFX' },
            { title: 'Qubits and Superposition', url: 'https://youtu.be/JAfUZRhEEno?si=j6FYmhh19dr_1jFS' },
            { title: 'Entanglement and Quantum Gates', url: 'https://youtu.be/WnDZiH4wdBY?si=UD_1AONoGOMssPSx' },
            { title: 'Quantum Algorithms (Shor\'s & Grover\'s)', url: 'https://youtu.be/rVpxeXJudO8?si=qy-YR0N4Kewo6vrJ' },
            { title: 'The Future of Quantum Computers', url: 'https://youtu.be/YajmrNociI8?si=iC046t4qu0ww9Xuy' }
        ]
    },
    {
        title: 'Digital Electronics & Logic Design',
        description: 'From basic logic gates to complex digital circuits, master the fundamentals of digital electronics.',
        category: 'Electronics',
        isPublic: true,
        tags: ['Digital', 'Electronics', 'Logic Design'],
        lectures: [
            { title: 'Number Systems and Binary', url: 'https://youtu.be/M0mx8S05v60?si=f3QRAvmzTvtG4V6P' },
            { title: 'Logic Gates (AND, OR, NOT, XOR)', url: 'https://youtu.be/F5h3z8p9dPg?si=FwEJxiB7I12hFjjp' },
            { title: 'Boolean Algebra & K-Maps', url: 'https://youtu.be/jRL9ag3riJY?si=480qCxjAphfa0Ypa' },
            { title: 'Combinational & Sequential Circuits', url: 'https://youtu.be/izBaDRyqnBk?si=I0O8QQ4bmJ6G82Rz' },
            { title: 'Introduction to Microprocessors', url: 'https://youtu.be/2xXErGeeb_Q?si=Xef0FwSOaGhu01WM' }
        ]
    }
];

const seedDB = async () => {
    await connectDB();
    try {
        // Find an instructor to assign the courses to
        let instructor = await User.findOne({ role: 'instructor' });
        if (!instructor) {
            console.log('No instructor found. Please create an instructor user first.');
            process.exit();
        }

        // Clear existing public courses to avoid duplicates
        await Course.deleteMany({ isPublic: true });
        console.log('Cleared existing public courses.');

        const coursesWithInstructor = courses.map(course => ({ ...course, instructor: instructor._id }));

        await Course.insertMany(coursesWithInstructor);
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
