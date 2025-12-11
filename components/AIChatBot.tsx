
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { GenerateContentResponse } from '@google/genai';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'أهلاً بك في متجر الحسام! 🛍️\nأنا مساعدك الذكي، كيف يمكنني مساعدتك في العثور على المنتج المناسب اليوم؟'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const stream = await sendMessageToGemini(userMessage.text);
      
      const botMessageId = (Date.now() + 1).toString();
      let fullText = '';
      
      // Add placeholder message for stream updates
      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'model',
        text: ''
      }]);

      for await (const chunk of stream) {
          const content = chunk as GenerateContentResponse;
          const text = content.text || '';
          fullText += text;
          
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: fullText } : msg
          ));
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 sm:bottom-6 left-6 z-40 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-primary transition-all duration-300 hover:scale-110 group"
          aria-label="تحدث مع المساعد الذكي"
        >
          <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full shadow-sm animate-bounce">
            AI
          </div>
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 sm:bottom-6 left-6 z-50 w-[90vw] sm:w-96 h-[500px] max-h-[70vh] sm:max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-fade-in-up ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-gradient-to-l from-gray-900 to-gray-800 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-sm">مساعد التسوق</h3>
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  متصل (Gemini)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-accent shadow-sm'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm rounded-tl-none border border-gray-100'
                } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}>
                  {msg.role === 'model' && msg.text === '' ? (
                     <span className="flex gap-1 items-center h-5">
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                     </span>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 items-end">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="اسأل عن منتج..."
                className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none max-h-32 scrollbar-hide"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className="bg-primary hover:bg-secondary text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:rotate-180" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBot;
