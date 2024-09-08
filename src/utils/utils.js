export function axiosErrorHandler(error) {
// Handle the error
console.log('error: ', error);
if (error.response) {
  // The request was made and the server responded with a status code
  // that falls out of the range of 2xx
  console.error('Error Response:', error.response.data);
  if (error.response.status === 400) {
    // Handle bad request, such as invalid data
    alert('Invalid signup details. Please check your inputs.');
  } else {
    // Handle other errors
    alert('An error occurred during signup. Please try again later.');
  }
} else if (error.request) {
  // The request was made but no response was received
  console.error('Error Request:', error.request);
  alert('No response from the server. Please check your internet connection.');
} else {
  // Something happened in setting up the request that triggered an Error
  console.error('Error:', error.message);
  alert('An error occurred during signup. Please try again.');
}

// Optionally, you can return some error indicator if needed
return null;
}