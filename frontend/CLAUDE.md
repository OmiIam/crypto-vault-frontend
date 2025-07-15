# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run start:prod` - Start production server with NODE_ENV=production
- `npm run lint` - Run ESLint

### Important Notes
- TypeScript and ESLint errors are ignored during builds (configured in next.config.ts)
- No test framework is currently configured
- Uses Turbopack for fast development builds

## Technology Stack

### Core Framework
- **Next.js 15.3.5** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Zustand** for state management

### Key Libraries
- **Lucide React** for icons
- **Headless UI** for accessible components
- **Recharts** for data visualization
- **Date-fns** for date manipulation

## Architecture Overview

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   └── login/
│   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── dashboard/
│   │   ├── market/
│   │   ├── trade/
│   │   ├── portfolio/
│   │   └── vault/
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── landing/          # Landing page components
│   ├── ui/               # Base UI components
│   ├── charts/           # Chart components
│   ├── admin/            # Admin-specific components
│   └── widgets/          # Dashboard widgets
├── hooks/                # Custom React hooks
└── lib/                  # Utilities and API client
```

### Key Components

#### Authentication & Navigation
- `Layout.tsx` - Main dashboard layout with sidebar navigation
- `src/lib/api.ts` - Centralized API client with token management
- Navigation items: Dashboard, Market, Trade, Portfolio
- Admin panel access for admin users

#### Landing Page
- Comprehensive landing page with sections: Hero, Features, Platform Preview, Trust Section, Testimonials, Pricing
- Professional design with glassmorphism and advanced animations
- Each section wrapped in ErrorBoundary for resilience

#### State Management
- Uses localStorage for user data and authentication tokens
- Zustand for client-side state management
- API client handles token persistence and authorization headers

### API Integration
- Base URL: `NEXT_PUBLIC_API_URL` or `http://localhost:5000/api`
- RESTful endpoints for auth, assets, trades, portfolio, admin functions
- Comprehensive admin features: user management, leaderboards, bulk operations

### Design System
- Professional trading platform aesthetic
- Gradient backgrounds with glassmorphism effects
- Responsive design with mobile-first approach
- Error boundaries throughout the application
- Toast notifications system
- Consistent color scheme: slate/purple/blue gradients

### Special Features
- Hero section with animated counters and trading panel preview
- Real-time market data visualization
- Advanced chart components using Recharts
- Admin dashboard with user management and analytics
- Portfolio tracking and professional trading

## Development Guidelines

### Component Patterns
- Use TypeScript for all components
- Implement proper error boundaries
- Follow consistent naming conventions
- Use Framer Motion for animations
- Wrap sections in ErrorBoundary components

### Styling Approach
- Tailwind CSS with design tokens
- Glassmorphism with backdrop-blur effects
- Consistent spacing using 8px grid system
- Professional gradient backgrounds
- Responsive breakpoints for mobile, tablet, desktop

### API Integration
- Use the centralized API client (`src/lib/api.ts`)
- Handle loading states and errors gracefully
- Implement proper token management
- Include comprehensive admin functionality

## Important Files
- `next.config.ts` - Next.js configuration with build optimizations
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint configuration
- `HERO_REDESIGN.md` - Detailed documentation of hero section design philosophy and implementation