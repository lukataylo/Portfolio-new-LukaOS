# LukaOS Portfolio

[![Live Demo](https://img.shields.io/badge/demo-meetluka.com-red?style=flat-square)](https://meetluka.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

A sophisticated React-based portfolio website that simulates a desktop operating system environment. It combines the functional metaphors of macOS with a minimalist, brutalist aesthetic inspired by Nothing Phone and PostHog.

**Live Site:** [meetluka.com](https://meetluka.com)

## Features

### Desktop Environment
- **Window System**: Fully functional windows with dragging, resizing (8-direction), minimizing, and maximizing
- **Window Tiling**: Snap windows to screen edges with visual preview indicator (left half, right half, fullscreen)
- **Z-Index Stacking**: Smart window management ensures active windows cascade to the front
- **Context Menu**: Right-click (desktop) or long-press (mobile) to access system tools
- **Responsive Design**: Automatically adapts between Desktop and Mobile layouts
- **Whimsical Menus**: File, Edit, and View menus with fun interactions

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+Space` | Open Spotlight search |
| `Cmd+Tab` | App Switcher |
| `Cmd+W` | Close active window |
| `Cmd+M` | Minimize active window |
| `Cmd+Q` | Quit (fun message) |
| `Escape` | Close overlays |
| `↑↑↓↓←→←→BA` | Konami code Easter egg |

### Applications

| App | Description |
|-----|-------------|
| **Finder** | macOS-style file browser with icons, list, and gallery views |
| **Notes** | iOS-style notes app with sidebar navigation and inline editing |
| **Library** | Book reviews with ratings, categories, and Amazon links |
| **Terminal** | AI-powered terminal with command history, tab completion, and virtual file system |
| **Mail** | macOS Mail-style email composition |
| **System Preferences** | Theme, sound, and system settings |

### Desktop Widgets
- **Clock Widget**: Real-time clock with date display
- **Weather Widget**: Current weather for London (simulated)
- **GitHub Widget**: GitHub contribution graph with activity visualization

### Additional Features
- **Spotlight Search** (`Cmd+Space`): Search all files by title, description, and type
- **Notification Center**: System notifications with timestamps
- **Sound Effects**: UI sounds via Web Audio API (toggleable)
- **App Switcher**: `Cmd+Tab` to switch between windows
- **Mobile App Drawer**: Swipe-up drawer on mobile devices
- **Dynamic Dock**: Shows pinned apps + currently open windows
- **Live Dock Previews**: Hover over dock items for window previews
- **Drag & Drop Icons**: Rearrange desktop icons with grid snapping (100px grid)
- **Persistent State**: Theme, sound, reduce motion, and icon positions saved to localStorage
- **URL Deep Linking**: Hash-based routing for direct access to windows (e.g., `#/about-me`)
- **PWA Support**: Installable as a Progressive Web App with offline caching
- **Accessibility**: Screen reader support, keyboard navigation, skip links, ARIA labels, reduce motion support

---

## Project Structure

```
Portfolio-new/
├── App.tsx                 # Main application component (OS Kernel)
├── types.ts                # TypeScript type definitions
├── constants.tsx           # Desktop items, dock items, content data
├── index.tsx               # Application entry point
├── index.html              # HTML template with PWA meta tags
│
├── public/
│   ├── manifest.json             # PWA manifest with app metadata
│   ├── sw.js                     # Service worker for offline caching
│   └── icons/                    # App icons for PWA (various sizes)
│
├── components/
│   ├── layout/             # Layout components
│   │   ├── AppSwitcher.tsx       # Cmd+Tab overlay
│   │   └── NotificationCenter.tsx # Notification panel
│   │
│   ├── content/            # Application content renderers
│   │   ├── BlogApp.tsx           # Notes app (iOS-style)
│   │   ├── BooksApp.tsx          # Library with book reviews
│   │   ├── BrowserApp.tsx        # Internal browser window
│   │   ├── ChatApp.tsx           # AI chat interface
│   │   ├── FinderApp.tsx         # File browser
│   │   ├── MailCompose.tsx       # Email composition
│   │   ├── PasswordLock.tsx      # Password protection screen
│   │   ├── PresentationViewer.tsx # Slide deck viewer
│   │   ├── SitemapViewer.tsx     # Site navigation
│   │   ├── SkeletonLoader.tsx    # Loading placeholder
│   │   ├── SystemPreferences.tsx # Settings panel
│   │   └── TerminalApp.tsx       # AI terminal with history & tab completion
│   │
│   ├── window/             # Window management
│   │   └── WindowFrame.tsx       # Window chrome with snap preview
│   │
│   ├── widgets/            # Desktop widgets
│   │   ├── index.ts              # Widget exports
│   │   ├── ClockWidget.tsx       # Real-time clock display
│   │   ├── WeatherWidget.tsx     # Weather information
│   │   └── GitHubWidget.tsx      # GitHub activity graph
│   │
│   ├── ContextMenu.tsx     # Right-click menu
│   ├── CookieNotice.tsx    # GDPR cookie banner
│   ├── DesktopIcon.tsx     # Draggable desktop file icons
│   ├── Dock.tsx            # Application dock with previews
│   ├── MobileAppDrawer.tsx # Mobile swipe-up drawer
│   └── Spotlight.tsx       # Search overlay
│
├── hooks/                  # Custom React hooks
│   ├── index.ts                  # Hook exports
│   ├── useWindowManager.ts       # Window state management
│   └── useKeyboardShortcuts.ts   # Keyboard shortcut handling
│
├── utils/                  # Utility functions
│   ├── sound.ts                  # Web Audio API sound effects
│   └── storage.ts                # LocalStorage persistence utilities
│
└── services/               # External services
    └── geminiService.ts          # Google Gemini AI integration
```

---

## Architecture

### State Management

The application uses React's built-in state management with custom hooks for organization:

```tsx
// Window management via custom hook
const {
  windows,
  activeWindowId,
  openWindow,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  bringToFront,
} = useWindowManager();
```

### File Types

Content types determine how items are rendered:

```typescript
enum FileType {
  PRESENTATION,  // Slide-based content viewer
  PROTECTED,     // Password-locked content
  LINK,          // Internal browser window
  EXTERNAL_LINK, // Opens in new tab
  APP,           // Internal applications
  BLOG,          // Notes app
  SITEMAP,       // Site navigation
  BOOKS,         // Library/book reviews
  TERMINAL,      // AI-powered terminal
  MAIL,          // Email compose
  FINDER,        // File browser
  PREFERENCES,   // System settings
}
```

### Window Lifecycle

1. **Opening**: Captures origin DOMRect from clicked icon
2. **Animation**: CSS transitions morph from origin to target position
3. **Interaction**: Drag via mousemove/touchmove, resize via edge handles
4. **Closing**: Reverse animation back to origin

### Sound System

UI sounds use Web Audio API for zero-latency playback:

```typescript
import { playSound } from './utils/sound';

// Play sound effect
playSound('pop');      // Window open
playSound('close');    // Window close
playSound('minimize'); // Minimize
playSound('notification'); // Alerts
playSound('click');    // Button press
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Environment Variables
For AI features, configure Google GenAI API key in `services/geminiService.ts`.

---

## Deployment

Configured for GitHub Pages:

1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Custom domain via `public/CNAME`

---

## Design Philosophy

> "Every portfolio looks the same. But doing something different often means worse UX. Good UX is immediately recognisable. This site uses a familiar metaphor — the desktop OS — to stand out while remaining intuitive."

### Inspired By
- **macOS**: Window management, Spotlight, Mail
- **Nothing Phone**: Brutalist, dot-matrix aesthetic
- **PostHog**: Bold, technical design language

---

## Easter Eggs

- **Konami Code** (`↑↑↓↓←→←→BA`): Activates retro CRT mode
- **Clock Click**: Cycles through Normal → Binary → Hex → Coffee time
- **Window Shake**: Rapidly drag a window side-to-side to close it
- **Terminal Commands**: Try `help`, `clear`, `whoami`, `ls`, or hidden commands
- **Dock Wobble**: Long-press dock icons for iOS-style wobble mode

---

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **Google Gemini** - AI integration

---

## Author

**Luka Dadiani**
Product Manager & Senior Designer
London, United Kingdom

- [GitHub](https://github.com/lukataylo)
- [Twitter/X](https://x.com/lukadadiani)
- [LinkedIn](https://www.linkedin.com/in/luka-dadiani-3293a915)
- Email: luka.taylor@gmail.com

---

Built with React + TypeScript + Tailwind CSS + Vite
