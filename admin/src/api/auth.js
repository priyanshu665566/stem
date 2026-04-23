import API from './axiosInstance'

export const registerUser = (email) => API.post('/auth/register/',{email})
export const loginUser = (email, password) => API.post('/auth/login/',{email, password})
export const forgotPassword = (email) => API.post('/auth/forgot-password/',{email})
export const resetPassword = (token, new_password, confirm_password) => 
    API.post('/auth/reset-password/',{token, new_password, confirm_password})