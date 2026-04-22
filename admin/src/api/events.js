import API from './axiosInstance'

export const getEvents = () => API.get('/events/')
export const getMyEvents = () => API.get('/events/my-events/')
export const getUserEvents = () => API.get('/events/user-events/')
export const createEvent = (data) => API.post('/events/create/', data)
export const updateEvent = (id, data) => API.put(`/events/${id}/update/`, data)
export const deleteEvent = (id) => API.delete(`/events/${id}/delete/`)
export const publishEvent = (id) => API.patch(`/events/${id}/publish/`)