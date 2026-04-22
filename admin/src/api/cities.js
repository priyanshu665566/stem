import API from './axiosInstance'

export const getCities = () => API.get('/cities/')
export const getMyCities = () => API.get('/cities/my-cities/')
export const createCity = (formData) => API.post('/cities/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteCity = (cityId) => API.delete(`/cities/${cityId}/delete/`)

export const getCity = (id) => API.get(`/cities/${id}/`)
export const updateCity = (id, formData) => API.patch(`/cities/${id}/update/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
export const requestReviewCity = (id) => API.patch(`/cities/${id}/request-review/`)
export const publishCity = (id) => API.patch(`/cities/${id}/publish/`)
