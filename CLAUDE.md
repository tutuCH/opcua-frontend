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
- **UI Framework:** Mixed architecture - MUI v6 + shadcn/ui components + Tailwind CSS
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
│   ├── settings/      # Settings management (personal info, subscription)
│   └── login/         # Authentication components
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components (modern Radix-based)
│   └── ...           # Legacy and custom components
├── pages/            # Page components
├── routes/           # Routing configuration
├── theme/            # MUI theme customization
├── utils/            # Utility functions
└── lib/              # Shared utilities (cn function, etc.)
```

### Key Business Logic
- **Factory Management:** CRUD operations for industrial factories with drag-and-drop machine positioning
- **Machine Monitoring:** Real-time data visualization and monitoring for injection molding machines
- **OPC UA Integration:** Industrial protocol for connecting to manufacturing equipment
- **Warning System:** Configurable alerts based on machine parameters (temperature, pressure, cycle time)

### Authentication & Authorization Architecture
- **JWT-based authentication** with 30-day token expiration stored in localStorage
- **AuthContext** provides centralized authentication state and navigation
- **AuthMiddleware** component handles route-level authentication checks
- **SubscriptionProtectedRoute** provides subscription-based access control
- **Token Management** via TokenManager utility with automatic cleanup
- **Navigation Integration**: AuthContext handles post-login/logout navigation automatically

### Subscription & Billing
- **Stripe Checkout Integration**: Uses prebuilt Stripe Checkout pages for subscriptions
- **Customer Portal**: Stripe-hosted portal for subscription management
- **Subscription Plans**: Basic ($9.99), Professional ($29.99), Enterprise ($99.99) monthly plans
- **API Endpoints**: 
  - `POST /api/subscription/create-checkout-session` - Create Stripe Checkout session
  - `POST /api/subscription/create-portal-session` - Access customer portal
  - `GET /api/subscription/current` - Get current subscription status
- **Callback Pages**: Success (`/subscription/success`) and Cancel (`/subscription/cancel`) handling
- **Lookup Keys**: Uses descriptive keys like `basic_monthly`, `professional_monthly`, `enterprise_monthly`
- **Real-time Subscription Checking**: SubscriptionProtectedRoute makes direct API calls to verify subscription status

### Route Protection & Navigation Flow
```
Login → AuthContext.login() → Auto-navigate to /factory
Logout → AuthContext.logout() → Auto-navigate to /login
Protected Routes → AuthMiddleware → SubscriptionProtectedRoute → Content
```

**Route Hierarchy:**
1. **AuthMiddleware**: Handles authentication checks and redirects
2. **DashboardLayout**: Provides common layout (nav, header)  
3. **SubscriptionProtectedRoute**: Verifies active subscription before content access
4. **Page Components**: Final rendered content

### API Integration
- Base URL configured via `VITE_BACKEND_URL` environment variable
- RESTful endpoints for factory/machine operations
- OPC UA connection management endpoints
- Subscription API endpoints for Stripe integration
- **Axios interceptors** for automatic token attachment and 401 handling

### State Management Patterns
- **Authentication:** React Context for global auth state with navigation integration
- **Subscription Data:** Local state in SubscriptionProtectedRoute with dedicated API calls
- **API Data:** Local component state with useEffect + useState
- **Forms:** React Hook Form for complex forms (settings, login)
- **No global state library** - intentionally simple architecture

### UI Component Migration Strategy
The codebase is in **active migration** from MUI to shadcn/ui:

**Current State:**
- **New Components**: Use shadcn/ui + Tailwind CSS (settings pages, navigation, subscription components)
- **Legacy Components**: Still use MUI v6 (factory management, machine monitoring, warnings)
- **Mixed Usage**: Some components combine both approaches during transition

**Component Conventions:**
- **shadcn/ui**: Located in `src/components/ui/` - modern, accessible, Radix-based
- **MUI**: Traditional Material-UI components with custom theming
- **Icons**: Consistently use Lucide React across all components
- **Styling**: Tailwind CSS classes preferred over MUI sx prop
- **Loading States**: Use Loader2 from Lucide + shadcn Skeleton components

### Development Notes
- **Language:** Mixed English/Chinese in UI (Chinese labels, English code)
- **Build Tool:** Vite with React SWC plugin for fast builds
- **Code Quality:** ESLint with Airbnb config + Prettier
- **TypeScript:** Expanding usage, especially for new shadcn/ui components and API integrations
- **Port Conflicts:** Development server automatically finds available ports (3030, 3031, 3032, etc.)

### Common Patterns
- **Authentication Flow**: Always use AuthContext methods, never direct navigation
- **Subscription Checks**: SubscriptionProtectedRoute handles API calls and loading states
- **Loading States**: Use shadcn Skeleton + Loader2 for consistent loading UX
- **Form Validation**: React Hook Form with proper TypeScript typing
- **Error Handling**: Try-catch blocks with user-friendly Alert components
- **Navigation**: Use React Router's navigate with { replace: true } to prevent back button issues

### Critical Implementation Details
- **Subscription Loading**: SubscriptionProtectedRoute makes independent API call to prevent flash of subscription required page
- **Token Refresh**: AuthContext includes token warning system (5 minutes before expiration)
- **Route Throttling Prevention**: AuthMiddleware uses useRef to prevent duplicate navigation calls
- **Loading State Coordination**: AuthContext loading state covers both auth and subscription checks

### Testing
- No test framework currently configured
- Manual testing approach
- Test account: abc@gmail.com, password: abc123

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

## Migration Guidelines

### When Adding New Components
1. **Use shadcn/ui** for all new UI components
2. **Apply Tailwind CSS** for styling instead of MUI sx
3. **Use Lucide React icons** consistently
4. **Implement proper TypeScript** interfaces
5. **Follow AuthContext patterns** for authentication

### When Refactoring Existing Components  
1. **Prioritize user-facing components** (settings, login, subscription pages)
2. **Maintain functional compatibility** during migration
3. **Test navigation flows** thoroughly after auth-related changes
4. **Use proper loading states** to prevent UI flash issues

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.