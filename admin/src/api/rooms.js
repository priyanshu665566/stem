import API from './axiosInstance'

export const getRooms = () => API.get('/rooms/')
export const getMyRooms = () => API.get('/rooms/my-rooms/')
export const getAllowedRooms = () => API.get('/rooms/allowed/')
export const createRoom = (formData) => API.post('/rooms/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteRoom = (roomId) => API.delete(`/rooms/${roomId}/delete/`)

export const getRoom = (id) => API.get(`/rooms/${id}/`)
export const updateRoom = (id, formData) => API.patch(`/rooms/${id}/update/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
export const requestReviewRoom = (id) => API.patch(`/rooms/${id}/request-review/`)
export const publishRoom = (id) => API.patch(`/rooms/${id}/publish/`)
