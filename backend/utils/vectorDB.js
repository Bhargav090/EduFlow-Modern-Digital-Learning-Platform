const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const indexName = process.env.PINECONE_INDEX_NAME || 'eduflow-courses';

/**
 * Generates an embedding for a given text using Gemini REST API.
 */
const generateEmbedding = async (text) => {
    try {
        if (!API_KEY) {
            console.warn('Gemini API Key not configured. Skipping embedding generation.');
            return null;
        }

        const modelsToTry = [
            process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
            'text-embedding-004'
        ];

        for (const modelName of modelsToTry) {
            try {
                // Direct REST API Call
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: { parts: [{ text }] },
                        outputDimensionality: 1024
                    })
                });

                const data = await response.json();

                if (response.ok && data.embedding?.values) {
                    console.log(`Successfully generated embedding with ${modelName} via REST`);
                    return data.embedding.values;
                }
                
                console.warn(`Embedding model ${modelName} failed with status ${response.status}. Trying next...`);
            } catch (err) {
                console.warn(`Fetch error for embedding model ${modelName}:`, err.message);
                continue;
            }
        }
        
        throw new Error("No available Gemini embedding models found via REST");
    } catch (error) {
        console.error('Gemini Embedding Error:', error.message);
        
        // Fallback to OpenAI
        try {
            if (!process.env.OPENAI_API_KEY) return null;
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const resp = await openai.embeddings.create({
                model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
                input: text,
                dimensions: 1024
            });
            if (resp?.data?.[0]?.embedding) {
                console.log("Successfully generated embedding via OpenAI fallback");
                return resp.data[0].embedding;
            }
            return null;
        } catch (fallbackError) {
            console.error('OpenAI embedding fallback failed:', fallbackError.message);
            return null;
        }
    }
};

/**
 * Upserts a course's embedding into Pinecone.
 */
const upsertCourseEmbedding = async (courseId, metadata, textForEmbedding) => {
    try {
        const embedding = await generateEmbedding(textForEmbedding);
        if (!embedding || embedding.length === 0) {
            console.warn(`No embedding generated for course ${courseId}. Skipping upsert.`);
            return;
        }

        const index = pinecone.index(indexName);
        const record = {
            id: courseId.toString(),
            values: embedding,
            metadata: {
                ...metadata,
                courseId: courseId.toString(),
            },
        };
        console.log(`Upserting to index ${indexName}:`, { id: record.id, valuesLength: record.values.length });
        await index.upsert({ records: [record] });
        console.log(`Successfully upserted embedding for course: ${courseId}`);
    } catch (error) {
        console.error(`Error upserting embedding for course ${courseId}:`, error);
    }
};

/**
 * Deletes a course's embedding from Pinecone.
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
