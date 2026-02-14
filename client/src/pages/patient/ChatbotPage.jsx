import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Bot, User, AlertTriangle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { aiService } from '../../services';

const ChatbotPage = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                "Hello! I'm your AI health assistant. I can help you understand symptoms, answer general health questions, and provide wellness advice. How can I help you today?",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const chatMutation = useMutation({
        mutationFn: ({ message, sessionId }) => aiService.chat(message, sessionId),
        onSuccess: (data) => {
            setSessionId(data.sessionId);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date().toISOString(),
                },
            ]);
        },
    });

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const payload = { message: input };
        if (sessionId) {
            payload.sessionId = sessionId;
        }
        chatMutation.mutate(payload);
        setInput('');
    };

    const suggestedPrompts = [
        'What are the symptoms of diabetes?',
        'I have a headache, should I be concerned?',
        "How can I improve my sleep?",
        'What causes high blood pressure?',
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card flex flex-col h-[calc(100vh-12rem)]">
                    {/* Header */}
                    <div className="border-b border-slate-200 pb-4 mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <Bot className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">AI Health Assistant</h2>
                                <p className="text-sm text-slate-600">Ask me anything about health</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-start space-x-2">
                                        {message.role === 'assistant' && (
                                            <Bot className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                        )}
                                        {message.role === 'user' && <User className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {chatMutation.isPending && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                    <LoadingSpinner size="sm" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Prompts (only show at start) */}
                    {messages.length === 1 && (
                        <div className="mb-4">
                            <p className="text-xs text-slate-600 mb-2">Suggested questions:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {suggestedPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInput(prompt)}
                                        className="text-xs text-left bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-2 text-slate-700 transition"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-900">
                                This AI provides general health information only and cannot replace professional
                                medical advice.
                            </p>
                        </div>
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="input flex-1"
                            disabled={chatMutation.isPending}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || chatMutation.isPending}
                            className="btn-primary px-4"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;
