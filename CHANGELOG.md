# Changelog

All notable changes to LukaOS Portfolio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-09

### Added

#### Core Features
- macOS-style window management with drag, resize (8-direction), minimize, and maximize
- Window tiling with snap-to-edge functionality (left half, right half, fullscreen)
- Smart z-index stacking for active window management
- Desktop context menu (right-click) with sorting and cleanup options
- Window context menu with minimize, maximize, refresh, and close actions
- Responsive design with automatic Desktop/Mobile layout switching

#### Applications
- **Finder**: macOS-style file browser with icons, list, and gallery views
- **Notes**: iOS-style notes app with sidebar navigation and inline editing
- **Library**: Book reviews with ratings, categories, and Amazon links
- **Terminal**: AI-powered terminal with command history, tab completion, and virtual file system
- **Mail**: macOS Mail-style email composition
- **System Preferences**: Theme, sound, and system settings panel
- **Browser**: Internal browser window for link previews

#### Desktop Features
- Draggable desktop icons with grid snapping (100px)
- Icon position persistence via localStorage
- Desktop widgets: Clock, Weather, GitHub activity graph
- Dynamic dock with pinned apps and open windows
- Live dock previews on hover
- Spotlight search (`Cmd+Space`)
- App Switcher (`Cmd+Tab`)
- Notification Center

#### Keyboard Shortcuts
- `Cmd+Space` - Spotlight search
- `Cmd+Tab` - App Switcher
- `Cmd+W` - Close active window
- `Cmd+M` - Minimize active window
- `Cmd+Q` - Quit (fun message)
- `Escape` - Close overlays
- Konami code Easter egg

#### Technical Features
- PWA support with offline caching
- URL deep linking with hash-based routing
- Sound effects via Web Audio API (toggleable)
- Persistent state (theme, sound, reduce motion, icon positions)
- Accessibility: ARIA labels, keyboard navigation, screen reader support, reduce motion

#### Easter Eggs
- Konami code activates retro CRT mode
- Clock click cycles through time formats
- Window shake to close
- Hidden terminal commands
- Dock wobble mode

### Technical Stack
- React 19
- TypeScript 5.8
- Tailwind CSS
- Vite 6
- Google Gemini AI integration
- Lucide React icons

---

## [Unreleased]

### Planned
- Additional desktop widgets
- More Easter eggs
- Performance optimizations
- Unit test coverage
