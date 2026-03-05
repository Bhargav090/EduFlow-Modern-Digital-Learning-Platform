const Course = require('../models/Course');
const User = require('../models/User');
const { searchSimilarCourses } = require('../utils/vectorDB');
const predefinedResponses = require('../config/predefinedResponses');

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

const detectIntent = (text) => {
    const t = text.toLowerCase();
    if (t.includes('my courses') || t.includes('enrolled')) return 'enrolled';
    if (t.includes('list courses') || t.includes('all courses') || t.includes('courses')) return 'list';
    if (t.includes('recommend') || t.includes('suggest')) return 'recommend';
    if (t.includes('category') || t.includes('categories')) return 'categories';
    if (t.includes('progress')) return 'progress';
    return null;
};

const siteAwareRespond = async (intent, user, text) => {
    const filter = user 
        ? { $or: [{ isPublic: true }, { isPublic: false, college: user.college }] }
        : { isPublic: true };

    switch (intent) {
        case 'list': {
            const courses = await Course.find(filter).select('title category').limit(8);
            if (courses.length === 0) {
                return { message: 'No courses are available yet. Check back soon!', suggestions: ['Browse later', 'Create a course'] };
            }
            const summary = courses.map(c => `• ${c.title} (${c.category})`).join('\n');
            return { 
                message: `Here are some courses:\n${summary}\nYou can open Courses to see all.`,
                suggestions: ['Open Courses', 'Recommend for me']
            };
        }
        case 'enrolled': {
            const courses = await Course.find({ _id: { $in: user.enrolledCourses } }).select('title category').limit(8);
            if (courses.length === 0) {
                return { message: 'You have not enrolled in any courses yet.', suggestions: ['Browse courses', 'Recommend for me'] };
            }
            const summary = courses.map(c => `• ${c.title} (${c.category})`).join('\n');
            return { message: `Your enrolled courses:\n${summary}`, suggestions: ['Continue learning', 'View dashboard'] };
        }
        case 'recommend': {
            const interestText = (user.interests && user.interests.length) ? user.interests.join(' ') : text;
            const relatedIds = await searchSimilarCourses(interestText, 5, filter);
            const recs = relatedIds.length 
                ? await Course.find({ _id: { $in: relatedIds } }).select('title category').limit(5)
                : await Course.find(filter).select('title category').limit(5);
            if (!recs || recs.length === 0) {
                return { 
                    message: 'I couldn’t find recommendations right now. Try opening Courses and browsing categories.',
                    suggestions: ['Open Courses', 'Show categories']
                };
            }
            const summary = recs.map(c => `• ${c.title} (${c.category})`).join('\n');
            return { message: `Recommended for you:\n${summary}`, suggestions: ['Enroll now', 'Compare courses'] };
        }
        case 'categories': {
            const categories = await Course.distinct('category');
            const list = categories.slice(0, 10).join(', ');
            return { message: `Popular categories: ${list}.`, suggestions: ['Show courses in a category', 'Recommend for me'] };
        }
        case 'progress': {
            const count = (user.enrolledCourses || []).length;
            return { message: `You are enrolled in ${count} course(s). Open your dashboard to see detailed progress.`, suggestions: ['Open Dashboard', 'Continue learning'] };
        }
        default:
            return null;
    }
};

const findPredefinedResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    for (const item of predefinedResponses) {
        if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
            return {
                message: item.response,
                suggestions: item.suggestions
            };
        }
    }
    return null;
};

const aiChat = async (req, res) => {
    const { message, history } = req.body;
    const user = await User.findById(req.user._id);

    try {
        const intent = detectIntent(message);
        if (intent) {
            const siteResponse = await siteAwareRespond(intent, user, message);
            if (siteResponse) {
                return res.json(siteResponse);
            }
        }

        const predefined = findPredefinedResponse(message);
        if (predefined) {
            console.log("Using predefined response for:", message);
            return res.json(predefined);
        }

        if (!API_KEY) {
            const siteResponse = await siteAwareRespond('recommend', user, message) 
                || await siteAwareRespond('list', user, message);
            return res.json(siteResponse || { message: 'Open Courses to explore available content.', suggestions: ['Open Courses', 'Recommend for me'] });
        }

        const filter = { $or: [{ isPublic: true }, { college: user.college }] };
        const relatedCourseIds = await searchSimilarCourses(message, 2, filter);
        
        let courseContext = "";
        if (relatedCourseIds.length > 0) {
            const relatedCourses = await Course.find({ _id: { $in: relatedCourseIds } })
                .select('title description')
                .limit(2);
            courseContext = relatedCourses.map(c => `* ${c.title}`).join('\n');
        }

        const systemInstruction = `You are Eduflow AI, a proactive learning guide. 
Respond like an assistant that suggests the best next steps. 
Be concise (1-2 sentences). 
Context: ${courseContext || "No specific matches yet."}
User: ${user.name} (${user.college}).`;

        const historyContext = history.slice(-2).map(m => `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`).join('\n');
        const fullPrompt = `${systemInstruction}\n\nRecent Chat:\n${historyContext}\n\nUser: ${message}\nAI:`;

        const modelsToTry = [
            'gemini-flash-latest',
            'gemini-2.0-flash-lite',
            'gemini-2.0-flash',
            'gemini-pro-latest'
        ];
        
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }],
                        generationConfig: { 
                            maxOutputTokens: 50,
                            temperature: 0.7
                        }
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorStatus = response.status;
                    if (errorStatus === 404 || errorStatus === 400 || errorStatus === 429 || errorStatus === 503) {
                        console.warn(`Model ${modelName} failed (${errorStatus}). Trying next...`);
                        lastError = { status: errorStatus, message: data.error?.message };
                        continue;
                    }
                    throw new Error(`API Error ${errorStatus}`);
                }

                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!aiText || !aiText.trim()) {
                    const siteResponse = await siteAwareRespond('recommend', user, message) 
                        || await siteAwareRespond('list', user, message);
                    return res.json(siteResponse || { message: 'Open Courses to explore available content.', suggestions: ['Open Courses', 'Recommend for me'] });
                }
                return res.json({
                    message: aiText.trim(),
                    suggestions: generateSuggestions(aiText)
                });
            } catch (err) {
                lastError = err;
                continue;
            }
        }

        const fallbackMsg = "I'm currently resting. Try checking the 'Courses' tab for new content!";
        return res.json({
            message: fallbackMsg,
            suggestions: ["View Courses", "Wait a minute"]
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'AI is busy. Please try later.' });
    }
};

const generateSuggestions = (text) => {
    const suggestions = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('course') || lowerText.includes('recommend')) {
        suggestions.push("Show me more details", "Compare with other courses");
    } else if (lowerText.includes('learn') || lowerText.includes('study')) {
        suggestions.push("Create a weekly plan", "Resources for this");
    } else if (lowerText.includes('college') || lowerText.includes('university')) {
        suggestions.push("Campus news", "Faculty details");
    } else {
        suggestions.push("Suggest a course", "Learning paths");
    }
    
    return suggestions.slice(0, 2);
};

module.exports = { aiChat, generateSuggestions };
