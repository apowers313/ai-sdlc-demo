# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JokeStream is a Next.js application that provides an endless stream of family-friendly dad jokes with advanced content filtering. The project uses TypeScript, React 19, and the Next.js App Router.

## Development Commands

```bash
# Development (runs on port 9090)
npm run dev

# Build
npm run build

# Start production server
npm run start

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a single test file
npm test -- path/to/test.ts

# Lint code
npm run lint

# Lint and fix
npm run lint -- --fix
```

## Architecture Overview

### Content Filtering System
The core feature is a multi-layer content filtering system:
- **ContentFilterService** (`src/services/contentFilter.ts`) - Uses the obscenity package to detect inappropriate content with custom patterns for sensitive topics
- **FilterStore** (`src/stores/filterStore.ts`) - Zustand store managing filter state with persistence
- **Default Setting**: Filter strength is set to "strict" by default

### State Management
- **Zustand** is used for global state management with persistence
- Stores are located in `src/stores/`
- Each store uses the persist middleware for localStorage persistence

### API Integration Strategy
- **axios** for HTTP requests (configured in `src/services/api/`)
- **SWR** for data fetching with caching
- API endpoint: icanhazdadjoke.com

### Component Structure
- `src/components/ui/` - Reusable UI components (Switch, Select, etc.)
- `src/components/features/` - Feature-specific components (FilterSettings, etc.)
- `src/components/common/` - Shared components
- `src/components/jokes/` - Joke-related components
- `src/components/layout/` - Layout components

### Testing Strategy
- Jest with React Testing Library for unit tests
- Tests are co-located with source files (*.test.ts)
- 80% coverage threshold enforced
- Pre-commit hooks run tests via Husky

### Styling Approach
- Tailwind CSS v4 with CSS variables
- Dark mode support via CSS variables
- Utility classes composed with clsx and tailwind-merge
- Custom CSS variables defined in `src/app/globals.css`

### Key Dependencies
- **obscenity**: Content filtering with profanity detection
- **zustand**: State management with persistence
- **swr**: Data fetching and caching
- **framer-motion**: Animations
- **@radix-ui**: Accessible UI primitives
- **lucide-react**: Icon library

## Implementation Plan

The project follows a phased implementation plan (see `design/implementation-plan.md`):
- Phase 1: Content Filtering System ✅ (completed)
- Phase 2: API Integration Layer
- Phase 3: Core UI Components
- Phase 4: Search and Filtering UI
- Phase 5: User Preferences and Storage
- Phase 6: Social Features
- Phase 7: Advanced Features
- Phase 8: Performance Optimization
- Phase 9: Testing & Quality Assurance
- Phase 10: Documentation & Deployment

## Port Configuration

The application runs on port 9090 (configured in package.json) to avoid conflicts with other services.