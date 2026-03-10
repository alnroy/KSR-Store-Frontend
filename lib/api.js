import axios from 'axios';

const API = axios.create({
    baseURL: 'https://alnroy.pythonanywhere.com/api/',
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle expired tokens globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid/expired - Clear and redirect
            localStorage.removeItem('access_token');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export const fetchProducts = () => API.get('products/');
export const fetchAddresses = () => API.get('addresses/');
export const saveAddress = (data) => API.post('addresses/', data);
export const createOrder = (formData) => API.post('orders/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export default API;