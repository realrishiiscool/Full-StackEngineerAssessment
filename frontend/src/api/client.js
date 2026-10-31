import axios from 'axios';
import toast from 'react-hot-toast';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => config,
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status !== 400) {
      // Don't auto-toast 400s — let forms handle validation display
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default client;
