import API from './axiosInstance'

export const getUsers = () => API.get('/users/')
export const getAllUsers = () => API.get('/users/all/')
export const createUser = (formData) => API.post('/users/create/', formData)
export const updateUser = (userId, data) => API.patch(`/users/${userId}/update/`, data)
export const deleteUser = (userId) => API.delete(`/users/${userId}/delete/`)
export const getActivityLogs = (userId) => API.get(`/users/${userId}/activity/`)
