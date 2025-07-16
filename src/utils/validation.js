// Form validation utilities
import { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character';
  return null;
};

// Password confirmation validation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

// Factory name validation
export const validateFactoryName = (name) => {
  if (!name) return 'Factory name is required';
  if (name.length < 2) return 'Factory name must be at least 2 characters long';
  if (name.length > 50) return 'Factory name must be less than 50 characters';
  if (!/^[a-zA-Z0-9\s\u4e00-\u9fff-_]+$/.test(name)) return 'Factory name contains invalid characters';
  return null;
};

// Machine name validation
export const validateMachineName = (name) => {
  if (!name) return 'Machine name is required';
  if (name.length < 2) return 'Machine name must be at least 2 characters long';
  if (name.length > 50) return 'Machine name must be less than 50 characters';
  if (!/^[a-zA-Z0-9\s\u4e00-\u9fff-_]+$/.test(name)) return 'Machine name contains invalid characters';
  return null;
};

// IP address validation
export const validateIpAddress = (ip) => {
  if (!ip) return 'IP address is required';
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) return 'Please enter a valid IP address';
  return null;
};

// Numeric value validation
export const validateNumericValue = (value, fieldName, min = 1, max = 9999) => {
  if (!value) return `${fieldName} is required`;
  const numValue = parseInt(value, 10);
  if (Number.isNaN(numValue)) return `${fieldName} must be a number`;
  if (numValue < min) return `${fieldName} must be at least ${min}`;
  if (numValue > max) return `${fieldName} must be less than ${max}`;
  return null;
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input.trim());
};

// Username validation
export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters long';
  if (username.length > 20) return 'Username must be less than 20 characters';
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return 'Username can only contain letters, numbers, hyphens, and underscores';
  return null;
};

// Generic required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Form validation hook
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;
    
    if (Array.isArray(rule)) {
      return rule.find(validator => validator(value)) || null;
    }
    
    return rule(value);
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name, value) => {
    const sanitizedValue = sanitizeInput(value);
    setValues(prev => ({ ...prev, [name]: sanitizedValue }));
    
    if (touched[name]) {
      const error = validateField(name, sanitizedValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const resetForm = () => {
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