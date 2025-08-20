# Documentation for subscriptionServices.ts

## 1. Overview

This document provides a detailed explanation of the `subscriptionServices.ts` file. This file is responsible for handling all API requests related to user subscriptions, payments, and profile management using Stripe integration.

**Last Updated:** August 2025  
**Version:** 2.1 - Updated Plan IDs

## 2. Axios Instance and Interceptors

### 2.1. Axios Instance

A new Axios instance is created with a base URL that is read from the environment variable `VITE_BACKEND_URL`. If this variable is not set, it defaults to `http://localhost:3000`.

### 2.2. Request Interceptor

The request interceptor adds the user's access token to the `Authorization` header of every request. The access token is retrieved from local storage.

### 2.3. Response Interceptor

The response interceptor handles authentication errors. If a 401 (Unauthorized) error is received, it means the user's access token is invalid or has expired. In this case, the interceptor removes the user's data from local storage and redirects the user to the login page.

## 3. API Functions

### 3.1. `getCurrentSubscription()`

*   **Description:** Retrieves the current user's subscription. Handles network errors gracefully when backend is unavailable.
*   **Method:** `GET`
*   **Endpoint:** `/api/subscription/current`
*   **Returns:** A `SubscriptionResponse` object if the user has a subscription, `null` if no subscription exists or backend is unavailable.
*   **Error Handling:** Network errors and 404 responses return `null` instead of throwing.
*   **Sample Response:**
    ```json
    {
      "status": "success",
      "message": "Subscription retrieved successfully",
      "data": {
        "id": "sub_12345",
        "status": "active",
        "currentPeriodStart": 1672531200,
        "currentPeriodEnd": 1704067199,
        "plan": {
          "id": "plan_professional",
          "amount": 2999,
          "currency": "usd",
          "interval": "month"
        }
      }
    }
    ```

### 3.2. `getPlans()`

*   **Description:** Retrieves the available subscription plans.
*   **Method:** `GET`
*   **Endpoint:** `/api/subscription/plans`
*   **Returns:** An array of `SubscriptionPlan` objects wrapped in ApiResponse.
*   **Sample Response:**
    ```json
    {
      "status": "success",
      "message": "Plans retrieved successfully",
      "data": [
        {
          "id": "plan_basic",
          "name": "基礎方案",
          "price": 9.99,
          "currency": "usd",
          "interval": "month",
          "features": [
            "1 個工廠管理",
            "實時機器監控",
            "數據分析報告",
            "警報系統"
          ],
          "stripePlanId": "plan_basic"
        },
        {
          "id": "plan_professional",
          "name": "專業方案",
          "price": 29.99,
          "currency": "usd",
          "interval": "month",
          "features": [
            "無限制工廠管理",
            "實時機器監控",
            "數據分析報告",
            "警報系統",
            "24/7 客戶支持",
            "數據導出功能"
          ],
          "stripePlanId": "plan_professional"
        },
        {
          "id": "plan_enterprise",
          "name": "企業方案",
          "price": 99.99,
          "currency": "usd",
          "interval": "month",
          "features": [
            "無限制工廠管理",
            "實時機器監控",
            "數據分析報告",
            "警報系統",
            "24/7 客戶支持",
            "數據導出功能",
            "AI-Powered Assistant",
            "Dedicated Account Manager"
          ],
          "stripePlanId": "plan_enterprise"
        }
      ]
    }
    ```

### 3.3. `createSubscription()`

*   **Description:** Creates a new subscription for the user using Stripe.
*   **Method:** `POST`
*   **Endpoint:** `/api/subscription/create`
*   **Parameters:** A `CreateSubscriptionRequest` object containing the Stripe price ID and payment method ID.
*   **Sample Payload:**
    ```json
    {
      "planId": "plan_professional",
      "paymentMethodId": "pm_12345"
    }
    ```
*   **Returns:** A `CreateSubscriptionResponse` object wrapped in ApiResponse.
*   **Sample Response:**
    ```json
    {
      "status": "success",
      "message": "Subscription created successfully",
      "data": {
        "subscriptionId": "sub_12345",
        "clientSecret": "pi_12345_secret_67890",
        "status": "requires_confirmation"
      }
    }
    ```

### 3.4. `updateSubscription()`

*   **Description:** Updates an existing subscription (e.g., change plan).
*   **Method:** `PUT`
*   **Endpoint:** `/api/subscription/{subscriptionId}`
*   **Parameters:** An `UpdateSubscriptionRequest` object containing the subscription ID and optional new price ID.
*   **Sample Payload:**
    ```json
    {
      "subscriptionId": "sub_12345",
      "planId": "plan_enterprise"
    }
    ```
*   **Returns:** `void` (no response body)

### 3.5. `cancelSubscription()`

*   **Description:** Cancels an existing subscription.
*   **Method:** `DELETE`
*   **Endpoint:** `/api/subscription/{subscriptionId}`
*   **Parameters:** A `CancelSubscriptionRequest` object containing the subscription ID and a boolean indicating whether to cancel immediately.
*   **Sample Payload:**
    ```json
    {
      "subscriptionId": "sub_12345",
      "immediately": true
    }
    ```
*   **Returns:** `void`

### 3.6. `getPaymentMethods()`

