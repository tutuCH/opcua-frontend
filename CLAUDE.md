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
- **Real-time Communication:** Socket.IO client for WebSocket connections
- **Charts:** ApexCharts/Recharts for data visualization
- **Icons:** Lucide React
- **Internationalization:** i18next with browser language detection

### Project Structure
```
src/
├── api/               # API service layers (authServices, machinesServices)
├── contexts/          # React contexts (AuthContext)
├── hooks/             # Custom React hooks (useWebSocket, useSubscription)
├── services/          # Service layers (websocketService for real-time data)
├── i18n/              # Internationalization (locales for en, zh-CN, zh-TW)
├── layouts/           # Page layouts (dashboard layout with nav/header)
├── sections/          # Feature-specific components
│   ├── factory/       # Factory management (CRUD, dialogs, machine positioning)
│   ├── machine/       # Machine monitoring (charts, data tables, real-time updates)
│   ├── warnings/      # Warning system (cards, date filtering)
│   ├── settings/      # Settings management (personal info, subscription)
│   └── login/         # Authentication components
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components (modern Radix-based)
│   ├── WebSocketStatus.tsx  # Real-time connection status indicators
│   └── ...           # Legacy and custom components
├── pages/            # Page components
├── routes/           # Routing configuration
├── theme/            # MUI theme customization
├── utils/            # Utility functions
└── lib/              # Shared utilities (cn function, etc.)
```

### Key Business Logic
- **Factory Management:** CRUD operations for industrial factories with drag-and-drop machine positioning
- **Real-time Machine Monitoring:** Live data streaming via WebSocket with injection molding machine metrics
- **OPC UA Integration:** Industrial protocol for connecting to manufacturing equipment
- **Statistical Process Control (SPC):** Advanced manufacturing analytics with cycle time, pressure, and temperature monitoring
- **Warning System:** Configurable alerts based on machine parameters with real-time notifications
- **Multi-language Support:** Internationalization for English, Simplified Chinese, and Traditional Chinese

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
- **Real-time Data:** WebSocket service singleton with custom hooks for state management
- **Forms:** React Hook Form for complex forms (settings, login)
- **No global state library** - intentionally simple architecture

### Real-time Data Architecture
- **WebSocket Service:** Singleton service (`getMachineDataService()`) for connection management
- **Custom Hooks:**
  - `useWebSocket()` - General WebSocket connection and event handling
  - `useMachineRealtime(deviceId)` - Subscribe to specific machine real-time data
  - `useMachineStatus(deviceId)` - Request and manage machine status
  - `useMachineAlerts()` - Global alert management
- **Connection Management:** Auto-reconnection, subscription state tracking, error handling
- **Event Types:**
  - `realtime-update` - Live machine data (temperatures, operation mode, status)
  - `spc-update` - Statistical Process Control data (cycle times, pressures, injection parameters)
  - `machine-status` - Current machine status responses
  - `machine-history` - Historical data for time-range queries
  - `machine-alert` - Real-time alerts and notifications
- **Data Flow:** MQTT → NestJS Backend → Redis → WebSocket Gateway → Frontend Components

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
- **WebSocket Integration**: Use singleton `getMachineDataService()` and custom hooks for real-time data
- **Language Support**: Use i18next hooks (`useTranslation`) for multilingual content

### Real-time Data Integration Patterns
- **Connection Management**: Initialize WebSocket service once per application lifecycle
- **Machine Subscriptions**: Use `useMachineRealtime(deviceId)` for automatic subscription/cleanup
- **Status Monitoring**: Use `WebSocketStatus` component for connection health display
- **Error Recovery**: WebSocket service handles auto-reconnection and subscription restoration
- **Data Validation**: Always validate incoming WebSocket data structure before use
- **Performance**: Limit concurrent machine subscriptions, implement data throttling for high-frequency updates

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
- **WebSocket Integration:** See `docs/WEBSOCKET_FRONTEND_INTEGRATION.md` for comprehensive real-time data implementation guide
- **Key Real-time Files:**
  - `src/services/websocketService.ts` - Core WebSocket service singleton
  - `src/hooks/useWebSocket.ts` - React hooks for real-time data management
  - `src/components/WebSocketStatus.tsx` - Connection status indicators
  - `src/i18n/` - Internationalization configuration and locale files

## Sample Real-time Data

