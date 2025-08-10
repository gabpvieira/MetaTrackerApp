# Overview

This is a Personal Finance PWA (Progressive Web App) called "Finanças Semanais" - a local-first weekly financial management application. The app helps users track income, expenses, and weekly goals with a premium design interface. All data is stored locally using IndexedDB with encryption capabilities, ensuring complete privacy and offline functionality.

The application features a dashboard with weekly progress tracking, transaction management, category organization, reporting capabilities, and data backup/restore functionality. It's built as a PWA to be installable and work offline while maintaining a modern, responsive design inspired by premium financial applications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system featuring glass morphism effects and gradient themes
- **State Management**: Zustand store for global application state
- **Data Fetching**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

## Data Storage Architecture
- **Local Database**: Dexie.js wrapper around IndexedDB for client-side data persistence
- **Data Encryption**: WebCrypto API for AES-GCM encryption of sensitive financial data
- **Schema Validation**: Zod schemas for runtime type checking and validation
- **Backup System**: JSON export/import with encryption for data portability

## PWA Features
- **Service Worker**: Custom SW implementation for offline functionality and caching
- **Manifest**: Web app manifest for installation capabilities
- **Offline-First**: Complete functionality without network connectivity
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization

## Component Architecture
- **Layout Components**: Sidebar navigation and mobile-responsive header
- **Feature Modules**: Separate modules for dashboard, transactions, categories, reports, and backup
- **UI Components**: Reusable component library built on Radix UI primitives
- **Form Components**: Specialized forms for financial data entry with validation

## Backend Architecture (Minimal)
- **Server**: Express.js server primarily for development and potential future API endpoints
- **Storage Interface**: Abstract storage layer with in-memory implementation
- **Build System**: ESBuild for production server bundling
- **Development**: Vite integration for hot module replacement

## Design System
- **Theme**: Custom CSS variables supporting light/dark modes
- **Typography**: Inter font family for modern readability
- **Color Palette**: Primary green (#77FFC8) with gradient system
- **Glass Effects**: Backdrop blur and transparency effects for premium feel
- **Animations**: Smooth transitions and micro-interactions

## Data Schema
- **Categories**: Income/expense categorization with icons and colors
- **Transactions**: Financial entries linked to categories with amounts and descriptions
- **Settings**: User preferences including weekly goals and theme settings
- **Backup Format**: Versioned export format for data migration

## Security Considerations
- **Data Encryption**: All sensitive data encrypted before storage in IndexedDB
- **Local-Only**: No external data transmission, complete privacy
- **Key Management**: Crypto keys generated and managed locally
- **Input Validation**: Comprehensive validation using Zod schemas

# External Dependencies

## UI and Component Libraries
- **Radix UI**: Headless UI primitives for accessibility and behavior
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for component variant management

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization
- **ESBuild**: Fast JavaScript bundler for production builds

## Data and State Management
- **Zustand**: Lightweight state management library
- **Dexie.js**: IndexedDB wrapper for client-side database operations
- **React Query**: Server state and caching management
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference

## Utility Libraries
- **date-fns**: Date manipulation and formatting with Portuguese locale
- **clsx/twMerge**: Conditional CSS class management
- **Recharts**: Chart and graph visualization library

## PWA and Performance
- **Workbox** (implicit): Service worker functionality
- **Web Crypto API**: Native browser encryption capabilities
- **IndexedDB**: Native browser database for offline storage

## Development Environment
- **Replit Integration**: Custom plugins for Replit development environment
- **Runtime Error Overlay**: Development error reporting
- **Cartographer**: Code mapping for development (Replit-specific)

## Font and Assets
- **Google Fonts**: Inter font family loaded from Google Fonts CDN
- **PWA Assets**: Icons, manifest, and service worker files for installation