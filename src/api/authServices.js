import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const userLogin = async (email, password) => {
  try {
    // Send the login request to the backend
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: email,
      password: password
    });

    // Assuming the response contains an access_token
    const { access_token } = response.data;

    // Calculate the expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Store the token and its expiration in localStorage
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('token_expiration', expirationDate.toISOString());

    // Optionally, you can return the token or some other response data if needed
    return access_token;

  } catch (error) {
    // Handle the error

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response:', error.response.data);
      if (error.response.status === 401) {
        // Handle unauthorized error
        alert('Invalid email or password.');
      } else {
        // Handle other errors
        alert('An error occurred. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error Request:', error.request);
      alert('No response from the server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      alert('An error occurred. Please try again.');
    }

    // Optionally, you can return some error indicator if needed
    return null;
  }
};


