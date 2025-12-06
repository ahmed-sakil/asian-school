import axios from 'axios';

// Create a configured instance of Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Reads from .env
  withCredentials: true, // Important: Allows cookies (for login) to be sent/received
});

export default api;