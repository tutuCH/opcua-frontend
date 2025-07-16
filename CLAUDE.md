# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Start development server:** `yarn dev` or `npm run dev`
- **Build for production:** `yarn build` or `npm run build`
- **Preview production build:** `yarn preview` or `npm run preview`

### Code Quality
- **Lint code:** `yarn lint` or `npm run lint`
- **Fix linting issues:** `yarn lint:fix` or `npm run lint:fix`
- **Format code:** `yarn prettier` or `npm run prettier`

### Maintenance
- **Clean and restart:** `yarn re:start` (removes node_modules, reinstalls, and starts dev)
- **Clean build:** `yarn re:build` (removes node_modules, reinstalls, and builds)
- **Clear Vite cache:** `yarn vite:clean`

## Architecture Overview

### Technology Stack
- **Frontend:** React 18 with Vite build system
- **UI Framework:** Material-UI (MUI) v6 + shadcn/ui components + Tailwind CSS
- **Routing:** React Router v6 with lazy loading
- **State Management:** React Context (AuthContext) + local component state
- **HTTP Client:** Axios with interceptors
- **Charts:** ApexCharts/Recharts for data visualization
- **Icons:** Lucide React

### Project Structure
```
src/
├── api/               # API service layers (authServices, machinesServices)
├── contexts/          # React contexts (AuthContext)
├── layouts/           # Page layouts (dashboard layout with nav/header)
├── sections/          # Feature-specific components
│   ├── factory/       # Factory management (CRUD, dialogs, machine positioning)
│   ├── machine/       # Machine monitoring (charts, data tables)
│   ├── warnings/      # Warning system (cards, date filtering)
│   └── ...
├── components/        # Reusable UI components
├── pages/            # Page components
├── routes/           # Routing configuration
├── theme/            # MUI theme customization
└── utils/            # Utility functions
```

### Key Business Logic
- **Factory Management:** CRUD operations for industrial factories with drag-and-drop machine positioning
- **Machine Monitoring:** Real-time data visualization and monitoring for injection molding machines
- **OPC UA Integration:** Industrial protocol for connecting to manufacturing equipment
- **Warning System:** Configurable alerts based on machine parameters (temperature, pressure, cycle time)

### Authentication
- JWT-based authentication with 30-day token expiration
- Protected routes using AuthMiddleware wrapper
- Automatic logout on 401 responses via Axios interceptor

### API Integration
- Base URL configured via `VITE_BACKEND_URL` environment variable
- RESTful endpoints for factory/machine operations
- OPC UA connection management endpoints

### State Management Patterns
- **Authentication:** React Context for global auth state
- **API Data:** Local component state with useEffect + useState
- **Forms:** React Hook Form for complex forms
- **No global state library** - intentionally simple architecture

### UI Component Conventions
- **Primary UI:** Material-UI components with custom theming
- **Modern Components:** shadcn/ui + Radix for advanced interactions
- **Styling:** Tailwind CSS for custom styling
- **Consistent Icons:** Lucide React throughout the application

### Development Notes
- **Language:** Mixed English/Chinese in UI (Chinese labels, English code)
- **Build Tool:** Vite with React SWC plugin for fast builds
- **Code Quality:** ESLint with Airbnb config + Prettier
- **TypeScript:** Limited usage (mainly for shadcn/ui components)

### Common Patterns
- **Dialogs:** Material-UI dialogs for CRUD operations
- **Tables:** Custom table components with sorting/filtering
- **Charts:** ApexCharts for time-series data visualization
- **Loading States:** Skeleton components and loading indicators
- **Error Handling:** Try-catch blocks with user-friendly messages

### Testing
- No test framework currently configured
- Manual testing approach

### Environment Variables
- `VITE_BACKEND_URL`: Backend API base URL
- Configure in `.env.local` for local development