const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const { upsertCourseEmbedding } = require('./vectorDB');

dotenv.config({ path: '../.env' });

const indexExistingCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for indexing...');

        const courses = await Course.find({});
        console.log(`Found ${courses.length} courses to index.`);

        for (const course of courses) {
            const textForEmbedding = `${course.title} ${course.description} ${course.category} ${course.tags ? course.tags.join(' ') : ''}`;
            
            console.log(`Indexing course: ${course.title}...`);
            await upsertCourseEmbedding(course._id, {
                title: course.title,
                category: course.category,
                college: course.college || 'public',
                isPublic: course.isPublic
            }, textForEmbedding);
        }

        console.log('Indexing complete!');
        process.exit(0);
    } catch (error) {
        console.error('Indexing failed:', error);
        process.exit(1);
    }
};

indexExistingCourses();
