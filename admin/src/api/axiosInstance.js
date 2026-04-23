import axios from 'axios'

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api'
})

// Request interceptor to add Authorization header
API.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle token expiration
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear localStorage and redirect to login
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userRole')
            localStorage.removeItem('userId')
            localStorage.removeItem('userName')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default API
