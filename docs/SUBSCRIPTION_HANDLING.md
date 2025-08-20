# Subscription Handling Guide - Frontend Perspective

This document outlines how subscription management and access control is implemented from the frontend perspective.

## Overview

The application uses a subscription-based access model with three tiers:
- **基礎方案 (Basic)** - $9.99/month
- **專業方案 (Professional)** - $29.99/month  
- **企業方案 (Enterprise)** - $99.99/month

## Architecture Components

### 1. Subscription Context (`useSubscription` Hook)

**Location:** `src/hooks/useSubscription.ts`

The subscription hook manages subscription state and provides access control methods:

```typescript
interface SubscriptionData {
  plan: 'basic' | 'professional' | 'enterprise' | null;
  status: 'active' | 'canceled' | 'past_due' | 'inactive';
  currentPeriodEnd: Date | null;
  isActive: boolean;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionData;
  loading: boolean;
  error: string | null;
  hasAccess: (requiredPlan: string) => boolean;
  refreshSubscription: () => Promise<void>;
}
```

**Key Methods:**
- `hasAccess(requiredPlan)` - Checks if current subscription meets minimum requirements
- `refreshSubscription()` - Fetches latest subscription data from backend
- Automatic token refresh and error handling

### 2. Subscription Protected Route Component

**Location:** `src/components/SubscriptionProtectedRoute.tsx`

Wraps routes that require active subscription access:

```typescript
interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
  requiredPlan?: 'basic' | 'professional' | 'enterprise';
  fallback?: React.ReactNode;
}
```

**Behavior:**
- Shows loading state while checking subscription
- Redirects to subscription page if no access
- Supports minimum plan requirements
- Custom fallback UI for access denied

### 3. Subscription Services

**Location:** `src/api/subscriptionServices.ts`

API service layer for subscription operations:

```typescript
// Core subscription methods
export const subscriptionServices = {
  // Get current user subscription status
  getCurrentSubscription: () => Promise<SubscriptionResponse>;
  
  // Create Stripe Checkout session
  createCheckoutSession: (lookupKey: string) => Promise<CheckoutResponse>;
  
  // Create Stripe Customer Portal session
  createPortalSession: () => Promise<PortalResponse>;
  
  // Get saved payment methods
  getPaymentMethods: () => Promise<PaymentMethodsResponse>;
};
```

## Subscription Access Levels

### Plan Hierarchy

```
Enterprise (Highest Access)
    ↑
Professional (Mid-tier Access)  
    ↑
Basic (Basic Access)
    ↑
No Subscription (Public Access Only)
```

### Access Control Logic

```typescript
// Plan hierarchy for access control
const PLAN_HIERARCHY = {
  'basic': 1,
  'professional': 2, 
  'enterprise': 3
};

// Check if user has required access level
function hasAccess(userPlan: string, requiredPlan: string): boolean {
  if (!userPlan) return false;
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}
```

### Feature Access Matrix

| Feature | Basic | Professional | Enterprise |
|---------|-------|--------------|------------|
| Factory Management | ✅ | ✅ | ✅ |
| Basic Machine Monitoring | ✅ | ✅ | ✅ |
| Warning System | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Multi-Factory Support | ❌ | ❌ | ✅ |
| Custom Integrations | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

## Implementation Patterns

### 1. Route Protection

```typescript
// Protect entire routes
<Route path="/advanced-analytics" element={
  <SubscriptionProtectedRoute requiredPlan="professional">
    <AdvancedAnalyticsPage />
  </SubscriptionProtectedRoute>
} />

// Protect specific components
function AdvancedFeature() {
  const { hasAccess } = useSubscription();
  
  if (!hasAccess('professional')) {
    return <UpgradePrompt requiredPlan="professional" />;
  }
  
  return <AdvancedFeatureContent />;
}
```

### 2. Conditional UI Rendering

```typescript
function DashboardHeader() {
  const { subscription, hasAccess } = useSubscription();
  
  return (
    <header>
      <h1>Dashboard</h1>
      {hasAccess('professional') && (
        <Button>Advanced Reports</Button>
      )}
      {!subscription.isActive && (
        <UpgradeBanner />
      )}
    </header>
  );
}
```

### 3. Feature Flags

