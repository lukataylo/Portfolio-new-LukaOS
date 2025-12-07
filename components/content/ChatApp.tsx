import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatAppProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
}

export const ChatApp: React.FC<ChatAppProps> = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);

    await onSendMessage(userMsg);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-[#0a0a0a] transition-colors">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'model' ? 'bg-red-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}
            `}>
              {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`
              max-w-[75%] p-3 rounded-lg text-sm font-mono leading-relaxed shadow-sm
              ${msg.role === 'model' 
                ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300' 
                : 'bg-zinc-200 dark:bg-white text-black'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs px-4 animate-pulse">
            <span className="w-2 h-2 bg-red-600 rounded-full"/> Processing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE COMMAND..."
            className="flex-1 bg-zinc-100 dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded px-4 py-2 text-black dark:text-white font-mono text-sm focus:border-red-600 outline-none transition-colors"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};