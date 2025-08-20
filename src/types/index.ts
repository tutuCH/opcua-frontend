// Core API Response Types
export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

// Event Handler Types
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;
export type DivClickEvent = React.MouseEvent<HTMLDivElement>;

// JWT Token Types
export interface DecodedToken {
  exp: number;
  iat: number;
  sub?: string;
  userId?: string;
  email?: string;
  username?: string;
  roles?: string[];
}

// Authentication Types
export interface LoginResponse {
  access_token: string;
  userId: string;
  username: string;
}

export interface SignupResponse {
  status: string;
  message: string;
}

export interface VerifyEmailResponse {
  userId: string;
  access_token: string;
  status: string;
  message: string;
  email: string;
  username: string;
}

export interface ResetPasswordResponse {
  access_token: string;
  userId: string;
  status: string;
  message: string;
}

// Machine and Factory Types
export interface Machine {
  id: string;
  machineIpAddress: string;
  machineName: string;
  machineIndex: number;
  factoryId: string;
  factoryIndex: number;
}

export interface CreateMachineRequest {
  machineIpAddress: string;
  machineName: string;
  machineIndex: number;
  factoryId: string;
  factoryIndex: number;
}

export interface UpdateMachineRequest {
  machineId: string;
  machineIndex: number;
  factoryId: string;
}

export interface Factory {
  id: string;
  factoryName: string;
  factoryIndex: number;
  width: number;
  height: number;
  machines?: Machine[];
}

export interface CreateFactoryRequest {
  factoryName: string;
  factoryIndex: number;
  width: number;
  height: number;
}

export interface UpdateFactoryRequest {
  factoryId: string;
  factoryName: string;
  factoryIndex: number;
  width: number;
  height: number;
}

export interface FactoriesMachinesResponse {
  factories: Factory[];
}

// OPC UA Connection Types
export interface OPCUAConnectionRequest {
  endpoint: string;
}

export interface OPCUAConnectionResponse {
  success: boolean;
  message?: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string>;
  signup: (email: string, password: string, username: string) => Promise<SignupResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  hasActiveSubscription: boolean;
  refreshUserData: () => Promise<void>;
}

export interface User {
  id: string;
  email: string;
  username: string;
  subscriptionStatus?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  subscriptionId?: string;
  planType?: 'monthly' | 'yearly';
  subscriptionEndDate?: string;
}

// Utility Types
export interface ValidationError {
  field: string;
  message: string;
}

// Form State Types
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Factory & Machine State Types
export interface FactoryState {
  factories: Factory[];
  selectedFactoryIndex: number;
  selectedAddMachineIndex: number | null;
  machineDialogState: boolean[];
  factoryDialogState: boolean[];
  isEdit: boolean;
  isLoading: boolean;
}

export interface MachineState {
  factories: Factory[];
  selectedMachine: Machine | null;
  belongsToFactory: Factory | null;
  factoryIndex: number | null;
  machineIndex: number | null;
  isLoading: boolean;
}

// Warning Criteria Types
export interface WarningCriteria {
  temperature: CriteriaConfig;
  pressure: CriteriaConfig;
  cycleTime: CriteriaConfig;
  meltTemperature: CriteriaConfig;
  moldTemperature: CriteriaConfig;
  screwRpm: CriteriaConfig;
}

export interface CriteriaConfig {
  enabled: boolean;
  condition: 'exceeds' | 'drops_below';
  value: number;
}

// Common Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  username: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Page Props Types
export interface PageProps {
  title?: string;
  meta?: {
    description?: string;
    keywords?: string;
  };
}

// Generic Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: Status;
  error: string | null;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePlanId: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
  status: string;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  planId?: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  immediately?: boolean;
}

export interface SubscriptionResponse {
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

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
}

export interface SubscriptionContextType {
  subscription: SubscriptionResponse | null;
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  createSubscription: (request: CreateSubscriptionRequest) => Promise<CreateSubscriptionResponse>;
  updateSubscription: (request: UpdateSubscriptionRequest) => Promise<void>;
  cancelSubscription: (request: CancelSubscriptionRequest) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}