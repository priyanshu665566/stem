import API from './axiosInstance';

export const getCities = () => API.get('/cities/');
export const getCityBySlug = (slug) => API.get(`/cities/slug/${slug}/`);
export const getCityById = (id) => API.get(`/cities/${id}/`);
export const getCityRooms = (cityId) => API.get(`/cities/${cityId}/rooms/`);
export const uploadCityLogo = (cityId, file) => {
  const formData = new FormData();
  formData.append('logo_original', file);
  return API.post(`/cities/${cityId}/logo/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const deleteCityLogo = (cityId) => API.delete(`/cities/${cityId}/logo/`);
export const updateNavbarSlots = (cityId, navbarSlots) => 
  API.patch(`/cities/${cityId}/navbar-slots/`, { navbar_slots: navbarSlots });

