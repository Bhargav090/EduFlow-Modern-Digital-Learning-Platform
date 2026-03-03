const { OpenAI } = require('openai');
const Course = require('../models/Course');
const User = require('../models/User');
const { searchSimilarCourses } = require('../utils/vectorDB');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Private
const aiChat = async (req, res) => {
    const { message, history } = req.body;
    const user = await User.findById(req.user._id);

    try {
        // 1. Get context: find courses related to the user's message using vector search
        const filter = {
            $or: [
                { isPublic: true },
                { college: user.college }
            ]
        };
        
        const relatedCourseIds = await searchSimilarCourses(message, 3, filter);
        let relatedCourses = [];
        if (relatedCourseIds.length > 0) {
            relatedCourses = await Course.find({ _id: { $in: relatedCourseIds } })
                .select('title description category price')
                .limit(3);
        }

        // 2. Prepare System Prompt
        const systemPrompt = `You are Eduflow AI, a helpful learning assistant for the Eduflow LMS platform.
User Name: ${user.name}
User Interests: ${user.interests.join(', ')}
User College: ${user.college}

Your goals:
1. Answer student questions about learning, career paths, and technical topics.
2. Recommend specific courses from Eduflow when relevant.
3. Be concise, encouraging, and professional.

Context of available related courses on Eduflow:
${relatedCourses.map(c => `- ${c.title}: ${c.description} (Category: ${c.category})`).join('\n')}

If no courses are listed above, you can still suggest general learning paths but mention you'll keep an eye out for matching courses on Eduflow.
Always format your response in a clean way. Use bolding for course titles.`;

        // 3. Call OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...history.slice(-6), // Keep last 6 messages for context
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = response.choices[0].message.content;

        res.json({
            message: aiResponse,
            suggestions: generateSuggestions(aiResponse)
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'AI Assistant is currently busy. Please try again later.' });
    }
};

// Helper to generate dynamic suggestions based on AI response
const generateSuggestions = (text) => {
    const suggestions = [];
    if (text.toLowerCase().includes('course') || text.toLowerCase().includes('recommend')) {
        suggestions.push("Tell me more about these courses");
        suggestions.push("Are there any free courses?");
    }
    if (text.toLowerCase().includes('career') || text.toLowerCase().includes('path')) {
        suggestions.push("What skills do I need for this?");
        suggestions.push("How long will it take to learn?");
    }
    
    // Default suggestions if none matched
    if (suggestions.length === 0) {
        suggestions.push("What should I learn next?");
        suggestions.push("Help me with a study plan");
        suggestions.push("Recommend a course for me");
    }

    return suggestions.slice(0, 3);
};

module.exports = { aiChat };
