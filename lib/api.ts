import axios from 'axios';

// The base URL for your PythonAnywhere backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alnroy.pythonanywhere.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically attach JWT token if it exists in localStorage
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
export { API_BASE_URL };
