import { AxiosError } from 'axios';
import type { ApiError } from '../types';

export function axiosErrorHandler(error: unknown): null {
  // Handle the error
  console.log('error: ', error);
  
  // Type guard to check if error is an AxiosError
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response:', axiosError.response.data);
      if (axiosError.response.status === 400) {
        // Handle bad request, such as invalid data
        alert('Invalid signup details. Please check your inputs.');
      } else {
        // Handle other errors
        alert('An error occurred during signup. Please try again later.');
      }
    } else if (axiosError.request) {
      // The request was made but no response was received
      console.error('Error Request:', axiosError.request);
      alert('No response from the server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', axiosError.message);
      alert('An error occurred during signup. Please try again.');
    }
  } else {
    // Handle non-axios errors
    console.error('Unknown error:', error);
    alert('An error occurred. Please try again.');
  }

  // Optionally, you can return some error indicator if needed
  return null;
}