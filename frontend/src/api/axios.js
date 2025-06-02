import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import {refreshAccessToken} from '../auth/refreshToken';

const api = axios.create({
  baseURL: 'http://192.168.1.7:5500/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Attach access token
api.interceptors.request.use(async config => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    config.headers.Authorization = `Bearer ${credentials.password}`;
  }
  return config;
});

// 🔁 Retry failed requests if token expired
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const status = err.response?.status;
    const message = err.response?.data?.error;

    // 🔁 If token expired and this is the first retry
    if (
      status === 401 &&
      message === 'jwt expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // 🔄 Set new token and retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔁 Retry failed:', refreshError);
        throw refreshError;
      }
    }

    return Promise.reject(err);
  },
);

export default api;
