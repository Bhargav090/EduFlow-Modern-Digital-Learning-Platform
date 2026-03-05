import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, X, Send, Bot, User, Sparkles, 
    ChevronRight, Loader2, Minimize2, Maximize2 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([
        "Recommend a course for me",
        "How can I learn Web Dev?",
        "Help me with a study plan"
    ]);
    const { user } = useAuth();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [history, isOpen, isMinimized]);

    const handleSendMessage = async (msgText) => {
        const textToSend = msgText || message;
        if (!textToSend.trim() || isLoading) return;

        const newHistory = [...history, { role: 'user', content: textToSend }];
        setHistory(newHistory);
        setMessage('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/ai/chat', { 
                message: textToSend, 
                history: newHistory.slice(-6) 
            });
            
            setHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
            setSuggestions(data.suggestions || []);
        } catch (error) {
            console.error('Chat failed', error);
            setHistory(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm having a bit of trouble connecting right now. Please try again in a moment!" 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            height: isMinimized ? '64px' : '500px',
                            width: '380px'
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-4 flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none">Eduflow AI</h3>
                                    <span className="text-[10px] opacity-80 flex items-center gap-1 mt-1">
                                        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                                        Always Online
                                    </span>
                                    <div className="text-[9px] opacity-70 mt-1">
                                        Powered by Vector DB
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* AI Suggestion Header - Fixed at top */}
                                {suggestions.length > 0 && (
                                    <div className="bg-indigo-50/50 border-b border-indigo-100 p-3 shrink-0 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
                                                <Sparkles className="w-3 h-3 animate-pulse" />
                                                AI Smart Suggestions
                                            </div>
                                            <div className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded uppercase tracking-tighter">
                                                Live
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(s)}
                                                    className="text-[10px] font-bold px-3 py-1.5 bg-white text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                                                >
                                                    <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Chat Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
                                    {history.length === 0 && (
                                        <div className="text-center py-6">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <Bot className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <h4 className="font-bold text-slate-800">Hello, {user.name}!</h4>
                                            <p className="text-sm text-slate-500 max-w-[200px] mx-auto mt-1">
                                                I'm your AI assistant. Ask me anything about courses or learning paths!
                                            </p>
                                        </div>
                                    )}

                                    {history.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                                                    msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-200'
                                                }`}>
                                                    {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-slate-600" />}
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                    msg.role === 'user' 
                                                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-2 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm rounded-tl-none">
                                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                                <span className="text-xs text-slate-500 font-medium">AI is thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                                    <form 
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                        className="flex gap-2"
                                    >
                                        <input 
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={!message.trim() || isLoading}
                                            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    if (isOpen) setIsMinimized(false);
                    else setIsOpen(true);
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    isOpen 
                        ? 'bg-slate-900 text-white rotate-0' 
                        : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/40'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"
                    />
                )}
            </motion.button>
        </div>
    );
};

export default AIChatBot;
