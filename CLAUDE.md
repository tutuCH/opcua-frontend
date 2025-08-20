# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- **Start development server:** `yarn dev` or `npm run dev` (runs on port 3030)
- **Start with host access:** `yarn dev:host` (for network access)
- **Build for production:** `yarn build` or `npm run build`
- **Preview production build:** `yarn preview` or `npm run preview` (runs on port 3030)

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

### Subscription & Billing
- **Stripe Checkout Integration**: Uses prebuilt Stripe Checkout pages for subscriptions
- **Customer Portal**: Stripe-hosted portal for subscription management
- **Subscription Plans**: Basic ($9.99), Professional ($29.99), Enterprise ($99.99) monthly plans
- **API Endpoints**: 
  - `POST /api/subscription/create-checkout-session` - Create Stripe Checkout session
  - `POST /api/subscription/create-portal-session` - Access customer portal
- **Callback Pages**: Success (`/subscription/success`) and Cancel (`/subscription/cancel`) handling
- **Lookup Keys**: Uses descriptive keys like `basic_monthly`, `professional_monthly`, `enterprise_monthly`

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
- `VITE_BACKEND_URL`: Backend API base URL (default: http://localhost:3000)
- `VITE_COGNITO_*`: AWS Cognito authentication configuration
- `VITE_SIGN_IN_URL` / `VITE_SIGN_OUT_URL`: Authentication redirect URLs
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for Checkout sessions
- `VITE_STRIPE_SECRET_KEY`: Stripe secret key (server-side only, not used in frontend)
- Configure in `.env.local` for local development (`.env` contains defaults)

### Important File Paths
- **Path aliases:** `@/` and `src/` point to the src directory
- **TypeScript:** Strict mode enabled with comprehensive type checking
- **Port configuration:** Development server runs on port 3030 (not 3000)
- **Backend Integration:** See `BACKEND_INTEGRATION.md` for detailed API specifications

## Sample MQTT Data

### Injection Molding Machine Data Structure
```json
{
  "devId": "C02",
  "topic": "realtime", 
  "sendTime": "2025-08-01 10:49:21",
  "sendStamp": 1754016561000,
  "time": "2025-08-01 10:49:20",
  "timestamp": 1754016560000,
  "Data": {
    "ATST": 0,    // Auto Test Status (0=disabled, 1=enabled)
    "OPM": -1,    // Operation Mode (-1=stopped, 0=manual, 1=auto, 2=setup)
    "STS": 1,     // System Status (0=offline, 1=online, 2=error, 3=warning)
    "T1": 0,      // Temperature Zone 1 (°C)
    "T2": 0,      // Temperature Zone 2 (°C) 
    "T3": 0,      // Temperature Zone 3 (°C)
    "T4": 0,      // Temperature Zone 4 (°C)
    "T5": 0,      // Temperature Zone 5 (°C)
    "T6": 0,      // Temperature Zone 6 (°C)
    "T7": 0       // Temperature Zone 7 (°C)
  }
}
```

**Data Field Explanations:**
- `devId`: Machine/Device identifier (e.g., "C02" = Machine C02)
- `topic`: MQTT topic type ("realtime" for live data streams)
- `sendTime`/`sendStamp`: When data was transmitted from machine
- `time`/`timestamp`: When data was collected at machine level
- `Data.ATST`: Auto-test functionality status
- `Data.OPM`: Current operational mode of the machine
- `Data.STS`: Overall machine status indicator
- `Data.T1-T7`: Temperature readings from 7 heating zones in injection molding barrel
- testing account: abc@gmail.com, password: abc123