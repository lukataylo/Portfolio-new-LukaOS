# LukaOS Portfolio

A sophisticated React-based portfolio website that simulates a desktop operating system environment. It combines the functional metaphors of macOS with a minimalist, brutalist aesthetic inspired by Nothing Phone and PostHog.

**Live Site:** [meetluka.com](https://meetluka.com)

## Key Features

### Desktop Environment
- **Window System**: Fully functional windows with dragging, resizing (8-direction), minimizing, and maximizing capabilities.
- **Z-Index Stacking**: Smart window management ensures active windows always cascade to the front.
- **Context Menu**: Right-click (desktop) or long-press (mobile) to access system tools like Sorting and Refresh.
- **Responsive Design**: Automatically switches layout modes between Desktop (RTL icon flow) and Mobile (horizontal grid, auto-sizing windows).
- **Whimsical Menus**: File, Edit, and View menus with fun interactions like "Do a Barrel Roll" that actually spins the page.

### Spotlight Search (Cmd+Space)
- **macOS-style Spotlight**: Press `Cmd+Space` (or `Ctrl+Space`) or click the search icon to open.
- **Instant Search**: Searches all files by title, description, and type.
- **Keyboard Navigation**: Arrow keys to navigate, Enter to open, Escape to close.
- **Visual Feedback**: Blue highlight on selected result, file type icons.

### Notes App (iOS-style)
- **Apple Notes Aesthetic**: Left sidebar for navigation, main area for content.
- **Search Functionality**: Filter notes by title, excerpt, or tags.
- **Inline Editing**: Content is editable by default (session-only, not persisted).
- **Yellow Selection**: Active note highlighted like Apple Notes.

### Library (Books App)
- **Book Reviews**: Personal book reviews with ratings out of 10.
- **Category Organization**: Books grouped by category (Business, History, Economics, etc.).
- **Clean Grid Layout**: Minimal design with cover images and ratings.
- **Detail View**: Full review, author info, and Amazon link for each book.
- **9 Books Included**: Zero to One, How Big Things Get Done, Boom, Stubborn Attachments, Vietnam: An Epic Tragedy, The Price of Time, Meet Me by the Fountain, Bandit Capitalism, About Face.

### AI Terminal (Gemini Integration)
- **Authentic Terminal Look**: Dark theme with green text, macOS traffic light buttons.
- **Built-in Commands**: `help`, `clear`, `whoami`, `ls`.
- **AI-Powered Responses**: Any other input queries Gemini AI.
- **Rate Limited**: 2 AI questions per user (stored in localStorage).
- **Context-Aware**: AI knows about Luka's background and portfolio.

### Mail Compose (macOS Mail-style)
- **New Email Window**: Looks like macOS Mail's compose view.
- **Rich Text Editing**: Bold, italic, underline, lists, links.
- **Pre-filled Recipient**: Luka's email already in the To field.
- **Disabled Attachments**: Attachment and image buttons visible but disabled.
- **Opens Mail Client**: Sends via user's default email application.

### Animations & Interactions
- **Origin-Based Scaling**: Windows animate smoothly from their source icon's screen coordinates when opening and closing.
- **Overshoot Physics**: Custom cubic-bezier curves provide a tactile "pop" and bounce effect.
- **Live Dock Previews**: Hovering over dock items reveals a real-time, scaled-down thumbnail of the window content.

### Browser Simulation
- **Virtual Browser**: External links open in internal windows to maintain immersion.
- **Smart Mocking**: Detects security headers (X-Frame-Options) from sites like GitHub, LinkedIn, and Twitter/X. Renders high-fidelity mock profiles instead of broken iframes.

### Social Links
- **External Links**: GitHub, Twitter/X, and LinkedIn open directly in new tabs.
- **Real Profiles**: Links to actual social media profiles.

### Security & Content
- **File System**: Supports different file types: Presentations, Links, Apps, Protected Files, Blog, Books, Terminal, Mail, Sitemap.
- **Password Protection**: Case studies can be locked behind a functional decryption screen. (Test with "Project X", Password: `123`)

---

## Technical Architecture

### State Management (`App.tsx`)
The `App` component acts as the OS Kernel. It holds the "Global State":
- `windows`: Array of active window objects containing size, position, z-index, and state flags (minimized/maximized).
- `desktopItems`: The file system state (allows for sorting).
- `theme`: Global light/dark mode context.
- `isSpotlightOpen`: Controls Spotlight search visibility.

### File Types
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
  MAIL           // Email compose window
}
```

### Window Logic
Windows are complex interactive objects managed by `WindowFrame.tsx`:
1. **Mounting**: Captures the `originRect` (DOMRect) of the icon that was clicked.
2. **Animation**: Uses CSS transitions to morph `originRect` -> `targetRect`.
3. **Interaction**: Drag calculates deltas on `mousemove`/`touchmove`. Resize detects edge interactions.

### The Dock (`Dock.tsx`)
The dock is "smart":
- **Dynamic Items**: Shows pinned apps AND currently open windows.
- **Render Props**: Uses a `renderPreview` callback to generate React component thumbnails scaled via CSS `transform: scale()`.

### Styling
- **Tailwind CSS**: Utility-first styling engine.
- **Custom Aesthetics**: Heavy use of `border-zinc-xxx`, `font-mono`, and custom grid patterns.
- **Dark Mode**: Implemented via Tailwind's `dark:` modifier and root-level class toggle.

## Components Overview

| Component | Description |
|-----------|-------------|
| `WindowFrame` | The chrome wrapper for all apps. Handles title bar, controls, resize handles. |
| `BrowserApp` | Handles URL rendering with mock content for blocked iframes. |
| `BlogApp` | iOS-style Notes app with sidebar navigation and inline editing. |
| `BooksApp` | Library view with category organization and book detail pages. |
| `TerminalApp` | AI-powered terminal with Gemini integration and command support. |
| `MailCompose` | macOS Mail-style email composition with rich text editing. |
| `ChatApp` | Chat interface that consumes the GeminiService. |
| `PresentationViewer` | Renders slide-deck style content for case studies. |
| `PasswordLock` | Blocks content until password matches. |
| `Spotlight` | macOS-style search overlay with keyboard navigation. |
| `SitemapViewer` | Site navigation and file listing. |

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
For AI features, ensure a valid Google GenAI API key is configured in `services/geminiService.ts`.

## Deployment

This project is configured for GitHub Pages deployment:

1. Push to the `main` branch
2. GitHub Actions workflow automatically builds and deploys
3. Custom domain configured via `public/CNAME`

## Design Philosophy

> "Every portfolio looks the same. But doing something different often means worse UX. Good UX is immediately recognisable. This site uses a familiar metaphor — the desktop OS — to stand out while remaining intuitive."

### Inspired By
- **macOS**: Window management, Spotlight, Mail
- **Nothing Phone**: Brutalist, dot-matrix aesthetic
- **PostHog**: Bold, technical design language

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
