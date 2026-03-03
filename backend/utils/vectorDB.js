const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const indexName = process.env.PINECONE_INDEX_NAME || 'eduflow-courses';

/**
 * Generates an embedding for a given text using OpenAI.
 * @param {string} text - The text to embed (e.g., course title + description).
 * @returns {Promise<number[]>} - The embedding vector.
 */
const generateEmbedding = async (text) => {
    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            console.warn('OpenAI API Key not configured. Skipping embedding generation.');
            return null;
        }

        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
};

/**
 * Upserts a course's embedding into Pinecone.
 * @param {string} courseId - The ID of the course in MongoDB.
 * @param {object} metadata - Metadata to store with the vector (title, category, etc.).
 * @param {string} textForEmbedding - The text to embed.
 */
const upsertCourseEmbedding = async (courseId, metadata, textForEmbedding) => {
    try {
        const embedding = await generateEmbedding(textForEmbedding);
        if (!embedding) return;

        const index = pinecone.index(indexName);
        await index.upsert([{
            id: courseId.toString(),
            values: embedding,
            metadata: {
                ...metadata,
                courseId: courseId.toString(),
            },
        }]);
        console.log(`Successfully upserted embedding for course: ${courseId}`);
    } catch (error) {
        console.error(`Error upserting embedding for course ${courseId}:`, error);
    }
};

/**
 * Deletes a course's embedding from Pinecone.
 * @param {string} courseId - The ID of the course in MongoDB.
 */
const deleteCourseEmbedding = async (courseId) => {
    try {
        const index = pinecone.index(indexName);
        await index.deleteOne(courseId.toString());
        console.log(`Successfully deleted embedding for course: ${courseId}`);
    } catch (error) {
        console.error(`Error deleting embedding for course ${courseId}:`, error);
    }
};

/**
 * Searches for similar courses based on a query text.
 * @param {string} queryText - The search query.
 * @param {number} limit - Max number of results.
 * @param {object} filter - Metadata filter (e.g., { college: 'srmap.edu.in' }).
 * @returns {Promise<string[]>} - Array of course IDs.
 */
const searchSimilarCourses = async (queryText, limit = 5, filter = {}) => {
    try {
        const queryEmbedding = await generateEmbedding(queryText);
        if (!queryEmbedding) return [];

        const index = pinecone.index(indexName);
        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: limit,
            filter: filter,
            includeMetadata: true,
        });

        return queryResponse.matches.map(match => match.metadata.courseId);
    } catch (error) {
        console.error('Error searching similar courses:', error);
        return [];
    }
};

module.exports = {
    generateEmbedding,
    upsertCourseEmbedding,
    deleteCourseEmbedding,
    searchSimilarCourses,
};
