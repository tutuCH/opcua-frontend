import axios from 'axios';
import { axiosErrorHandler } from '../utils/utils';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const userLogin = async (email, password) => {
  try {
    // Send the login request to the backend
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: email,
      password: password
    });

    // Assuming the response contains an access_token
    const { access_token, userId } = response.data;

    // Calculate the expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Store the token and its expiration in localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('token_expiration', expirationDate.toISOString());

    // Optionally, you can return the token or some other response data if needed
    return access_token;

  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const userSignup = async (email, password, username) => {
  try {
    // Send the signup request to the backend
    const response = await axios.post(`${BACKEND_URL}/auth/signup`, {
      email: email,
      password: password,
      username: username
    });
    console.log('success: ', JSON.stringify(response.data));
    // Assuming the response contains an access_token after signup
    const { access_token } = response.data;

    // Calculate the expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Store the token and its expiration in localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('token_expiration', expirationDate.toISOString());

    // Optionally, you can return the token or some other response data if needed
    console.log('access_token:', access_token);
    return access_token;

  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const userForgetPassword = async (email) => {
  try {
    // Send the signup request to the backend
    console.log('forget password');
    const response = await axios.post(`${BACKEND_URL}/auth/forget-password`, {
      email: email
    });
    console.log('success: ', JSON.stringify(response));
    const { status, message } = response.data;
    return { status, message };

    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {status: 'success', message: 'Sent reset email successfully'};
  } catch (error) {
    console.error('error: ', error);
    return axiosErrorHandler(error);
  }
}

export const userResetPassword = async (email, token) => {
  try {
    // Send the signup request to the backend
    const response = await axios.post(`${BACKEND_URL}/auth/reset-password/${token}`, {
      email: email
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