```typescript
// Feature availability based on subscription
const FEATURES = {
  ADVANCED_CHARTS: 'professional',
  MULTI_FACTORY: 'enterprise',
  CUSTOM_ALERTS: 'professional',
  API_ACCESS: 'enterprise'
};

function useFeature(feature: keyof typeof FEATURES) {
  const { hasAccess } = useSubscription();
  return hasAccess(FEATURES[feature]);
}
```

## Subscription State Management

### 1. Initial Load
```typescript
// On app initialization
useEffect(() => {
  if (isAuthenticated) {
    refreshSubscription();
  }
}, [isAuthenticated]);
```

### 2. Post-Payment Refresh
```typescript
// After successful Stripe Checkout
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    // Wait for webhook processing then refresh
    setTimeout(() => {
      refreshSubscription();
    }, 2000);
  }
}, []);
```

### 3. Periodic Sync
```typescript
// Periodic subscription sync (every 5 minutes)
useEffect(() => {
  if (!subscription.isActive) return;
  
  const interval = setInterval(() => {
    refreshSubscription();
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [subscription.isActive]);
```

## Error Handling

### 1. Subscription API Errors
```typescript
try {
  const subscription = await subscriptionServices.getCurrentSubscription();
  setSubscriptionData(subscription);
} catch (error) {
  if (error.status === 404) {
    // No subscription found - treat as inactive
    setSubscriptionData({ isActive: false, plan: null });
  } else {
    // Other errors - show error state
    setError('Failed to load subscription status');
  }
}
```

### 2. Payment Processing Errors
```typescript
try {
  const { url } = await subscriptionServices.createCheckoutSession(lookupKey);
  window.location.href = url;
} catch (error) {
  toast.error('Payment processing failed. Please try again.');
  console.error('Checkout error:', error);
}
```

### 3. Access Denied Scenarios
```typescript
function SubscriptionProtectedRoute({ children, requiredPlan }) {
  const { subscription, loading, hasAccess } = useSubscription();
  
  if (loading) return <LoadingSpinner />;
  
  if (!hasAccess(requiredPlan)) {
    return (
      <AccessDenied 
        currentPlan={subscription.plan}
        requiredPlan={requiredPlan}
        onUpgrade={() => navigateToUpgrade(requiredPlan)}
      />
    );
  }
  
  return children;
}
```

## Best Practices

### 1. Progressive Enhancement
- Show basic features first, enhance with subscription features
- Graceful degradation when subscription expires
- Clear upgrade prompts for premium features

### 2. User Experience
- Clear feedback during payment processing
- Immediate access after successful payment
- Helpful error messages with next steps

### 3. Security
- Always verify subscription on backend
- Don't rely solely on frontend checks
- Implement proper token refresh mechanisms

### 4. Performance
- Cache subscription data appropriately
- Minimize subscription API calls
- Use optimistic updates where appropriate

## Troubleshooting Common Issues

### 1. User Still Sees Subscription Prompt After Payment
**Causes:**
- Webhook not processed yet
- Frontend subscription cache not refreshed
- Backend subscription not properly updated

**Solutions:**
- Implement post-payment subscription refresh
- Add manual refresh option
- Check webhook processing logs

### 2. Access Denied for Valid Subscription
**Causes:**
- Stale subscription data
- Backend subscription status mismatch
- Token authentication issues

**Solutions:**
- Force subscription refresh
- Check backend subscription sync
- Verify JWT token validity

### 3. Payment Success But No Access
**Causes:**
- Webhook processing failure
- Database update issues
- User-subscription mapping problems

**Solutions:**
- Manual webhook retry
- Database consistency checks
- Customer support intervention

## Integration Points

### Authentication Context
```typescript
// AuthContext integration
const { user, isAuthenticated } = useAuth();
const { subscription, refreshSubscription } = useSubscription();

// Refresh subscription when user changes
useEffect(() => {
  if (isAuthenticated && user) {
    refreshSubscription();
  }
}, [user, isAuthenticated]);
```

### Route Configuration
```typescript
// Route-level subscription protection
const protectedRoutes = [
  {
    path: '/advanced-analytics',
    element: <SubscriptionProtectedRoute requiredPlan="professional">
      <AdvancedAnalyticsPage />
    </SubscriptionProtectedRoute>
  },
  {
    path: '/enterprise-features', 
    element: <SubscriptionProtectedRoute requiredPlan="enterprise">
      <EnterpriseFeaturesPage />
    </SubscriptionProtectedRoute>
  }
];
```

This architecture provides a robust foundation for subscription-based access control while maintaining a smooth user experience and clear separation of concerns.