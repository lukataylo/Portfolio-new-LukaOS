import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Monitor,
  Palette,
  Bell,
  Keyboard,
  Mouse,
  Info,
  ChevronLeft,
  Check
} from 'lucide-react';

interface SystemPreferencesProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
}

type PreferenceSection = 'main' | 'appearance' | 'sound' | 'notifications' | 'shortcuts' | 'about';

export const SystemPreferences: React.FC<SystemPreferencesProps> = ({
  theme,
  onThemeChange,
  soundEnabled,
  onSoundChange
}) => {
  const [activeSection, setActiveSection] = useState<PreferenceSection>('main');
  const [reduceMotion, setReduceMotion] = useState(false);

  const renderMainMenu = () => (
    <div className="grid grid-cols-3 gap-4 p-6">
      {[
        { id: 'appearance', icon: Palette, label: 'Appearance', color: 'bg-purple-500' },
        { id: 'sound', icon: Volume2, label: 'Sound', color: 'bg-pink-500' },
        { id: 'notifications', icon: Bell, label: 'Notifications', color: 'bg-red-500' },
        { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts', color: 'bg-blue-500' },
        { id: 'about', icon: Info, label: 'About', color: 'bg-zinc-500' },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id as PreferenceSection)}
          className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
            <item.icon size={28} className="text-white" />
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
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
            }`}
          >
            <div className="w-full aspect-video bg-white border border-zinc-200 rounded-lg mb-3 flex items-center justify-center">
              <Sun size={24} className="text-yellow-500" />
            </div>
            <div className="flex items-center justify-center gap-2">
              {theme === 'light' && <Check size={14} className="text-blue-500" />}
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Light</span>
            </div>
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
            }`}
          >
            <div className="w-full aspect-video bg-zinc-900 border border-zinc-700 rounded-lg mb-3 flex items-center justify-center">
              <Moon size={24} className="text-blue-400" />
            </div>
            <div className="flex items-center justify-center gap-2">
              {theme === 'dark' && <Check size={14} className="text-blue-500" />}
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Dark</span>
            </div>
          </button>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-black dark:text-white">Reduce Motion</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Minimize animations throughout the system</p>
          </div>
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`w-12 h-7 rounded-full transition-colors ${
              reduceMotion ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              reduceMotion ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
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
        <button
          onClick={() => onSoundChange(!soundEnabled)}
          className={`w-12 h-7 rounded-full transition-colors ${
            soundEnabled ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            soundEnabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <h4 className="text-sm font-medium text-black dark:text-white mb-4">Sound Effects Preview</h4>
        <div className="space-y-2">
          {['Pop', 'Close', 'Minimize', 'Notification'].map(sound => (
            <button
              key={sound}
              className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{sound}</span>
              <span className="text-xs text-blue-500">Play</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-black dark:text-white">Show Notifications</h4>
          <p className="text-xs text-zinc-500">Display system notifications</p>
        </div>
        <button className="w-12 h-7 rounded-full bg-blue-500 transition-colors">
          <div className="w-5 h-5 bg-white rounded-full shadow-md translate-x-6" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-black dark:text-white">Sound Alerts</h4>
          <p className="text-xs text-zinc-500">Play sound when notification appears</p>
        </div>
        <button
          className={`w-12 h-7 rounded-full transition-colors ${
            soundEnabled ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            soundEnabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );

  const renderShortcuts = () => (
    <div className="p-6 space-y-4">
      <h3 className="text-sm font-medium text-black dark:text-white mb-4">Keyboard Shortcuts</h3>
      {[
        { keys: '⌘ + Space', action: 'Open Spotlight Search' },
        { keys: '⌘ + Tab', action: 'Switch between windows' },
        { keys: '⌘ + W', action: 'Close active window' },
        { keys: '⌘ + M', action: 'Minimize active window' },
        { keys: '⌘ + Q', action: 'Quit application (nice try!)' },
        { keys: 'Escape', action: 'Close modal/overlay' },
        { keys: '↑↑↓↓←→←→BA', action: 'Activate Konami Code' },
      ].map(shortcut => (
        <div
          key={shortcut.keys}
          className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
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
      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        <div className="w-8 h-8 bg-white rounded-full" />
      </div>
      <h2 className="text-xl font-bold text-black dark:text-white">LukaOS</h2>
      <p className="text-sm text-zinc-500 mt-1">Version 1.0.0</p>

      <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-left">
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
          className="text-xs text-blue-500 hover:underline"
        >
          GitHub
        </a>
        <a
          href="https://x.com/lukadadiani"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          Twitter
        </a>
        <a
          href="https://linkedin.com/in/luka-dadiani-3293a915"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
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
      case 'notifications': return 'Notifications';
      case 'shortcuts': return 'Keyboard Shortcuts';
      case 'about': return 'About This Mac';
      default: return 'System Preferences';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#1c1c1e]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        {activeSection !== 'main' && (
          <button
            onClick={() => setActiveSection('main')}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
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
        {activeSection === 'notifications' && renderNotifications()}
        {activeSection === 'shortcuts' && renderShortcuts()}
        {activeSection === 'about' && renderAbout()}
      </div>
    </div>
  );
};