### Injection Molding Machine Real-time Data
```json
{
  "devId": "C02",
  "topic": "realtime",
  "sendTime": "2025-08-01 10:49:21",
  "sendStamp": 1754016561000,
  "time": "2025-08-01 10:49:20",
  "timestamp": 1754016560000,
  "Data": {
    "OT": 52.3,   // Oil Temperature (°C)
    "ATST": 0,    // Auto Time Start (0=disabled, 1=enabled)
    "OPM": 2,     // Operation Mode (-1=stopped, 0=manual, 1=auto, 2=setup)
    "STS": 2,     // System Status (0=offline, 1=online, 2=error, 3=warning)
    "T1": 221.5,  // Temperature Zone 1 (°C)
    "T2": 220.8,  // Temperature Zone 2 (°C)
    "T3": 222.1,  // Temperature Zone 3 (°C)
    "T4": 219.7,  // Temperature Zone 4 (°C)
    "T5": 221.9,  // Temperature Zone 5 (°C)
    "T6": 220.4,  // Temperature Zone 6 (°C)
    "T7": 222.3   // Temperature Zone 7 (°C)
  }
}
```

### Statistical Process Control (SPC) Data
```json
{
  "devId": "C02",
  "topic": "spc",
  "sendTime": "2025-08-01 10:49:21",
  "sendStamp": 1754016561000,
  "time": "2025-08-01 10:49:20",
  "timestamp": 1754016560000,
  "Data": {
    "CYCN": "1234",           // Cycle Number
    "ECYCT": "45.2",          // Effective Cycle Time (seconds)
    "EISS": "2024-01-15T10:29:14.000Z", // Effective Injection Start Time
    "EIVM": "152.3",          // Effective Injection Velocity Max (mm/s)
    "EIPM": "78.5",           // Effective Injection Pressure Max (bar)
    "ESIPT": "2.5",           // Effective Switch-over Injection Pressure Time (s)
    "ESIPP": "87.2",          // Effective Switch-over Injection Pressure Position (%)
    "ESIPS": "32.1",          // Effective Switch-over Injection Pressure Speed (mm/s)
    "EIPT": "5.2",            // Effective Injection Pressure Time (s)
    "EIPSE": "2024-01-15T10:29:19.000Z", // Effective Injection Pressure Start End
    "EPLST": "4.1",           // Effective Plasticizing Time (s)
    "EPLSSE": "2024-01-15T10:29:23.000Z", // Effective Plasticizing Start End
    "EPLSPM": "118.7",        // Effective Plasticizing Pressure Max (bar)
    "ET1": "221.5",           // Effective Temperature 1-10 (°C)
    "ET2": "220.8",
    "ET3": "222.1",
    "ET4": "219.7",
    "ET5": "221.9",
    "ET6": "220.4",
    "ET7": "222.3",
    "ET8": "220.9",
    "ET9": "221.2",
    "ET10": "222.0"
  }
}
```

**Data Field Explanations:**
- `devId`: Machine/Device identifier (e.g., "C02" = Machine C02)
- `topic`: Data stream type ("realtime" for live data, "spc" for process control metrics)
- `sendTime`/`sendStamp`: When data was transmitted from machine
- `time`/`timestamp`: When data was collected at machine level
- **Real-time Fields:**
  - `OT`: Oil/hydraulic system temperature
  - `ATST`: Auto-test functionality status
  - `OPM`: Current operational mode of the machine
  - `STS`: Overall machine status indicator
  - `T1-T7`: Temperature readings from 7 heating zones in injection molding barrel
- **SPC Fields:** Advanced manufacturing metrics for quality control and process optimization
  - `CYCN`: Production cycle identifier
  - `ECYCT`: Time for complete injection molding cycle
  - `EIVM/EIPM`: Injection velocity and pressure maximums for quality control
  - `ESIPT/ESIPP/ESIPS`: Switch-over point parameters for injection-to-packing transition
  - `EPLST/EPLSPM`: Plasticizing phase timing and pressure metrics
  - `ET1-ET10`: Extended temperature monitoring across all heating zones

## Migration Guidelines

### When Adding New Components
1. **Use shadcn/ui** for all new UI components
2. **Apply Tailwind CSS** for styling instead of MUI sx
3. **Use Lucide React icons** consistently
4. **Implement proper TypeScript** interfaces
5. **Follow AuthContext patterns** for authentication
6. **Use i18next hooks** (`useTranslation`) for internationalized content
7. **Integrate WebSocket data** using custom hooks when displaying machine data

### When Adding Real-time Features
1. **Use WebSocket service singleton** (`getMachineDataService()`) for connection management
2. **Implement custom hooks** (`useWebSocket`, `useMachineRealtime`) for state management
3. **Add connection status indicators** using `WebSocketStatus` or `WebSocketIndicator` components
4. **Handle loading and error states** appropriately for real-time data
5. **Validate incoming data structure** before updating component state
6. **Clean up subscriptions** in component cleanup (useEffect return function)

### When Refactoring Existing Components
1. **Prioritize user-facing components** (settings, login, subscription pages)
2. **Maintain functional compatibility** during migration
3. **Test navigation flows** thoroughly after auth-related changes
4. **Use proper loading states** to prevent UI flash issues
5. **Integrate real-time data** where appropriate for machine monitoring components
6. **Add internationalization** for user-facing text and labels

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.