*   **Description:** Retrieves the user's saved payment methods from Stripe.
*   **Method:** `GET`
*   **Endpoint:** `/api/subscription/payment-methods`
*   **Returns:** An array of `PaymentMethod` objects wrapped in ApiResponse.
*   **Sample Response:**
    ```json
    {
      "status": "success",
      "message": "Payment methods retrieved successfully",
      "data": [
        {
          "id": "pm_12345",
          "type": "card",
          "card": {
            "brand": "visa",
            "last4": "4242",
            "expiryMonth": 12,
            "expiryYear": 2025
          }
        }
      ]
    }
    ```

### 3.7. `createPaymentIntent()`

*   **Description:** Creates a Stripe payment intent for subscription setup.
*   **Method:** `POST`
*   **Endpoint:** `/api/subscription/create-payment-intent`
*   **Parameters:** An object containing the `planId` of the subscription plan.
*   **Sample Payload:**
    ```json
    {
      "planId": "plan_professional"
    }
    ```
*   **Returns:** An object containing the `clientSecret` for Stripe Elements.
*   **Sample Response:**
    ```json
    {
      "status": "success",
      "message": "Payment intent created successfully",
      "data": {
        "clientSecret": "pi_12345_secret_67890"
      }
    }
    ```

### 3.8. `confirmSubscription()`

*   **Description:** Confirms a subscription after successful Stripe payment.
*   **Method:** `POST`
*   **Endpoint:** `/api/subscription/confirm`
*   **Parameters:** An object containing the `paymentIntentId`.
*   **Sample Payload:**
    ```json
    {
      "paymentIntentId": "pi_12345"
    }
    ```
*   **Returns:** A `SubscriptionResponse` object wrapped in ApiResponse.
*   **Sample Response:**
    ```json
    {
      "status": "success", 
      "message": "Subscription confirmed successfully",
      "data": {
        "id": "sub_12345",
        "status": "active",
        "currentPeriodStart": 1672531200,
        "currentPeriodEnd": 1704067199,
        "plan": {
          "id": "plan_professional",
          "amount": 2999,
          "currency": "usd",
          "interval": "month"
        }
      }
    }
    ```

### 3.9. `getBillingHistory()`

*   **Description:** Retrieves the user's billing history.
*   **Method:** `GET`
*   **Endpoint:** `/api/subscription/billing-history`
*   **Returns:** An array of billing history objects.
*   **Sample Response:**
    ```json
    [
      {
        "id": "in_12345",
        "date": "2023-11-30T12:00:00Z",
        "amount": 29.99,
        "currency": "USD",
        "status": "paid",
        "invoice_pdf": "https://example.com/invoice.pdf"
      }
    ]
    ```

### 3.10. `updateUserProfile()`

*   **Description:** Updates the user's profile information.
*   **Method:** `PUT`
*   **Endpoint:** `/api/user/profile`
*   **Parameters:** An object containing the user's new `username` and/or `email`.
*   **Sample Payload:**
    ```json
    {
      "username": "new_username",
      "email": "new_email@example.com"
    }
    ```
*   **Returns:** `void`

### 3.11. `changePassword()`

*   **Description:** Changes the user's password.
*   **Method:** `PUT`
*   **Endpoint:** `/api/user/change-password`
*   **Parameters:** An object containing the user's `currentPassword` and `newPassword`.
*   **Sample Payload:**
    ```json
    {
      "currentPassword": "old_password",
      "newPassword": "new_secure_password"
    }
    ```
*   **Returns:** `void` (no response body)

## 4. TypeScript Interfaces

### 4.1. Core Types

#### `SubscriptionResponse`
```typescript
interface SubscriptionResponse {
  id: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  plan: {
    id: string;
    amount: number;
    currency: string;
    interval: string;
  };
}
```

#### `SubscriptionPlan`
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePlanId: string;
}
```

#### `PaymentMethod`
```typescript
interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
}
```

### 4.2. Request Types

#### `CreateSubscriptionRequest`
```typescript
interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId: string;
}
```

#### `UpdateSubscriptionRequest`
```typescript
interface UpdateSubscriptionRequest {
  subscriptionId: string;
  planId?: string;
}
```

#### `CancelSubscriptionRequest`
```typescript
interface CancelSubscriptionRequest {
  subscriptionId: string;
  immediately?: boolean;
}
```

### 4.3. Response Types

#### `CreateSubscriptionResponse`
```typescript
interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
  status: string;
}
```

#### `ApiResponse<T>`
```typescript
interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
}
```

## 5. Error Handling

### 5.1. Network Errors
- **Network failures**: Return `null` instead of throwing
- **401 Unauthorized**: Automatic logout and redirect to login
- **404 Not Found**: Return `null` for subscription endpoints

### 5.2. Graceful Degradation
- Backend unavailable: Continue with limited functionality
- Missing subscription data: Default to "inactive" status
- API timeouts: Handle with user-friendly messages

## 6. Integration Notes

### 6.1. Stripe Integration
- Uses Stripe publishable key from `VITE_STRIPE_PUBLISHABLE_KEY`
- Payment intents for secure payment processing
- Supports subscription lifecycle management

### 6.2. Authentication
- JWT tokens required for all API calls
- Automatic token refresh handling
- Secure logout on authentication failures

### 6.3. State Management
- Integrates with AuthContext for user state
- useSubscription hook for subscription operations
- Real-time subscription status updates

## 7. Development Notes

### 7.1. Testing
- Graceful handling when backend is unavailable
- Mock subscription data for frontend development
- Network error simulation for robust testing

### 7.2. Production Considerations
- Stripe webhooks required for subscription events
- Server-side subscription validation
- Secure API key management
