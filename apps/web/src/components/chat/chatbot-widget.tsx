'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'bot', text: 'Namaste! I am JanSetu Sahayak. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let botReply = "I'm sorry, I didn't quite catch that. Can you rephrase?";
      
      const lowerInput = userMsg.toLowerCase();
      if (lowerInput.includes('volunteer')) {
        botReply = "You can find volunteering opportunities on the Dashboard! We currently have 3 open tasks in your area. Would you like me to guide you there?";
      } else if (lowerInput.includes('donate') || lowerInput.includes('fund')) {
        botReply = "Thank you for your generosity! You can donate to verified campaigns from your donor portal. Which campaign category interests you the most?";
      } else if (lowerInput.includes('ngo') || lowerInput.includes('register')) {
        botReply = "To register an NGO, go to the onboarding page and upload your 80G/12A documents. Our AI will verify them instantly!";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botReply = "Hello! How can JanSetu make your day better?";
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all z-50 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[350px] shadow-2xl glass-card border border-indigo-500/20 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: 'calc(100vh - 40px)' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">JanSetu Sahayak</h3>
              <p className="text-indigo-200 text-xs">AI Assistant</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex max-w-[85%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} gap-2`}>
              {msg.role === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-auto">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex max-w-[85%] mr-auto gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-auto">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3 rounded-2xl text-sm bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 bg-slate-800 text-slate-200 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
