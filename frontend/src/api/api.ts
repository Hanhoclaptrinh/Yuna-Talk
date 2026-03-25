import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const uid = localStorage.getItem('uid');
        if (refreshToken && uid) {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            'refresh-token': refreshToken,
            uid: uid
          });
          localStorage.setItem('accessToken', res.data.access_token);
          localStorage.setItem('refreshToken', res.data.refresh_token);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
          return api(originalRequest);
        }
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// File upload function
export const uploadMessageFile = async (file: File, fileType: 'image' | 'video' | 'audio' | 'file') => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`/messages/upload/${fileType}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export default api;

