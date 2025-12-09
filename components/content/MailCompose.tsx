import React, { useState, useRef } from 'react';
import {
  Send,
  Paperclip,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  ChevronDown,
  X,
  Check
} from 'lucide-react';

interface MailComposeProps {
  recipientEmail: string;
  recipientName: string;
}

export const MailCompose: React.FC<MailComposeProps> = ({
  recipientEmail,
  recipientName
}) => {
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleSend = async () => {
    if (!fromEmail.trim() || !subject.trim() || !contentRef.current?.innerHTML.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSending(true);

    // Create mailto link with content
    const body = contentRef.current?.innerText || '';
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${fromEmail}\n\n${body}`)}`;

    // Open mail client
    window.location.href = mailtoUrl;

    // Show success state
    setTimeout(() => {
      setIsSending(false);
      setSendStatus('success');

      // Reset after showing success
      setTimeout(() => {
        setSendStatus('idle');
        setFromEmail('');
        setSubject('');
        if (contentRef.current) {
          contentRef.current.innerHTML = '';
        }
      }, 2000);
    }, 500);
  };

  if (sendStatus === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-[#1c1c1e] p-8">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
          <Check size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-black dark:text-white mb-2">Opening Mail Client</h2>
        <p className="text-sm text-zinc-500 text-center">
          Your default mail application should open with the message ready to send.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-1">
          {/* Formatting buttons */}
          <button
            onClick={() => handleFormat('bold')}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => handleFormat('italic')}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => handleFormat('underline')}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Underline"
          >
            <Underline size={16} />
          </button>

          <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <button
            onClick={() => handleFormat('insertUnorderedList')}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => handleFormat('insertOrderedList')}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>

          <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

          <button
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) handleFormat('createLink', url);
            }}
            className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Insert Link"
          >
            <Link size={16} />
          </button>

          {/* Disabled attachment button */}
          <button
            disabled
            className="p-2 rounded text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
            title="Attachments disabled"
          >
            <Paperclip size={16} />
          </button>
          <button
            disabled
            className="p-2 rounded text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
            title="Images disabled"
          >
            <Image size={16} />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isSending}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
        >
          {isSending ? (
            <span className="animate-pulse">Sending...</span>
          ) : (
            <>
              <Send size={14} />
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      {/* Email Fields */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        {/* To Field */}
        <div className="flex items-center px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50">
          <label className="w-16 text-sm text-zinc-400 flex-shrink-0">To:</label>
          <div className="flex-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded">
              {recipientName}
              <span className="text-blue-400 dark:text-blue-500">&lt;{recipientEmail}&gt;</span>
            </span>
          </div>
        </div>

        {/* From Field */}
        <div className="flex items-center px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50">
          <label className="w-16 text-sm text-zinc-400 flex-shrink-0">From:</label>
          <input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder:text-zinc-400 focus:outline-none ml-2"
          />
        </div>

        {/* Subject Field */}
        <div className="flex items-center px-4 py-2">
          <label className="w-16 text-sm text-zinc-400 flex-shrink-0">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject..."
            className="flex-1 bg-transparent text-sm text-black dark:text-white placeholder:text-zinc-400 focus:outline-none ml-2"
          />
        </div>
      </div>

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={contentRef}
          contentEditable
          className="min-h-full p-4 text-sm text-black dark:text-white focus:outline-none"
          style={{ lineHeight: '1.6' }}
          data-placeholder="Write your message..."
          onFocus={(e) => {
            if (e.currentTarget.innerHTML === '' || e.currentTarget.innerHTML === '<br>') {
              e.currentTarget.dataset.empty = 'true';
            }
          }}
          onInput={(e) => {
            const target = e.currentTarget;
            if (target.innerHTML === '' || target.innerHTML === '<br>') {
              target.dataset.empty = 'true';
            } else {
              delete target.dataset.empty;
            }
          }}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <p className="text-[10px] text-zinc-400 text-center">
          This will open your default email client to send the message
        </p>
      </div>

      <style>{`
        [contenteditable][data-empty="true"]:before,
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #a1a1aa;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
