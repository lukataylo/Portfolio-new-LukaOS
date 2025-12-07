# Nothing OS Portfolio

A sophisticated React-based portfolio website that simulates a desktop operating system environment. It combines the functional metaphors of macOS with the brutalist, dot-matrix aesthetic of the "Nothing" brand.

## 🌟 Key Features

### 🖥️ Desktop Environment
*   **Window System**: Fully functional windows with dragging, resizing (8-direction), minimizing, and maximizing capabilities.
*   **Z-Index Stacking**: Smart window management ensures active windows always cascade to the front.
*   **Context Menu**: Right-click (desktop) or long-press (mobile) to access system tools like Sorting and Refresh.
*   **Responsive Design**: Automatically switches layout modes between Desktop (RTL icon flow) and Mobile (horizontal grid, auto-sizing windows).

### 🚀 Animations & Interactions
*   **Origin-Based Scaling**: Windows animate smoothly from their source icon's screen coordinates when opening and closing.
*   **Overshoot Physics**: Custom cubic-bezier curves provide a tactile "pop" and bounce effect.
*   **Live Dock Previews**: Hovering over dock items reveals a real-time, scaled-down thumbnail of the window content, even if minimized.

### 🤖 Gemini AI Integration
*   **Native Assistant**: A built-in terminal-style chat application powered by Google's Gemini 2.5 Flash model.
*   **Context Aware**: The AI is prompted to act as the portfolio engineer, providing technical details about the projects.

### 🌐 Browser Simulation
*   **Virtual Browser**: External links open in internal windows to maintain immersion.
*   **Smart Mocking**: Detects security headers (X-Frame-Options) from sites like GitHub, LinkedIn, and Twitter/X. Instead of a broken iframe, it renders a high-fidelity, interactive mock profile using React components.

### 🔒 Security & Content
*   **File System**: Supports different file types: Presentations, Links, Apps, and Protected Files.
*   **Password Protection**: Case studies can be locked behind a functional decryption screen.

---

## 🏗️ Technical Architecture

### State Management (`App.tsx`)
The `App` component acts as the OS Kernel. It holds the "Global State":
*   `windows`: Array of active window objects containing size, position, z-index, and state flags (minimized/maximized).
*   `desktopItems`: The file system state (allows for sorting).
*   `theme`: Global light/dark mode context.

### Window Logic
Windows are not simple divs; they are complex interactive objects managed by `WindowFrame.tsx`:
1.  **Mounting**: Captures the `originRect` (DOMRect) of the icon that was clicked.
2.  **Animation**: Uses CSS transitions to morph `originRect` -> `targetRect` (Window Size).
3.  **Interaction**: 
    *   **Drag**: Calculates deltas on `mousemove`/`touchmove`.
    *   **Resize**: Detects edge interactions to adjust specific dimensions (width/height/x/y).

### The Dock (`Dock.tsx`)
The dock is "smart"—it doesn't just list apps.
*   **Dynamic Items**: It shows pinned apps (Finder, Mail) AND currently open windows that aren't pinned.
*   **Render Props**: It uses a `renderPreview` callback to generate the actual React component tree of a window inside a tiny container, scaled down using CSS `transform: scale()`.

### styling
*   **Tailwind CSS**: Used for the utility-first styling engine.
*   **Custom Aesthetics**: Heavy use of `border-zinc-xxx`, `font-mono`, and custom grid patterns to achieve the "Nothing" look.
*   **Dark Mode**: Implemented via Tailwind's `dark:` modifier and a root-level class toggle.

## 🛠️ Components Overview

*   **`WindowFrame`**: The chrome wrapper for all apps. Handles the "OS" UI (Title bar, controls, resize handles).
*   **`BrowserApp`**: Handles URL rendering. Contains the logic switch `renderMockContent()` to bypass iframe restrictions.
*   **`ChatApp`**: A standardized chat interface that consumes the `GeminiService`.
*   **`PresentationViewer`**: Renders slide-deck style content for case studies.
*   **`PasswordLock`**: A wrapper component that blocks content rendering until a specific string matches the `item.password` prop.

## 🚀 Getting Started

1.  **API Key**: Ensure a valid Google GenAI API key is present in the environment variables (handled automatically in this web container).
2.  **Theme**: Toggle between Light and Dark mode using the button at the top of the screen.
3.  **Explore**: Double-click "Project X" (Password: `123`) to test the security features.
