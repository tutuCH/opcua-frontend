import axios from 'axios';
import { axiosErrorHandler } from '../utils/utils';
import { sanitizeInput } from '../utils/validation';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const userLogin = async (email, password) => {
  try {
    // Sanitize inputs before sending to backend
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    
    // Send the login request to the backend
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: sanitizedEmail,
      password: sanitizedPassword
    });

    // Assuming the response contains an access_token
    const { access_token, userId, username } = response.data;

    // Calculate the expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Store the token and its expiration in localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('token_expiration', expirationDate.toISOString());
    localStorage.setItem('email', email);
    localStorage.setItem('username', username);

    // Optionally, you can return the token or some other response data if needed
    return access_token;

  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const userSignup = async (email, password, username) => {
  try {
    // Sanitize inputs before sending to backend
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedUsername = sanitizeInput(username);
    
    // Send the signup request to the backend
    const response = await axios.post(`${BACKEND_URL}/auth/sign-up`, {
      email: sanitizedEmail,
      password: sanitizedPassword,
      username: sanitizedUsername
    });
    // Assuming the response contains an access_token after signup
    const { status, message } = response.data;
    return {status, message};

  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const userVerifyEmail = async (token) => {
  try {
    // Send the signup request to the backend
    const response = await axios.get(`${BACKEND_URL}/auth/verify-email?token=${token}`, {
    });
    // Assuming the response contains an access_token after signup
    const { userId, access_token, status, message, email, username } = response.data;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Store the token and its expiration in localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('token_expiration', expirationDate.toISOString());
    localStorage.setItem('email', email);
    localStorage.setItem('username', username);
    return { userId, access_token, status, message };

  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const userForgetPassword = async (email) => {
  try {
    // Sanitize input before sending to backend
    const sanitizedEmail = sanitizeInput(email);
    
    // Send the forget password request to the backend
    console.log('forget password');
    const response = await axios.post(`${BACKEND_URL}/auth/forget-password`, {
      email: sanitizedEmail
    });
    console.log('success: ', JSON.stringify(response));
    const { status, message } = response.data;
    return { status, message };
    // demo code for success send email
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // return {status: 'success', message: 'Sent reset email successfully'};
  } catch (error) {
    console.error('error: ', error);
    return axiosErrorHandler(error);
  }
}

export const userResetPassword = async (token, password) => {
  try {
    // Send the signup request to the backend
    const response = await axios.post(`${BACKEND_URL}/auth/reset-password/${token}`, {
      password
    });
    // Assuming the response contains an access_token
    const { access_token, userId, status, message } = response.data;

    // Calculate the expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Store the token and its expiration in localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('token_expiration', expirationDate.toISOString());

    // Optionally, you can return the token or some other response data if needed
    return { access_token, userId, status, message };    
  } catch (error) {
    return axiosErrorHandler(error);
  }
}