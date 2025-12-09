import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../../services/geminiService';

interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error';
  content: string;
}

export const TerminalApp: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'LukaOS Terminal v1.0.0' },
    { type: 'system', content: 'AI-powered assistant ready. You have 2 questions remaining.' },
    { type: 'system', content: 'Type your question and press Enter.' },
    { type: 'system', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState(() => {
    // Check localStorage for existing count
    const stored = localStorage.getItem('terminal-questions');
    if (stored) {
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? 2 : parsed;
    }
    return 2;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  // Save questions remaining to localStorage
  useEffect(() => {
    localStorage.setItem('terminal-questions', questionsRemaining.toString());
  }, [questionsRemaining]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    setInput('');

    // Add user input to lines
    setLines(prev => [...prev, { type: 'input', content: `$ ${userInput}` }]);

    // Handle built-in commands
    const lowerInput = userInput.toLowerCase();

    if (lowerInput === 'clear') {
      setLines([
        { type: 'system', content: 'LukaOS Terminal v1.0.0' },
        { type: 'system', content: `AI-powered assistant ready. You have ${questionsRemaining} question${questionsRemaining !== 1 ? 's' : ''} remaining.` },
        { type: 'system', content: '' },
      ]);
      return;
    }

    if (lowerInput === 'help') {
      setLines(prev => [...prev,
        { type: 'output', content: 'Available commands:' },
        { type: 'output', content: '  help     - Show this help message' },
        { type: 'output', content: '  clear    - Clear the terminal' },
        { type: 'output', content: '  whoami   - About Luka' },
        { type: 'output', content: '  ls       - List portfolio sections' },
        { type: 'output', content: '  <query>  - Ask AI anything (limited questions)' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    if (lowerInput === 'whoami') {
      setLines(prev => [...prev,
        { type: 'output', content: 'Luka Dadiani' },
        { type: 'output', content: 'Product Manager & Senior Designer' },
        { type: 'output', content: 'London, United Kingdom' },
        { type: 'output', content: '' },
        { type: 'output', content: '9+ years building user-centred digital products' },
        { type: 'output', content: 'across insurance, telecoms, and e-commerce.' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    if (lowerInput === 'ls') {
      setLines(prev => [...prev,
        { type: 'output', content: 'about-me/     case-studies/   notes/' },
        { type: 'output', content: 'library/      photography/    sitemap/' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    // Hidden easter egg commands
    if (lowerInput === 'sudo hire-me' || lowerInput === 'sudo hire me') {
      setLines(prev => [...prev,
        { type: 'output', content: '[sudo] password for visitor: ********' },
        { type: 'output', content: '' },
        { type: 'output', content: '✨ HIRING SEQUENCE INITIATED ✨' },
        { type: 'output', content: '' },
        { type: 'output', content: 'Contacting: luka.taylor@gmail.com' },
        { type: 'output', content: 'Skills verified: ✓ Product Management' },
        { type: 'output', content: '                ✓ UX Design' },
        { type: 'output', content: '                ✓ Frontend Development' },
        { type: 'output', content: '                ✓ Being Awesome' },
        { type: 'output', content: '' },
        { type: 'output', content: 'Recommendation: HIRE IMMEDIATELY 🚀' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    if (lowerInput === 'rm -rf /' || lowerInput === 'rm -rf /*') {
      setLines(prev => [...prev,
        { type: 'error', content: 'Permission denied: Nice try! 😈' },
        { type: 'output', content: '' },
        { type: 'output', content: 'This portfolio is protected by:' },
        { type: 'output', content: '  • Good vibes only™' },
        { type: 'output', content: '  • React\'s reconciliation algorithm' },
        { type: 'output', content: '  • The power of friendship' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    if (lowerInput === 'cat /etc/secrets' || lowerInput === 'cat secrets') {
      setLines(prev => [...prev,
        { type: 'output', content: '========== TOP SECRET ===========' },
        { type: 'output', content: '' },
        { type: 'output', content: '• Coffee consumption: Critical levels' },
        { type: 'output', content: '• Tabs vs Spaces: Tabs (fight me)' },
        { type: 'output', content: '• Favorite debugger: console.log' },
        { type: 'output', content: '• Most used shortcut: Cmd+Z' },
        { type: 'output', content: '• Secret skill: Can center a div' },
        { type: 'output', content: '' },
        { type: 'output', content: '=================================' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    if (lowerInput === 'matrix') {
      setLines(prev => [...prev,
        { type: 'output', content: 'Wake up, Neo...' },
        { type: 'output', content: '' },
        { type: 'output', content: 'The Matrix has you...' },
        { type: 'output', content: '' },
        { type: 'output', content: 'Follow the white rabbit. 🐰' },
        { type: 'output', content: '' },
        { type: 'output', content: 'Knock, knock.' },
        { type: 'system', content: '' },
      ]);
      // Add matrix rain effect briefly
      document.body.style.filter = 'hue-rotate(90deg)';
      setTimeout(() => {
        document.body.style.filter = '';
      }, 3000);
      return;
    }

    if (lowerInput === 'coffee' || lowerInput === 'brew coffee') {
      setLines(prev => [...prev,
        { type: 'output', content: '☕ Brewing coffee...' },
        { type: 'output', content: '' },
        { type: 'output', content: '   ( (  ' },
        { type: 'output', content: '    ) )' },
        { type: 'output', content: '  ........' },
        { type: 'output', content: '  |      |]' },
        { type: 'output', content: '  \\      /' },
        { type: 'output', content: '   `----\'' },
        { type: 'output', content: '' },
        { type: 'output', content: 'Coffee ready! Productivity +100% ☕' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    if (lowerInput === 'exit' || lowerInput === 'quit') {
      setLines(prev => [...prev,
        { type: 'output', content: 'Logout? In this economy?' },
        { type: 'output', content: '' },
        { type: 'output', content: 'Just kidding, you can\'t escape.' },
        { type: 'output', content: 'This terminal is your home now. 🏠' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    // Check if user has questions remaining
    if (questionsRemaining <= 0) {
      setLines(prev => [...prev,
        { type: 'error', content: 'Error: You have used all your AI questions.' },
        { type: 'output', content: 'Refresh the page or come back later to ask more.' },
        { type: 'system', content: '' },
      ]);
      return;
    }

    // AI Query
    setIsProcessing(true);
    setLines(prev => [...prev, { type: 'system', content: 'Processing...' }]);

    try {
      const context = [
        'You are an AI assistant embedded in Luka Dadiani\'s portfolio website.',
        'Luka is a Product Manager and Senior Designer based in London with 9+ years experience.',
        'He has worked at xTrade (Howden Group), Hyperion X, Interoute, Easynet, and co-founded PawPost.',
        'His skills include product management, UX design, design systems, and agile delivery.',
        'Keep responses concise and terminal-friendly (no markdown, short lines).',
      ];

      const response = await generateChatResponse(context, userInput);

      // Remove the "Processing..." line and add response
      setLines(prev => {
        const newLines = prev.slice(0, -1); // Remove processing line
        const responseLines = response.split('\n').map(line => ({
          type: 'output' as const,
          content: line
        }));
        return [...newLines, ...responseLines, { type: 'system', content: '' }];
      });

      // Decrement questions
      setQuestionsRemaining(prev => prev - 1);

      // Add remaining questions notice
      const remaining = questionsRemaining - 1;
      if (remaining > 0) {
        setLines(prev => [...prev,
          { type: 'system', content: `[${remaining} question${remaining !== 1 ? 's' : ''} remaining]` },
          { type: 'system', content: '' },
        ]);
      } else {
        setLines(prev => [...prev,
          { type: 'error', content: '[No questions remaining]' },
          { type: 'system', content: '' },
        ]);
      }
    } catch (error) {
      setLines(prev => {
        const newLines = prev.slice(0, -1);
        return [...newLines,
          { type: 'error', content: 'Error: Failed to get AI response.' },
          { type: 'system', content: '' },
        ];
      });
    }

    setIsProcessing(false);
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input':
        return 'text-green-400';
      case 'output':
        return 'text-zinc-300';
      case 'system':
        return 'text-zinc-500';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-zinc-300';
    }
  };

  return (
    <div
      className="h-full bg-[#1e1e1e] font-mono text-sm flex flex-col cursor-text"
      onClick={handleContainerClick}
    >
      {/* Terminal Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {lines.map((line, i) => (
          <div key={i} className={`${getLineColor(line.type)} whitespace-pre-wrap break-words`}>
            {line.content || '\u00A0'}
          </div>
        ))}

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-zinc-100 outline-none caret-green-400"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {isProcessing && (
            <span className="text-zinc-500 animate-pulse">▊</span>
          )}
        </form>
      </div>
    </div>
  );
};
