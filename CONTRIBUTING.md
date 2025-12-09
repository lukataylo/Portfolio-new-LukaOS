# Contributing to LukaOS Portfolio

Thank you for your interest in contributing to LukaOS Portfolio! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Portfolio-new-LukaOS.git
   cd Portfolio-new-LukaOS
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/add-calculator-app`)
- `fix/` - Bug fixes (e.g., `fix/window-resize-issue`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(window): add snap-to-edge functionality`
- `fix(dock): resolve icon alignment on mobile`
- `docs(readme): update installation instructions`

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use Tailwind CSS for styling
- Keep components focused and single-purpose

## Project Structure

```
├── App.tsx              # Main application (OS kernel)
├── components/          # React components
│   ├── content/         # Application windows
│   ├── widgets/         # Desktop widgets
│   └── window/          # Window management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── services/            # External service integrations
```

## Adding New Features

### Adding a New Desktop App

1. Create the component in `components/content/`
2. Add a new `FileType` in `types.ts` if needed
3. Register the app in `constants.tsx`
4. Add rendering logic in `App.tsx`

### Adding a New Widget

1. Create the widget in `components/widgets/`
2. Export from `components/widgets/index.ts`
3. Add to the desktop area in `App.tsx`

## Testing

Before submitting:

1. Run the build to check for TypeScript errors:
   ```bash
   npm run build
   ```
2. Test on multiple screen sizes
3. Verify keyboard navigation works
4. Check both light and dark themes

## Pull Request Process

1. Update documentation if needed
2. Ensure the build passes
3. Provide a clear description of changes
4. Link any related issues

## Questions?

Feel free to open an issue for any questions or suggestions.

---

Thank you for contributing!
