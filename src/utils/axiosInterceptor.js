// src/utils/axiosInterceptor.js
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('access_token'); // Optionally remove the token
        const navigate = useNavigate();
        navigate('/login', { replace: true });
      }
      return Promise.reject(error);
    }
  );
};
