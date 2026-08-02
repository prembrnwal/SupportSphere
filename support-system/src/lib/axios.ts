import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('sh_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          if (res.data?.success && res.data?.data?.access_token) {
            const newAccessToken = res.data.data.access_token;
            const newRefreshToken = res.data.data.refresh_token;

            localStorage.setItem('sh_token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('sh_refresh_token', newRefreshToken);
            }

            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            isRefreshing = false;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;
          localStorage.removeItem('sh_token');
          localStorage.removeItem('sh_refresh_token');
          return Promise.reject(refreshErr);
        }
      }
      isRefreshing = false;
    }

    return Promise.reject(error);
  }
);
