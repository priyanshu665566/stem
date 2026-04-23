import API from './axiosInstance'

export const getUsers = () => API.get('/auth/users/')
export const getAllUsers = () => API.get('/auth/users/all/')
export const createUser = (formData) => API.post('/auth/users/create/', formData)
export const updateUser = (userId, data) => API.patch(`/auth/users/${userId}/update/`, data)
export const deleteUser = (userId) => API.delete(`/auth/users/${userId}/delete/`)
export const getActivityLogs = (userId) => API.get(`/auth/users/${userId}/activity/`)
