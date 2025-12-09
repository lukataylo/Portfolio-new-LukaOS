/**
 * Terminal Application Component
 *
 * AI-powered terminal with command history, tab completion, and Easter eggs.
 *
 * @module components/content/TerminalApp
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateChatResponse } from '../../services/geminiService';

interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error';
  content: string;
}

// Virtual file system for navigation commands
const FILE_SYSTEM: Record<string, string[]> = {
  '~': ['about-me', 'case-studies', 'notes', 'library', 'photography', 'sitemap', '.secrets'],
  '~/about-me': ['cv.pdf', 'skills.txt', 'experience.md'],
  '~/case-studies': ['ecommerce-redesign.md', 'project-x.locked'],
  '~/notes': ['react-patterns.md', 'design-systems.md', 'product-strategy.md'],
  '~/library': ['zero-to-one.txt', 'stubborn-attachments.txt', 'boom.txt'],
  '~/photography': ['street-001.jpg', 'street-002.jpg', 'urban-decay.jpg'],
  '~/.secrets': ['coffee-addiction.log', 'vim-exit-attempts.log'],
};

// All available commands for tab completion
const COMMANDS = [
  'help', 'clear', 'whoami', 'ls', 'cd', 'pwd', 'cat', 'open', 'echo',
  'date', 'uptime', 'history', 'exit', 'quit',
  'sudo', 'coffee', 'matrix', 'neofetch',
];

export const TerminalApp: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'LukaOS Terminal v2.0.0' },
    { type: 'system', content: 'Type "help" for available commands. Tab for autocomplete.' },
    { type: 'system', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDir, setCurrentDir] = useState('~');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [questionsRemaining, setQuestionsRemaining] = useState(() => {
    const stored = localStorage.getItem('terminal-questions');
    if (stored) {
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? 2 : parsed;
    }
    return 2;
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startTime = useRef(Date.now());

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  // Save questions remaining
  useEffect(() => {
    localStorage.setItem('terminal-questions', questionsRemaining.toString());
  }, [questionsRemaining]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Tab completion
  const handleTabCompletion = useCallback(() => {
    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1].toLowerCase();

    if (parts.length === 1) {
      // Complete command
      const matches = COMMANDS.filter(cmd => cmd.startsWith(lastPart));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        setLines(prev => [
          ...prev,
          { type: 'output', content: matches.join('  ') },
        ]);
      }
    } else if (parts[0] === 'cd' || parts[0] === 'cat' || parts[0] === 'open') {
      // Complete path/file
      const files = FILE_SYSTEM[currentDir] || [];
      const matches = files.filter(f => f.startsWith(lastPart));
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        setInput(parts.join(' '));
      } else if (matches.length > 1) {
        setLines(prev => [
          ...prev,
          { type: 'output', content: matches.join('  ') },
        ]);
      }
    }
  }, [input, currentDir]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setInput('');
      setLines(prev => [...prev, { type: 'input', content: `${currentDir} $ ^C` }]);
    }
  };

  const addOutput = (content: string | string[], type: TerminalLine['type'] = 'output') => {
    const contents = Array.isArray(content) ? content : [content];
    setLines(prev => [
      ...prev,
      ...contents.map(c => ({ type, content: c })),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    setInput('');
    setHistoryIndex(-1);

    // Add to history
    setCommandHistory(prev => [...prev, userInput]);

    // Add input line
    setLines(prev => [...prev, { type: 'input', content: `${currentDir} $ ${userInput}` }]);

    const parts = userInput.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Built-in commands
    switch (cmd) {
      case 'clear':
        setLines([
          { type: 'system', content: 'LukaOS Terminal v2.0.0' },
          { type: 'system', content: '' },
        ]);
        return;

      case 'help':
        addOutput([
          'Available commands:',
          '',
          '  Navigation:',
          '    cd <dir>    - Change directory',
          '    ls          - List directory contents',
          '    pwd         - Print working directory',
          '    cat <file>  - Display file contents',
          '    open <file> - Open a file/app',
          '',
          '  System:',
          '    whoami      - About Luka',
          '    date        - Show current date/time',
          '    uptime      - System uptime',
          '    history     - Command history',
          '    clear       - Clear terminal',
          '    neofetch    - System info',
          '',
          '  Fun:',
          '    coffee      - Brew some coffee',
          '    matrix      - Enter the Matrix',
          '    sudo <cmd>  - Try it... I dare you',
          '',
          '  AI:',
          '    <question>  - Ask AI anything (2 free questions)',
          '',
        ]);
        return;

      case 'pwd':
        addOutput(currentDir);
        addOutput('');
        return;

      case 'ls':
        const lsPath = args[0] ? resolvePath(args[0]) : currentDir;
        const files = FILE_SYSTEM[lsPath];
        if (files) {
          const formatted = files.map(f => {
            if (f.startsWith('.')) return `\x1b[90m${f}\x1b[0m`; // Hidden files dimmed
            if (f.endsWith('.locked')) return `\x1b[31m${f}\x1b[0m`; // Locked files red
            if (!f.includes('.')) return `\x1b[34m${f}/\x1b[0m`; // Directories blue
            return f;
          });
          addOutput(formatted.join('  '));
        } else {
          addOutput(`ls: cannot access '${lsPath}': No such directory`, 'error');
        }
        addOutput('');
        return;

      case 'cd':
        if (!args[0] || args[0] === '~') {
          setCurrentDir('~');
        } else if (args[0] === '..') {
          if (currentDir !== '~') {
            const parts = currentDir.split('/');
            parts.pop();
            setCurrentDir(parts.join('/') || '~');
          }
        } else {
          const newPath = resolvePath(args[0]);
          if (FILE_SYSTEM[newPath]) {
            setCurrentDir(newPath);
          } else {
            addOutput(`cd: ${args[0]}: No such directory`, 'error');
          }
        }
        addOutput('');
        return;

      case 'cat':
        if (!args[0]) {
          addOutput('cat: missing operand', 'error');
        } else {
          handleCat(args[0]);
        }
        addOutput('');
        return;

      case 'open':
        if (!args[0]) {
          addOutput('open: missing file operand', 'error');
        } else {
          addOutput(`Opening ${args[0]}...`);
          addOutput('(Hint: Double-click desktop icons to open files)');
        }
        addOutput('');
        return;

      case 'echo':
        addOutput(args.join(' '));
        addOutput('');
        return;

      case 'whoami':
        addOutput([
          'Luka Dadiani',
          'Product Manager & Senior Designer',
          'London, United Kingdom',
          '',
          '9+ years building user-centred digital products',
          'across insurance, telecoms, and e-commerce.',
          '',
        ]);
        return;

      case 'date':
        addOutput(new Date().toString());
        addOutput('');
        return;

      case 'uptime':
        const uptimeMs = Date.now() - startTime.current;
        const uptimeSec = Math.floor(uptimeMs / 1000);
        const uptimeMin = Math.floor(uptimeSec / 60);
        const uptimeHr = Math.floor(uptimeMin / 60);
        addOutput(`up ${uptimeHr}h ${uptimeMin % 60}m ${uptimeSec % 60}s`);
        addOutput('');
        return;

      case 'history':
        commandHistory.forEach((cmd, i) => {
          addOutput(`  ${i + 1}  ${cmd}`);
        });
        addOutput('');
        return;

      case 'neofetch':
        addOutput([
          '',
          '        .---.        luka@lukaos',
          '       /     \\       -----------',
          '       \\.@-@./       OS: LukaOS v2.0.0',
          '       /`\\_/`\\       Host: Portfolio',
          '      //  _  \\\\      Kernel: React 19',
          '     | \\     )|_     Uptime: ' + formatUptime(),
          '    /`\\_`>  <_/ \\    Shell: TerminalApp',
          '    \\__/\'---\'\\__/    Resolution: ' + window.innerWidth + 'x' + window.innerHeight,
          '                     Theme: ' + (document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'),
          '                     Icons: Lucide React',
          '                     CPU: Your Browser',
          '                     Memory: Enough',
          '',
        ]);
        return;

      case 'coffee':
      case 'brew':
        addOutput([
          '☕ Brewing coffee...',
          '',
          '   ( (  ',
          '    ) )',
          '  ........',
          '  |      |]',
          '  \\      /',
          '   `----\'',
          '',
          'Coffee ready! Productivity +100% ☕',
          '',
        ]);
        return;

      case 'matrix':
        addOutput([
          'Wake up, Neo...',
          '',
          'The Matrix has you...',
          '',
          'Follow the white rabbit. 🐰',
          '',
          'Knock, knock.',
          '',
        ]);
        document.body.style.filter = 'hue-rotate(90deg)';
        setTimeout(() => { document.body.style.filter = ''; }, 3000);
        return;

      case 'sudo':
        if (args.join(' ').toLowerCase().includes('hire')) {
          addOutput([
            '[sudo] password for visitor: ********',
            '',
            '✨ HIRING SEQUENCE INITIATED ✨',
            '',
            'Contacting: luka.taylor@gmail.com',
            'Skills verified: ✓ Product Management',
            '                ✓ UX Design',
            '                ✓ Frontend Development',
            '                ✓ Being Awesome',
            '',
            'Recommendation: HIRE IMMEDIATELY 🚀',
            '',
          ]);
        } else {
          addOutput('Permission denied: Nice try though! 😎', 'error');
          addOutput('');
        }
        return;

      case 'rm':
        if (args.join(' ').includes('-rf')) {
          addOutput([
            'Permission denied: Nice try! 😈',
            '',
            'This portfolio is protected by:',
            '  • Good vibes only™',
            '  • React\'s reconciliation algorithm',
            '  • The power of friendship',
            '',
          ], 'error');
        } else {
          addOutput('rm: operation not permitted', 'error');
          addOutput('');
        }
        return;

      case 'exit':
      case 'quit':
        addOutput([
          'Logout? In this economy?',
          '',
          'Just kidding, you can\'t escape.',
          'This terminal is your home now. 🏠',
          '',
        ]);
        return;

      default:
        // Try AI query
        await handleAIQuery(userInput);
        return;
    }
  };

  const resolvePath = (path: string): string => {
    if (path.startsWith('~/')) return path;
    if (path.startsWith('/')) return '~' + path;
    if (path === '~') return '~';
    return currentDir === '~' ? `~/${path}` : `${currentDir}/${path}`;
  };

  const formatUptime = (): string => {
    const uptimeMs = Date.now() - startTime.current;
    const uptimeSec = Math.floor(uptimeMs / 1000);
    const uptimeMin = Math.floor(uptimeSec / 60);
    return `${uptimeMin}m ${uptimeSec % 60}s`;
  };

  const handleCat = (filename: string) => {
    const fileContents: Record<string, string[]> = {
      'skills.txt': [
        '# Skills',
        '',
        '• Product Management & Strategy',
        '• UX/UI Design (Figma, Sketch)',
        '• Frontend Development (React, TypeScript)',
        '• Design Systems & Component Libraries',
        '• User Research & Testing',
        '• Agile/Scrum Methodology',
      ],
      'cv.pdf': [
        '[Binary file - use "open cv.pdf" to view]',
      ],
      'coffee-addiction.log': [
        '2024-01-01 08:00 - Coffee consumed',
        '2024-01-01 10:30 - Coffee consumed',
        '2024-01-01 14:00 - Coffee consumed',
        '2024-01-01 16:30 - Coffee consumed',
        '... (10,847 more entries)',
      ],
      'vim-exit-attempts.log': [
        ':q - failed',
        ':q! - failed',
        ':wq - failed',
        'Ctrl+C - failed',
        'Ctrl+Z - failed',
        'Power button - success',
      ],
    };

    const content = fileContents[filename];
    if (content) {
      addOutput(content);
    } else if (filename.endsWith('.locked')) {
      addOutput('cat: Permission denied (file is password protected)', 'error');
    } else {
      addOutput(`cat: ${filename}: No such file`, 'error');
    }
  };

  const handleAIQuery = async (query: string) => {
    if (questionsRemaining <= 0) {
      addOutput('Error: You have used all your AI questions.', 'error');
      addOutput('Refresh the page or come back later to ask more.');
      addOutput('');
      return;
    }

    setIsProcessing(true);
    setLines(prev => [...prev, { type: 'system', content: 'Processing...' }]);

    try {
      const context = [
        'You are an AI assistant embedded in Luka Dadiani\'s portfolio website terminal.',
        'Luka is a Product Manager and Senior Designer based in London with 9+ years experience.',
        'Keep responses concise and terminal-friendly (no markdown, short lines).',
      ];

      const response = await generateChatResponse(context, query);

      // Remove processing line and add response
      setLines(prev => {
        const newLines = prev.slice(0, -1);
        const responseLines = response.split('\n').map(line => ({
          type: 'output' as const,
          content: line
        }));
        return [...newLines, ...responseLines, { type: 'system', content: '' }];
      });

      setQuestionsRemaining(prev => prev - 1);
      const remaining = questionsRemaining - 1;
      addOutput(
        remaining > 0
          ? `[${remaining} question${remaining !== 1 ? 's' : ''} remaining]`
          : '[No questions remaining]',
        'system'
      );
      addOutput('');
    } catch {
      setLines(prev => {
        const newLines = prev.slice(0, -1);
        return [...newLines, { type: 'error', content: 'Error: Failed to get AI response.' }];
      });
      addOutput('');
    }

    setIsProcessing(false);
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-green-400';
      case 'output': return 'text-zinc-300';
      case 'system': return 'text-zinc-500';
      case 'error': return 'text-red-400';
      default: return 'text-zinc-300';
    }
  };

  return (
    <div
      className="h-full bg-[#1e1e1e] font-mono text-sm flex flex-col cursor-text"
      onClick={handleContainerClick}
      role="application"
      aria-label="Terminal"
    >
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${getLineColor(line.type)} whitespace-pre-wrap break-words`}
            role={line.type === 'error' ? 'alert' : undefined}
          >
            {line.content || '\u00A0'}
          </div>
        ))}

        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-blue-400 mr-1">{currentDir}</span>
          <span className="text-green-400 mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-zinc-100 outline-none caret-green-400"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
          {isProcessing && (
            <span className="text-zinc-500 animate-pulse">▊</span>
          )}
        </form>
      </div>
    </div>
  );
};
