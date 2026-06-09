# Changelog

All notable changes to LukaOS Portfolio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-09

A system-wide "OS update": simpler, faster, more reliable, more beautiful.

### Changed

#### Design refresh
- Rounder windows (16px radius) with properly clipped title bars and content corners
- New soft, diffuse shadow scale (`soft` / `panel` / `window` / `dock`) replacing harsh `shadow-2xl`/`shadow-lg` everywhere
- Hairline borders (`black/5`, `white/10`) instead of heavy zinc borders across windows, dock, menus, and panels
- Single red accent throughout: Spotlight selection, App Switcher, Finder selection, snap previews, toggles, links, and badges (previously a mix of blue, green, yellow, purple, and pink)
- Monochrome traffic lights (red close; neutral minimize/maximize), borderless dots
- Neutral widget styling (GitHub contribution ramp, weather icons) and flattened gradients
- Faster, snappier window animations (open 500ms → 300ms; close/maximize ~250ms) and quicker theme transitions

### Fixed
- Window z-indexes are renormalized on focus so windows can no longer stack above the menu bar after repeated focusing
- Off-screen bounce-back now uses the window's final drag position (stale-closure bug made it act on the drag-start position)
- Traffic-light buttons no longer double-fire on touch devices (maximize used to instantly un-maximize)
- Closing/minimizing a window now focuses the visually topmost remaining window instead of the most recently opened one
- Terminal `ls` no longer prints raw ANSI escape garbage; directories are marked with a trailing `/`
- Terminal Ctrl+C no longer hijacks clipboard copy when text is selected; input refocuses after AI responses; AI question allowance now actually resets daily as promised
- UI sounds recover from the browser's autoplay policy (suspended AudioContext is resumed on play)
- System Preferences: Reduce Motion toggle is now wired to the real, persisted setting; sound previews actually play; dead notification toggles removed
- Finder items can be opened on touch devices (tap selects, second tap opens); dead breadcrumb/sidebar buttons removed
- Mobile app drawer no longer closes when scrolling the app grid
- Chat assistant no longer gets stuck on "Processing..." if a request fails
- Back/forward navigation now works for `#/` deep links (hashchange listener)
- Welcome Back modal: clicking outside closes it; "2 minute" pluralization corrected
- Mail: empty message body no longer bypasses validation; Spotlight arrow-key crash with zero results fixed
- GitHub widget contribution cells now render correctly in dark mode; weather details no longer jitter every minute
- Escape now closes Spotlight; browser back/forward arrows no longer pretend to be clickable

### Removed
- Dead code: unused `useWindowManager`/`useKeyboardShortcuts` hooks, duplicate inline App Switcher and Notification Center implementations, unused beach-ball loader

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
