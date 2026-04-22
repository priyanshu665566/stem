import API from './axiosInstance'

export const registerUser = (email) => API.post('/register/',{email})
export const loginUser = (email, password) => API.post('/login/',{email, password})
export const forgotPassword = (email) => API.post('/forgot-password/',{email})
export const resetPassword = (token, new_password, confirm_password) => 
    API.post('/reset-password/',{token, new_password, confirm_password})