import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Palette,
  Keyboard,
  Info,
  ChevronLeft,
  Check
} from 'lucide-react';
import type { SoundType } from '../../utils/sound';

interface SystemPreferencesProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
  reduceMotion: boolean;
  onReduceMotionChange: (enabled: boolean) => void;
  onPlaySound?: (type: SoundType) => void;
}

type PreferenceSection = 'main' | 'appearance' | 'sound' | 'shortcuts' | 'about';

const Toggle: React.FC<{ on: boolean; onClick: () => void; label: string }> = ({ on, onClick, label }) => (
  <button
    onClick={onClick}
    role="switch"
    aria-checked={on}
    aria-label={label}
    className={`w-12 h-7 rounded-full transition-colors ${
      on ? 'bg-red-600' : 'bg-zinc-300 dark:bg-zinc-600'
    }`}
  >
    <div className={`w-5 h-5 bg-white rounded-full shadow-soft transition-transform ${
      on ? 'translate-x-6' : 'translate-x-1'
    }`} />
  </button>
);

export const SystemPreferences: React.FC<SystemPreferencesProps> = ({
  theme,
  onThemeChange,
  soundEnabled,
  onSoundChange,
  reduceMotion,
  onReduceMotionChange,
  onPlaySound
}) => {
  const [activeSection, setActiveSection] = useState<PreferenceSection>('main');

  const renderMainMenu = () => (
    <div className="grid grid-cols-3 gap-4 p-6">
      {[
        { id: 'appearance', icon: Palette, label: 'Appearance' },
        { id: 'sound', icon: Volume2, label: 'Sound' },
        { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts' },
        { id: 'about', icon: Info, label: 'About' },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id as PreferenceSection)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-soft">
            <item.icon size={26} className="text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <span className="text-xs text-zinc-700 dark:text-zinc-300">{item.label}</span>
        </button>
      ))}
    </div>
  );

  const renderAppearance = () => (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-black dark:text-white mb-4">Theme</h3>
        <div className="flex gap-4">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex-1 p-4 rounded-2xl border transition-all ${
              theme === 'light'
                ? 'border-red-600 bg-red-50 dark:bg-red-900/10'
                : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
            }`}
          >
            <div className="w-full aspect-video bg-white border border-black/5 rounded-xl mb-3 flex items-center justify-center">
              <Sun size={24} className="text-zinc-500" />
            </div>
            <div className="flex items-center justify-center gap-2">
              {theme === 'light' && <Check size={14} className="text-red-600" />}
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Light</span>
            </div>
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`flex-1 p-4 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'border-red-600 bg-red-50 dark:bg-red-900/10'
                : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
            }`}
          >
            <div className="w-full aspect-video bg-zinc-900 border border-white/10 rounded-xl mb-3 flex items-center justify-center">
              <Moon size={24} className="text-zinc-400" />
            </div>
            <div className="flex items-center justify-center gap-2">
              {theme === 'dark' && <Check size={14} className="text-red-600" />}
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Dark</span>
            </div>
          </button>
        </div>
      </div>

      <div className="border-t border-black/5 dark:border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-black dark:text-white">Reduce Motion</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Minimise animations across the system</p>
          </div>
          <Toggle
            on={reduceMotion}
            onClick={() => onReduceMotionChange(!reduceMotion)}
            label="Reduce motion"
          />
        </div>
      </div>
    </div>
  );

  const renderSound = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {soundEnabled ? (
            <Volume2 size={24} className="text-zinc-500" />
          ) : (
            <VolumeX size={24} className="text-zinc-400" />
          )}
          <div>
            <h4 className="text-sm font-medium text-black dark:text-white">Sound Effects</h4>
            <p className="text-xs text-zinc-500">Play sounds for UI interactions</p>
          </div>
        </div>
        <Toggle
          on={soundEnabled}
          onClick={() => onSoundChange(!soundEnabled)}
          label="Sound effects"
        />
      </div>

      <div className="border-t border-black/5 dark:border-white/10 pt-6">
        <h4 className="text-sm font-medium text-black dark:text-white mb-4">Sound Effects Preview</h4>
        <div className="space-y-2">
          {([
            ['Pop', 'pop'],
            ['Close', 'close'],
            ['Minimize', 'minimize'],
            ['Notification', 'notification'],
          ] as Array<[string, SoundType]>).map(([label, type]) => (
            <button
              key={label}
              onClick={() => onPlaySound?.(type)}
              disabled={!soundEnabled}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
              <span className="text-xs text-red-600">Play</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShortcuts = () => (
    <div className="p-6 space-y-4">
      <h3 className="text-sm font-medium text-black dark:text-white mb-4">Keyboard Shortcuts</h3>
      {[
        { keys: '⌘ + Space', action: 'Open Spotlight Search' },
        { keys: '⌘ + W', action: 'Close active window' },
        { keys: '⌘ + M', action: 'Minimize active window' },
        { keys: '⌘ + Q', action: 'Quit application (nice try!)' },
        { keys: 'Escape', action: 'Close modal/overlay' },
        { keys: '↑↑↓↓←→←→BA', action: 'Activate Konami Code' },
      ].map(shortcut => (
        <div
          key={shortcut.keys}
          className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0"
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{shortcut.action}</span>
          <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono text-zinc-600 dark:text-zinc-400">
            {shortcut.keys}
          </kbd>
        </div>
      ))}
    </div>
  );

  const renderAbout = () => (
    <div className="p-6 text-center">
      <div className="w-20 h-20 mx-auto bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-soft">
        <div className="w-8 h-8 bg-white rounded-full" />
      </div>
      <h2 className="text-xl font-bold text-black dark:text-white">LukaOS</h2>
      <p className="text-sm text-zinc-500 mt-1">Version 1.0.0</p>

      <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-left">
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          A portfolio disguised as an operating system. Built with React, TypeScript, and Tailwind CSS.
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
          Created by <span className="font-medium text-black dark:text-white">Luka Dadiani</span>
          <br />
          Product Manager & Senior Designer
          <br />
          London, United Kingdom
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <a
          href="https://github.com/lukataylo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-red-600 hover:underline"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/luka-dadiani-3293a915"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-red-600 hover:underline"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'appearance': return 'Appearance';
      case 'sound': return 'Sound';
      case 'shortcuts': return 'Keyboard Shortcuts';
      case 'about': return 'About LukaOS';
      default: return 'System Preferences';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900">
        {activeSection !== 'main' && (
          <button
            onClick={() => setActiveSection('main')}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            aria-label="Back to all preferences"
          >
            <ChevronLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        )}
        <h2 className="font-medium text-sm text-black dark:text-white">{getSectionTitle()}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'main' && renderMainMenu()}
        {activeSection === 'appearance' && renderAppearance()}
        {activeSection === 'sound' && renderSound()}
        {activeSection === 'shortcuts' && renderShortcuts()}
        {activeSection === 'about' && renderAbout()}
      </div>
    </div>
  );
};
