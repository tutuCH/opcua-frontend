// Form validation utilities
import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

type ValidationFunction = (value: string) => string | null;
type ValidationRule = ValidationFunction | ValidationFunction[];

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormValidationResult {
  values: Record<string, string>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  handleChange: (name: string, value: string) => void;
  handleBlur: (name: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}

// Email validation
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character';
  return null;
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

// Factory name validation
export const validateFactoryName = (name: string): string | null => {
  if (!name) return 'Factory name is required';
  if (name.length < 2) return 'Factory name must be at least 2 characters long';
  if (name.length > 50) return 'Factory name must be less than 50 characters';
  if (!/^[a-zA-Z0-9\s\u4e00-\u9fff-_]+$/.test(name)) return 'Factory name contains invalid characters';
  return null;
};

// Machine name validation
export const validateMachineName = (name: string): string | null => {
  if (!name) return 'Machine name is required';
  if (name.length < 2) return 'Machine name must be at least 2 characters long';
  if (name.length > 50) return 'Machine name must be less than 50 characters';
  if (!/^[a-zA-Z0-9\s\u4e00-\u9fff-_]+$/.test(name)) return 'Machine name contains invalid characters';
  return null;
};

// IP address validation
export const validateIpAddress = (ip: string): string | null => {
  if (!ip) return 'IP address is required';
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) return 'Please enter a valid IP address';
  return null;
};

// Numeric value validation
export const validateNumericValue = (value: string, fieldName: string, min: number = 1, max: number = 9999): string | null => {
  if (!value) return `${fieldName} is required`;
  const numValue = parseInt(value, 10);
  if (Number.isNaN(numValue)) return `${fieldName} must be a number`;
  if (numValue < min) return `${fieldName} must be at least ${min}`;
  if (numValue > max) return `${fieldName} must be less than ${max}`;
  return null;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim());
};

// Username validation
export const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters long';
  if (username.length > 20) return 'Username must be less than 20 characters';
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, hyphens, and underscores';
  return null;
};

// Generic required field validation
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Form validation hook
export const useFormValidation = (initialValues: Record<string, string>, validationRules: ValidationRules): FormValidationResult => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;
    
    if (Array.isArray(rule)) {
      return rule.find(validator => validator(value)) || null;
    }
    
    return rule(value);
  };

  const validateForm = (): boolean => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string): void => {
    const sanitizedValue = sanitizeInput(value);
    setValues(prev => ({ ...prev, [name]: sanitizedValue }));
    
    if (touched[name]) {
      const error = validateField(name, sanitizedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string): void => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const resetForm = (): void => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
    setErrors
  };
};