import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { getBeautyAdvice } from '../services/geminiService';
import Markdown from 'react-markdown';

export const AIBeautyAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Welcome to Von Luxe. I am your personal beauty assistant. How may I guide your aesthetic journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await getBeautyAdvice(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that." }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[calc(100vw-4rem)] sm:w-80 md:w-96 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-luxury-gold/20"
          >
            <div className="p-4 bg-luxury-ink text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-luxury-gold" />
                <span className="font-serif italic text-lg">Von Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-luxury-gold transition-colors">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-luxury-cream/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-luxury-ink text-white rounded-tr-none' 
                      : 'bg-white text-luxury-ink shadow-sm rounded-tl-none border border-luxury-gold/10'
                  }`}>
                    <div className="markdown-body">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-luxury-gold/10">
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex gap-1"
                    >
                      <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                      <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                      <div className="w-1.5 h-1.5 bg-luxury-gold rounded-full" />
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-luxury-gold/10 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for beauty advice..."
                  className="flex-1 text-sm outline-none font-serif italic"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="text-luxury-ink hover:text-luxury-gold transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-luxury-ink text-white rounded-full flex items-center justify-center shadow-xl hover:bg-luxury-gold transition-colors"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};
