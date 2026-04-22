import API from './axiosInstance';

export const getCities = () => API.get('/cities/');
export const getCityBySlug = (slug) => API.get(`/cities/slug/${slug}/`);
